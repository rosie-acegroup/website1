// ACE Content Studio — backend Worker
//
// Responsibilities:
//   1. Proxy Anthropic Messages API calls (keeps ANTHROPIC_API_KEY server-side).
//   2. Run the Google OAuth flow and store the refresh token in KV.
//   3. Create Google Calendar events on behalf of the connected account.
//
// Secrets (set with `wrangler secret put ...`):
//   ANTHROPIC_API_KEY     - your Anthropic API key
//   GOOGLE_CLIENT_ID      - OAuth 2.0 client ID
//   GOOGLE_CLIENT_SECRET  - OAuth 2.0 client secret
//   ACCESS_CODE           - shared passphrase gating the tool (optional but recommended)
//
// Bindings (wrangler.toml):
//   ACE_KV  - a KV namespace for the Google refresh token + OAuth state

const CONTENT_MODEL = "claude-opus-4-8";
const GOOGLE_SCOPE = "https://www.googleapis.com/auth/calendar.events";
const REFRESH_KEY = "google_refresh_token";

function cors(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Access-Code",
    ...extra,
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors() },
  });
}

// Gate API calls behind the shared access code. If ACCESS_CODE is unset the
// gate is disabled (fine for local testing, not for a public domain).
function checkAccess(request, env) {
  if (!env.ACCESS_CODE) return true;
  const provided = request.headers.get("X-Access-Code");
  return !!provided && provided === env.ACCESS_CODE;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors() });
    }

    try {
      if (path === "/api/generate" && request.method === "POST") {
        return await handleGenerate(request, env);
      }
      if (path === "/auth/google/start" && request.method === "GET") {
        return await handleAuthStart(env, url);
      }
      if (path === "/auth/google/callback" && request.method === "GET") {
        return await handleAuthCallback(env, url);
      }
      if (path === "/api/calendar/status" && request.method === "GET") {
        if (!checkAccess(request, env)) return json({ error: "unauthorized" }, 401);
        const token = await env.ACE_KV.get(REFRESH_KEY);
        return json({ connected: !!token });
      }
      if (path === "/api/calendar/event" && request.method === "POST") {
        return await handleCalendarEvent(request, env);
      }
      return json({ error: "not found" }, 404);
    } catch (e) {
      return json({ error: (e && e.message) || String(e) }, 500);
    }
  },
};

async function handleGenerate(request, env) {
  if (!checkAccess(request, env)) {
    return json({ error: { message: "Invalid or missing access code." } }, 401);
  }
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: { message: "Server is missing ANTHROPIC_API_KEY." } }, 500);
  }
  const body = await request.json();
  const payload = {
    model: CONTENT_MODEL,
    max_tokens: 1024,
    system: body.system,
    messages: body.messages,
  };
  if (Array.isArray(body.tools) && body.tools.length) payload.tools = body.tools;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });
  // Pass Anthropic's JSON straight through so the frontend parser is unchanged.
  const data = await res.json();
  return json(data, res.status);
}

async function handleAuthStart(env, url) {
  if (env.ACCESS_CODE && url.searchParams.get("ac") !== env.ACCESS_CODE) {
    return new Response("Invalid access code.", { status: 401 });
  }
  if (!env.GOOGLE_CLIENT_ID) {
    return new Response("Server is missing GOOGLE_CLIENT_ID.", { status: 500 });
  }
  const state = crypto.randomUUID();
  await env.ACE_KV.put("oauth_state_" + state, "1", { expirationTtl: 600 });

  const redirectUri = url.origin + "/auth/google/callback";
  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", GOOGLE_SCOPE);
  auth.searchParams.set("access_type", "offline");
  auth.searchParams.set("prompt", "consent"); // force a refresh_token every time
  auth.searchParams.set("state", state);
  return Response.redirect(auth.toString(), 302);
}

async function handleAuthCallback(env, url) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return htmlClose("Missing authorization code.");

  const ok = await env.ACE_KV.get("oauth_state_" + state);
  if (!ok) return htmlClose("This login link expired. Please try connecting again.");
  await env.ACE_KV.delete("oauth_state_" + state);

  const redirectUri = url.origin + "/auth/google/callback";
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tok = await tokenRes.json();
  if (!tok.refresh_token) {
    return htmlClose(
      "Google did not return a refresh token. Remove ACE at myaccount.google.com/permissions, then connect again."
    );
  }
  await env.ACE_KV.put(REFRESH_KEY, tok.refresh_token);
  return htmlClose("Google Calendar connected. You can close this window.", true);
}

function htmlClose(msg, success = false) {
  const signal = success ? "ace-calendar-connected" : "ace-calendar-failed";
  const body =
    '<!doctype html><meta charset="utf-8">' +
    '<body style="font-family:sans-serif;padding:48px;text-align:center;color:#5C2D4F">' +
    "<p>" +
    msg +
    "</p><script>if(window.opener){window.opener.postMessage('" +
    signal +
    "','*');}setTimeout(function(){window.close();},1800);</script></body>";
  return new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

async function getAccessToken(env) {
  const refresh = await env.ACE_KV.get(REFRESH_KEY);
  if (!refresh) return null;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: refresh,
      grant_type: "refresh_token",
    }),
  });
  const tok = await res.json();
  return tok.access_token || null;
}

async function handleCalendarEvent(request, env) {
  if (!checkAccess(request, env)) return json({ error: "unauthorized" }, 401);
  const token = await getAccessToken(env);
  if (!token) return json({ error: "Calendar is not connected." }, 400);

  const b = await request.json();
  const timeZone = b.timeZone || "America/New_York";
  const event = {
    summary: b.title,
    description: b.description || "",
    start: { dateTime: b.start, timeZone },
    end: { dateTime: b.end, timeZone },
  };
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(event),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    return json(
      { error: (data.error && data.error.message) || "Calendar API error" },
      res.status
    );
  }
  return json({ ok: true, id: data.id, htmlLink: data.htmlLink });
}

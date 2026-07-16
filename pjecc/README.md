# PJECC — One-Page Website

A warm, nature-inspired one-page site for the **Palisades Jewish Early Childhood Center**, built to the PJECC 2026 brand guidelines (League Gothic / Playfair Display / PT Sans Narrow, the brand palette, and the blue tree logo).

It ships in two forms from a **single source of truth**:

| What | Where | Use |
|------|-------|-----|
| **WordPress theme** | `theme/` | The production site. Zip and upload to WordPress. |
| **Static preview** | `index.html` | Open in any browser to see the site instantly. Also viewable at `acegroupny.com/pjecc/` via GitHub Pages. |

Both render the exact same markup — `theme/template-parts/content.php`. Edit the content once; rebuild the preview with one command (below).

---

## Quick preview (no WordPress needed)

Open `pjecc/index.html` in a browser, or serve the folder:

```bash
cd pjecc
php -S localhost:8000
# visit http://localhost:8000
```

---

## Installing on WordPress

This is a **classic custom theme** — the cleanest way to put a hand-coded design on WordPress with pixel-perfect control. It works on any **self-hosted WordPress** (wordpress.org) or **WordPress.com Business plan or higher** (cheaper WordPress.com plans don't allow custom themes).

### Option A — Upload the zip (easiest)

1. Build the zip (already provided as `pjecc-theme.zip`, or regenerate — see below).
2. In WordPress: **Appearance → Themes → Add New → Upload Theme**.
3. Choose `pjecc-theme.zip`, click **Install**, then **Activate**.
4. Go to **Settings → Reading → Your homepage displays → A static page**, or simply leave it — the theme's `front-page.php`/`index.php` renders the one-pager as the homepage automatically.
5. Done. Visit the site.

### Option B — Upload the folder via FTP/SFTP

1. Copy the entire `theme/` folder to `wp-content/themes/pjecc/` on the server.
2. In WordPress: **Appearance → Themes → Activate "PJECC"**.

### Rebuild the zip

```bash
cd pjecc
# name the inner folder "pjecc" so WordPress installs it cleanly
cp -r theme pjecc-theme && (cd pjecc-theme && :) # (already structured)
zip -r pjecc-theme.zip theme -x "*.DS_Store"
```

*(WordPress accepts the folder named `theme`; if you prefer the theme directory to be named `pjecc`, rename the folder before zipping.)*

---

## Editing content

- **Copy & structure:** `theme/template-parts/content.php` — all headings, paragraphs, and sections. Plain HTML, no coding gymnastics.
- **Colors, type, spacing:** `theme/style.css` — the brand tokens live at the top under `:root`.
- **Interactions:** `theme/assets/js/pjecc.js` — sticky nav, mobile menu, scroll reveals.
- **Logo & images:** `theme/assets/img/` — swap the PNGs (keep the same filenames) to update artwork.

After editing `content.php`, regenerate the static preview so it stays in sync:

```bash
cd pjecc
php build-preview.php > index.html
```

### Making sections client-editable (optional, later)

Right now copy is edited in the template (Ace maintains it). If PJECC wants to edit text/photos themselves without touching code, the common next step is to wire key sections to the WordPress editor or **ACF (Advanced Custom Fields)**. That's a follow-on if/when they want it — the current build is intentionally simple and fast.

---

## Before launch — things to replace

These are **placeholders** in `content.php` and should be swapped for real info:

- [ ] **Photos** — the About block and campus banners use gradient placeholders. Drop in real classroom/campus photography (mark "Add a photo…" spots).
- [ ] **Contact details** — `hello@pjecc.org`, `(310) 555-0100`, and campus addresses are placeholders.
- [ ] **Social links** — Instagram / Facebook links in the footer point to `#`.
- [ ] **The tour form** — it's a front-end demo. On WordPress, connect it to a real form plugin (**WPForms**, **Contact Form 7**, or **Gravity Forms**) so submissions get emailed/stored. Replace the `<form id="tour-form">` block with the plugin's shortcode, or point it at your form handler.
- [ ] **Testimonial** — currently the brand-summary quote, attributed to "A PJECC Parent." Swap for a real, named quote if you have permission.

---

## Notes

- **Fonts** load from Google Fonts (League Gothic, Playfair Display, PT Sans Narrow) — matching the brand guidelines exactly, no font files to host.
- **Logo art** was taken from the 2026 brand guidelines (primary lockup, PJECC stacked mark, and tree submark), exported with transparency.
- Fully **responsive** (desktop → mobile) and respects **reduced-motion** preferences.

Branding & site by [The Ace Group](https://acegroupny.com).

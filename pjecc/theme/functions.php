<?php
/**
 * PJECC theme functions.
 *
 * @package PJECC
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Tour-form email delivery via Web3Forms (reliable, no SMTP or plugin needed).
 *
 * HOW TO TURN IT ON:
 *   1. Go to https://web3forms.com and enter  chana@pjecc.org  as the destination.
 *   2. They email you a free Access Key.
 *   3. Paste that key between the quotes below, then save/re-upload the theme.
 * Until a key is set, the form shows a thank-you but does not send.
 */
if ( ! defined( 'PJECC_FORM_KEY' ) ) {
	define( 'PJECC_FORM_KEY', '' );
}

if ( ! function_exists( 'pjecc_setup' ) ) {
	function pjecc_setup() {
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
		add_theme_support( 'custom-logo', array(
			'height'      => 120,
			'width'       => 400,
			'flex-height' => true,
			'flex-width'  => true,
		) );
		// One in-page anchor menu (optional — the theme ships with hardcoded anchors).
		register_nav_menus( array( 'primary' => __( 'Primary Menu', 'pjecc' ) ) );
	}
}
add_action( 'after_setup_theme', 'pjecc_setup' );

/**
 * Fonts + styles + scripts.
 * Fonts (League Gothic / Playfair Display / PT Sans Narrow) come from Google Fonts,
 * matching the PJECC 2026 brand guidelines.
 */
function pjecc_assets() {
	// Version by file modification time so browsers/caches always pick up edits.
	$css_path = get_stylesheet_directory() . '/style.css';
	$js_path  = get_template_directory() . '/assets/js/pjecc.js';
	$css_ver  = file_exists( $css_path ) ? filemtime( $css_path ) : '1.1.0';
	$js_ver   = file_exists( $js_path ) ? filemtime( $js_path ) : '1.1.0';

	wp_enqueue_style(
		'pjecc-fonts',
		'https://fonts.googleapis.com/css2?family=League+Gothic&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap',
		array(),
		null
	);

	// Main stylesheet (style.css at the theme root).
	wp_enqueue_style( 'pjecc-style', get_stylesheet_uri(), array( 'pjecc-fonts' ), $css_ver );

	wp_enqueue_script(
		'pjecc-script',
		get_template_directory_uri() . '/assets/js/pjecc.js',
		array(),
		$js_ver,
		true
	);
}
add_action( 'wp_enqueue_scripts', 'pjecc_assets' );

/**
 * Preconnect to Google Fonts for faster loading.
 */
function pjecc_resource_hints( $urls, $relation_type ) {
	if ( 'preconnect' === $relation_type ) {
		$urls[] = array( 'href' => 'https://fonts.gstatic.com', 'crossorigin' );
	}
	return $urls;
}
add_filter( 'wp_resource_hints', 'pjecc_resource_hints', 10, 2 );

/**
 * Tour-request form handler.
 * Emails every submission to the school. No form plugin required.
 *
 * Change the recipient here (or override with the 'pjecc_tour_recipient' filter).
 */
function pjecc_tour_recipient() {
	return apply_filters( 'pjecc_tour_recipient', 'chana@pjecc.org' );
}

function pjecc_handle_tour() {
	// Spam honeypot: real people never fill this.
	if ( ! empty( $_POST['website'] ) ) {
		wp_safe_redirect( add_query_arg( 'tour', 'sent', wp_get_referer() ?: home_url( '/' ) ) . '#enroll' );
		exit;
	}

	// Security: verify the nonce.
	if ( ! isset( $_POST['pjecc_nonce'] ) || ! wp_verify_nonce( $_POST['pjecc_nonce'], 'pjecc_tour' ) ) {
		wp_die( esc_html__( 'Sorry, your security token expired. Please go back and submit the form again.', 'pjecc' ) );
	}

	$name   = sanitize_text_field( wp_unslash( $_POST['pname'] ?? '' ) );
	$email  = sanitize_email( wp_unslash( $_POST['pemail'] ?? '' ) );
	$phone  = sanitize_text_field( wp_unslash( $_POST['pphone'] ?? '' ) );
	$campus = sanitize_text_field( wp_unslash( $_POST['pcampus'] ?? '' ) );
	$child  = sanitize_text_field( wp_unslash( $_POST['pchild'] ?? '' ) );
	$msg    = sanitize_textarea_field( wp_unslash( $_POST['pmsg'] ?? '' ) );

	$to      = pjecc_tour_recipient();
	$subject = 'New Tour Request from the PJECC website' . ( $name ? ' — ' . $name : '' );

	$body  = "A new tour request came in from the PJECC website:\n\n";
	$body .= 'Name: ' . $name . "\n";
	$body .= 'Email: ' . $email . "\n";
	$body .= 'Phone: ' . $phone . "\n";
	$body .= 'Location of interest: ' . $campus . "\n";
	$body .= "Child's age: " . $child . "\n\n";
	$body .= "Message:\n" . ( $msg !== '' ? $msg : '(none)' ) . "\n";

	$headers = array( 'Content-Type: text/plain; charset=UTF-8' );
	if ( $email && is_email( $email ) ) {
		$headers[] = 'Reply-To: ' . ( $name ? $name . ' ' : '' ) . '<' . $email . '>';
	}

	wp_mail( $to, $subject, $body, $headers );

	$redirect = wp_get_referer() ? wp_get_referer() : home_url( '/' );
	wp_safe_redirect( add_query_arg( 'tour', 'sent', $redirect ) . '#enroll' );
	exit;
}
add_action( 'admin_post_pjecc_tour', 'pjecc_handle_tour' );
add_action( 'admin_post_nopriv_pjecc_tour', 'pjecc_handle_tour' );

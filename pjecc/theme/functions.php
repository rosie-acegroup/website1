<?php
/**
 * PJECC theme functions.
 *
 * @package PJECC
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

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
	$theme   = wp_get_theme();
	$version = $theme->get( 'Version' ) ? $theme->get( 'Version' ) : '1.0.0';

	wp_enqueue_style(
		'pjecc-fonts',
		'https://fonts.googleapis.com/css2?family=League+Gothic&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=PT+Sans+Narrow:wght@400;700&display=swap',
		array(),
		null
	);

	// Main stylesheet (style.css at the theme root).
	wp_enqueue_style( 'pjecc-style', get_stylesheet_uri(), array( 'pjecc-fonts' ), $version );

	wp_enqueue_script(
		'pjecc-script',
		get_template_directory_uri() . '/assets/js/pjecc.js',
		array(),
		$version,
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

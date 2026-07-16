<?php
/**
 * Main template — renders the single-page PJECC site.
 *
 * @package PJECC
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

// Asset base for images referenced inside the shared content partial.
$asset = get_template_directory_uri() . '/assets';
include get_theme_file_path( 'template-parts/content.php' );

get_footer();

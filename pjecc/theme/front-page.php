<?php
/**
 * Front page template.
 * Ensures the one-page layout renders whether or not a static front page is set.
 *
 * @package PJECC
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

get_header();

$asset = get_template_directory_uri() . '/assets';
include get_theme_file_path( 'template-parts/content.php' );

get_footer();

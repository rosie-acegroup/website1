<?php
/**
 * Header — opens the document through <body>.
 *
 * @package PJECC
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="description" content="PJECC — the Palisades Jewish Early Childhood Center. A warm, nature-inspired, Reggio-inspired Jewish preschool serving infants through TK across our Pacific Palisades and Santa Monica campuses.">
	<link rel="profile" href="https://gmpg.org/xfn/11">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

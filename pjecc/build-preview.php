<?php
/**
 * Renders the static preview (pjecc/index.html) from the SAME content partial
 * the WordPress theme uses, so the preview never drifts from the real site.
 *
 * Usage:  php build-preview.php > index.html
 */

$asset = 'theme/assets'; // relative to pjecc/index.html

ob_start();
?><!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>PJECC — Palisades Jewish Early Childhood Center</title>
	<meta name="description" content="PJECC — the Palisades Jewish Early Childhood Center. A warm, nature-inspired, Reggio-inspired Jewish preschool serving infants through TK across our Pacific Palisades and Santa Monica campuses.">
	<!-- NOTE: This standalone file is a PREVIEW only. The production site is the
	     WordPress theme in ./theme/. Regenerate with: php build-preview.php > index.html -->
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=League+Gothic&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=PT+Sans+Narrow:wght@400;700&display=swap">
	<link rel="stylesheet" href="theme/style.css">
	<link rel="icon" href="theme/assets/img/tree-submark.png">
</head>
<body>
<?php include __DIR__ . '/theme/template-parts/content.php'; ?>
<script src="theme/assets/js/pjecc.js"></script>
</body>
</html>
<?php
echo ob_get_clean();

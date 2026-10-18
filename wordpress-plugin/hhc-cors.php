<?php
/**
 * Plugin Name: HHC Store API CORS
 * Description: Lets the Helping Hands Craft storefront read the WooCommerce Store API from the browser. Install in wp-content/mu-plugins.
 *
 * wc/store/v1 sends no Access-Control-Allow-Origin by default, so a browser on helpinghandscraft.co.uk is blocked from api.helpinghandscraft.co.uk.
 * Only the shop's own origins are allowed.
 */
function hhc_is_allowed_origin($origin) {
	return in_array($origin, [
		'https://helpinghandscraft.co.uk',
		'https://www.helpinghandscraft.co.uk',
		'http://localhost:5175',
	], true);
}

function hhc_store_api_cors($served, $result, $request) {
	$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
	if (hhc_is_allowed_origin($origin)) {
		header('Access-Control-Allow-Origin: ' . $origin);
		header('Access-Control-Allow-Credentials: true');
		header('Vary: Origin');
	}
	return $served;
}
add_filter('rest_pre_serve_request', 'hhc_store_api_cors', 10, 3);

<?php
/**
 * Plugin Name: HHC Menu API
 * Description: Exposes WordPress menus via a public REST API endpoint
 * Version: 1.0
 */

add_action('rest_api_init', function () {
    register_rest_route('hhc/v1', '/menu/(?P<location>[a-zA-Z0-9_-]+)', [
        'methods' => 'GET',
        'callback' => 'hhc_get_menu',
        'permission_callback' => '__return_true',
        'args' => [
            'location' => [
                'required' => true,
                'validate_callback' => function ($param) {
                    return is_string($param) && !empty($param);
                },
            ],
        ],
    ]);

    register_rest_route('hhc/v1', '/menus', [
        'methods' => 'GET',
        'callback' => 'hhc_get_all_menus',
        'permission_callback' => '__return_true',
    ]);
});

function hhc_get_menu($request) {
    $location = $request->get_param('location');
    $locations = get_nav_menu_locations();
    
    if (!isset($locations[$location])) {
        return new WP_Error('no_menu', 'No menu found at this location', ['status' => 404]);
    }
    
    $menu_id = $locations[$location];
    $menu_items = wp_get_nav_menu_items($menu_id);
    
    if (empty($menu_items)) {
        return [];
    }
    
    $items = [];
    foreach ($menu_items as $item) {
        $items[] = [
            'id' => $item->ID,
            'title' => $item->title,
            'url' => $item->url,
            'slug' => basename(parse_url($item->url, PHP_URL_PATH)),
            'order' => $item->menu_order,
            'parent' => $item->menu_item_parent,
            'target' => $item->target,
        ];
    }
    
    return $items;
}

function hhc_get_all_menus() {
    $menus = wp_get_nav_menus();
    $locations = get_nav_menu_locations();
    
    $result = [];
    foreach ($menus as $menu) {
        $menu_locations = [];
        foreach ($locations as $loc => $menu_id) {
            if ($menu_id === $menu->term_id) {
                $menu_locations[] = $loc;
            }
        }
        $result[] = [
            'id' => $menu->term_id,
            'name' => $menu->name,
            'slug' => $menu->slug,
            'locations' => $menu_locations,
        ];
    }
    
    return $result;
}

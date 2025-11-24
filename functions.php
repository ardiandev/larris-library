<?php
/**
 * Functions and definitions for the LarrisLibrary theme.
 *
 * @package Larris Library Theme
 */

/**
 * Registers blocks to manages book and writer posts.
 */
function larris_library_blocks() {
	if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
		wp_register_block_types_from_metadata_collection( __DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php' );
		return;
	}

	if ( function_exists( 'wp_register_block_metadata_collection' ) ) {
		wp_register_block_metadata_collection( __DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php' );
	}

	$manifest_data = require __DIR__ . '/build/blocks-manifest.php';
	foreach ( array_keys( $manifest_data ) as $block_type ) {
		register_block_type( __DIR__ . "/build/{$block_type}" );
	}
}
add_action( 'init', 'larris_library_blocks' );

/**
 * Register Larris Book Custom Post Type
 */
function register_larris_book_cpt() {
	$post_type = 'larris_book';

	$args = array(
		'name'          => 'Books',
		'singular_name' => 'Book',
		'add_new'       => 'Add Book',
		'add_new_item'  => 'Add Book',
	);

	register_post_type(
		$post_type,
		array(
			'label'        => 'Books',
			'labels'       => $args,
			'supports'     => array( 'title', 'editor', 'thumbnail', 'custom-fields', 'excerpt' ),
			'show_in_menu' => true,
			'public'       => true,
			'rewrite'      => array( 'slug' => 'books' ),
			'show_in_rest' => true,
			'rest_base'    => 'books',
 'rest_controller_class' => 'WP_REST_Posts_Controller',
			'menu_icon'    => 'dashicons-book',
			'template'     => array(

				array( 'create-block/larris-book' ),
				array(
					'core/group',
					array(
						'className' => 'my-custom-group',
					),
					array(
						array(
							'core/paragraph',
							array(
								'placeholder' => 'Write something...',
							),
						),
					),
				),
			),

		)
	);
}

add_action( 'init', 'register_larris_book_cpt' );

/**
 * Register meta data for Larris Book CPT
 */
function register_larris_book_meta() {
	$post_type = 'larris_book';

	register_post_meta(
		$post_type,
		'book_title',
		array(
			'show_in_rest'      => true,
			'single'            => true,
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_text_field',
			'auth_callback'     => function () {
				return current_user_can( 'edit_posts' );
			},

		)
	);

register_post_meta(
    $post_type,
    'book_writer',
    array(
        'single' => true,
        'show_in_rest' => array(
            'schema' => array(
                'type'  => 'array',
                'items' => array(
                    'type' => 'integer',
                ),
            ),
        ),
        'type' => 'array',     // IMPORTANT
        'auth_callback' => function () {
            return current_user_can( 'edit_posts' );
        },
    )
);


				register_post_meta(
					$post_type,
					'book_description',
					array(
						'show_in_rest'      => true,
						'single'            => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
						'auth_callback'     => function () {
							return current_user_can( 'edit_posts' );
						},

					)
				);
}

add_action( 'init', 'register_larris_book_meta' );

/**
 * Register Larris Library Writer CPT
 * return void
 */
function register_larris_writer_ctp() {
	$post_type = 'larris_writer';

	$args = array(
		'name'          => 'Writers',
		'singular_name' => 'Writer',
		'add_new'       => 'Add Writer',
		'add_new_item'  => 'Add Writer',
	);

	register_post_type(
		$post_type,
		array(
			'label'        => 'Writers',
			'labels'       => $args,
			'supports'     => array( 'title', 'editor', 'thumbnail', 'custom-fields', 'excerpt' ),
			'show_in_menu' => true,
			'public'       => true,
			'rewrite'      => array( 'slug' => 'writers' ),
			'show_in_rest' => true,
			'rest_base'    => 'writers',

			'menu_icon'    => 'dashicons-book',
		)
	);
}



add_action( 'init', 'register_larris_writer_ctp' );

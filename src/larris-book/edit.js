/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
// import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */

import { TextControl, FormTokenField } from '@wordpress/components';
import { useEntityProp, useEntityRecords } from '@wordpress/core-data';
import { useState, useMemo, useEffect } from '@wordpress/element';
export default function Edit( props ) {
	const { postType, postId } = props.context;

	const [ meta, setMeta ] = useEntityProp(
		'postType',
		postType,
		'meta',
		postId
	);

	return (
		<div { ...useBlockProps() }>
			<BookTitle postId={ postId } postType={ postType } />

			<MyFormTokenField meta={ meta } setMeta={ setMeta } />
		</div>
	);
}

const generateSlug = ( title, maxLength = 60 ) => {
	let slug = title
		.toLowerCase()
		.replace( /\s+/g, '-' ) // spaces → hyphens
		.replace( /[^\w-]+/g, '' ); // remove invalid chars

	if ( slug.length > maxLength ) {
		slug = slug.slice( 0, maxLength );

		// Remove trailing hyphen if cut in middle of word
		slug = slug.replace( /-$/, '' );
	}

	return slug;
};

const BookTitle = ( { postId, postType } ) => {
	const [ title, setTitle ] = useEntityProp(
		'postType',
		postType,
		'title',
		postId
	);
	const [ , setSlug ] = useEntityProp( 'postType', postType, 'slug', postId );

	const updateBookTitle = ( value ) => {
		setTitle( value );

		const newSlug = generateSlug( value, 60 );
		setSlug( newSlug );
	};

	return (
		<TextControl
			label="Book Title"
			value={ title || '' }
			onChange={ updateBookTitle }
		/>
	);
};

function MyFormTokenField( { meta, setMeta } ) {
	// Fetch writers CPT
	const { records } = useEntityRecords( 'postType', 'larris_writer', {
		per_page: 20,
	} );

	// Build lookup maps + suggestions
	const writerMaps = useMemo( () => {
		const mapNameToId = {};
		const mapIdToName = {};
		const names = [];

		records?.forEach( ( writer ) => {
			const name = writer.title.rendered;
			mapNameToId[ name ] = writer.id;
			mapIdToName[ writer.id ] = name;
			names.push( name );
		} );

		return {
			nameToId: mapNameToId,
			idToName: mapIdToName,
			suggestions: names,
		};
	}, [ records ] );

	const { nameToId, idToName, suggestions } = writerMaps;

	// Local token state
	const [ tokens, setTokens ] = useState( [] );

	// Sync tokens with saved meta
	useEffect( () => {
		if ( ! meta?.book_writer ) {
			return;
		}

		const names = meta.book_writer
			.map( ( id ) => idToName[ id ] )
			.filter( Boolean );

		setTokens( names );
	}, [ meta?.book_writer, idToName ] );

	// Save both tokens + meta
	const updateBookWriter = ( newTokens ) => {
		const ids = newTokens.map( ( t ) => nameToId[ t ] ).filter( Boolean );

		setTokens( newTokens );

		setMeta( {
			...meta,
			book_writer: ids,
		} );
	};

	return (
		<FormTokenField
			label="Writer"
			value={ tokens }
			suggestions={ suggestions }
			onChange={ updateBookWriter }
		/>
	);
}

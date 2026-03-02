/**
 * Directory Search Block - View Script
 *
 * This block uses the shared frs/directory store defined by the grid block.
 * The search input uses data-wp-on--input and data-wp-bind--value directives.
 */
import { store } from '@wordpress/interactivity';

// This file just needs to import the interactivity module to enable directives.
// The store and actions are defined in the grid block's view.js.
// WordPress merges store definitions, so we don't need to redefine anything here.

// If you need search-specific functionality, you can extend the store:
store( 'frs/directory', {
	// Any search-specific state or actions can be added here.
	// They will be merged with the grid block's store definition.
} );

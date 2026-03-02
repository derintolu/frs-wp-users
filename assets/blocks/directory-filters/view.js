/**
 * Directory Filters Block - View Script
 *
 * This block uses the shared frs/directory store defined by the grid block.
 * Service area chips are server-rendered and use data-wp-on-async--click directives.
 */
import { store } from '@wordpress/interactivity';

// This file just needs to import the interactivity module to enable directives.
// The store and actions are defined in the grid block's view.js.
// WordPress merges store definitions, so we don't need to redefine anything here.

// If you need filter-specific functionality, you can extend the store:
store( 'frs/directory', {
	// Any filter-specific state or actions can be added here.
	// They will be merged with the grid block's store definition.
} );

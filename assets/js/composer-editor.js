/**
 * Composer Editor Bridge (runs inside the iframe)
 *
 * Handles postMessage communication between the minimal block editor
 * (inside the iframe) and the parent profile page composer chrome.
 *
 * @package FRSUsers
 * @since 3.3.0
 */
( function() {
	'use strict';

	var config = window.frsComposerConfig || {};
	var parentOrigin = window.location.origin;

	/**
	 * Send a message to the parent frame.
	 */
	function sendToParent( data ) {
		if ( window.parent && window.parent !== window ) {
			window.parent.postMessage( data, parentOrigin );
		}
	}

	/**
	 * Wait for the editor to be ready, then notify parent.
	 */
	function waitForEditor() {
		var check = setInterval( function() {
			try {
				var store = wp.data.select( 'core/editor' );
				if ( store && store.getCurrentPostId() ) {
					clearInterval( check );
					onEditorReady();
				}
			} catch ( e ) {
				// Editor not ready yet.
			}
		}, 200 );
	}

	/**
	 * Called once the editor is initialized and ready.
	 */
	function onEditorReady() {
		sendToParent( { type: 'frs-composer-ready' } );
		observeHeight();
		listenForParentMessages();
		listenForSaveComplete();
	}

	/**
	 * Listen for messages from the parent frame.
	 */
	function listenForParentMessages() {
		window.addEventListener( 'message', function( event ) {
			if ( ! event.data || ! event.data.type ) return;
			if ( event.origin !== parentOrigin ) return;

			switch ( event.data.type ) {
				case 'frs-composer-set-title':
					wp.data.dispatch( 'core/editor' ).editPost( {
						title: event.data.title,
					} );
					break;

				case 'frs-composer-publish':
					publishPost();
					break;

				case 'frs-composer-save-draft':
					saveDraft();
					break;

				case 'frs-composer-set-format':
					wp.data.dispatch( 'core/editor' ).editPost( {
						format: event.data.format,
					} );
					break;
			}
		} );
	}

	/**
	 * Publish the current post.
	 */
	function publishPost() {
		var dispatch = wp.data.dispatch( 'core/editor' );

		dispatch.editPost( { status: 'publish' } );
		dispatch.savePost().then( function() {
			var post = wp.data.select( 'core/editor' ).getCurrentPost();
			sendToParent( {
				type: 'frs-composer-published',
				postId: post.id,
				title: post.title,
				url: post.link || '',
				excerpt: ( post.excerpt && post.excerpt.rendered ) || '',
				format: post.format || 'standard',
			} );
		} ).catch( function( err ) {
			sendToParent( {
				type: 'frs-composer-error',
				message: err.message || 'Failed to publish',
			} );
		} );
	}

	/**
	 * Save post as draft.
	 */
	function saveDraft() {
		var dispatch = wp.data.dispatch( 'core/editor' );

		dispatch.editPost( { status: 'draft' } );
		dispatch.savePost().then( function() {
			sendToParent( { type: 'frs-composer-draft-saved' } );
		} ).catch( function( err ) {
			sendToParent( {
				type: 'frs-composer-error',
				message: err.message || 'Failed to save draft',
			} );
		} );
	}

	/**
	 * Listen for save completion events from the editor.
	 */
	function listenForSaveComplete() {
		wp.data.subscribe( function() {
			var isSaving = wp.data.select( 'core/editor' ).isSavingPost();
			var isAutosaving = wp.data.select( 'core/editor' ).isAutosavingPost();

			if ( ! isSaving && ! isAutosaving ) {
				// Send current content height after any save operation.
				sendHeight();
			}
		} );
	}

	/**
	 * Observe the editor content area for height changes and report to parent.
	 */
	function observeHeight() {
		var lastHeight = 0;

		function sendHeight() {
			var content = document.querySelector( '.interface-interface-skeleton__content' )
				|| document.querySelector( '.editor-styles-wrapper' )
				|| document.body;

			var height = content.scrollHeight;
			if ( height !== lastHeight ) {
				lastHeight = height;
				sendToParent( {
					type: 'frs-composer-height',
					height: Math.min( height, 600 ), // Cap at 600px.
				} );
			}
		}

		// Poll for height changes.
		setInterval( sendHeight, 500 );
		sendHeight();
	}

	/**
	 * Send current height to parent.
	 */
	function sendHeight() {
		var content = document.querySelector( '.interface-interface-skeleton__content' )
			|| document.querySelector( '.editor-styles-wrapper' )
			|| document.body;

		sendToParent( {
			type: 'frs-composer-height',
			height: Math.min( content.scrollHeight, 600 ),
		} );
	}

	// Start waiting for editor once DOM is ready.
	if ( typeof wp !== 'undefined' && wp.domReady ) {
		wp.domReady( waitForEditor );
	} else {
		document.addEventListener( 'DOMContentLoaded', function() {
			if ( typeof wp !== 'undefined' && wp.domReady ) {
				wp.domReady( waitForEditor );
			}
		} );
	}
} )();

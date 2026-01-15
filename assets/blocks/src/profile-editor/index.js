/**
 * Profile Editor Block - Editor Script
 *
 * Server-side rendered block for editing the current user's profile.
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

import './style.css';

registerBlockType( metadata.name, {
	edit: function Edit() {
		const blockProps = useBlockProps();

		return (
			<div { ...blockProps }>
				<div style={ {
					background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
					border: '2px dashed #dee2e6',
					borderRadius: '12px',
					padding: '48px 24px',
					textAlign: 'center',
					color: '#495057',
				} }>
					<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" style={ { marginBottom: '16px', color: '#6c757d' } }>
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
						<circle cx="12" cy="7" r="4" />
					</svg>
					<h3 style={ { margin: '0 0 8px', fontSize: '18px', fontWeight: '600' } }>
						{ __( 'Profile Editor', 'frs-users' ) }
					</h3>
					<p style={ { margin: '0', fontSize: '14px', color: '#6c757d' } }>
						{ __( "Displays the current logged-in user's editable profile.", 'frs-users' ) }
					</p>
					<p style={ { marginTop: '16px', fontStyle: 'italic', fontSize: '12px', color: '#6c757d' } }>
						{ __( 'This block renders on the frontend only.', 'frs-users' ) }
					</p>
				</div>
			</div>
		);
	},
	save: function Save() {
		return null;
	},
} );

/**
 * Directory Filters Block - Editor Script
 */
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { filter as icon } from '@wordpress/icons';

import metadata from './block.json';

// Sample state chips for editor preview
const SAMPLE_STATES = [ 'AZ', 'CA', 'CO', 'NV', 'TX', 'UT' ];

registerBlockType( metadata.name, {
	icon,
	edit: ( { attributes, setAttributes } ) => {
		const { title, hint, showClearButton } = attributes;
		const blockProps = useBlockProps( {
			className: 'frs-directory-filters',
		} );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Filter Settings', 'frs-users' ) }>
						<TextControl
							label={ __( 'Section Title', 'frs-users' ) }
							value={ title }
							onChange={ ( value ) => setAttributes( { title: value } ) }
						/>
						<TextControl
							label={ __( 'Hint Text', 'frs-users' ) }
							value={ hint }
							onChange={ ( value ) => setAttributes( { hint: value } ) }
						/>
						<ToggleControl
							label={ __( 'Show Clear Button', 'frs-users' ) }
							checked={ showClearButton }
							onChange={ ( value ) => setAttributes( { showClearButton: value } ) }
						/>
					</PanelBody>
				</InspectorControls>
				<div { ...blockProps }>
					<div className="frs-sidebar__section">
						<div className="frs-sidebar__header">
							<label className="frs-sidebar__label">{ title }</label>
							{ showClearButton && (
								<button className="frs-sidebar__clear" disabled>
									{ __( 'Clear All', 'frs-users' ) }
								</button>
							) }
						</div>
						<p className="frs-sidebar__hint">{ hint }</p>
						<div className="frs-service-areas">
							{ SAMPLE_STATES.map( ( state ) => (
								<div
									key={ state }
									className="frs-service-area-chip"
								>
									{ state }
								</div>
							) ) }
						</div>
					</div>
				</div>
			</>
		);
	},
	save: () => null, // Dynamic block - rendered by PHP
} );

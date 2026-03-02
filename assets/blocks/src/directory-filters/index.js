/**
 * Directory Filters Block - Editor Script
 *
 * Uses exact same CSS classes as the monolithic loan-officer-directory sidebar.
 */
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { filter as icon } from '@wordpress/icons';

import metadata from './block.json';
import './style.css';

// Sample state chips for editor preview
const SAMPLE_STATES = [ 'AZ', 'CA', 'CO', 'NV', 'TX', 'UT' ];

registerBlockType( metadata.name, {
	icon,
	edit: ( { attributes, setAttributes } ) => {
		const { title, hint, showClearButton } = attributes;
		const blockProps = useBlockProps( {
			className: 'frs-directory__sidebar',
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
				<aside { ...blockProps }>
					<div className="frs-sidebar__header">
						<h3>{ title }</h3>
						{ showClearButton && (
							<button className="frs-sidebar__clear" disabled>
								{ __( 'Clear All', 'frs-users' ) }
							</button>
						) }
					</div>
					<div className="frs-sidebar__section">
						<label className="frs-sidebar__label">{ __( 'Search', 'frs-users' ) }</label>
						<div className="frs-sidebar__input-wrap">
							<input
								type="text"
								className="frs-sidebar__input"
								placeholder={ __( 'Name or location...', 'frs-users' ) }
								disabled
							/>
						</div>
					</div>
					<div className="frs-sidebar__section">
						<label className="frs-sidebar__label">{ __( 'Service Areas', 'frs-users' ) }</label>
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
				</aside>
			</>
		);
	},
	save: () => null,
} );

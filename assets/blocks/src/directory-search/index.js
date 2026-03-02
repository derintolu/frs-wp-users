/**
 * Directory Search Block - Editor Script
 */
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { search as icon } from '@wordpress/icons';

import metadata from './block.json';
import './style.css';

registerBlockType( metadata.name, {
	icon,
	edit: ( { attributes, setAttributes } ) => {
		const { placeholder, showButton, buttonText } = attributes;
		const blockProps = useBlockProps( {
			className: 'frs-directory-search',
		} );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Search Settings', 'frs-users' ) }>
						<TextControl
							label={ __( 'Placeholder Text', 'frs-users' ) }
							value={ placeholder }
							onChange={ ( value ) => setAttributes( { placeholder: value } ) }
						/>
						<ToggleControl
							label={ __( 'Show Search Button', 'frs-users' ) }
							checked={ showButton }
							onChange={ ( value ) => setAttributes( { showButton: value } ) }
						/>
						{ showButton && (
							<TextControl
								label={ __( 'Button Text', 'frs-users' ) }
								value={ buttonText }
								onChange={ ( value ) => setAttributes( { buttonText: value } ) }
							/>
						) }
					</PanelBody>
				</InspectorControls>
				<div { ...blockProps }>
					<form className="frs-directory-search__form">
						<div className="frs-directory-search__input-wrap">
							<input
								type="search"
								className="frs-directory-search__input"
								placeholder={ placeholder }
								disabled
							/>
							<svg className="frs-directory-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<circle cx="11" cy="11" r="8"/>
								<path d="m21 21-4.35-4.35"/>
							</svg>
						</div>
						{ showButton && (
							<button type="button" className="frs-directory-search__button" disabled>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<circle cx="11" cy="11" r="8"/>
									<path d="m21 21-4.35-4.35"/>
								</svg>
								<span>{ buttonText }</span>
							</button>
						) }
					</form>
				</div>
			</>
		);
	},
	save: () => null, // Dynamic block - rendered by PHP
} );

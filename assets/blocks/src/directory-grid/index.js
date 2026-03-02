/**
 * Directory Grid Block - Editor Script
 */
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { grid as icon } from '@wordpress/icons';

import metadata from './block.json';
import './style.css';

// Sample card for editor preview
const SampleCard = ( { name, title, initials } ) => (
	<div className="frs-card">
		<div className="frs-card__header"></div>
		<div className="frs-card__avatar">
			<div className="frs-card__avatar-placeholder">{ initials }</div>
		</div>
		<div className="frs-card__content">
			<h3 className="frs-card__name">{ name }</h3>
			<p className="frs-card__title">{ title }</p>
			<p className="frs-card__nmls">NMLS# 123456</p>
			<div className="frs-card__service-areas">
				<span className="frs-card__area-tag">CA</span>
				<span className="frs-card__area-tag">AZ</span>
			</div>
		</div>
		<div className="frs-card__actions">
			<button className="frs-card__btn frs-card__btn--primary" disabled>
				{ __( 'View Profile', 'frs-users' ) }
			</button>
			<button className="frs-card__btn frs-card__btn--outline" disabled>
				{ __( 'Call', 'frs-users' ) }
			</button>
		</div>
	</div>
);

const SAMPLE_PROFILES = [
	{ name: 'John Smith', title: 'Senior Loan Officer', initials: 'JS' },
	{ name: 'Sarah Johnson', title: 'Loan Officer', initials: 'SJ' },
	{ name: 'Mike Davis', title: 'Branch Manager', initials: 'MD' },
	{ name: 'Emily Chen', title: 'Loan Officer', initials: 'EC' },
	{ name: 'Robert Wilson', title: 'Senior Loan Officer', initials: 'RW' },
	{ name: 'Lisa Brown', title: 'Loan Officer', initials: 'LB' },
];

registerBlockType( metadata.name, {
	icon,
	edit: ( { attributes, setAttributes } ) => {
		const { perPage, columns, showCount, showLoadMore } = attributes;
		const blockProps = useBlockProps( {
			className: 'frs-directory-grid',
		} );

		// Show sample cards based on perPage (up to 6 for preview)
		const visibleCards = SAMPLE_PROFILES.slice( 0, Math.min( perPage, 6 ) );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Grid Settings', 'frs-users' ) }>
						<RangeControl
							label={ __( 'Profiles Per Page', 'frs-users' ) }
							value={ perPage }
							onChange={ ( value ) => setAttributes( { perPage: value } ) }
							min={ 3 }
							max={ 24 }
							step={ 3 }
						/>
						<RangeControl
							label={ __( 'Columns', 'frs-users' ) }
							value={ columns }
							onChange={ ( value ) => setAttributes( { columns: value } ) }
							min={ 2 }
							max={ 4 }
						/>
					</PanelBody>
					<PanelBody title={ __( 'Display Options', 'frs-users' ) }>
						<ToggleControl
							label={ __( 'Show Result Count', 'frs-users' ) }
							checked={ showCount }
							onChange={ ( value ) => setAttributes( { showCount: value } ) }
						/>
						<ToggleControl
							label={ __( 'Show Load More Button', 'frs-users' ) }
							checked={ showLoadMore }
							onChange={ ( value ) => setAttributes( { showLoadMore: value } ) }
						/>
					</PanelBody>
				</InspectorControls>
				<div { ...blockProps }>
					{ showCount && (
						<div className="frs-directory__results-header">
							<span className="frs-directory__count">
								<span>{ visibleCards.length }</span> { __( 'loan officers', 'frs-users' ) }
							</span>
						</div>
					) }
					<div
						className="frs-directory__grid"
						style={ {
							display: 'grid',
							gridTemplateColumns: `repeat(${ columns }, 1fr)`,
							gap: '1.5rem',
						} }
					>
						{ visibleCards.map( ( profile, index ) => (
							<SampleCard key={ index } { ...profile } />
						) ) }
					</div>
					{ showLoadMore && (
						<div className="frs-directory__load-more">
							<button className="frs-btn frs-btn--primary" disabled>
								{ __( 'Load More', 'frs-users' ) }
							</button>
						</div>
					) }
				</div>
			</>
		);
	},
	save: () => null, // Dynamic block - rendered by PHP
} );

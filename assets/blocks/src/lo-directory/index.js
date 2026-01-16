import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, TextControl } from '@wordpress/components';
import './editor.scss';

// Default template with the search bar included
const HERO_TEMPLATE = [
    ['core/group', { 
        className: 'frs-hero',
        style: {
            spacing: {
                padding: { top: '80px', bottom: '80px' }
            }
        },
        layout: { type: 'constrained' }
    }, [
        ['core/heading', { 
            level: 1, 
            content: 'Find Your Loan Officer',
            textAlign: 'center',
            className: 'frs-hero__headline'
        }],
        ['core/paragraph', { 
            content: 'Connect with a mortgage professional in your area',
            align: 'center',
            className: 'frs-hero__subheadline'
        }]
    ]]
];

registerBlockType('frs/lo-directory', {
    edit: function Edit({ attributes, setAttributes }) {
        const { perPage, columns, searchPlaceholder } = attributes;
        const blockProps = useBlockProps({
            className: 'frs-directory-editor'
        });

        return (
            <>
                <InspectorControls>
                    <PanelBody title="Directory Settings" initialOpen={true}>
                        <RangeControl
                            label="Cards per page"
                            value={perPage}
                            onChange={(value) => setAttributes({ perPage: value })}
                            min={4}
                            max={24}
                            step={4}
                        />
                        <RangeControl
                            label="Columns"
                            value={columns}
                            onChange={(value) => setAttributes({ columns: value })}
                            min={2}
                            max={5}
                        />
                    </PanelBody>
                    <PanelBody title="Search Bar" initialOpen={true}>
                        <TextControl
                            label="Placeholder text"
                            value={searchPlaceholder}
                            onChange={(value) => setAttributes({ searchPlaceholder: value })}
                        />
                    </PanelBody>
                </InspectorControls>
                <div {...blockProps}>
                    {/* Hero Section - Editable with InnerBlocks */}
                    <div className="frs-directory-editor__hero">
                        <InnerBlocks
                            template={HERO_TEMPLATE}
                            templateLock={false}
                        />
                        
                        {/* Search Bar - Always shown, styled to match */}
                        <div className="frs-directory-editor__search-bar">
                            <form className="frs-search">
                                <input 
                                    type="text" 
                                    className="frs-search__input"
                                    placeholder={searchPlaceholder}
                                    disabled
                                />
                                <button type="button" className="frs-search__btn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                                    </svg>
                                    <span>Search</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Directory Preview */}
                    <div className="frs-directory-editor__preview">
                        <div className="frs-directory-editor__sidebar">
                            <div className="frs-directory-editor__sidebar-header">
                                <span>Filter Results</span>
                            </div>
                            <div className="frs-directory-editor__sidebar-section">
                                <label>Search</label>
                                <div className="frs-directory-editor__search-input">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                                    </svg>
                                    <span>Name or location...</span>
                                </div>
                            </div>
                            <div className="frs-directory-editor__sidebar-section">
                                <label>Licensed States</label>
                                <div className="frs-directory-editor__state-chips">
                                    {['CA', 'TX', 'FL', 'NY', 'AZ', 'NV', 'WA', 'OR'].map(state => (
                                        <span key={state} className="frs-directory-editor__chip">{state}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="frs-directory-editor__main">
                            <div className="frs-directory-editor__results-header">
                                <span>{perPage} loan officers</span>
                            </div>
                            <div className={`frs-directory-editor__grid frs-directory-editor__grid--cols-${columns}`}>
                                {Array.from({ length: Math.min(perPage, 8) }, (_, i) => (
                                    <div key={i} className="frs-directory-editor__card">
                                        <div className="frs-directory-editor__card-header"></div>
                                        <div className="frs-directory-editor__card-avatar"></div>
                                        <div className="frs-directory-editor__card-content">
                                            <div className="frs-directory-editor__card-name"></div>
                                            <div className="frs-directory-editor__card-title"></div>
                                            <div className="frs-directory-editor__card-tags">
                                                <span></span><span></span><span></span>
                                            </div>
                                        </div>
                                        <div className="frs-directory-editor__card-actions">
                                            <span></span><span></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    },

    save: function Save() {
        const blockProps = useBlockProps.save();
        return (
            <div {...blockProps}>
                <InnerBlocks.Content />
            </div>
        );
    }
});

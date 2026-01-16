import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ToggleControl } from '@wordpress/components';
import './editor.scss';

registerBlockType('frs/lo-grid', {
    edit: function Edit({ attributes, setAttributes }) {
        const { perPage, columns, showSidebar } = attributes;
        const blockProps = useBlockProps({
            className: `frs-lo-grid-editor frs-lo-grid-editor--cols-${columns}${showSidebar ? ' frs-lo-grid-editor--with-sidebar' : ''}`
        });

        // Generate placeholder cards
        const placeholderCards = Array.from({ length: Math.min(perPage, 8) }, (_, i) => (
            <div key={i} className="frs-lo-grid-editor__card">
                <div className="frs-lo-grid-editor__card-header"></div>
                <div className="frs-lo-grid-editor__card-avatar"></div>
                <div className="frs-lo-grid-editor__card-content">
                    <div className="frs-lo-grid-editor__card-name"></div>
                    <div className="frs-lo-grid-editor__card-title"></div>
                    <div className="frs-lo-grid-editor__card-tags">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <div className="frs-lo-grid-editor__card-actions">
                    <span></span>
                    <span></span>
                </div>
            </div>
        ));

        return (
            <>
                <InspectorControls>
                    <PanelBody title="Grid Settings" initialOpen={true}>
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
                        <ToggleControl
                            label="Show sidebar filters"
                            checked={showSidebar}
                            onChange={(value) => setAttributes({ showSidebar: value })}
                            help={showSidebar ? "Sidebar with search and state filters" : "Inline search bar only"}
                        />
                    </PanelBody>
                </InspectorControls>
                <div {...blockProps}>
                    {showSidebar && (
                        <div className="frs-lo-grid-editor__sidebar">
                            <div className="frs-lo-grid-editor__sidebar-header">
                                <span>Filter Results</span>
                            </div>
                            <div className="frs-lo-grid-editor__sidebar-section">
                                <label>Search</label>
                                <div className="frs-lo-grid-editor__search-input">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                                    </svg>
                                    <span>Name or location...</span>
                                </div>
                            </div>
                            <div className="frs-lo-grid-editor__sidebar-section">
                                <label>Licensed States</label>
                                <div className="frs-lo-grid-editor__state-chips">
                                    {['CA', 'TX', 'FL', 'NY', 'AZ', 'NV', 'WA', 'OR'].map(state => (
                                        <span key={state} className="frs-lo-grid-editor__chip">{state}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="frs-lo-grid-editor__main">
                        {!showSidebar && (
                            <div className="frs-lo-grid-editor__inline-search">
                                <div className="frs-lo-grid-editor__search-input frs-lo-grid-editor__search-input--large">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                                    </svg>
                                    <span>Search by name or location...</span>
                                </div>
                                <div className="frs-lo-grid-editor__state-chips frs-lo-grid-editor__state-chips--inline">
                                    {['CA', 'TX', 'FL', 'NY', 'AZ', 'NV'].map(state => (
                                        <span key={state} className="frs-lo-grid-editor__chip">{state}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="frs-lo-grid-editor__results-header">
                            <span>{perPage} loan officers</span>
                        </div>
                        <div className="frs-lo-grid-editor__grid">
                            {placeholderCards}
                        </div>
                        <div className="frs-lo-grid-editor__load-more">
                            <button>Load More</button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
});

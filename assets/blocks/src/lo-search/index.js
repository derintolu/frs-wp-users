import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, SelectControl } from '@wordpress/components';
import './editor.scss';

registerBlockType('frs/lo-search', {
    edit: function Edit({ attributes, setAttributes }) {
        const { placeholder, buttonText, showButton, size } = attributes;
        const blockProps = useBlockProps({
            className: `frs-lo-search-editor frs-lo-search-editor--${size}`
        });

        return (
            <>
                <InspectorControls>
                    <PanelBody title="Search Settings" initialOpen={true}>
                        <TextControl
                            label="Placeholder text"
                            value={placeholder}
                            onChange={(value) => setAttributes({ placeholder: value })}
                        />
                        <ToggleControl
                            label="Show search button"
                            checked={showButton}
                            onChange={(value) => setAttributes({ showButton: value })}
                        />
                        {showButton && (
                            <TextControl
                                label="Button text"
                                value={buttonText}
                                onChange={(value) => setAttributes({ buttonText: value })}
                            />
                        )}
                        <SelectControl
                            label="Size"
                            value={size}
                            options={[
                                { label: 'Small', value: 'small' },
                                { label: 'Medium', value: 'medium' },
                                { label: 'Large', value: 'large' },
                            ]}
                            onChange={(value) => setAttributes({ size: value })}
                        />
                    </PanelBody>
                </InspectorControls>
                <div {...blockProps}>
                    <form className="frs-lo-search-editor__form">
                        <div className="frs-lo-search-editor__input-wrap">
                            <svg className="frs-lo-search-editor__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input 
                                type="text" 
                                className="frs-lo-search-editor__input"
                                placeholder={placeholder}
                                disabled
                            />
                        </div>
                        {showButton && (
                            <button type="button" className="frs-lo-search-editor__btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                                </svg>
                                <span>{buttonText}</span>
                            </button>
                        )}
                    </form>
                </div>
            </>
        );
    }
});

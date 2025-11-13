import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface EditProps {
	attributes: {
		user_id: number;
		showHeadshot: boolean;
		layout: string;
	};
	setAttributes: (attributes: Partial<EditProps['attributes']>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	const { showHeadshot, layout } = attributes;
	const blockProps = useBlockProps();

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('About Section Settings', 'frs-users')}>
					<ToggleControl
						label={__('Show Headshot', 'frs-users')}
						checked={showHeadshot}
						onChange={(value) => setAttributes({ showHeadshot: value })}
					/>
					<SelectControl
						label={__('Layout', 'frs-users')}
						value={layout}
						options={[
							{ label: __('Side by Side', 'frs-users'), value: 'sidebyside' },
							{ label: __('Stacked', 'frs-users'), value: 'stacked' },
						]}
						onChange={(value) => setAttributes({ layout: value })}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div
					className={`frs-company-about frs-company-about--${layout}`}
					style={{ padding: '3rem 1rem', maxWidth: '1200px', margin: '0 auto' }}
				>
					<div style={{ display: layout === 'sidebyside' ? 'grid' : 'block', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
						{showHeadshot && (
							<div
								style={{
									width: layout === 'stacked' ? '200px' : '100%',
									height: layout === 'stacked' ? '200px' : '300px',
									margin: layout === 'stacked' ? '0 auto 2rem' : '0',
									background: '#e5e7eb',
									borderRadius: '8px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#6b7280',
								}}
							>
								Image
							</div>
						)}
						<div>
							<h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '2rem' }}>
								{__('About Us', 'frs-users')}
							</h2>
							<p style={{ margin: '0 0 1rem', lineHeight: 1.7, color: '#374151' }}>
								{__('Your company biography and description will appear here. This content comes from your profile data.', 'frs-users')}
							</p>
							<p style={{ margin: 0, lineHeight: 1.7, color: '#374151' }}>
								{__('Multiple paragraphs of content can be displayed to tell your company story and showcase your expertise.', 'frs-users')}
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface EditProps {
	attributes: {
		user_id: number;
		showLogo: boolean;
		showTagline: boolean;
		alignment: string;
	};
	setAttributes: (attributes: Partial<EditProps['attributes']>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	const { showLogo, showTagline, alignment } = attributes;
	const blockProps = useBlockProps();

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Header Settings', 'frs-users')}>
					<ToggleControl
						label={__('Show Logo', 'frs-users')}
						checked={showLogo}
						onChange={(value) => setAttributes({ showLogo: value })}
					/>
					<ToggleControl
						label={__('Show Tagline', 'frs-users')}
						checked={showTagline}
						onChange={(value) => setAttributes({ showTagline: value })}
					/>
					<SelectControl
						label={__('Alignment', 'frs-users')}
						value={alignment}
						options={[
							{ label: __('Left', 'frs-users'), value: 'left' },
							{ label: __('Center', 'frs-users'), value: 'center' },
							{ label: __('Right', 'frs-users'), value: 'right' },
						]}
						onChange={(value) => setAttributes({ alignment: value })}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div
					className={`frs-company-header frs-company-header--${alignment}`}
					style={{
						padding: '3rem 1rem',
						background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
						color: '#fff',
						textAlign: alignment as 'left' | 'center' | 'right',
					}}
				>
					{showLogo && (
						<div style={{ marginBottom: '1rem' }}>
							<div
								style={{
									width: '120px',
									height: '120px',
									margin: alignment === 'center' ? '0 auto' : alignment === 'right' ? '0 0 0 auto' : '0',
									background: '#fff',
									borderRadius: '8px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#2563eb',
									fontSize: '14px',
								}}
							>
								Logo
							</div>
						</div>
					)}
					<h1 style={{ margin: '0 0 0.5rem', fontSize: '2.5rem', fontWeight: '700' }}>
						{__('Company Name', 'frs-users')}
					</h1>
					{showTagline && (
						<p style={{ margin: 0, fontSize: '1.25rem', opacity: 0.9 }}>
							{__('Your trusted partner in home financing', 'frs-users')}
						</p>
					)}
				</div>
			</div>
		</>
	);
}

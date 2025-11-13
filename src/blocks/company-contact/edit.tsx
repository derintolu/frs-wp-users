import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface EditProps {
	attributes: {
		user_id: number;
		showSocial: boolean;
		showLocation: boolean;
		layout: string;
	};
	setAttributes: (attributes: Partial<EditProps['attributes']>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	const { showSocial, showLocation, layout } = attributes;
	const blockProps = useBlockProps();

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Contact Section Settings', 'frs-users')}>
					<ToggleControl
						label={__('Show Social Links', 'frs-users')}
						checked={showSocial}
						onChange={(value) => setAttributes({ showSocial: value })}
					/>
					<ToggleControl
						label={__('Show Location', 'frs-users')}
						checked={showLocation}
						onChange={(value) => setAttributes({ showLocation: value })}
					/>
					<SelectControl
						label={__('Layout', 'frs-users')}
						value={layout}
						options={[
							{ label: __('Grid', 'frs-users'), value: 'grid' },
							{ label: __('Stacked', 'frs-users'), value: 'stacked' },
						]}
						onChange={(value) => setAttributes({ layout: value })}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div
					className={`frs-company-contact frs-company-contact--${layout}`}
					style={{ padding: '3rem 1rem', background: '#f9fafb', maxWidth: '1200px', margin: '0 auto' }}
				>
					<h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>
						{__('Get in Touch', 'frs-users')}
					</h2>

					<div style={{ display: 'grid', gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fit, minmax(250px, 1fr))' : '1fr', gap: '2rem' }}>
						<div style={{ padding: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
							<div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📧</div>
							<h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem' }}>{__('Email', 'frs-users')}</h3>
							<p style={{ margin: 0, color: '#2563eb' }}>contact@example.com</p>
						</div>

						<div style={{ padding: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
							<div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📞</div>
							<h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem' }}>{__('Phone', 'frs-users')}</h3>
							<p style={{ margin: 0, color: '#2563eb' }}>(555) 123-4567</p>
						</div>

						{showLocation && (
							<div style={{ padding: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
								<div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📍</div>
								<h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem' }}>{__('Location', 'frs-users')}</h3>
								<p style={{ margin: 0, color: '#6b7280' }}>City, State</p>
							</div>
						)}
					</div>

					{showSocial && (
						<div style={{ marginTop: '2rem', textAlign: 'center' }}>
							<p style={{ marginBottom: '1rem', color: '#6b7280' }}>{__('Follow Us', 'frs-users')}</p>
							<div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
								{['Facebook', 'LinkedIn', 'Instagram'].map((social) => (
									<div
										key={social}
										style={{
											width: '40px',
											height: '40px',
											background: '#2563eb',
											borderRadius: '50%',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											color: '#fff',
											fontSize: '0.75rem',
										}}
									>
										{social[0]}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

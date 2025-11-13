import { useBlockProps } from '@wordpress/block-editor';
import { Placeholder, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

interface EditProps {
	attributes: {
		user_id: number;
	};
	setAttributes: (attributes: Partial<EditProps['attributes']>) => void;
}

interface WPUser {
	id: number;
	name: string;
}

export default function Edit({ attributes, setAttributes }: EditProps): JSX.Element {
	const { user_id } = attributes;

	const blockProps = useBlockProps();

	// Get all users for selection
	const users = useSelect((select) => {
		return select(coreStore).getUsers({ per_page: -1 }) as WPUser[] | null;
	}, []);

	// Build user options - "Page Author" as default option
	const userOptions = users
		? [
				{ label: __('Page Author (Auto)', 'lending-resource-hub'), value: 0 },
				...users.map((user) => ({
					label: user.name,
					value: user.id,
				})),
		  ]
		: [{ label: __('Loading...', 'lending-resource-hub'), value: 0 }];

	return (
		<div {...blockProps}>
			<Placeholder
				icon="id-alt"
				label={__('Profile Card', 'lending-resource-hub')}
				instructions={__(
					'Display a profile card with contact info, social links, and QR code. Defaults to page author.',
					'lending-resource-hub'
				)}
			>
				<SelectControl
					label={__('User', 'lending-resource-hub')}
					value={user_id}
					options={userOptions}
					onChange={(value) => setAttributes({ user_id: parseInt(value) })}
					help={__(
						'Select a specific user or leave as "Page Author" to use the page author.',
						'lending-resource-hub'
					)}
				/>
				<div className="components-placeholder__preview">
					<p className="description">
						{user_id === 0
							? __('Profile card will display the page author\'s data.', 'lending-resource-hub')
							: __('Profile card will display the selected user\'s data.', 'lending-resource-hub')}
					</p>
				</div>
			</Placeholder>
		</div>
	);
}

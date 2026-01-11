/**
 * FRS Profile Edit Entry Point
 */
import { createRoot } from '@wordpress/element';
import ProfileEdit from './ProfileEdit';
import './profile-edit.scss';

const container = document.getElementById('frs-profile-edit-root');
if (container) {
	const root = createRoot(container);
	root.render(<ProfileEdit />);
}

/**
 * FRS Profile Add Entry Point
 */
import { createRoot } from '@wordpress/element';
import ProfileAdd from './ProfileAdd';
import './profile-edit.scss';

const container = document.getElementById('frs-profile-add-root');
if (container) {
	const root = createRoot(container);
	root.render(<ProfileAdd />);
}

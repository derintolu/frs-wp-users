/**
 * FRS Profiles Admin App
 *
 * WordPress-native admin interface using Gutenberg components.
 */
import { render } from '@wordpress/element';
import App from './App';
import './style.scss';

// Render immediately (script loads in footer, so DOM is already ready)
const root = document.getElementById('frs-profiles-admin-root');

if (root) {
	render(<App />, root);
}

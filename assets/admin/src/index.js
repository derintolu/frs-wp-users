/**
 * FRS Profiles Admin App
 *
 * WordPress-native admin interface using Gutenberg components.
 */
import { render } from '@wordpress/element';
import App from './App';
import './index.css';

// Wait for DOM ready
document.addEventListener('DOMContentLoaded', () => {
	const root = document.getElementById('frs-profiles-admin-root');

	if (root) {
		render(<App />, root);
	}
});

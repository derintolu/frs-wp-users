/**
 * Twenty CRM Settings Entry Point
 */
import { render } from '@wordpress/element';
import TwentyCRMSettings from './TwentyCRMSettings';
import './style.scss';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('frs-twenty-crm-settings-root');
	if (container) {
		render(<TwentyCRMSettings />, container);
	}
});

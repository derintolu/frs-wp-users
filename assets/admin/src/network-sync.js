/**
 * Network Sync Control Panel Entry Point
 */
import { render } from '@wordpress/element';
import NetworkSyncPanel from './NetworkSyncPanel';
import './style.scss';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('frs-network-sync-root');
	if (container) {
		render(<NetworkSyncPanel />, container);
	}
});

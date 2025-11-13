/**
 * WordPress Interactivity API - Profile Card Block
 */

import { store, getContext } from '@wordpress/interactivity';
import QRCodeStyling from 'qr-code-styling';

interface ProfileCardContext {
	showQRCode: boolean;
	biolinkUrl: string;
}

const { state } = store('lrh/profile-card', {
	state: {},
	actions: {
		toggleQRCode() {
			const context = getContext<ProfileCardContext>();
			context.showQRCode = !context.showQRCode;
		},
		initQRCode() {
			const context = getContext<ProfileCardContext>();
			const qrContainer = event.currentTarget as HTMLElement;

			if (qrContainer.querySelector('canvas')) {
				return;
			}

			const qrCode = new QRCodeStyling({
				width: 200,
				height: 200,
				type: 'canvas',
				data: context.biolinkUrl,
				dotsOptions: {
					color: '#1e3a8a',
					type: 'rounded'
				},
				backgroundOptions: {
					color: '#ffffff',
				},
				cornersSquareOptions: {
					color: '#2dd4da',
					type: 'extra-rounded'
				},
				cornersDotOptions: {
					color: '#2563eb',
					type: 'dot'
				},
				imageOptions: {
					crossOrigin: 'anonymous',
					margin: 8
				}
			});

			qrCode.append(qrContainer);
		}
	}
});

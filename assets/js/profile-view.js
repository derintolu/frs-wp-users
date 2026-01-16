/**
 * Profile Template Interactivity API Store
 * 
 * Handles interactive behaviors for the loan officer profile page.
 * Uses WordPress Interactivity API directives in the PHP template.
 */
import { store, getContext } from '@wordpress/interactivity';

store('frs/profile', {
    actions: {
        /**
         * Toggles the avatar flip state.
         * 
         * The avatar has two faces:
         * - Front: Profile photo with QR button
         * - Back: QR code with avatar button
         * 
         * Each face has its own button inside it, so buttons flip with the card.
         * No need to show/hide buttons - they're always visible on their respective face.
         */
        flip() {
            const context = getContext();
            context.isFlipped = !context.isFlipped;
        },
    },
});

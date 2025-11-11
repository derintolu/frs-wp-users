import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
	plugins: [react()],
	build: {
		outDir: resolve(__dirname, 'assets/widget'),
		lib: {
			entry: resolve(__dirname, 'src/widget/loan-officer-directory-widget.tsx'),
			name: 'FRSLoanOfficerDirectoryWidget',
			fileName: 'loan-officer-directory-widget',
			formats: ['iife'], // Self-executing function for script tag embedding
		},
		rollupOptions: {
			output: {
				// Ensure CSS is bundled into the JS file
				assetFileNames: 'loan-officer-directory-widget.[ext]',
			},
		},
		minify: true,
		sourcemap: false,
	},
});

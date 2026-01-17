/**
 * WordPress Scripts webpack configuration for FRS Directory Blocks
 * 
 * Handles both regular block scripts and Interactivity API view modules
 */
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

// Get default entries
const defaultEntries = defaultConfig.entry();

// Main config for regular block scripts (no module settings)
const mainConfig = {
	mode: defaultConfig.mode,
	target: defaultConfig.target,
	entry: defaultEntries,
	output: defaultConfig.output,
	module: defaultConfig.module,
	plugins: defaultConfig.plugins,
	resolve: defaultConfig.resolve,
	optimization: defaultConfig.optimization,
	devtool: defaultConfig.devtool,
};

// Separate config for Interactivity API view module
const viewModuleConfig = {
	mode: defaultConfig.mode,
	target: defaultConfig.target,
	entry: {
		'profile-editor/view': path.resolve(__dirname, 'src/profile-editor/view.js'),
	},
	output: {
		...defaultConfig.output,
		module: true,
		chunkFormat: 'module',
		library: {
			type: 'module',
		},
	},
	module: defaultConfig.module,
	plugins: defaultConfig.plugins.filter(
		(plugin) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
	),
	resolve: defaultConfig.resolve,
	experiments: {
		outputModule: true,
	},
	externalsType: 'module',
	externals: {
		'@wordpress/interactivity': '@wordpress/interactivity',
	},
};

module.exports = [mainConfig, viewModuleConfig];

/**
 * WordPress Scripts webpack configuration for FRS Directory Blocks
 */
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
    ...defaultConfig,
    entry: {
        'directory-search/index': path.resolve(__dirname, 'directory-search/edit.js'),
        'directory-grid/index': path.resolve(__dirname, 'directory-grid/edit.js'),
    },
    output: {
        ...defaultConfig.output,
        path: path.resolve(__dirname),
        filename: '[name].js',
    },
};

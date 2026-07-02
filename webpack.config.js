const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/gui/script.js',
    output: {
        filename: 'webview-bundle.js',
        path: path.resolve(__dirname, 'src', 'gui'),
    },
    optimization: {
        minimize: false,
    },
};

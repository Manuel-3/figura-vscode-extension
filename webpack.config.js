const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/gui/script.js',
    output: {
        filename: 'webview-bundle.js',
        path: path.resolve(__dirname, 'src', 'gui'),
    },
};

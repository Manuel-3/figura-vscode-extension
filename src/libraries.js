const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const appdata_dir = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');

if (vscode.workspace.getConfiguration('figura').get('librariesFolderPath') == '') {
    vscode.workspace.getConfiguration('figura').update('librariesFolderPath', path.join(appdata_dir, '/.minecraft/figura/model_files/libraries/'), vscode.ConfigurationTarget.Global);
}

const destination_dir = vscode.workspace.getConfiguration('figura').get('librariesFolderPath');

function getLibraries() {
    let libs = [];
    if (fs.existsSync(destination_dir)) {
        libs = fs.readdirSync(destination_dir)
            .filter(x => x?.endsWith('.lua'))
            .map(x => { return { name: x.substring(0, x.length - 4), content: fs.readFileSync(path.join(destination_dir, x)).toString(), path: path.join(destination_dir, x) } });
    }
    return libs;
}

module.exports = { getLibraries };
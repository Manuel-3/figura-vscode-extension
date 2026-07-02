const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function isInstalled() {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    // If no folders are open, return false
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return false;
    }

    // .some() returns true if at least one element in the array passes the test
    return workspaceFolders.some(folder => {
        const configPath = path.join(folder.uri.fsPath, '.luarc.json');
        return fs.existsSync(configPath);
    });
}

module.exports = { isInstalled };

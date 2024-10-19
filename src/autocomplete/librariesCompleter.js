const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const libraries = require('../libraries');
const { findAvatarFolder } = require('../util');

/**
 * @param {vscode.ExtensionContext} context 
 */
function activate(context) {
    const librariesImportProvider = vscode.languages.registerCompletionItemProvider(
        'lua',
        {
            provideCompletionItems(document, position, token, context) {
                let items = combined(libraries.getLibraries()).map(lib => {
                    let item = new vscode.CompletionItem('import: ' + lib.name, vscode.CompletionItemKind.File);
                    item.insertText = lib.content;
                    return item;
                });
                return items;
            }
        }
    );
    
    const copyLibCommand = 'figura.copyLib';
    const copyLibCommandHandler = (sourcePath, name, requirePath) => {
        if (vscode.workspace.workspaceFolders != undefined) {
            let currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document.uri.fsPath;
            let currentlyOpenTabFolderPath;
            if (currentlyOpenTabfilePath != undefined) currentlyOpenTabFolderPath = path.dirname(currentlyOpenTabfilePath);
            const targetPath = path.join(findAvatarFolder(currentlyOpenTabFolderPath), requirePath, `${name}.lua`);
            if (!fs.existsSync(path.dirname(targetPath))) {
                fs.mkdirSync(path.dirname(targetPath), { recursive: true });
            }
            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, targetPath, fs.constants.COPYFILE_EXCL); // do not overwrite if already exists
            }
        }
    };

    context.subscriptions.push(vscode.commands.registerCommand(copyLibCommand, copyLibCommandHandler));
    
    const librariesRequireProvider = vscode.languages.registerCompletionItemProvider(
        'lua',
        {
            provideCompletionItems(document, position, token, context) {
                let items = combined(libraries.getLibraries()).map(lib => {
                    let item = new vscode.CompletionItem('require: ' + lib.name, vscode.CompletionItemKind.File);
                    const requirePath = vscode.workspace.getConfiguration('figura').get('requirePath');
                    const requireTarget = path.join(requirePath, lib.name).replaceAll('\\', '/').replace(/^\//, '');
                    const needLocalVar = document.lineAt(position).text.substr(0, position.character-1).trim()=='';
                    let varName = lib.name;
                    let match = lib.name.match(/[^\.]+\.?(.+)/); // remove author from file name for the variable
                    if (lib.name.includes('.') && match && match[1]) {
                        varName = match[1];
                    }
                    item.insertText = needLocalVar ? `local ${varName} = require("${requireTarget}")` : `require("${requireTarget}")`;
                    item.command = {};
                    item.command.title = copyLibCommand;
                    item.command.command = copyLibCommand;
                    item.command.arguments = [lib.path, lib.name, requirePath];
                    return item;
                });
                return items;
            }
        }
    );

    context.subscriptions.push(librariesImportProvider, librariesRequireProvider);
}

function combined(libs) {
    return libs.userlibs.concat(libs.defaultlibs.filter(x=>libraries.getDefaultLibraryEnabled(x.name) && !(libs.userlibs.find(y=>y.name == x.name))))
}

module.exports = { activate }
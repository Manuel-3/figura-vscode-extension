const vscode = require('vscode');
const libraries = require('../libraries').getLibraries();

/**
 * @param {vscode.ExtensionContext} context 
 */
function activate(context) {
    const librariesImportProvider = vscode.languages.registerCompletionItemProvider(
        'lua',
        {
            provideCompletionItems(document, position, token, context) {
    
                let items = libraries.map(lib => {
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
            const targetPath = path.join(currentlyOpenTabFolderPath, requirePath, `${name}.lua`);
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
    
                let items = libraries.map(lib => {
                    let item = new vscode.CompletionItem('require: ' + lib.name, vscode.CompletionItemKind.File);
                    const requirePath = vscode.workspace.getConfiguration('figura').get('requirePath');
                    const requireTarget = path.join(requirePath, lib.name).replaceAll('\\', '/').replace(/^\//, '');
                    item.insertText = `require("${requireTarget}")`;
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

module.exports = { activate }
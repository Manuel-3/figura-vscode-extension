const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const documentation = require('./documentation');
const snippetSettings = require('./snippets/snippetSettings');
const snippets = require('./snippets/snippets.json');

const luaExtensionId = 'sumneko.lua';

function getBlockbenchPaths() {
    const platform = os.platform();
    switch (platform) {
        case 'win32': // Windows
            return [path.join(process.env.LocalAppData, 'Programs', 'Blockbench', 'Blockbench.exe')];
        case 'darwin': // macOS
            return [
                '/Applications/Blockbench.app/Contents/MacOS/Blockbench',
                '~/Applications/Blockbench.app/Contents/MacOS/Blockbench',
                '/System/Applications/Blockbench.app/Contents/MacOS/Blockbench'
            ];
        case 'linux': // Linux
            return ['/usr/bin/blockbench'];
        default:
            return null; // Unsupported OS
    }
}

function getBlockbenchPath() {
    const paths = getBlockbenchPaths();
    for (const pathOption of paths) {
        if (fs.existsSync(pathOption)) {
            return pathOption;
        }
    }
    return null;
}

function isBlockbenchInstalled() {
    return getBlockbenchPath()!=null;
}

const maxBlockbenchFindAttempts = 20; // checks every 6 seconds so this number divided by 10 == amount of minutes it will check for
let blockbenchFindAttempts = maxBlockbenchFindAttempts;

/**
 * @param {FiguraTreeDataProvider} figuraTreeDataProvider 
 */
function startCheckingBlockbenchInstallation(figuraTreeDataProvider) {
    // Watch for changes in blockbench
    const currentAttempts = blockbenchFindAttempts;
    blockbenchFindAttempts = 0;
    if (currentAttempts == maxBlockbenchFindAttempts) {
        function check() {
            blockbenchFindAttempts++;
            if (isBlockbenchInstalled()) {
                blockbenchFindAttempts = maxBlockbenchFindAttempts;
                figuraTreeDataProvider.update();
            }
            if (blockbenchFindAttempts < maxBlockbenchFindAttempts) {
                setTimeout(check, 6000);
            }
        }
        check();
    }
}

class FiguraTreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;

        // Subscribe to extension changes
        this._onExtensionChange = vscode.extensions.onDidChange(() => {
            this.scheduleUpdate();
        });

        // Subscribe to file system changes
        this._onFileCreate = vscode.workspace.onDidCreateFiles((event) => {
            this.scheduleUpdate();
        });
        this._onFileDelete = vscode.workspace.onDidDeleteFiles((event) => {
            this.scheduleUpdate();
        });
        this._onFileRename = vscode.workspace.onDidRenameFiles((event) => {
            this.scheduleUpdate();
        });
    }

    update() {
        this._onDidChangeTreeData.fire();
    }

    scheduleUpdate() {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout); // Reset the timer if it was already set
        }
        // Set the debounce delay
        this.updateTimeout = setTimeout(() => {
            this.update();
        }, 500);
    }

    dispose() {
        // Dispose of the event listeners when no longer needed
        this._onExtensionChange.dispose();
        this._onFileCreate.dispose();
        this._onFileDelete.dispose();
        this._onFileRename.dispose();

        // Clear any pending debounce timers
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
    }

    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        if (element) {
            // Return children for the given section
            if (element.label === 'Setup') {
                return [
                    new TreeItem((vscode.extensions.all.find(x => x.id == luaExtensionId)==undefined?'⬇️':'☑️')+' Install Lua language server', 'figura.askInstallLua'),
                    new TreeItem((documentation.isInstalled()?'☑️':'⬇️')+' Install Figura documentation', "figura.askInstallDocumentation"),
                    new TreeItem((isBlockbenchInstalled()?'☑️':'⬇️')+' Install Blockbench', "figura.askInstallBlockbench")
                ];
            } else if (element.label === 'Libraries') {
                return [
                    new TreeItem('📁 Open libraries folder', 'figura.openLibrariesFolder'),
                    new TreeItem('⚙️ Change libraries folder', 'figura.changeLibrariesFolder'),
                    new TreeItem('⚙️ Change target folder', 'figura.changeTargetRequireFolder')
                ];
            } else if (element.label === 'Snippets') {
				const items = [];
                items.push(new TreeItem("✔️ Check all", {
                    command: 'figura.changeAllSnippetsEnabled',
                    title: 'Change All Snippets Enabled',
                    arguments: [true]
                }));
                items.push(new TreeItem("❌ Uncheck all", {
                    command: 'figura.changeAllSnippetsEnabled',
                    title: 'Change All Snippets Enabled',
                    arguments: [false]
                }));
				for (const key in snippets) {
                        const item = new TreeItem((snippetSettings.getEnabled(key)?'☑️ ':'◽ ')+key, {
                            command: 'figura.changeSnippetEnabled',
                            title: 'Change Snippet Enabled',
                            arguments: [key, !snippetSettings.getEnabled(key)]
                        });
                        snippetSettings.subscribe((haveAllChanged, newValue, changedKey) => {
                            if (haveAllChanged || changedKey == key) {
                                item.label = (newValue?'☑️ ':'◽ ')+key;
                                this.update();
                            }
                        })
                        items.push(item);
				}
                return items;
            }
            else if (element.label === 'Links') {
                return [
                    new TreeItem('📖 Open Figura wiki', 'figura.openWiki'),
                    new TreeItem('🎮 Join Discord server', 'figura.openDiscord'),
                    new TreeItem('📝 View Figura source code', 'figura.openFiguraSource')
                ];
            }
        } else {
            // Return the root elements (sections)
            return [
                new TreeItem('Setup', null, vscode.TreeItemCollapsibleState.Expanded),
                new TreeItem('Libraries', null, vscode.TreeItemCollapsibleState.Expanded),
                new TreeItem('Links', null, vscode.TreeItemCollapsibleState.Expanded),
                new TreeItem('Snippets', null, vscode.TreeItemCollapsibleState.Collapsed),
            ];
        }
    }
}

class TreeItem extends vscode.TreeItem {
    constructor(label, command = null, collapsibleState = vscode.TreeItemCollapsibleState.None) {
        super(label, collapsibleState);

        if (command) {
            if (typeof command === 'string') {
                this.command = {
                    command: command,
                    title: label
                };
            } else if (typeof command === 'object') {
                this.command = command;
            }
        }
    }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const figuraTreeDataProvider = new FiguraTreeDataProvider();
    // Sidebar View
	const figuraSettingsView = vscode.window.createTreeView('figuraSettingsView', {
        treeDataProvider: figuraTreeDataProvider
    });
    context.subscriptions.push(figuraSettingsView);
    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('figura.changeSnippetEnabled', (key, value) => {
            snippetSettings.setEnabled(key, value);
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('figura.changeAllSnippetsEnabled', (value) => {
            snippetSettings.setAllEnabled(value);
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('figura.changeLibrariesFolder', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'figura.librariesFolderPath');
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('figura.changeTargetRequireFolder', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'figura.requirePath');
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('figura.openLibrariesFolder', () => {
            const folderPath = vscode.workspace.getConfiguration('figura').get('librariesFolderPath')
            if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()) {
                vscode.env.openExternal(vscode.Uri.file(folderPath));
            } else {
                vscode.window.showInformationMessage(`Invalid folder path "${folderPath}"`);
            }
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('figura.askInstallLua', async () => {
            let sumnekolua = vscode.extensions.all.find(x => x.id == luaExtensionId);
            let result;
            if (sumnekolua != undefined) {
                result = await vscode.window.showInformationMessage(
                    `${luaExtensionId} is already installed`,
                    'Show extension'
                );
            }
            else {
                result = await vscode.window.showInformationMessage(
                    'Lua language is a third party extension! Always make sure to trust things before you install them!',
                    'Show extension',
                    'Install now anyway',
                    'Cancel'
                );
            }
            if (result === 'Show extension') {
                vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`vscode:extension/${luaExtensionId}`));
            }
            else if (result === 'Install now anyway') {
                vscode.commands.executeCommand('workbench.extensions.installExtension', luaExtensionId)
                    .then(() => {
                        vscode.window.showInformationMessage(`Installed ${luaExtensionId}`);
                    }, (error) => {
                        vscode.window.showErrorMessage(`Could not install ${luaExtensionId}: ${error}`);
                    });
            }
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('figura.askInstallBlockbench', async () => {
            figuraTreeDataProvider.update();
            let result;
            if (isBlockbenchInstalled()) {
                result = await vscode.window.showInformationMessage(
                    `Blockbench is already installed`,
                    'Open',
                    'Go to website',
                    'Cancel'
                );
            }
            else {
                result = await vscode.window.showInformationMessage(
                    'Blockbench is a third party modeling program! Always make sure to trust things before you install them!',
                    'Go to website',
                    'Cancel'
                );
            }
            if (result === 'Go to website') {
                // Open the Blockbench website and check installation
                startCheckingBlockbenchInstallation(figuraTreeDataProvider);
                const url = 'https://www.blockbench.net/';
                vscode.env.openExternal(vscode.Uri.parse(url));
            }
            else if (result === 'Open') {
                // Run application
                vscode.env.openExternal(vscode.Uri.file(getBlockbenchPath()));
            }
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('figura.askInstallDocumentation', async () => {
            if (documentation.isInstalled()) {
                result = await vscode.window.showInformationMessage(
                    `Figura documentation is already installed.`,
                    'OK'
                );
            }
            else {
                result = await vscode.window.showInformationMessage(
                    'Unofficial Figura documentation is made by a third party! Always make sure to trust things before you install them!',
                    'View source',
                    /*'Install now anyway',*/ //todo: add this
                    'Cancel'
                );
            }
            if (result === 'View source') {
                // Open the github source
                const url = vscode.workspace.getConfiguration('figura').get('figuraDocumentationRepository');
                vscode.env.openExternal(vscode.Uri.parse(url));
            }
            else if (result === 'Install now anyway') {
                documentation.install();
            }
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('figura.openWiki', () => {
            vscode.env.openExternal(vscode.Uri.parse('https://wiki.figuramc.org/'));
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('figura.openDiscord', () => {
            vscode.env.openExternal(vscode.Uri.parse('https://discord.figuramc.org/'));
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('figura.openFiguraSource', () => {
            vscode.env.openExternal(vscode.Uri.parse('https://github.com/FiguraMC/Figura/'));
        })
    );
}

module.exports = {activate}
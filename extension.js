const vscode = require('vscode');
const path = require('path');
const blockbenchCompleter = require('./src/autocomplete/blockbenchCompleter');
const librariesCompleter = require('./src/autocomplete/librariesCompleter');
const snippetCompleter = require('./src/autocomplete/snippetCompleter');
const treeView = require('./src/gui/treeView');
const libraries = require('./src/libraries');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	// Hook into material icon theme
	updateIcons(vscode.window.activeColorTheme, context);
	vscode.window.onDidChangeActiveColorTheme((theme) => {
		updateIcons(theme, context);
	});

	// Setup gui
	treeView.activate(context);
	
	// const defaultWorkspaceConfiguration = JSON.stringify({ folders: [{ path: "." }] });

	// Check if workspace exists
	if (vscode.workspace.workspaceFolders == undefined) {
		vscode.window.showWarningMessage('To use the Figura extension, you must open a workspace or a folder!', 'Open as folder', 'Cancel').then(result => {
			if (result == 'Open as folder') {
				vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(path.dirname(vscode.window.activeTextEditor.document.uri.fsPath)));
			}
		});
	}

	// Refresh libraries folder when the setting changes
	vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('figura.librariesFolderPath')) {
            libraries.redoWatchLibraries();
        }
    });

	// Autocomplete
	blockbenchCompleter.activate(context);
	librariesCompleter.activate(context);
	snippetCompleter.activate(context);

	// vscode.window.setStatusBarMessage("Figura extension activated");
}

function updateIcons(theme, context) {
	if (theme.kind === vscode.ColorThemeKind.Light) {
		logo = 'blockbench_logo_black';
	} else {
		logo = 'blockbench_logo_white';
	}
	let iconTheme = vscode.workspace.getConfiguration('material-icon-theme').get('files.associations')
	iconTheme['avatar.json'] = `../../${path.basename(context.extensionPath)}/images/avatarjson`;
	iconTheme['*.bbmodel'] = `../../${path.basename(context.extensionPath)}/images/${logo}`;
	vscode.workspace.getConfiguration('material-icon-theme').update('files.associations', iconTheme, vscode.ConfigurationTarget.Global);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}

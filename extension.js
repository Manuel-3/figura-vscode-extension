const vscode = require('vscode');
const fs = require('fs');
const fs_extra = require('fs-extra');
const path = require('path');
const parser = require('./src/parser');
const rootgroups = require('./src/rootgroups/' + vscode.workspace.getConfiguration('figura').get('targetFiguraVersion'));
const downloader = require('./src/downloader');
const libraries = require('./src/libraries').getLibraries();

let intervalID;
let compatmode = false;

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	compatmode = vscode.workspace.getConfiguration('figura').get('documentation.enableDocumentation');

	if (compatmode) {
		let sumnekolua = vscode.extensions.all.find(x => x.id == 'sumneko.lua');
		if (sumnekolua == undefined) {
			vscode.window.showInformationMessage('Figura extension works best with a Lua Language Server!', 'Install', 'Maybe later').then(selection => {
				if (selection == 'Install') {
					vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('vscode:extension/sumneko.lua'));
				}
			});
		}
		if (vscode.workspace.workspaceFolders == undefined) {
			vscode.window.showWarningMessage('To use the Language Server Figura Documentation, you must open a workspace or folder.');
		}
	}

	if (vscode.workspace.workspaceFolders != undefined) {
		const destination_dir = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '/.vscode');
		if (compatmode) {
			switch (vscode.workspace.getConfiguration('figura').get('documentation.source')) {
				case 'Default':
					downloader.fetch();
					break;
				case 'Custom':
					if (vscode.workspace.workspaceFolders != undefined) {
						if (!fs.existsSync(destination_dir)) {
							downloader.download(vscode.workspace.getConfiguration('figura').get('documentation.customDownloadUrl'), destination_dir);
						}
					}
					break;
				case 'Local':
					if (vscode.workspace.workspaceFolders != undefined) {
						if (!fs.existsSync(destination_dir)) {
							try {
								fs_extra.copySync(vscode.workspace.getConfiguration('figura').get('documentation.localPath'), destination_dir);
								vscode.window
									.showInformationMessage('Figura documentation is now installed', 'Open Settings')
									.then(selection => {
										if (selection == 'Open Settings') {
											vscode.workspace.openTextDocument(vscode.Uri.file(path.join(destination_dir, '/settings.json')))
												.then((a) => {
													vscode.window.showTextDocument(a);
												});
										}
									});
							}
							catch (error) {
								vscode.window.showWarningMessage('Could not copy documentation from custom path.');
							}
						}
					}
					break;
				default:
					break;
			}
		}
	}

	const rootnodeprovider = vscode.languages.registerCompletionItemProvider(
		'lua',
		{
			provideCompletionItems(document, position, token, context) {

				let items = [];
				const linePrefix = document.lineAt(position).text.substr(0, position.character);

				if (linePrefix.match(/\.\w+$/)) return [];

				for (let i = 0; i < rootgroups.length; i++) {
					let item = new vscode.CompletionItem(rootgroups[i].group.words[0], rootgroups[i].group.type);
					item.commitCharacters = ['.'];
					if (!compatmode || rootgroups[i].ignoreCompat)
						items.push(item);
				}

				return items;
			}
		}
	);

	const subnodeprovider = vscode.languages.registerCompletionItemProvider(
		'lua',
		{
			provideCompletionItems(document, position, token, context) {

				let items = [];
				const linePrefix = document.lineAt(position).text.substr(0, position.character);

				for (let i = 0; i < rootgroups.length; i++) {
					if (!compatmode || rootgroups[i].ignoreCompat)
						items = items.concat(browse(document, position, linePrefix, rootgroups[i].group.subgroups, '\\b' + rootgroups[i].group.words[0] + '\\.'));
				}

				return items;
			}
		},
		'.'
	);

	// recursively find matching words
	function browse(document, position, linePrefix, groups, pattern) {
		let items = [];

		if (groups == []) return [];

		for (let i = 0; i < groups.length; i++) {
			const group = groups[i];
			for (let n = 0; n < group.words.length; n++) {
				let hasSpaces = group.words[n].includes(' ');
				if (linePrefix.match(new RegExp(pattern + '$')) && group.showSuggestion) {
					if (compatmode && group.type == vscode.CompletionItemKind.Method) continue; // in compat mode dont show methods, even when ignoreCompat is true

					let item = new vscode.CompletionItem(group.words[n], group.type);
					if (hasSpaces) {
						item.insertText = '["' + group.words[n] + '"]';
						let range = new vscode.Range(new vscode.Position(position.line, position.character - 1), position);
						item.additionalTextEdits = [new vscode.TextEdit(range, '')]; // remove the '.'
					}
					if (group.type == vscode.CompletionItemKind.Method) item.commitCharacters = ['('];
					else if (group.type == vscode.CompletionItemKind.Property) item.commitCharacters = ['.'];

					items.push(item);
				}
				let nextpattern;
				if (hasSpaces) nextpattern = pattern.substring(0, pattern.length - 2) + '\\[\\"' + group.words[n] + '\\"\\]' + '\\.'; // in this case remove the \. from the pattern and use ["word"]
				else nextpattern = pattern + group.words[n] + '\\.';
				items = items.concat(
					browse(document, position, linePrefix, group.subgroups, nextpattern)
				);
			}
		}

		return items;
	}

	const variableNameProvider = vscode.languages.registerCompletionItemProvider(
		'lua',
		{
			provideCompletionItems(document, position, token, context) {
				if (compatmode) return;

				// remove the current line to not include what is currently being typed in the results
				const lines = document.getText().split('\n');
				lines.splice(document.lineAt(position).lineNumber, 1);
				const text = lines.join('\n');

				let variables = parser.parse(text, /((?<=\s)|(?<=^))[a-zA-z_]\w*\b((?=\s*=))/g);
				let functions = parser.parse(text, /((?<=\s)|(?<=^))[a-zA-z_]\w*\b((?=\s*\())/g);
				let items = []

				for (let i = 0; i < variables.length; i++) {
					const variable = variables[i];
					items.push(new vscode.CompletionItem(variable, vscode.CompletionItemKind.Variable))
				}
				for (let i = 0; i < functions.length; i++) {
					const func = new vscode.CompletionItem(functions[i], vscode.CompletionItemKind.Function);
					func.commitCharacters = ['('];
					items.push(func)
				}

				return items;
			}
		}
	);

	const librariesProvider = vscode.languages.registerCompletionItemProvider(
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

	context.subscriptions.push(rootnodeprovider, subnodeprovider, variableNameProvider, librariesProvider);

	vscode.window.setStatusBarMessage("Figura extension activated");
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
let rootgroups = require('./src/rootgroups/0.1.0');
const libraries = require('./src/libraries').getLibraries();
const snippets = require('./src/snippets/0.1.0.json');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	const defaultWorkspaceConfiguration = JSON.stringify({ folders: [{ path: "." }] });

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

	const rootnodeprovider = vscode.languages.registerCompletionItemProvider(
		'lua',
		{
			provideCompletionItems(document, position, token, context) {

				let items = [];
				const linePrefix = document.lineAt(position).text.substr(0, position.character);

				if (linePrefix.match(/[\.:]\w+$/)) return [];

				for (let i = 0; i < rootgroups.length; i++) {
					let item = new vscode.CompletionItem(rootgroups[i].group.words[0], rootgroups[i].group.completionItemKind);
					if (rootgroups[i].group.documentations != undefined) {
						item.detail = 'Documentation available ->';
						item.documentation = rootgroups[i].group.documentations[0];
					}
					item.commitCharacters = ['.', ':'];
					if (rootgroups[i].ignoreCompat)
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
				const linePrefix = document.lineAt(position).text.substr(0, position.character).replace(/\([^)]*\)/g, ''); // remove anything inside ()

				for (let i = 0; i < rootgroups.length; i++) {
					if (rootgroups[i].ignoreCompat)
						items = items.concat(browse(document, position, linePrefix, rootgroups[i].group.subgroups, '\\b' + rootgroups[i].group.words[0] + '[\\.:]'));
				}

				return items;
			}
		},
		'.',
		':'
	);

	// recursively find matching words
	function browse(document, position, linePrefix, groups, pattern) {
		let items = [];

		if (groups == []) return [];

		for (let i = 0; i < groups.length; i++) {
			const group = groups[i];
			for (let n = 0; n < group.words.length; n++) {
				let hasSpaces = group.words[n].includes(' ');
				let isSelfCall = group.selfcalls != undefined ? group.selfcalls[n] : false;
				if (linePrefix.match(new RegExp(pattern + '$')) && group.showSuggestion) {
					if (group.completionItemKind == vscode.CompletionItemKind.Method) continue; // in compat mode dont show methods, even when ignoreCompat is true

					let item = new vscode.CompletionItem(group.words[n], group.completionItemKind);
					if (group.documentations != undefined && group.documentations[n] != undefined) {
						item.detail = 'Documentation available ->';
						item.documentation = group.documentations[n];
					}
					if (hasSpaces) {
						item.insertText = '["' + group.words[n] + '"]';
						let range = new vscode.Range(new vscode.Position(position.line, position.character - 1), position);
						item.additionalTextEdits = [new vscode.TextEdit(range, '')]; // remove the '.' or ':'
					}
					if (isSelfCall) {
						item.insertText = ':' + group.words[n];
						let range = new vscode.Range(new vscode.Position(position.line, position.character - 1), position);
						item.additionalTextEdits = [new vscode.TextEdit(range, '')]; // remove the '.' or ':'
					}
					if (group.completionItemKind == vscode.CompletionItemKind.Method) item.commitCharacters = ['('];
					else if (group.completionItemKind == vscode.CompletionItemKind.Property) item.commitCharacters = ['.', ':'];

					items.push(item);
				}
				let nextpattern;
				if (hasSpaces) nextpattern = pattern.substring(0, pattern.length - 2) + '\\[\\"' + group.words[n] + '\\"\\]' + '[\\.:]'; // in this case remove the \. from the pattern and use ["word"]
				else nextpattern = pattern + group.words[n] + '[\\.:]';
				items = items.concat(
					browse(document, position, linePrefix, group.subgroups, nextpattern)
				);
			}
		}

		return items;
	}

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
			const targetPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, requirePath, `${name}.lua`);
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

	const snippetprovider = vscode.languages.registerCompletionItemProvider(
		'lua',
		{
			provideCompletionItems(document, position, token, context) {

				const linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (linePrefix.match(/\.\w+$/)) return [];

				const items = [];
				for (const key in snippets) {
					if (Object.hasOwnProperty.call(snippets, key)) {
						const element = snippets[key];
						const snippet = new vscode.CompletionItem(element.prefix, vscode.CompletionItemKind.Snippet);
						snippet.insertText = new vscode.SnippetString(element.body.join('\n'));
						snippet.documentation = new vscode.MarkdownString(element.description);
						items.push(snippet);
					}
				}

				return items;
			}
		}
	);

	context.subscriptions.push(rootnodeprovider, subnodeprovider, librariesImportProvider, librariesRequireProvider, snippetprovider);

	vscode.window.setStatusBarMessage("Figura extension activated");
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}

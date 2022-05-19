const vscode = require('vscode');
const targetFiguraVersion = vscode.workspace.getConfiguration('figura').get('targetFiguraVersion');
const fs = require('fs');
const fs_extra = require('fs-extra');
const path = require('path');
const parser = require('./src/parser');
let rootgroups;
if (fs.existsSync(path.join(__dirname, '/src/rootgroups/') + targetFiguraVersion + '.js')) {
	rootgroups = require('./src/rootgroups/' + targetFiguraVersion);
}
else {
	// This happens if a target version was removed by an update of the extension
	// Fix settings to use the new/default ones instead
	const pjson = require('./package.json');
	const version = pjson.contributes.configuration.properties['figura.targetFiguraVersion'];
	console.log("Target figura version has been reset to " + version.default);
	rootgroups = require('./src/rootgroups/' + version.default);
	// Delete removed versions from sources
	const sources = vscode.workspace.getConfiguration('figura').get('documentation.sources');
	const sourcesMap = new Map(Object.entries(sources));
	sourcesMap.forEach((value, key) => {
		if (!version.enum.includes(key)) {
			// Delete removed version entry
			sources[key] = undefined;
			// Use the value for the default entry instead, so it isnt lost
			// (Only bottom most one will be saved, other removed ones are gone)
			sources[version.default] = value;
			vscode.workspace.getConfiguration('figura').update('documentation.sources', sources, vscode.ConfigurationTarget.Global);
		}
	});
}
const downloader = require('./src/downloader');
const libraries = require('./src/libraries').getLibraries();

let compatmode = false;

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	const defaultWorkspaceConfiguration = JSON.stringify({ folders: [{ path: "." }] });

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
			const sources = vscode.workspace.getConfiguration('figura').get('documentation.sources');
			let source = sources[targetFiguraVersion];
			if (source == undefined) {
				source = sources["Default"];
			}
			console.log('Docs source: ' + source);
			if (source == undefined) {
				console.log("Using default docs");
				downloader.fetch();
			}
			else if (fs.existsSync(source)) {
				if (!fs.existsSync(destination_dir)) {
					try {
						console.log("Using local path");
						fs_extra.copySync(source, destination_dir);
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
			else {
				if (!fs.existsSync(destination_dir)) {
					console.log("Using custom download");
					downloader.download(source, destination_dir);
				}
			}
		}
	}

	const rootnodeprovider = vscode.languages.registerCompletionItemProvider(
		'lua',
		{
			provideCompletionItems(document, position, token, context) {

				let items = [];
				const linePrefix = document.lineAt(position).text.substr(0, position.character);

				if (linePrefix.match(/[\.:]\w+$/)) return [];

				for (let i = 0; i < rootgroups.length; i++) {
					let item = new vscode.CompletionItem(rootgroups[i].group.words[0], rootgroups[i].group.type);
					if (rootgroups[i].group.documentations != undefined) {
						item.detail = 'Documentation available ->';
						item.documentation = rootgroups[i].group.documentations[0];
					}
					item.commitCharacters = ['.', ':'];
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
				const linePrefix = document.lineAt(position).text.substr(0, position.character).replace(/\([^)]*\)/g, ''); // remove anything inside ()

				for (let i = 0; i < rootgroups.length; i++) {
					if (!compatmode || rootgroups[i].ignoreCompat)
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
					if (compatmode && group.type == vscode.CompletionItemKind.Method) continue; // in compat mode dont show methods, even when ignoreCompat is true

					let item = new vscode.CompletionItem(group.words[n], group.type);
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
					if (group.type == vscode.CompletionItemKind.Method) item.commitCharacters = ['('];
					else if (group.type == vscode.CompletionItemKind.Property) item.commitCharacters = ['.', ':'];

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

	context.subscriptions.push(rootnodeprovider, subnodeprovider, variableNameProvider, librariesImportProvider, librariesRequireProvider);

	vscode.window.setStatusBarMessage("Figura extension activated");
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}

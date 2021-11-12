const vscode = require('vscode');
const parser = require('./parser');
const rootgroups = require('./rootgroups');
const downloader = require('./downloader')
const libraries = require('./libraries').getLibraries();

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

    if (vscode.workspace.getConfiguration('figura').get('checkForNewDocumentationVersion')) {
		downloader.fetch();
		let sumnekolua = vscode.extensions.all.find(x => x.id == 'sumneko.lua');
		if (sumnekolua != undefined) {
			if (!vscode.workspace.getConfiguration('figura').get('useLanguageServer')) {
				vscode.window.showInformationMessage('Enabled Lua Language Server support.');
				await vscode.workspace.getConfiguration('figura').update('useLanguageServer', true, vscode.ConfigurationTarget.Global);
			}
		}
		else {
			vscode.window.showInformationMessage('Figura extension works best with a Lua Language Server installed, please consider adding one!', 'Install', 'Maybe later').then(selection=>{
				if (selection == 'Install') {
					vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('vscode:extension/sumneko.lua'));
				}
			});
		}
	}

	if (vscode.workspace.getConfiguration('figura').get('useLanguageServer')) {
		if ((vscode.workspace.workspaceFolders == undefined)) {
			vscode.window.showWarningMessage('To use the Language Server Figura Documentation, you must open a workspace or folder.');
		}
	}
	// else {
	// 	let sumnekolua = vscode.extensions.all.find(x => x.id == 'sumneko.lua');
	// 	if (sumnekolua != undefined) {
	// 		vscode.window.showWarningMessage('Sumneko\'s Language Server detected! Please enable compatibility in the settings or remove the language server.');
	// 	}
	// }

	const rootnodeprovider = vscode.languages.registerCompletionItemProvider(
		'lua',
		{
			provideCompletionItems(document, position, token, context) {
				let items = [];
				const linePrefix = document.lineAt(position).text.substr(0, position.character);

				if (linePrefix.match(/\.\w+$/)) return [];
				
				for (let i = 0; i < rootgroups.length; i++) {
					let item = new vscode.CompletionItem(rootgroups[i].words[0], rootgroups[i].type);
					item.commitCharacters = ['.'];
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
					items = items.concat(browse(document, position, linePrefix, rootgroups[i].subgroups, '\\b'+rootgroups[i].words[0]+'\\.'));
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
					let item = new vscode.CompletionItem(group.words[n], group.type);
					if (hasSpaces) {
						item.insertText = '["' + group.words[n] + '"]';
						let range = new vscode.Range(new vscode.Position(position.line,position.character-1), position);
						item.additionalTextEdits = [new vscode.TextEdit(range, '')]; // remove the '.'
					}
					if (group.type == vscode.CompletionItemKind.Method) item.commitCharacters = ['('];
					else if (group.type == vscode.CompletionItemKind.Property) item.commitCharacters = ['.'];
					
					items.push(item);
				}
				let nextpattern;
				if (hasSpaces) nextpattern = pattern.substring(0,pattern.length-2) + '\\[\\"' + group.words[n] + '\\"\\]' + '\\.'; // in this case remove the \. from the pattern and use ["word"]
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
    			if (vscode.workspace.getConfiguration('figura').get('useLanguageServer')) return;

				// remove the current line to not include what is currently being typed in the results
				var lines = document.getText().split('\n');
				lines.splice(document.lineAt(position).lineNumber, 1);
				var text = lines.join('\n');

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

	vscode.window.setStatusBarMessage("Figura Helper activated");
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}

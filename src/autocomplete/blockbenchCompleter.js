const vscode = require('vscode');
let rootgroups = require('./rootgroups');

/**
 * @param {vscode.ExtensionContext} context 
 */
function activate(context) {
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
				let linePrefix = document.lineAt(position).text.substr(0, position.character).replace(/\([^)]*\)/g, ''); // remove anything inside ()
				const i1 = linePrefix.lastIndexOf('.');
				const i2 = linePrefix.lastIndexOf(':');
				linePrefix = linePrefix.substring(0, Math.max(i1,i2)+1); // remove anything to the right of the last . or :

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
				let hasDots = group.words[n].includes('.');
				let isSelfCall = group.selfcalls != undefined ? group.selfcalls[n] : false;
				if (linePrefix.match(new RegExp(pattern + '$')) && group.showSuggestion) {
					if (group.completionItemKind == vscode.CompletionItemKind.Method) continue; // in compat mode dont show methods, even when ignoreCompat is true

					let item = new vscode.CompletionItem(group.words[n], group.completionItemKind);
					item.sortText = '00001';
					if (group.documentations != undefined && group.documentations[n] != undefined) {
						item.detail = 'Documentation available ->';
						item.documentation = group.documentations[n];
					}
					if (hasSpaces || hasDots) {
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
				if (hasSpaces || hasDots) nextpattern = pattern.substring(0, pattern.length - 5) + '\\["' + group.words[n] + '"\\]' + '[\\.:]'; // in this case remove the [\\.:] from the pattern and use \["word"\]
				else nextpattern = pattern + group.words[n] + '[\\.:]';
				items = items.concat(
					browse(document, position, linePrefix, group.subgroups, nextpattern)
				);
			}
		}

		return items;
	}

    context.subscriptions.push(rootnodeprovider, subnodeprovider);
}

module.exports = { activate }
const vscode = require('vscode');
const snippets = require('../snippets/snippets');
const snippetSettings = require('../snippets/snippetSettings');

/**
 * @param {vscode.ExtensionContext} context 
 */
function activate(context) {
    const snippetProvider = vscode.languages.registerCompletionItemProvider(
        'lua',
        {
            provideCompletionItems(document, position, token, context) {
    
                const linePrefix = document.lineAt(position).text.substr(0, position.character);
                if (linePrefix.match(/\.\w+$/)) return [];
    
                const items = [];
                for (const key in snippets) {
                    if (Object.hasOwnProperty.call(snippets, key)) {
                        if (!snippetSettings.getEnabled(key)) continue;
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
    context.subscriptions.push(snippetProvider);
}

module.exports = { activate }
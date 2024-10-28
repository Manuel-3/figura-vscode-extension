const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const htmlContent = fs.readFileSync(path.join(__dirname, 'fpm.html')).toString();
const themeStylesDark = fs.readFileSync(path.join(__dirname, '..', '..', 'node_modules', 'highlight.js/styles/github-dark.min.css')).toString();
const themeStylesLight = fs.readFileSync(path.join(__dirname, '..', '..', 'node_modules', 'highlight.js/styles/github.min.css')).toString();

function validateGithubResourceUrl(inputurl, filetype, raw) {
    if (!inputurl.startsWith('https://')) return null;
    const url = new URL(inputurl);
    if (url.host!='github.com') return null;
    if (url.pathname.split('/')[3]!='blob') return null;
    if (url.pathname.split('/').length < 5) return null;
    if (!url.pathname.endsWith(filetype)) return null;
    return 'https://'+url.host+url.pathname+(raw?"?raw=true":'')
}

class CustomWebviewPanel {
    static currentPanel;
    panel;
    extensionUri;
    disposables = [];

    /**
     * @param {vscode.ExtensionContext} context
     */
    static createOrShow(context) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        // If a panel already exists, show it in the target column
        if (CustomWebviewPanel.currentPanel) {
            //CustomWebviewPanel.currentPanel.panel.reveal(column);
            return;
        }

        // Otherwise, create a new one
        const panel = vscode.window.createWebviewPanel(
            'customWebview',
            'FPM - Figura Package Manager',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true, // Enable JavaScript in the Webview
                //localResourceRoots: [vscode.Uri.file(context.extensionPath)], // Allow access to local files in the extension
            }
        );

        // Listen for messages from the webview
        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'openLink':
                        // Open the external link securely using VS Code's `vscode.env.openExternal`
                        vscode.env.openExternal(vscode.Uri.parse(message.url));
                        return;
                    case 'viewSource':
                        // Basically same as above but only allow github.com lua files
                        const url = validateGithubResourceUrl(message.url, '.lua', false);
                        if (url) {
                            vscode.env.openExternal(vscode.Uri.parse(url));
                        }
                        else {
                            CustomWebviewPanel.currentPanel.panel.webview.postMessage({ command: 'illegalSource', callbackUniqueId: message.callbackUniqueId, otherbuttonUniqueId: message.otherbuttonUniqueId });
                        }
                        return;
                    case 'downloadPackage':
                        // Make sure its a valid github lua file url
                        const downloadUrl = validateGithubResourceUrl(message.url, '.lua', true);
                        if (!downloadUrl) {
                            CustomWebviewPanel.currentPanel.panel.webview.postMessage({ command: 'illegalSource', callbackUniqueId: message.callbackUniqueId, otherbuttonUniqueId: message.otherbuttonUniqueId });
                            return;
                        }
                        fetch(downloadUrl)
                            .then(response => {
                                // Check if the content type is 'text/plain'
                                const contentType = response.headers.get('Content-Type');
                                if (contentType && contentType.includes('text/plain')) {
                                    // Return the text content if it's plain text
                                    return response.text();
                                } else {
                                    // Throw an error or handle the non-plain-text response
                                    console.error('The response was not plain text.');
                                    CustomWebviewPanel.currentPanel.panel.webview.postMessage({ command: 'downloadFailed', callbackUniqueId: message.callbackUniqueId });
                                }
                            })
                            .then(text => {
                                // download completed, save lua file
                                const libFolderPath = vscode.workspace.getConfiguration('figura').get('librariesFolderPath');
                                // make sure libraries folder exists
                                if (!fs.existsSync(libFolderPath)) {
                                    try {
                                        fs.mkdirSync(libFolderPath, { recursive: true });
                                    }
                                    catch {}
                                }
                                if (!fs.existsSync(libFolderPath)) {
                                    vscode.window.showErrorMessage('Libraries folder is invalid!');
                                    CustomWebviewPanel.currentPanel.panel.webview.postMessage({ command: 'downloadFailed', callbackUniqueId: message.callbackUniqueId });
                                    return;
                                }
                                try {
                                    // save file with name format author.libname.lua
                                    const pathname = (new URL(downloadUrl)).pathname.split('/');
                                    const originalFilename = pathname[pathname.length-1];
                                    let filename = message.username+'.'+originalFilename;
                                    if (!filename.toLowerCase().endsWith('.lua')) filename += '.lua'; // this should never happen but just in case
                                    fs.writeFileSync(path.join(libFolderPath, filename), text);
                                }
                                catch {
                                    vscode.window.showErrorMessage('Unexpected error while trying to save file.');
                                    CustomWebviewPanel.currentPanel.panel.webview.postMessage({ command: 'downloadFailed', callbackUniqueId: message.callbackUniqueId });
                                    return;
                                }
                                CustomWebviewPanel.currentPanel.panel.webview.postMessage({ command: 'downloadCompleted', callbackUniqueId: message.callbackUniqueId });
                            })
                            .catch(error => {
                                // Handle any errors that occurred during the fetch
                                CustomWebviewPanel.currentPanel.panel.webview.postMessage({ command: 'downloadFailed', callbackUniqueId: message.callbackUniqueId });
                                console.error('Error:', error);
                            });
                        return;
                    case 'downloadLongDescription':
                        // Make sure its a valid github markdown file url
                        const markdownUrl = validateGithubResourceUrl(message.url, '.md', true);
                        if (!markdownUrl) {
                            CustomWebviewPanel.currentPanel.panel.webview.postMessage({ command: 'returnLongDescriptionMarkdown', longdescription: 'No valid description found.', callbackUniqueId: message.callbackUniqueId });
                            return;
                        }
                        fetch(markdownUrl)
                            .then(response => {
                                // Check if the content type is 'text/plain'
                                const contentType = response.headers.get('Content-Type');
                                if (contentType && contentType.includes('text/plain')) {
                                    // Return the text content if it's plain text
                                    return response.text();
                                } else {
                                    // On error, reset to empty so you can try again
                                    CustomWebviewPanel.currentPanel.panel.webview.postMessage({ command: 'returnLongDescriptionMarkdown', longdescription: '', callbackUniqueId: message.callbackUniqueId });
                                    console.error('The response was not plain text.');
                                }
                            })
                            .then(text => {
                                // Send the long description text back into the webview and also pass the callback unique id
                                CustomWebviewPanel.currentPanel.panel.webview.postMessage({ command: 'returnLongDescriptionMarkdown', longdescription: text, callbackUniqueId: message.callbackUniqueId });
                            })
                            .catch(error => {
                                // Handle any errors that occurred during the fetch, reset to empty so you can try again
                                CustomWebviewPanel.currentPanel.panel.webview.postMessage({ command: 'returnLongDescriptionMarkdown', longdescription: '', callbackUniqueId: message.callbackUniqueId });
                                console.error('Error:', error);
                            });
                        return;
                }
            },
            undefined,
            context.subscriptions
        );

        CustomWebviewPanel.currentPanel = new CustomWebviewPanel(panel, context.extensionUri);
    }

    /**
     * 
     * @param {vscode.WebviewPanel} panel 
     * @param {vscode.Uri} extensionUri 
     */
    constructor(panel, extensionUri) {
        this.panel = panel;
        this.extensionUri = extensionUri;

        // Set the HTML content for the Webview
        this.panel.webview.html = this.getHtmlContent();

        // Dispose of the Webview when closed
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    }

    getHtmlContent() {
        const scriptUri = this.panel.webview.asWebviewUri(vscode.Uri.file(path.join(__dirname, 'webview-bundle.js')));
        const themeStyles = vscode.window.activeColorTheme.kind == vscode.ColorThemeKind.Light ? themeStylesLight : themeStylesDark;
        const extraStyles = vscode.window.activeColorTheme.kind == vscode.ColorThemeKind.Light ? '\ncode {background-color:#ffffff;color:#0d1117;}\n' : '\ncode{background-color:#0d1117;color:#c9d1d9;}\n'
        return htmlContent.replace('/*${scriptUri}*/', scriptUri).replace('/*${themeStyles}*/',themeStyles+extraStyles);
    }

    dispose() {
        CustomWebviewPanel.currentPanel = undefined;
        this.panel.dispose();

        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}

module.exports = CustomWebviewPanel
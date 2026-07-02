const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const htmlContent = fs.readFileSync(path.join(__dirname, 'fld.html')).toString();
const fldcache = require('./fldcache');
const util = require('./util');

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
            'Figura Library Finder',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true, // Enable JavaScript in the Webview
                //localResourceRoots: [vscode.Uri.file(context.extensionPath)], // Allow access to local files in the extension
            }
        );

        // Listen for messages from the webview
        panel.webview.onDidReceiveMessage(
            message => {
                const libFolderPath = vscode.workspace.getConfiguration('figura').get('librariesFolderPath');
                switch (message.command) {
                    case 'openLink':
                        // Open the external link using VS Code's `vscode.env.openExternal`
                        vscode.env.openExternal(vscode.Uri.parse(message.url));
                        return;
                    case 'getCacheAndFetch':
                    case 'getCache':
                        fldcache.load().then(() => {
                            let installedList = [];
                            if (fs.existsSync(libFolderPath)) {
                                installedList = fs.readdirSync(libFolderPath);
                            }
                            CustomWebviewPanel.currentPanel.panel.webview.postMessage({ command: 'receiveCache'+(message.command=='getCacheAndFetch'?'AndFetch':''), cache: fldcache.getPrimitive(), installedList: installedList });
                        });
                        return;
                    case 'saveCache':
                        const cache = util.parseCache(message.cache);
                        fldcache.set(cache);
                        fldcache.save(cache.timestamp);
                        return;
                    case 'downloadPackage':
                        fetch(message.url)
                            .then(response => {
                                // Check if the content type is 'text/plain'
                                const contentType = response.headers.get('Content-Type');
                                if (contentType && contentType.trim().toLowerCase().startsWith('text/plain')) {
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
                                if (!fs.existsSync(libFolderPath)) {
                                    // make sure libraries folder exists
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
                                    // save file
                                    const filename = util.getFileNameToSaveWith(message.username, message.url)
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
        const extraStyles = vscode.window.activeColorTheme.kind == vscode.ColorThemeKind.Light ? '\ncode {background-color:#ffffff;color:#0d1117;}\n' : '\ncode{background-color:#0d1117;color:#c9d1d9;}\n'
        return htmlContent.replace('/*${scriptUri}*/', scriptUri);
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
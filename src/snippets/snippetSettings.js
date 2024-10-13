const snippets = require('./snippets.json');
const vscode = require('vscode')

let cachedSnippetSettings = {};

function loadSnippetSettings() {
    let snippetSettings = vscode.workspace.getConfiguration('figura').get('snippetEnabledStates', vscode.ConfigurationTarget.Global);
    if (snippetSettings == undefined) {
        snippetSettings = {};
    }
    for (const key in snippets) {
        if (snippetSettings[key] == undefined) {
            snippetSettings[key] = true;
        }
    }
    cachedSnippetSettings = snippetSettings;
}

loadSnippetSettings();

function setSnippetSettings(snippetSettings) {
    vscode.workspace.getConfiguration('figura').update('snippetEnabledStates', snippetSettings, vscode.ConfigurationTarget.Global);
}

// Subscriptions to snippet-settings changes
const subscribers = [];
function subscribe(callback) {
    subscribers.push(callback);
}

// Set enabled
function setEnabled(key, value) {
    cachedSnippetSettings[key] = value;
    setSnippetSettings(cachedSnippetSettings);
    subscribers.forEach(subscriber => {
        subscriber(false, value, key);
    })
}

// Set all enabled
function setAllEnabled(value) {
    for (const key in cachedSnippetSettings) {
        cachedSnippetSettings[key] = value;
    }
    setSnippetSettings(cachedSnippetSettings);
    subscribers.forEach(subscriber => {
        subscriber(true, value);
    })
}

// Get enabled
function getEnabled(key) {
    return cachedSnippetSettings[key];
}

module.exports = { subscribe, setAllEnabled, setEnabled, getEnabled }
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const appdata_dir = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');

if (vscode.workspace.getConfiguration('figura').get('librariesFolderPath') == '') {
    const figurafolder = path.join(appdata_dir, '/.minecraft/figura');
    const figuralibraryfolder = path.join(appdata_dir, '/.minecraft/figura/libraries')
    if (!fs.existsSync(figuralibraryfolder)) {
        fs.mkdirSync(figuralibraryfolder, { recursive: true });
    }
    vscode.workspace.getConfiguration('figura').update('librariesFolderPath', figuralibraryfolder);
}

const defaultdir = path.join(__dirname, 'defaultlibraries');

function prepareLibraries() {
    const userlibdir = vscode.workspace.getConfiguration('figura').get('librariesFolderPath');
    let defaultlibs = [];
    let userlibs = [];
    // Included default libraries
    defaultlibs = fs.readdirSync(defaultdir)
        .filter(x => x?.toLowerCase().endsWith('.lua'))
        .map(x => { return { name: x.substring(0, x.length - 4), content: fs.readFileSync(path.join(defaultdir, x)).toString(), path: path.join(defaultdir, x) } });
    // User defined libraries
    if (fs.existsSync(userlibdir)) {
        userlibs = fs.readdirSync(userlibdir)
            .filter(x => x?.toLowerCase().endsWith('.lua'))
            .map(x => { return { name: x.substring(0, x.length - 4), content: fs.readFileSync(path.join(userlibdir, x)).toString(), path: path.join(userlibdir, x) } });
    }
    return {defaultlibs: defaultlibs, userlibs: userlibs};
}

let libraries;
let folderwatcher;

function redoWatchLibraries() {
    if (folderwatcher != undefined) folderwatcher.close();
    const path = vscode.workspace.getConfiguration('figura').get('librariesFolderPath');
    libraries = prepareLibraries();
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true })
    folderwatcher = fs.watch(path, (eventType, filename) => {
        // only do something for .lua files
        if (filename?.toLowerCase().endsWith('.lua'))
            libraries = prepareLibraries();
    });
}

redoWatchLibraries();

function getLibraries() {
    return libraries;
}

let cachedDefaultLibrariesSettings = {};

function loadDefaultLibrariesSettings() {
    let defaultLibrariesSettings = vscode.workspace.getConfiguration('figura').get('defaultLibrariesEnabledStates');
    if (defaultLibrariesSettings === null) {
        defaultLibrariesSettings = {};
    }
    const defaultlibs = fs.readdirSync(defaultdir)
        .filter(x => x?.toLowerCase().endsWith('.lua'))
        .map(x => x.substring(0, x.length - 4));
    for (const name of defaultlibs) {
        if (defaultLibrariesSettings[name] == undefined) {
            console.log("defaulting", name, "to true")
            defaultLibrariesSettings[name] = true;
        }
    }
    cachedDefaultLibrariesSettings = defaultLibrariesSettings;
}

loadDefaultLibrariesSettings();

function setDefaultLibrariesSettings(defaultLibrariesSettings) {
    vscode.workspace.getConfiguration('figura').update('defaultLibrariesEnabledStates', defaultLibrariesSettings, vscode.ConfigurationTarget.Global);
}

// Subscriptions to default-library-settings changes
const subscribers = [];
function subscribe(callback) {
    subscribers.push(callback);
}

// Set enabled
function setDefaultLibraryEnabled(key, value) {
    cachedDefaultLibrariesSettings[key] = value;
    setDefaultLibrariesSettings(cachedDefaultLibrariesSettings);
    subscribers.forEach(subscriber => {
        subscriber(false, value, key);
    })
}

// Set all enabled
function setAllDefaultLibrariesEnabled(value) {
    console.log(cachedDefaultLibrariesSettings);
    for (const key in cachedDefaultLibrariesSettings) {
        console.log("key",key)
        cachedDefaultLibrariesSettings[key] = value;
    }
    console.log(cachedDefaultLibrariesSettings);
    setDefaultLibrariesSettings(cachedDefaultLibrariesSettings);
    subscribers.forEach(subscriber => {
        subscriber(true, value);
    })
}

// Get enabled
function getDefaultLibraryEnabled(key) {
    return cachedDefaultLibrariesSettings[key];
}

module.exports = { getLibraries, setAllDefaultLibrariesEnabled, subscribe, setDefaultLibraryEnabled, getDefaultLibraryEnabled, redoWatchLibraries };
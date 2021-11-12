const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const libraries_folder_name = vscode.workspace.getConfiguration('figura').get('librariesFolderName')
const appdata_dir = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
const model_files_dir = path.join(appdata_dir, '/.minecraft/figura/model_files');
const destination_dir = path.join(model_files_dir, libraries_folder_name);

let workspace_destination_dir = undefined;
if (vscode.workspace.workspaceFolders != undefined) {
    workspace_destination_dir = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, libraries_folder_name);
}

function getLibraries() {
    let libs1 = [];
    let libs2 = [];
    if (fs.existsSync(destination_dir)) {
        libs1 = fs.readdirSync(destination_dir)
        .filter(x=>x.endsWith('.lua'))
        .map(x=>{return{name:x.substring(0, x.length-4), content:fs.readFileSync(path.join(destination_dir,x)).toString()}});
    }
    if (workspace_destination_dir != undefined && destination_dir.toLowerCase() != workspace_destination_dir.toLowerCase() && fs.existsSync(workspace_destination_dir)) {
        libs2 = fs.readdirSync(workspace_destination_dir)
        .filter(x=>x.endsWith('.lua'))
        .map(x=>{return{name:x.substring(0, x.length-4), content:fs.readFileSync(path.join(workspace_destination_dir,x)).toString()}});
    }
    console.log(libs1.concat(libs2));
    return libs1.concat(libs2);
}

module.exports = {getLibraries};
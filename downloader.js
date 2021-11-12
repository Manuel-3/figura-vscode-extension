const vscode = require('vscode');
const got = require('got');
const path = require('path');
const fs = require('fs-extra');
const extract = require('extract-zip')

const appdata_dir = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
const model_files_dir = path.join(appdata_dir, '/.minecraft/figura/model_files');
let destination_dir = path.join(model_files_dir, '/.vscode');

if (vscode.workspace.workspaceFolders != undefined) {
    destination_dir = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '/.vscode');
}

async function fetch() {
    const response = await got('https://api.github.com/repos/GrandpaScout/Figura-VSCode-Documentation/releases/latest');
    const obj = JSON.parse(response.body);

    const url = obj?.assets[0]?.browser_download_url;
    // const url = 'https://media.forgecdn.net/files/3359/914/Xray_Ultimate_1.17_v4.1.2.zip'

    // check if new version is available
    const version = obj?.tag_name;
    const versiontxt = path.join(destination_dir, '.version');
    let newVersionAvailable = true;
    if (fs.existsSync(versiontxt)) {
        const currentversion = fs.readFileSync(versiontxt).toString().trim();
        newVersionAvailable = (currentversion != version);
    }
    
    if (!newVersionAvailable) return;

    if (url) {
        vscode.window.showInformationMessage("Downloading latest Figura Documentation");
        // remove old documentation
        if (fs.existsSync(destination_dir)) {
            fs.readdir(destination_dir, (err, files) => {
                if (err) console.log(err);
                files.forEach(file => {
                    const fileDir = path.join(destination_dir, file);
                    // remove everything except the version file
                    if (file !== '.version') {
                        fs.rmSync(fileDir, { recursive: true });
                    }
                });
                // download new documentation after removing old one
                download(url);
            });
        }
        else {
            // download new documentation if it doesnt exist
            download(url);
        }
    }
    else {
        vscode.window.showErrorMessage("Could not find latest documentation");
    }
}

function download(url) {
    // create new directory
    if (!fs.existsSync(destination_dir)) {
        fs.mkdirSync(destination_dir);
    }
    const target = path.join(destination_dir, "/FiguraDoc.zip");
    const file = fs.createWriteStream(target);
    // download and pipe into file
    got.stream(url)
        .pipe(file)
        .on('error', function (err) {
            console.log(err);
            vscode.window.showErrorMessage("Could not download latest documentation");
        });
    // when done downloading, extract
    file.on('close', async () => {
        try {
            await extract(target, { dir: destination_dir })
            // copy the .vscode/.vscode folder to .vscode
            fs.copy(path.join(destination_dir,'.vscode'), destination_dir, { overwrite: true }, function (err) {
                if (err) {
                    console.log(err);
                    vscode.window.showErrorMessage("Could not copy files");
                }
                else {
                    vscode.window
                    .showInformationMessage('Latest Figura Documentation is now installed', 'Open Settings')
                    .then(selection => {
                        if (selection == 'Open Settings') {
                            vscode.env.openExternal(vscode.Uri.parse('https://github.com/GrandpaScout/Figura-VSCode-Documentation#the-settings'));
                            vscode.workspace.openTextDocument(vscode.Uri.file(path.join(destination_dir,'/settings.json')))
                            .then((a) => {
                                vscode.window.showTextDocument(a);
                            });
                        }
                    });
                    // remove the .vscode/.vscode folder
                    fs.rmSync(path.join(destination_dir,'.vscode'), { recursive: true });
                }
                
            });
            // when done extracting delete zip file
            fs.unlink(target, (err) => {
                if (err) console.log(err.message);
            });
        } catch (err) {
            console.log(err);
        }
    });
    // file write error
    file.on('error', (err) => {
        console.log(err);
        vscode.window.showErrorMessage("Could not save latest documentation");
    });
}

module.exports = { fetch, download };
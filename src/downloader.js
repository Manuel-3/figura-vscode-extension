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
        // vscode.window.showInformationMessage("Downloading Figura documentation");
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
                download(url, destination_dir);
            });
        }
        else {
            // download new documentation if it doesnt exist
            download(url, destination_dir);
        }
    }
    else {
        vscode.window.showErrorMessage("Could not find latest documentation");
    }
}

function download(url, destination) {
    let success = true;

    // create new directory
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination);
    }
    const target = path.join(destination, "/FiguraDoc.zip");
    const file = fs.createWriteStream(target);
    // download and pipe into file

    try {
        const stream = got.stream(url);
        stream.pipe(file)
            .on('error', function (err) {
                console.log(err);
                vscode.window.showErrorMessage("Could not save documentation");
            });
    }
    catch (error) {
        success = false;
        file.close();
    }
    // when done downloading, extract
    file.on('close', async () => {
        try {
            if (!success) {
                fs.rmSync(destination, { recursive: true });
                vscode.window.showWarningMessage('Could not download documentation.');
                return;
            }

            await extract(target, { dir: destination })
            // copy the .vscode/.vscode folder to .vscode
            fs.copy(path.join(destination, '.vscode'), destination, { overwrite: true }, function (err) {
                if (err) {
                    console.log(err);
                    // Error message not necessary, could be that there just isnt a subfolder and instead the files are just directly in there
                    // vscode.window.showErrorMessage("Could not copy files");
                }
                else {
                    // remove the .vscode/.vscode folder (in case it exists)
                    fs.rmSync(path.join(destination, '.vscode'), { recursive: true }).catch(console.error);
                }
                vscode.window
                .showInformationMessage('Figura documentation is now installed', 'Open Settings')
                .then(selection => {
                    if (selection == 'Open Settings') {
                        // vscode.env.openExternal(vscode.Uri.parse('https://github.com/GrandpaScout/Figura-VSCode-Documentation#the-settings'));
                        vscode.workspace.openTextDocument(vscode.Uri.file(path.join(destination, '/settings.json')))
                            .then((a) => {
                                vscode.window.showTextDocument(a);
                            });
                    }
                });
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
        vscode.window.showErrorMessage("Could not save documentation");
    });
}

module.exports = { fetch, download };
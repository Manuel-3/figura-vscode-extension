const vscode = require('vscode');
const WordGroup = require('../wordgroup');
const fs = require('fs');
const path = require('path');

const rootgroups = [];


const typeToWordGroup = new Map(); // string type to WordGroup[]

// ------ watch blockbench files begin ------

let models = new WordGroup(['models'], vscode.CompletionItemKind.Field);
let animations = new WordGroup(['animations'], vscode.CompletionItemKind.Field);

let folderwatcher;
let avatarFolder;

vscode.window.onDidChangeActiveTextEditor(changeEvent => {
    onDidChangeActiveTextEditor();
});

function onDidChangeActiveTextEditor() {
    let currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    if (!currentlyOpenTabfilePath?.endsWith('.lua')) return; // only search for a BB file if a lua script is open
    let currentlyOpenTabFolderPath;
    if (currentlyOpenTabfilePath != undefined) currentlyOpenTabFolderPath = path.dirname(currentlyOpenTabfilePath);
    let newAvatarFolder;
    if (currentlyOpenTabFolderPath != undefined) newAvatarFolder = findAvatarFolder(currentlyOpenTabFolderPath);

    if (avatarFolder != newAvatarFolder) {
        avatarFolder = newAvatarFolder;
        console.log('Avatar folder: ' + avatarFolder);

        if (avatarFolder != undefined) {

            if (folderwatcher != undefined) folderwatcher.close();
            folderwatcher = fs.watch(avatarFolder, (eventType, filename) => {

                // only do something for .bbmodel files
                if (!filename?.toLowerCase().endsWith('.bbmodel')) return;

                refreshModelTree(avatarFolder);
            });

            refreshModelTree(avatarFolder);
        }
    }
}
onDidChangeActiveTextEditor();

function refreshModelTree(folder) {
    // todo: also find files in subfolders
    const bbmodelpaths = (fs.readdirSync(folder).filter(file => file.toLowerCase().endsWith('.bbmodel')).reduce((acc, file) => { acc.push({ path: path.join(folder, file), filename: file.substring(0, file.length - 8) }); return acc; }, []));

    // reset models
    let index = rootgroups.findIndex(x => x.group == models);
    if (index != -1) rootgroups.splice(index, 1);
    models = new WordGroup(['models'], vscode.CompletionItemKind.Field);
    rootgroups.push({ group: models, ignoreCompat: true });

    // reset animations
    index = rootgroups.findIndex(x => x.group == animations);
    if (index != -1) rootgroups.splice(index, 1);
    animations = new WordGroup(['animations'], vscode.CompletionItemKind.Field);
    rootgroups.push({ group: animations, ignoreCompat: true });

    // add new models
    bbmodelpaths.forEach(bbmodelpath => {
        if (bbmodelpath != undefined && bbmodelpath.path != undefined && fs.existsSync(bbmodelpath.path)) {
            const filegroup_model = new WordGroup([bbmodelpath.filename], vscode.CompletionItemKind.Field);
            const filegroup_animation = new WordGroup([bbmodelpath.filename], vscode.CompletionItemKind.Field);
            // parse new model
            try {
                console.log("parsing " + bbmodelpath.filename);
                parseBB(bbmodelpath.path, filegroup_model, filegroup_animation);
                // vscode.window.setStatusBarMessage(`Model ${bbmodelpath.filename} reloaded.`);
            }
            catch (err) {
                console.error(err);
                vscode.window.showWarningMessage(`Model ${bbmodelpath.filename} could not be parsed.`);
            }
            models.addSubGroup(filegroup_model);
            animations.addSubGroup(filegroup_animation);
        }
        else {
            vscode.window.showWarningMessage(`Model ${bbmodelpath.filename} not found.`);
        }
    });
}

/**
 * Searches every folder leading to a given path for an avatar.json file and then returns that path if found
 */
function findAvatarFolder(p) {
    p = p.replaceAll('\\', '/');
    let folders = p.split('/');
    let currentPath = folders[0];
    for (let i = 1; i < folders.length; i++) {
        currentPath = path.join(currentPath, folders[i]);
        if (fs.existsSync(path.join(currentPath, 'avatar.json'))) return currentPath;
    }
    return undefined;
}

function parseBB(bbmodelpath, modelsubgroup, animationsubgroup) {
    let bbmodel = JSON.parse(fs.readFileSync(bbmodelpath).toString());
    bbmodelForeach(bbmodel, bbmodel.outliner, modelsubgroup);
    bbmodel.animations?.forEach(anim => {
        const animationWordGroup = new WordGroup([anim.name], vscode.CompletionItemKind.Property, true, '', false, 'Animation');
        animationsubgroup.addSubGroup(animationWordGroup);
    });
}

function bbmodelForeach(bbmodel, currentgroup, wordgroup) {
    currentgroup?.forEach(element => {
        if (typeof (element) == 'string') {
            // cube
            let cube = bbmodel.elements.find(x => x.uuid == element);
            let cubeword = new WordGroup([cube.name], vscode.CompletionItemKind.Property, true, '', false, 'ModelPart');
            // cubeword.addSubGroup(custommodelpart);
            wordgroup.addSubGroup(cubeword);
        }
        else {
            // group
            let groupword = new WordGroup([element.name], vscode.CompletionItemKind.Property, true, '', false, 'ModelPart');
            // groupword.addSubGroup(custommodelpart);
            wordgroup.addSubGroup(groupword);
            bbmodelForeach(bbmodel, element.children, groupword);
        }
    });
}

// ------ watch blockbench files end ------

// Applying all the classes to the globals
for (const rootgroup of rootgroups) {
    // Apply to first layer
    const g1 = typeToWordGroup.get(rootgroup.group.type);
    if (g1 != undefined) {
        for (const g of g1) {
            rootgroup.group.addSubGroup(g);
        }
    }
    // Apply to deeper layers
    for (const subgroup of rootgroup.group.subgroups) {
        apply(subgroup);
    }
}

function apply(current) {
    for (subgroup of current.subgroups) {
        apply(subgroup);
    }
    const g1 = typeToWordGroup.get(current.type);
    if (g1 != undefined) {
        for (const g of g1) {
            current.addSubGroup(g);
        }
    }
}

module.exports = rootgroups;
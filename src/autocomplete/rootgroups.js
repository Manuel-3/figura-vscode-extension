const vscode = require('vscode');
const WordGroup = require('./wordgroup');
const fs = require('fs');
const path = require('path');
const { findAvatarFolder } = require('../util');

const rootgroups = [];

const typeToWordGroup = new Map(); // string type to WordGroup[]

// ------ watch bbmodel and ogg files begin ------

let models = new WordGroup(['models'], vscode.CompletionItemKind.Field);
let animations = new WordGroup(['animations'], vscode.CompletionItemKind.Field);
let textures = new WordGroup(['textures'], vscode.CompletionItemKind.Field);
let sounds = new WordGroup(['sounds'], vscode.CompletionItemKind.Field);

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

        if (avatarFolder != undefined) {

            if (folderwatcher != undefined) folderwatcher.close();
            folderwatcher = fs.watch(avatarFolder, (eventType, filename) => {

                // only do something for .bbmodel or .ogg files
                if (filename?.toLowerCase().endsWith('.bbmodel')) refreshModelTree(avatarFolder);
                if (!filename?.toLowerCase().endsWith('.ogg')) refreshSounds(avatarFolder);
            });

            refreshModelTree(avatarFolder);
            refreshSounds(avatarFolder);
        }
    }
}
onDidChangeActiveTextEditor();

function findBBModelFiles(folder, structure) {
    structure = structure ?? {};
    // Read all files and directories in the current folder
    const items = fs.readdirSync(folder, { withFileTypes: true });
    let hasBBModelFiles = false; // Track if we find any .bbmodel files in this folder
    items.forEach(item => {
        const fullPath = path.join(folder, item.name);
        if (item.isDirectory()) {
            // Recursively search in subdirectories
            const subStructure = {}; // Temporary structure for subdirectory
            const foundBBModel = findBBModelFiles(fullPath, subStructure); // Get subfolder structure
            if (foundBBModel) {
                structure[item.name] = subStructure; // Only add if subfolder contains .bbmodel files
                hasBBModelFiles = true; // Set flag if a .bbmodel was found in the subfolder
            }
        } else if (item.isFile() && item.name.toLowerCase().endsWith('.bbmodel')) {
            // If it's a .bbmodel file, add it to the structure
            structure[item.name.substring(0, item.name.length - 8)] = fullPath; // Use name without extension
            hasBBModelFiles = true; // Set flag as we found a .bbmodel file
        }
    });
    return hasBBModelFiles; // Return whether this directory contains any .bbmodel files
}

function findOggFiles(folder, structure) {
    structure = structure ?? {};
    // Read all files and directories in the current folder
    const items = fs.readdirSync(folder, { withFileTypes: true });
    let hasOggFiles = false; // Track if we find any .ogg files in this folder
    items.forEach(item => {
        const fullPath = path.join(folder, item.name);
        if (item.isDirectory()) {
            // Recursively search in subdirectories
            const subStructure = {}; // Temporary structure for subdirectory
            const foundOgg = findOggFiles(fullPath, subStructure); // Get subfolder structure
            if (foundOgg) {
                structure[item.name] = subStructure; // Only add if subfolder contains .ogg files
                hasOggFiles = true; // Set flag if a .ogg was found in the subfolder
            }
        } else if (item.isFile() && item.name.toLowerCase().endsWith('.ogg')) {
            // If it's a .Ogg file, add it to the structure
            structure[item.name.substring(0, item.name.length - 4)] = fullPath; // Use name without extension
            hasOggFiles = true; // Set flag as we found a .ogg file
        }
    });
    return hasOggFiles; // Return whether this directory contains any .ogg files
}

function refreshSounds(folder) {
    const oggpaths = {};
    findOggFiles(folder, oggpaths);

    // reset sounds
    index = rootgroups.findIndex(x => x.group == sounds);
    if (index != -1) rootgroups.splice(index, 1);
    sounds = new WordGroup(['sounds'], vscode.CompletionItemKind.Field);
    rootgroups.push({ group: sounds, ignoreCompat: true });

    // add new sounds
    function addSounds(node, joinedNames) {
        joinedNames = joinedNames ?? "";
        for (const fileName in node) {
            if (Object.prototype.hasOwnProperty.call(node, fileName)) {
                const element = node[fileName];
                const internalpath = joinedNames+(joinedNames==""?"":".")+fileName;
                if (typeof(element) == 'string') {
                    sounds.addSubGroup(new WordGroup([internalpath], vscode.CompletionItemKind.Field));
                }
                else {
                    addSounds(element, internalpath);
                }
            }
        }
    }
    addSounds(oggpaths);
}

function refreshModelTree(folder) {
    //const bbmodelpaths = (fs.readdirSync(folder).filter(file => file.toLowerCase().endsWith('.bbmodel')).reduce((acc, file) => { acc.push({ path: path.join(folder, file), filename: file.substring(0, file.length - 8) }); return acc; }, []));
    const bbmodelpaths = {};
    findBBModelFiles(folder, bbmodelpaths);

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

    // reset textures
    index = rootgroups.findIndex(x => x.group == textures);
    if (index != -1) rootgroups.splice(index, 1);
    textures = new WordGroup(['textures'], vscode.CompletionItemKind.Field);
    rootgroups.push({ group: textures, ignoreCompat: true });

    // add new models
    function addModels(node, modelgroup, joinedNames) {
        joinedNames = joinedNames ?? "";
        for (const fileName in node) {
            if (Object.prototype.hasOwnProperty.call(node, fileName)) {
                const element = node[fileName];
                const internalpath = joinedNames+(joinedNames==""?"":".")+fileName;
                if (typeof(element) == 'string') {
                    const bbmodelpath = element;
                    if (bbmodelpath != undefined && fs.existsSync(bbmodelpath)) {
                        const filegroup_model = new WordGroup([fileName], vscode.CompletionItemKind.Field);
                        const filegroup_animation = new WordGroup([internalpath], vscode.CompletionItemKind.Field);
                        // parse new model
                        try {
                            console.log("parsing " + fileName);
                            parseBB(bbmodelpath, filegroup_model, filegroup_animation, textures, internalpath);
                            // vscode.window.setStatusBarMessage(`Model ${bbmodelpath.filename} reloaded.`);
                        }
                        catch (err) {
                            console.error(err);
                            vscode.window.showWarningMessage(`Model ${fileName} could not be parsed.`);
                        }
                        modelgroup.addSubGroup(filegroup_model);
                        animations.addSubGroup(filegroup_animation);
                    }
                    else {
                        vscode.window.showWarningMessage(`Model ${fileName} not found.`);
                    }
                }
                else {
                    let wg = new WordGroup([fileName], vscode.CompletionItemKind.Folder);
                    modelgroup.addSubGroup(wg);
                    addModels(element, wg, internalpath);
                }
            }
        }
    }
    addModels(bbmodelpaths, models);
}

function removeLastN(path, n) {
    const parts = path.split('.');
    parts.splice(-n, n);
    return parts.join('.');
}

function parseBB(bbmodelpath, modelsubgroup, animationsubgroup, textures, internalpath) {
    let bbmodel = JSON.parse(fs.readFileSync(bbmodelpath).toString());
    bbmodelForeach(bbmodel, bbmodel.outliner, modelsubgroup);
    bbmodel.animations?.forEach(anim => {
        const animationWordGroup = new WordGroup([anim.name], vscode.CompletionItemKind.Field, true, '', false, 'Animation');
        animationsubgroup.addSubGroup(animationWordGroup);
    });
    bbmodel.textures?.forEach(texture => {
        const textureName = texture.name.toLowerCase().endsWith(".png")?texture.name.substring(0,texture.name.length-4):texture.name;
        const dirName = path.dirname(bbmodelpath);
        if (texture.relative_path) {
            const textureFile = path.join(dirName,texture.relative_path);
            const folderUpCount = (texture.relative_path.match(/\.\.\//g) || []).length; // count how many ../ are inside
            const folderDownPath = texture.relative_path.startsWith('../')?'':(texture.relative_path.substring(0,texture.relative_path.lastIndexOf('/')).replaceAll('/','.'));
            if (fs.existsSync(textureFile)) {
                const folderUpPath = removeLastN(internalpath, folderUpCount+1)
                textures.addSubGroup(new WordGroup([folderUpPath+(folderUpPath==''?'':'.')+folderDownPath+(folderDownPath==''?'':'.')+textureName], vscode.CompletionItemKind.Field, true, '', false, 'Texture'))
            }
        }
        else {
            textures.addSubGroup(new WordGroup([internalpath+(internalpath==''?'':'.')+textureName], vscode.CompletionItemKind.Field, true, '', false, 'Texture'));
        }
    });
}

function bbmodelForeach(bbmodel, currentgroup, wordgroup) {
    currentgroup?.forEach(element => {
        if (typeof (element) == 'string') {
            // cube
            let cube = bbmodel.elements.find(x => x.uuid == element);
            let cubeword = new WordGroup([cube.name], vscode.CompletionItemKind.Field, true, '', false, 'ModelPart');
            // cubeword.addSubGroup(custommodelpart);
            wordgroup.addSubGroup(cubeword);
        }
        else {
            // group
            let groupword = new WordGroup([element.name], vscode.CompletionItemKind.Field, true, '', false, 'ModelPart');
            // groupword.addSubGroup(custommodelpart);
            wordgroup.addSubGroup(groupword);
            bbmodelForeach(bbmodel, element.children, groupword);
        }
    });
}

// ------ watch bbmodel and ogg files end ------

// Applying all the classes to the globals
// for (const rootgroup of rootgroups) {
//     // Apply to first layer
//     const g1 = typeToWordGroup.get(rootgroup.group.type);
//     if (g1 != undefined) {
//         for (const g of g1) {
//             rootgroup.group.addSubGroup(g);
//         }
//     }
//     // Apply to deeper layers
//     for (const subgroup of rootgroup.group.subgroups) {
//         apply(subgroup);
//     }
// }

// function apply(current) {
//     for (subgroup of current.subgroups) {
//         apply(subgroup);
//     }
//     const g1 = typeToWordGroup.get(current.type);
//     if (g1 != undefined) {
//         for (const g of g1) {
//             current.addSubGroup(g);
//         }
//     }
// }

module.exports = rootgroups;
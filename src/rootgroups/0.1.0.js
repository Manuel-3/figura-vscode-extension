const vscode = require('vscode');
const WordGroup = require('../wordgroup');
const fs = require('fs');
const path = require('path');
const docs = JSON.parse(fs.readFileSync(__filename + 'on').toString()); // read json file with same name

const rootgroups = [];

// ------ parse docs json begin ------

const typeToWordGroup = new Map(); // string type to WordGroup[]

// Parsing all classes from the docs file
for (const [_, group] of Object.entries(docs)) {
    for (const api of group) {
        if (api.name == 'globals') {
            for (const method of api.methods) {
                rootgroups.push({ group: new WordGroup([method.name], vscode.CompletionItemKind.Method, true, [method.description]), ignoreCompat: false });
            }
            for (const field of api.fields) {
                if (field.name == 'models' || field.name == "animation") continue; // ignore "models" and "animation" globals to avoid duplicates
                rootgroups.push({ group: new WordGroup([field.name], vscode.CompletionItemKind.Field, true, [field.description], undefined, field.type), ignoreCompat: false });
            }
        }
        else {
            const methodwords = [];
            const fieldwords = [];
            const superclasses = getSuperClasses(api);
            for (const method of (api.methods ?? [])) {
                let isSelfCall = superclasses.find(clazz => clazz == (method.parameters[0] && method.parameters[0][0]?.type)) != undefined;
                methodwords.push(new WordGroup([method.name], vscode.CompletionItemKind.Method, true, [generateMethodDescription(method)], [isSelfCall], method.returns[0]));
            }
            for (const field of (api.fields ?? [])) {
                fieldwords.push(new WordGroup([field.name], vscode.CompletionItemKind.Field, true, [field.description], undefined, field.type));
            }
            typeToWordGroup.set(api.name, methodwords.concat(fieldwords));
        }
    }
}

function getSuperClasses(clazz, current) {
    if (current == undefined) current = [];

    current.push(clazz.name);

    for (const [_, group] of Object.entries(docs)) {
        const superclass = group.find(api => api.name == clazz.parent);
        if (superclass != undefined) {
            current = getSuperClasses(superclass, current);
            break;
        }
    }

    return current;
}

function generateMethodDescription(method) {
    if (method.parameters.length != method.returns.length) return 'Unexpected error occured, please report this error.';
    let lines = '';
    for (let i = 0; i < method.parameters.length; i++) {
        let params = '';
        for (let j = 0; j < method.parameters[i].length; j++) {
            params += `${method.parameters[i][j].type} ${method.parameters[i][j].name}, `;
        }
        if (method.parameters[i].length > 0) params = params.substring(0, params.length - 2);
        lines += `${method.name}(${params}): ${method.returns[i]}\n`;
    }
    lines += '\n' + method.description;
    return lines;
}

// ------ parse docs json end ------

// ------ watch blockbench files begin ------

let models = new WordGroup(['models'], vscode.CompletionItemKind.Field);
let animation = new WordGroup(['animation'], vscode.CompletionItemKind.Field);

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

    // reset animation
    index = rootgroups.findIndex(x => x.group == animation);
    if (index != -1) rootgroups.splice(index, 1);
    animation = new WordGroup(['animation'], vscode.CompletionItemKind.Field);
    rootgroups.push({ group: animation, ignoreCompat: true });

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
            animation.addSubGroup(filegroup_animation);
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
        // animationWordGroup.addSubGroup(animationmethods);
        animationsubgroup.addSubGroup(animationWordGroup);
    });
    // animationsubgroup.addSubGroup(animationrootmethods);
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

/*
function onDidChangeActiveTextEditor() {

    // reset models
    let index = rootgroups.findIndex(x => x.group == models);
    if (index != -1) rootgroups.splice(index, 1);
    models = new WordGroup(['models'], vscode.CompletionItemKind.Field);
    rootgroups.push({ group: models, ignoreCompat: true });

    // reset animation
    // index = rootgroups.findIndex(x => x.group == animation);
    // if (index != -1) rootgroups.splice(index, 1);
    // animation = new WordGroup(['animation'], vscode.CompletionItemKind.Field);
    // rootgroups.push({ group: animation, ignoreCompat: true });

    let currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    if (!currentlyOpenTabfilePath?.endsWith('.lua')) return; // only search for a BB file if a lua script is open
    let currentlyOpenTabFolderPath;
    let bbmodelpaths;
    if (currentlyOpenTabfilePath != undefined) currentlyOpenTabFolderPath = path.dirname(currentlyOpenTabfilePath);
    if (currentlyOpenTabFolderPath != undefined) bbmodelpaths = (fs.readdirSync(currentlyOpenTabFolderPath).filter(file => file.toLowerCase().endsWith('.bbmodel')).reduce((acc, file) => { acc.push({ path: path.join(currentlyOpenTabFolderPath, file), filename: file.substring(0, file.length - 6) }); return acc; }, []));

    console.log(bbmodelpaths);

    
    bbmodelpaths.forEach(bbmodelpath => {
        if (bbmodelpath != undefined && fs.existsSync(bbmodelpath.path)) {
            const filegroup = new WordGroup([bbmodelpath.filename], vscode.CompletionItemKind.Field);
            let fsWait = false;
            filewatchers.push(fs.watch(bbmodelpath.path, (event, filename) => {
                if (filename) {
                    if (fsWait) return;
                    fsWait = setTimeout(() => {
                        fsWait = false;
                    }, 100);
                    console.log(`${filename} file changed`);

                    // reset models
                    let index = rootgroups.findIndex(x => x.group == models);
                    if (index != -1) rootgroups.splice(index, 1);
                    models = new WordGroup(['models'], vscode.CompletionItemKind.Field);

                    // reset animation
                    // index = rootgroups.findIndex(x => x.group == animation);
                    // if (index != -1) rootgroups.splice(index, 1);
                    // animation = new WordGroup(['animation'], vscode.CompletionItemKind.Field);

                    // parse new model
                    try {
                        parseBB(bbmodelpath);
                        vscode.window.setStatusBarMessage("Blockbench model reloaded");
                    }
                    catch {
                        vscode.window.showWarningMessage("Blockbench model not found");
                    }
                    rootgroups.push({ group: model, ignoreCompat: true });
                    // rootgroups.push({ group: animation, ignoreCompat: true });
                }
            }));
            parseBB(bbmodelpath);
        }
        else {
            vscode.window.showWarningMessage("Blockbench model not found");
        }
    });   
}
*/

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

// Add all the root groups together for export

// only if language server compat mode is not enabled [currently not used]
// rootgroups.push({ group: ....., ignoreCompat: false });

// always
// rootgroups.push({ group: models, ignoreCompat: true }); // not needed, will be added by the file watcher
// rootgroups.push({ group: animation, ignoreCompat: true });

module.exports = rootgroups;
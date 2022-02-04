const vscode = require('vscode');
const WordGroup = require('../wordgroup');
const fs = require('fs');
const path = require('path');

// Root groups

const vanilla_model = new WordGroup(['vanilla_model'], vscode.CompletionItemKind.Field);
const armor_model = new WordGroup(['armor_model'], vscode.CompletionItemKind.Field);
const elytra_model = new WordGroup(['elytra_model'], vscode.CompletionItemKind.Field);
const held_item_model = new WordGroup(['held_item_model'], vscode.CompletionItemKind.Field);
let model = new WordGroup(['model'], vscode.CompletionItemKind.Field);
const particle = new WordGroup(['particle'], vscode.CompletionItemKind.Field);
const sound = new WordGroup(['sound'], vscode.CompletionItemKind.Field);
const player = new WordGroup(['player'], vscode.CompletionItemKind.Field);
const world = new WordGroup(['world'], vscode.CompletionItemKind.Field);
const vectors = new WordGroup(['vectors'], vscode.CompletionItemKind.Field);
const renderer = new WordGroup(['renderer'], vscode.CompletionItemKind.Field);
const network = new WordGroup(['network'], vscode.CompletionItemKind.Field);
const item_stack = new WordGroup(['item_stack'], vscode.CompletionItemKind.Field);
const action_wheel = new WordGroup(['action_wheel'], vscode.CompletionItemKind.Field);
const keybind = new WordGroup(['keybind'], vscode.CompletionItemKind.Field);
const chat = new WordGroup(['chat'], vscode.CompletionItemKind.Field);
const meta = new WordGroup(['meta'], vscode.CompletionItemKind.Field);
const log = new WordGroup(['log'], vscode.CompletionItemKind.Field);
const logTableContent = new WordGroup(['logTableContent'], vscode.CompletionItemKind.Field);
const parrot_model = new WordGroup(['parrot_model'], vscode.CompletionItemKind.Field);
const nameplate = new WordGroup(['nameplate'], vscode.CompletionItemKind.Field);

vanilla_model.addSubGroup(new WordGroup([
    'HEAD',
    'HAT',
    'TORSO',
    'JACKET',
    'LEFT_ARM',
    'LEFT_SLEEVE',
    'RIGHT_ARM',
    'RIGHT_SLEEVE',
    'LEFT_LEG',
    'LEFT_PANTS_LEG',
    'RIGHT_LEG',
    'RIGHT_PANTS_LEG'
], vscode.CompletionItemKind.Property));

armor_model.addSubGroup(new WordGroup([
    'HELMET',
    'CHESTPLATE',
    'LEGGINGS',
    'BOOTS',
    'HEAD_ITEM'
], vscode.CompletionItemKind.Property));

elytra_model.addSubGroup(new WordGroup([
    'LEFT_WING',
    'RIGHT_WING'
], vscode.CompletionItemKind.Property));

held_item_model.addSubGroup(new WordGroup([
    'LEFT_HAND',
    'RIGHT_HAND'
], vscode.CompletionItemKind.Property));

// vanilla model part functions (armor_model, vanilla_model, elytra_model.....)
const vanillamodelpart = new WordGroup([
    'setPos',
    'getPos',
    'setRot',
    'getRot',
    'setEnabled',
    'getEnabled',
    'getOriginEnabled',
    'getOriginPos',
    'getOriginRot',
    'isOptionEnabled'
], vscode.CompletionItemKind.Method);

vanilla_model.subgroups[0].addSubGroup(vanillamodelpart);
armor_model.subgroups[0].addSubGroup(vanillamodelpart);
elytra_model.subgroups[0].addSubGroup(vanillamodelpart);
held_item_model.subgroups[0].addSubGroup(vanillamodelpart);

parrot_model.addSubGroup(new WordGroup([
    'LEFT_PARROT',
    'RIGHT_PARROT'
], vscode.CompletionItemKind.Property));

const parrot_modelpart = new WordGroup([
    'getPos',
    'setPos',
    'getRot',
    'setRot',
    'getEnabled',
    'setEnabled',
], vscode.CompletionItemKind.Method);

parrot_model.subgroups[0].addSubGroup(parrot_modelpart);

particle.addSubGroup(new WordGroup([
    'addParticle'
], vscode.CompletionItemKind.Method));

sound.addSubGroup(new WordGroup([
    'playSound',
    'getSounds'
], vscode.CompletionItemKind.Method));

player.addSubGroup(new WordGroup([
    'getFood',
    'getHeldItem',
    'getExperienceProgress',
    'getSaturation',
    'lastDamageSource',
    'getExperienceLevel'
], vscode.CompletionItemKind.Method));

const livingentity = new WordGroup([
    'getBodyYaw',
    'isLeftHanded',
    'getDeathTime',
    'isSneaky',
    'getStingerCount',
    'getArmor',
    'getHealthPercentage',
    'getMaxHealth',
    'getHealth',
    'getStuckArrowCount',
    'getStatusEffect',
    'getStatusEffectTypes'
], vscode.CompletionItemKind.Method);

const entity = new WordGroup([
    'getRot',
    'isWet',
    'getVehicle',
    'getLookDir',
    'getEyeHeight',
    'getAir',
    'getWorldName',
    'getMaxAir',
    'getFrozenTicks',
    'getFireTicks',
    'getTargetedBlockPos',
    'getNbtValue',
    'getAirPercentage',
    'getPos',
    'getBoundingBox',
    'getName',
    'getUUID',
    'getEquipmentSlot',
    'getType',
    'isGrounded',
    'getAnimation',
    'getVelocity'
], vscode.CompletionItemKind.Method);

player.addSubGroup(livingentity);
player.addSubGroup(entity);

world.addSubGroup(new WordGroup([
    'getBlockState',
    'getRedstonePower',
    'getStrongRedstonePower',
    'getTime',
    'getTimeOfDay',
    'getMoonPhase',
    'getRainGradient',
    'isLightning',
    'getLightLevel',
    'getSkyLightLevel',
    'getBlockLightLevel',
    'getBiomeID',
    'getFiguraPlayers',
    'getBlockTags',
    'getLunarTime'
], vscode.CompletionItemKind.Method));

vectors.addSubGroup(new WordGroup([
    'of',
    'getVector',
    'worldToPart',
    'hsvToRGB',
    'rgbToHSV',
    'rgbToINT',
    'intToRGB',
    'lerp',
    'asTable'
], vscode.CompletionItemKind.Method));

renderer.addSubGroup(new WordGroup([
    'setShadowSize',
    'getShadowSize',
    'isFirstPerson',
], vscode.CompletionItemKind.Method));

network.addSubGroup(new WordGroup([
    'registerPing',
    'ping',
], vscode.CompletionItemKind.Method));

item_stack.addSubGroup(new WordGroup([
    'createItem'
], vscode.CompletionItemKind.Method));

action_wheel.addSubGroup(new WordGroup([
    'setLeftSize',
    'getLeftSize',
    'setRightSize',
    'getRightSize',
    'getSelectedSlot'
], vscode.CompletionItemKind.Method));

const action_wheel__slots = new WordGroup([
    'SLOT_1',
    'SLOT_2',
    'SLOT_3',
    'SLOT_4',
    'SLOT_5',
    'SLOT_6',
    'SLOT_7',
    'SLOT_8'
], vscode.CompletionItemKind.Property);

const action_wheel__slots__methods = new WordGroup([
    'clear',
    'setItem',
    'getItem',
    'setTitle',
    'getTitle',
    'setFunction',
    'getFunction',
    'setHoverItem',
    'getHoverItem',
    'setColor',
    'getColor',
    'setHoverColor',
    'getHoverColor',
], vscode.CompletionItemKind.Method);

action_wheel__slots.addSubGroup(action_wheel__slots__methods);
action_wheel.addSubGroup(action_wheel__slots);

keybind.addSubGroup(new WordGroup([
    'newKey',
    'getRegisteredKeybind'
], vscode.CompletionItemKind.Method));

chat.addSubGroup(new WordGroup([
    'sendMessage',
    'getMessage',
    'setFiguraCommandPrefix'
], vscode.CompletionItemKind.Method));

meta.addSubGroup(new WordGroup([
    'getInitLimit',
    'getCurrentTickCount',
    'getTickLimit',
    'getCurrentRenderCount',
    'getRenderLimit',
    'getCurrentComplexity',
    'getComplexityLimit',
    'getCurrentParticleCount',
    'getParticleLimit',
    'getCurrentSoundCount',
    'getSoundLimit',
    'getCanModifyVanilla',
    'getCanModifyNameplate',
    'getDoesRenderOffscreen',
    'getFiguraVersion'
], vscode.CompletionItemKind.Method));

const nameplate_chat = new WordGroup([
    'CHAT'
], vscode.CompletionItemKind.Property);
const nameplate_entity = new WordGroup([
    'ENTITY'
], vscode.CompletionItemKind.Property);
const nameplate_list = new WordGroup([
    'LIST'
], vscode.CompletionItemKind.Property);
const nameplate_all_methods = new WordGroup([
    'setColor',
    'getColor',
    'setFormatting',
    'getFormatting',
    'setText',
    'getText',
], vscode.CompletionItemKind.Method);
const nameplate_entity_methods = new WordGroup([
    'setEnabled',
    'getEnabled',
    'setPos',
    'getPos',
    'setScale',
    'getScale',
], vscode.CompletionItemKind.Method);
nameplate_chat.addSubGroup(nameplate_all_methods);
nameplate_list.addSubGroup(nameplate_all_methods);
nameplate_entity.addSubGroup(nameplate_all_methods);
nameplate_entity.addSubGroup(nameplate_entity_methods);
nameplate.addSubGroup(nameplate_chat);
nameplate.addSubGroup(nameplate_entity);
nameplate.addSubGroup(nameplate_list);

const custommodelpart = new WordGroup([
    'setPos',
    'getPos',
    'setRot',
    'getRot',
    'setEnabled',
    'getEnabled',
    'setScale',
    'getScale',
    'setPivot',
    'getPivot',
    'setUV',
    'getUV',
    'setColor',
    'getColor',
    'setParentType',
    'getParentType',
    'setMimicMode',
    'getMimicMode',
    'setShader',
    'getShader',
    'partToWorldPos',
    'worldToPartPos',
    'partToWorldDir',
    'worldToPartDir',
    'setOpacity',
    'getOpacity'
], vscode.CompletionItemKind.Method);

// ------ watch blockbench file begin ------

let filewatcher;

vscode.window.onDidChangeActiveTextEditor(changeEvent => {
    onDidChangeActiveTextEditor();
});

function onDidChangeActiveTextEditor() {
    if (filewatcher != undefined) filewatcher.close();

    // reset model
    let index = rootgroups.findIndex(x => x == model);
    if (index != -1) rootgroups.splice(index, 1);
    model = new WordGroup(['model'], vscode.CompletionItemKind.Field);
    rootgroups.push({ group: model, ignoreCompat: true });

    let currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    if (!currentlyOpenTabfilePath?.endsWith('.lua')) return; // only search for a BB file if a lua script is open
    let currentlyOpenTabFolderPath;
    let bbmodelpath;
    if (currentlyOpenTabfilePath != undefined) currentlyOpenTabFolderPath = path.dirname(currentlyOpenTabfilePath);
    if (currentlyOpenTabFolderPath != undefined) bbmodelpath = path.join(currentlyOpenTabFolderPath, '/model.bbmodel');
    if (!fs.existsSync(bbmodelpath)) bbmodelpath = path.join(currentlyOpenTabFolderPath, '/player_model.bbmodel');

    if (bbmodelpath != undefined && fs.existsSync(bbmodelpath)) {
        let fsWait = false;
        filewatcher = fs.watch(bbmodelpath, (event, filename) => {
            if (filename) {
                if (fsWait) return;
                fsWait = setTimeout(() => {
                    fsWait = false;
                }, 100);
                console.log(`${filename} file Changed`);

                // reset model
                let index = rootgroups.findIndex(x => x == model);
                if (index != -1) rootgroups.splice(index, 1);
                model = new WordGroup(['model'], vscode.CompletionItemKind.Field);

                // parse new model
                try {
                    parseBB();
                    vscode.window.setStatusBarMessage("Blockbench model reloaded");
                }
                catch {
                    vscode.window.showWarningMessage("Blockbench model not found");
                }
                rootgroups.push({ group: model, ignoreCompat: true });
            }
        });
        parseBB();
    }
    else {
        vscode.window.showWarningMessage("Blockbench model not found");
    }
    function parseBB() {
        let bbmodel = JSON.parse(fs.readFileSync(bbmodelpath).toString());
        bbmodelForeach(bbmodel, bbmodel.outliner, model);
    }

    function bbmodelForeach(bbmodel, currentgroup, wordgroup) {
        currentgroup.forEach(element => {
            if (typeof (element) == 'string') {
                // cube
                let cube = bbmodel.elements.find(x => x.uuid == element);
                let cubeword = new WordGroup([cube.name], vscode.CompletionItemKind.Property);
                if (!vscode.workspace.getConfiguration('figura').get('useLanguageServer')) cubeword.addSubGroup(custommodelpart);
                wordgroup.addSubGroup(cubeword);
            }
            else {
                // group
                let groupword = new WordGroup([element.name], vscode.CompletionItemKind.Property);
                if (!vscode.workspace.getConfiguration('figura').get('useLanguageServer')) groupword.addSubGroup(custommodelpart);
                wordgroup.addSubGroup(groupword);
                bbmodelForeach(bbmodel, element.children, groupword);
            }
        });
    }
}

// ------ watch blockbench file end ------

// Add all the root groups together for export
const rootgroups = []

// only if useLanguageServer is not enabled
rootgroups.push({ group: vanilla_model, ignoreCompat: false });
rootgroups.push({ group: armor_model, ignoreCompat: false });
rootgroups.push({ group: elytra_model, ignoreCompat: false });
rootgroups.push({ group: held_item_model, ignoreCompat: false });
rootgroups.push({ group: particle, ignoreCompat: false });
rootgroups.push({ group: sound, ignoreCompat: false });
rootgroups.push({ group: player, ignoreCompat: false });
rootgroups.push({ group: world, ignoreCompat: false });
rootgroups.push({ group: vectors, ignoreCompat: false });
rootgroups.push({ group: renderer, ignoreCompat: false });
rootgroups.push({ group: network, ignoreCompat: false });
rootgroups.push({ group: item_stack, ignoreCompat: false });
rootgroups.push({ group: action_wheel, ignoreCompat: false });
rootgroups.push({ group: keybind, ignoreCompat: false });
rootgroups.push({ group: chat, ignoreCompat: false });
rootgroups.push({ group: meta, ignoreCompat: false });
rootgroups.push({ group: log, ignoreCompat: false });
rootgroups.push({ group: logTableContent, ignoreCompat: false });
rootgroups.push({ group: parrot_model, ignoreCompat: false });
rootgroups.push({ group: nameplate, ignoreCompat: false });

// always
rootgroups.push({ group: model, ignoreCompat: true });

// load BB file at start
onDidChangeActiveTextEditor();

module.exports = rootgroups;
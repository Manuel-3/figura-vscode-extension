const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');
const util = require('./util');

let cacheFile;
let cache = {
    timestamp: 0,
    list: new Set()
};

/**
 * Set the cache to something new
 * @param {object} newcache 
 */
function set(newcache) {
    cache = newcache;
}

/**
 * Get the memory cache with the list Set replaced with a list Array
 * @returns cache
 */
function getPrimitive() {
    return util.toPrimitiveCache(cache);
}

/**
 * Save memory cache to file
 * @param {number} timestamp 
 */
async function save(timestamp) {
    try {
        cache.timestamp = timestamp;
        const content = timestamp.toString() + '\n' + [...cache.list].join('\n');
        await fs.mkdir(path.dirname(cacheFile), { recursive: true });
        await fs.writeFile(cacheFile, content, 'utf-8');
    } catch (error) {
        console.error(`Error writing to file: ${error.message}`);
    }
}

/**
 * Load file into memory cache
 */
async function load() {
    try {
        const data = await fs.readFile(cacheFile, 'utf-8');
        const list = data.toString().replaceAll('\r\n','\n').split('\n').map(line => line.trim());
        const timestamp = parseInt(list[0])
        list.shift();
        cache = {
            timestamp: timestamp,
            list: new Set(shuffleArray(list))
        };
    } catch (error) {
        cache = {
            timestamp: 0,
            list: new Set()
        };
        console.log(`Error reading file: ${error.message}`);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements at indices i and j
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array; // Return the shuffled array
}

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * @param {vscode.ExtensionContext} context 
 */
function activate(context) {
    const cachePath = context.globalStorageUri.fsPath;
    cacheFile = path.join(cachePath, 'figura-library-finder-cache.txt');
}

module.exports = { activate, save, load, set, getPrimitive }
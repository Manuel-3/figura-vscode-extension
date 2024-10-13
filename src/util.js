const fs = require('fs');
const path = require('path');

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

module.exports = { findAvatarFolder }
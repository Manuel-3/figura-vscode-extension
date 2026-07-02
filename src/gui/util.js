/**
 * Get file name from username and download url as format author#originalname.lua
 * @param {string} username 
 * @param {string} url 
 * @returns 
 */
function getFileNameToSaveWith(username, url) {
    const pathname = (new URL(url)).pathname.split('/');
    const originalFilename = pathname[pathname.length-1];
    let filename = username+'#'+originalFilename;
    if (filename.toLowerCase().endsWith('.lua')) filename = filename.substring(0, filename.length-('.lua'.length));
    filename = filename.replaceAll('.',''); // dots are not allowed
    filename += '.lua';
    return filename;
}

/**
 * Convert a primitive Array cache back into a Set cache
 * @returns cache
 */
function parseCache(primitiveCache) {
    return {
        timestamp: primitiveCache.timestamp,
        list: new Set(primitiveCache.list)
    };
}

/**
 * Convert a Set cache into a primitive Array cache
 * @returns cache
 */
function toPrimitiveCache(cache) {
    return {
        timestamp: cache.timestamp,
        list: [...cache.list]
    };
}

module.exports = { getFileNameToSaveWith, parseCache, toPrimitiveCache }
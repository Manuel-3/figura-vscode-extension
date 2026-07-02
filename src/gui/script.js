import { getFileNameToSaveWith, parseCache, toPrimitiveCache } from './util';
const vscode = acquireVsCodeApi();

let cache;
let installedList = [];

const addBtn = document.getElementById("addBtn");
const addTextInput = document.getElementById("addTextInput");
const addTextInputContainer = document.getElementById("addTextInputContainer");

// Receive messages from the extension
window.addEventListener('message', async (event) => {
    const data = event.data; // The JSON data sent from the extension
    let element;
    if (data.callbackUniqueId) {
        element = document.querySelector(`[data-unique-id="${data.callbackUniqueId}"]`);
        if (!element) {
            console.error(`Could not find this unique id element: ${data.callbackUniqueId}`);
            return;
        }
    }
    switch (data.command) {
        case 'downloadCompleted':
            element.innerText = 'Installed';
            return;
        case 'downloadFailed':
            element.innerText = 'Try again';
            element.disabled = false;
            return;
        case 'illegalSource':
            element.innerText = 'Not available';
            element.disabled = true;
            const otherbutton = document.querySelector(`[data-unique-id="${data.otherbuttonUniqueId}"]`);
            if (!otherbutton) return;
            otherbutton.style.display = 'none';
            return;
        case 'receiveCacheAndFetch':
        case 'receiveCache':
            cache = parseCache(data.cache);
            installedList = data.installedList;
            if (data.command == 'receiveCacheAndFetch' || cache.list.size == 0) { // also fetch if cache is empty
                fetchFiles().then(()=>listFiles());
            }
            else {
                listFiles();
            }
            return;
    }
});

function isValidGithubLuaUrl(inputurl) {
    if (inputurl.includes('\n') || inputurl.includes('\r')) return false;
    if (!inputurl.startsWith('https://')) return false;
    const url = new URL(inputurl);
    const splitPath = url.pathname.split('/');
    if (url.host!='github.com') return false;
    if (splitPath.length < 5) return false;
    if (splitPath[3]!='blob') return false;
    if (!url.pathname.toLowerCase().endsWith('.lua')) return false;
    return true;
}

// Assortment of blocked names because they would never be used as custom wanted folder names
// If encountered uses the lua file name instead
const blockedNames = [
    "main",
    "src",
    "dist",
    "master",
    "lib",
    "bin",
    "build",
    "assets",
    "test",
    "tests",
    "example",
    "examples",
    "public",
    "docs",
    "doc",
    "config",
    "settings",
    "resources",
    "script",
    "scripts",
    "blob",
    "tree",
];

function extractValidatedData(inputurl) {
    if (inputurl.includes('\n') || inputurl.includes('\r')) return null;
    if (!inputurl.startsWith('https://')) return null;
    const url = new URL(inputurl);
    const splitPath = url.pathname.split('/');
    const folderPathArr = url.pathname.split('/');
    folderPathArr.pop(); // remove file from the end
    const folderUrl = 'https://' + url.host + folderPathArr.join('/');
    if (url.host!='github.com') return null;
    if (splitPath.length < 5) return null;
    if (splitPath[3]!='blob') return null;
    if (!url.pathname.toLowerCase().endsWith('.lua')) return null;
    const baseUrl = 'https://' + url.host + url.pathname.substring(0,url.pathname.length-('.lua'.length)) // remove ".lua" from the end
    let author = splitPath[1].replace(/[^a-zA-Z0-9\-]/gm,'-') // github user name, replace invalid characters with '-'
    // for title, uses folder name that the file is in,
    // unless its part of the path before the repo folders (github.com/ 1 user/ 2 repo/ 3 blob/ 4 branchname/ 5 customfolder/ 6 otherfolder)
    // or is one of the blocklisted words (like main, src, dist...)
    // in which case it uses file name instead
    let title = splitPath[splitPath.length-2];
    if (splitPath.length-2 <= 4 || blockedNames.includes(title.toLowerCase())) {
        const filename = splitPath[splitPath.length-1];
        title = filename.substring(0,filename.length-('.lua'.length))
    }
    return {
        title: title, 
        author: author,
        folderUrl: folderUrl,
        luaUrl: baseUrl+'.lua',
        luaRawUrl: baseUrl+'.lua?raw=true',
        pngRawUrl: baseUrl+'.png?raw=true',
        searchable: splitPath.filter(x=>!blockedNames.includes(x.toLowerCase())).join('').toLowerCase(),
    }
}

// Fetch documents that are newer than cache
async function fetchFiles() {
    if (cache == undefined) return;
    const querySnapshot = await getDocs(query(
        collection(db, "packages"),
        where('t', '>', cache.timestamp)
    ));

    let highestTimestamp = cache.timestamp;
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const url = decodeURIComponent(doc.id); // document name is the url as an uricomponent
        if (Number.isInteger(data.t)) {
            highestTimestamp = Math.max(highestTimestamp, data.t);
        }
        if (isValidGithubLuaUrl(url)) {
            cache.list.add(url);
        }
    });
    cache.timestamp = highestTimestamp;

    vscode.postMessage({ command: 'saveCache', cache: toPrimitiveCache(cache) });
}

const fileList = document.getElementById("fileList");

// List Lua files
async function listFiles() {
    if (cache == undefined) return;
    fileList.innerHTML = ""; // Clear previous list
    
    cache.list.forEach((url) => {
        const data = extractValidatedData(url);
        if (!data) return;

        const clone = document.getElementsByTagName("template")[0].content.cloneNode(true);
        clone.querySelector('.searchable').innerText = data.searchable;
        clone.querySelector('.title').innerText = data.title;
        clone.querySelector('.author').innerText = data.author;
        clone.querySelector('.showinfo').onclick = () => {
            vscode.postMessage({ command: 'openLink', url: data.folderUrl });
        }
        // both button ids
        const buttonUniqueId = crypto.randomUUID();
        const viewSourceButtonUniqueId = crypto.randomUUID();
        // download button
        const downloadButtonElement = clone.querySelector('.download');
        downloadButtonElement.setAttribute('data-unique-id', buttonUniqueId);
        downloadButtonElement.onclick = () => {
            downloadButtonElement.disabled = true;
            downloadButtonElement.innerText = "Downloading...";
            vscode.postMessage({ command: 'downloadPackage', url: data.luaRawUrl, username: data.author, callbackUniqueId: buttonUniqueId, otherbuttonUniqueId: viewSourceButtonUniqueId });
        }
        // check if its already installed and if so change the download button
        if (installedList.includes(getFileNameToSaveWith(data.author, data.luaUrl))) {
            downloadButtonElement.disabled = true;
            downloadButtonElement.innerText = "Installed";
        }
        // view source button
        const viewSourceButtonElement = clone.querySelector('.viewsource');
        viewSourceButtonElement.setAttribute('data-unique-id', viewSourceButtonUniqueId);
        viewSourceButtonElement.onclick = () => {
            vscode.postMessage({ command: 'openLink', url: data.luaUrl, callbackUniqueId: viewSourceButtonUniqueId, otherbuttonUniqueId: buttonUniqueId });
        }
        fileList.appendChild(clone);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    vscode.postMessage({ command: 'getCache' });
});

addBtn.addEventListener("click", () => {
    addTextInputContainer.style.display = 'block';
    if (addTextInput.value != '') {
        if (cache == undefined) return;
        if (isValidGithubLuaUrl(addTextInput.value)) {
            cache.list.add(addTextInput.value);
        }
        cache.timestamp = Date.now();
        vscode.postMessage({ command: 'saveCache', cache: toPrimitiveCache(cache) });
        addTextInput.value = '';
    }
});

const searchbar = document.getElementById('searchbar');
searchbar.addEventListener('input', () => {
    const searchstring = searchbar.value.toLowerCase().replace(/\s/g,'');
    const regex = new RegExp('.*'+searchstring.split('').join('.*')+'.*');
    fileList.querySelectorAll('.searchable').forEach(element => {
        console.log(searchstring, element.innerText)
        if (searchstring != '') {
            element.parentElement.style.display = regex.test(element.innerText) ? 'block' : 'none';
        }
        else {
            element.parentElement.style.display = 'block';
        }
    })
});
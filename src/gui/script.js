// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { Marked } from 'marked';
import { markedHighlight } from "marked-highlight";
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
const vscode = acquireVsCodeApi();

// Register languages
import lang_plain from 'highlight.js/lib/languages/plaintext';
import lang_lua from 'highlight.js/lib/languages/lua';
import lang_elm from 'highlight.js/lib/languages/elm';
import lang_diff from 'highlight.js/lib/languages/diff';
import lang_shell from 'highlight.js/lib/languages/shell';
hljs.registerLanguage('plaintext', lang_plain);
hljs.registerLanguage('lua', lang_lua);
hljs.registerLanguage('elm', lang_elm);
hljs.registerLanguage('diff', lang_diff);
hljs.registerLanguage('shell', lang_shell);

// Configure marked to use highlight.js
const marked = new Marked(
    markedHighlight({
        emptyLangClass: 'hljs',
        langPrefix: 'hljs language-',
        highlight(code, lang, info) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            console.log("using language", language)
            return hljs.highlight(code, { language }).value;
        }
    })
);

/**
 * Recursively check parents if any of them is a certain tag
 * @returns the first parent (or element itself) with that tag, or null
 */
function checkParentTags(element, tagName) {
    if (element == null) return null;
    if (element.tagName == tagName) return element;
    return checkParentTags(element.parentElement, tagName)
}

// Receive messages from the extension
window.addEventListener('message', event => {
    const data = event.data; // The JSON data sent from the extension
    const element = document.querySelector(`[data-unique-id="${data.callbackUniqueId}"]`);
    if (!element) {
        console.error(`Could not find this unique id element: ${data.callbackUniqueId}`);
        return;
    }
    switch (data.command) {
        case 'returnLongDescriptionMarkdown':
            element.innerHTML = DOMPurify.sanitize(marked.parse(data.longdescription), {
                ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'blockquote', 'code', 'pre', 'table', 'td', 'tr', 'tbody', 'thead', 'th', 'hr', 'details', 'summary', 'input', 'span'],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'type', 'disabled', 'checked'],
            });
            return;
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
    }
});

// Listen for clicks on all anchor elements to display confirmation message
document.body.addEventListener('click', function(event) {
    const element = checkParentTags(event.target, 'A');
    if (element) {
        const href = element.getAttribute('href');
        if (href != 'javascript:void(0);') {
            element.setAttribute('href', 'javascript:void(0);');
            element.setAttribute('originalTargetHreference', href);
        }
        const target = element.getAttribute('originalTargetHreference');
        // Open through vscode API instead
        vscode.postMessage({ command: 'openLink', url: target });
    }
});

function getTestData() {
    return [
        {
            data: ()=>{ return {
                title: 'Squashy API',
                short: 'Anything you want',
                username: 'Sir Squashy',
                long: 'https://github.com/MrSirSquishy/SquishyAPI/blob/main/README.md',
                url: 'https://github.com/MrSirSquishy/SquishyAPI/blob/main/SquAPI.lua'
            }}
        },
        {
            data: ()=>{ return {
                title: 'GS Blender',
                short: 'This library adds a blender into your model.',
                username: 'Grandma Scout',
                long: 'https://github.com/GrandpaScout/GSAnimBlend/blob/main/README.md',
                url: 'https://github.com/GrandpaScout/GSAnimBlend/blob/main/script/default/GSAnimBlend.lua'
            }}
        },
        {
            data: ()=>{ return {
                title: 'Spaghetti',
                short: 'A custom pastacle library',
                username: 'Mawnoel-',
                long: 'https://github.com/Manuel-3/figura-scripts/blob/main/src/confetti/readme.md',
                url: 'https://github.com/Manuel-3/figura-scripts/blob/main/src/confetti/confetti.lua'
            }}
        },
        {
            data: ()=>{ return {
                title: 'Johnny Anims',
                short: 'As of posting there are 999+ animations, and all of them are optional.',
                username: 'Johnny Helper',
                long: 'github.com',
                url: 'https://github.com/GrandpaScout/GSAnimBlend/blob/main'
            }}
        },
        {
            data: ()=>{ return {
                title: 'Cat Armor',
                short: 'A script designed to aid in all things cats, whether that be as simple as re-parenting the vanilla cat, or completely custom cats with unique models and textures.',
                username: 'CatCat269',
                long: 'google.com',
                url: 'https://github.com/GrandpaScout/GSAnimBlend/blob/main/'
            }}
        },
    ];
}

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDL1mLe_sYUcw4g5eX9UvoVCgmLlvy4g5E",
    authDomain: "fpm-figura-package-manager.firebaseapp.com",
    projectId: "fpm-figura-package-manager",
    storageBucket: "fpm-figura-package-manager.appspot.com",
    messagingSenderId: "677697190749",
    appId: "1:677697190749:web:34c73b50228f22015806b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to list Lua files and their content
async function listFiles() {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = ""; // Clear previous list

    // const querySnapshot = await getDocs(collection(db, "packages")); // Get all Lua file documents
    const querySnapshot = getTestData();
    querySnapshot.forEach((doc) => {
        const data = doc.data();

        const clone = document.getElementsByTagName("template")[0].content.cloneNode(true);
        clone.querySelector('.title').innerText = data.title;
        clone.querySelector('.shortdescription').innerText = data.short;
        clone.querySelector('.author').innerText = data.username;
        const longdescriptionElement = clone.querySelector('.longdescription');
        const uniqueId = crypto.randomUUID();
        longdescriptionElement.setAttribute('data-unique-id', uniqueId);
        longdescriptionElement.innerHTML = ''; // make sure its empty, this will be checked to decide if we need to download it
        const expandSectionElement = clone.querySelector('.expand');
        expandSectionElement.onclick = () => { // when clicked on, expand and show long description
            for (const elmnt of document.getElementById('fileList').children) {
                if (elmnt!=expandSectionElement.parentElement.parentElement)
                    elmnt.querySelector('p.longdescription').style.display = 'none';
            }
            if (expandSectionElement.parentElement.parentElement.querySelector('p.longdescription').style.display == 'none') {
                expandSectionElement.parentElement.parentElement.querySelector('p.longdescription').style.display = 'block';
                // if there is no content yet, download it
                if (longdescriptionElement.innerHTML == '') {
                    longdescriptionElement.innerHTML = 'Loading...';
                    vscode.postMessage({ command: 'downloadLongDescription', url: data.long, callbackUniqueId: uniqueId }); // pass unique id so we later know where this long description goes
                }
            }
            else {
                expandSectionElement.parentElement.parentElement.querySelector('p.longdescription').style.display = 'none';
            }
        }
        // both button ids
        const buttonUniqueId = crypto.randomUUID();
        const viewSourceButtonUniqueId = crypto.randomUUID();
        // download button
        const downloadButtonElement = clone.querySelector('.download')
        downloadButtonElement.setAttribute('data-unique-id', buttonUniqueId);
        downloadButtonElement.onclick = () => {
            downloadButtonElement.disabled = true;
            downloadButtonElement.innerText = "Downloading...";
            vscode.postMessage({ command: 'downloadPackage', url: data.url, username: data.username, callbackUniqueId: buttonUniqueId, otherbuttonUniqueId: viewSourceButtonUniqueId });
        }
        // view source button
        const viewSourceButtonElement = clone.querySelector('.viewsource')
        viewSourceButtonElement.setAttribute('data-unique-id', viewSourceButtonUniqueId);
        viewSourceButtonElement.onclick = () => {
            vscode.postMessage({ command: 'viewSource', url: data.url, callbackUniqueId: viewSourceButtonUniqueId, otherbuttonUniqueId: buttonUniqueId });
        }
        // clone.querySelector('p.longdescription').innerHTML = marked.parse(data.longdescription); // UNSAFE, DO NOT USE IN PRODUCTION
        // console.log(clone.querySelector('p.longdescription').innerHTML)
        fileList.appendChild(clone);
        // const listItem = document.createElement("li");
        // listItem.innerHTML = `<strong>${data.filename}</strong> uploaded by: ${data.username}<br><pre>${data.content}</pre>`;
        // fileList.appendChild(listItem);
    });
}

let canReload = true;
let reloadEffectTimeout = null;

document.getElementById("listFilesBtn").addEventListener("click", () => {
    if (!canReload) {
        console.log("on cooldown");
        // short reload effect but is actually on cooldown
        if (reloadEffectTimeout) clearTimeout(reloadEffectTimeout);
        const fileList = document.getElementById("fileList");
        for (const elmnt of fileList.children) {
            // collapse all of the long descriptions
            elmnt.querySelector('p.longdescription').style.display = 'none';
        }
        fileList.style.display = 'none';
        reloadEffectTimeout = setTimeout(() => {
            fileList.style.display = 'block';
            reloadEffectTimeout = null;
        }, 700);
        return;
    }
    console.log("reloading")
    canReload = false;
    listFiles('/packages');
    setTimeout(() => {
        canReload = true;
    }, 20*1000);
})
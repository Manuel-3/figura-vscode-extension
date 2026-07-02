/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/gui/script.js":
/*!***************************!*\
  !*** ./src/gui/script.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util */ \"./src/gui/util.js\");\n/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_util__WEBPACK_IMPORTED_MODULE_0__);\n\r\nconst vscode = acquireVsCodeApi();\r\n\r\nlet cache;\r\nlet installedList = [];\r\n\r\nconst addBtn = document.getElementById(\"addBtn\");\r\nconst addTextInput = document.getElementById(\"addTextInput\");\r\nconst addTextInputContainer = document.getElementById(\"addTextInputContainer\");\r\n\r\n// Receive messages from the extension\r\nwindow.addEventListener('message', async (event) => {\r\n    const data = event.data; // The JSON data sent from the extension\r\n    let element;\r\n    if (data.callbackUniqueId) {\r\n        element = document.querySelector(`[data-unique-id=\"${data.callbackUniqueId}\"]`);\r\n        if (!element) {\r\n            console.error(`Could not find this unique id element: ${data.callbackUniqueId}`);\r\n            return;\r\n        }\r\n    }\r\n    switch (data.command) {\r\n        case 'downloadCompleted':\r\n            element.innerText = 'Installed';\r\n            return;\r\n        case 'downloadFailed':\r\n            element.innerText = 'Try again';\r\n            element.disabled = false;\r\n            return;\r\n        case 'illegalSource':\r\n            element.innerText = 'Not available';\r\n            element.disabled = true;\r\n            const otherbutton = document.querySelector(`[data-unique-id=\"${data.otherbuttonUniqueId}\"]`);\r\n            if (!otherbutton) return;\r\n            otherbutton.style.display = 'none';\r\n            return;\r\n        case 'receiveCacheAndFetch':\r\n        case 'receiveCache':\r\n            cache = (0,_util__WEBPACK_IMPORTED_MODULE_0__.parseCache)(data.cache);\r\n            installedList = data.installedList;\r\n            if (data.command == 'receiveCacheAndFetch' || cache.list.size == 0) { // also fetch if cache is empty\r\n                fetchFiles().then(()=>listFiles());\r\n            }\r\n            else {\r\n                listFiles();\r\n            }\r\n            return;\r\n    }\r\n});\r\n\r\nfunction isValidGithubLuaUrl(inputurl) {\r\n    if (inputurl.includes('\\n') || inputurl.includes('\\r')) return false;\r\n    if (!inputurl.startsWith('https://')) return false;\r\n    const url = new URL(inputurl);\r\n    const splitPath = url.pathname.split('/');\r\n    if (url.host!='github.com') return false;\r\n    if (splitPath.length < 5) return false;\r\n    if (splitPath[3]!='blob') return false;\r\n    if (!url.pathname.toLowerCase().endsWith('.lua')) return false;\r\n    return true;\r\n}\r\n\r\n// Assortment of blocked names because they would never be used as custom wanted folder names\r\n// If encountered uses the lua file name instead\r\nconst blockedNames = [\r\n    \"main\",\r\n    \"src\",\r\n    \"dist\",\r\n    \"master\",\r\n    \"lib\",\r\n    \"bin\",\r\n    \"build\",\r\n    \"assets\",\r\n    \"test\",\r\n    \"tests\",\r\n    \"example\",\r\n    \"examples\",\r\n    \"public\",\r\n    \"docs\",\r\n    \"doc\",\r\n    \"config\",\r\n    \"settings\",\r\n    \"resources\",\r\n    \"script\",\r\n    \"scripts\",\r\n    \"blob\",\r\n    \"tree\",\r\n];\r\n\r\nfunction extractValidatedData(inputurl) {\r\n    if (inputurl.includes('\\n') || inputurl.includes('\\r')) return null;\r\n    if (!inputurl.startsWith('https://')) return null;\r\n    const url = new URL(inputurl);\r\n    const splitPath = url.pathname.split('/');\r\n    const folderPathArr = url.pathname.split('/');\r\n    folderPathArr.pop(); // remove file from the end\r\n    const folderUrl = 'https://' + url.host + folderPathArr.join('/');\r\n    if (url.host!='github.com') return null;\r\n    if (splitPath.length < 5) return null;\r\n    if (splitPath[3]!='blob') return null;\r\n    if (!url.pathname.toLowerCase().endsWith('.lua')) return null;\r\n    const baseUrl = 'https://' + url.host + url.pathname.substring(0,url.pathname.length-('.lua'.length)) // remove \".lua\" from the end\r\n    let author = splitPath[1].replace(/[^a-zA-Z0-9\\-]/gm,'-') // github user name, replace invalid characters with '-'\r\n    // for title, uses folder name that the file is in,\r\n    // unless its part of the path before the repo folders (github.com/ 1 user/ 2 repo/ 3 blob/ 4 branchname/ 5 customfolder/ 6 otherfolder)\r\n    // or is one of the blocklisted words (like main, src, dist...)\r\n    // in which case it uses file name instead\r\n    let title = splitPath[splitPath.length-2];\r\n    if (splitPath.length-2 <= 4 || blockedNames.includes(title.toLowerCase())) {\r\n        const filename = splitPath[splitPath.length-1];\r\n        title = filename.substring(0,filename.length-('.lua'.length))\r\n    }\r\n    return {\r\n        title: title, \r\n        author: author,\r\n        folderUrl: folderUrl,\r\n        luaUrl: baseUrl+'.lua',\r\n        luaRawUrl: baseUrl+'.lua?raw=true',\r\n        pngRawUrl: baseUrl+'.png?raw=true',\r\n        searchable: splitPath.filter(x=>!blockedNames.includes(x.toLowerCase())).join('').toLowerCase(),\r\n    }\r\n}\r\n\r\n// Fetch documents that are newer than cache\r\nasync function fetchFiles() {\r\n    if (cache == undefined) return;\r\n    const querySnapshot = await getDocs(query(\r\n        collection(db, \"packages\"),\r\n        where('t', '>', cache.timestamp)\r\n    ));\r\n\r\n    let highestTimestamp = cache.timestamp;\r\n    querySnapshot.forEach((doc) => {\r\n        const data = doc.data();\r\n        const url = decodeURIComponent(doc.id); // document name is the url as an uricomponent\r\n        if (Number.isInteger(data.t)) {\r\n            highestTimestamp = Math.max(highestTimestamp, data.t);\r\n        }\r\n        if (isValidGithubLuaUrl(url)) {\r\n            cache.list.add(url);\r\n        }\r\n    });\r\n    cache.timestamp = highestTimestamp;\r\n\r\n    vscode.postMessage({ command: 'saveCache', cache: (0,_util__WEBPACK_IMPORTED_MODULE_0__.toPrimitiveCache)(cache) });\r\n}\r\n\r\nconst fileList = document.getElementById(\"fileList\");\r\n\r\n// List Lua files\r\nasync function listFiles() {\r\n    if (cache == undefined) return;\r\n    fileList.innerHTML = \"\"; // Clear previous list\r\n    \r\n    cache.list.forEach((url) => {\r\n        const data = extractValidatedData(url);\r\n        if (!data) return;\r\n\r\n        const clone = document.getElementsByTagName(\"template\")[0].content.cloneNode(true);\r\n        clone.querySelector('.searchable').innerText = data.searchable;\r\n        clone.querySelector('.title').innerText = data.title;\r\n        clone.querySelector('.author').innerText = data.author;\r\n        clone.querySelector('.showinfo').onclick = () => {\r\n            vscode.postMessage({ command: 'openLink', url: data.folderUrl });\r\n        }\r\n        // both button ids\r\n        const buttonUniqueId = crypto.randomUUID();\r\n        const viewSourceButtonUniqueId = crypto.randomUUID();\r\n        // download button\r\n        const downloadButtonElement = clone.querySelector('.download');\r\n        downloadButtonElement.setAttribute('data-unique-id', buttonUniqueId);\r\n        downloadButtonElement.onclick = () => {\r\n            downloadButtonElement.disabled = true;\r\n            downloadButtonElement.innerText = \"Downloading...\";\r\n            vscode.postMessage({ command: 'downloadPackage', url: data.luaRawUrl, username: data.author, callbackUniqueId: buttonUniqueId, otherbuttonUniqueId: viewSourceButtonUniqueId });\r\n        }\r\n        // check if its already installed and if so change the download button\r\n        if (installedList.includes((0,_util__WEBPACK_IMPORTED_MODULE_0__.getFileNameToSaveWith)(data.author, data.luaUrl))) {\r\n            downloadButtonElement.disabled = true;\r\n            downloadButtonElement.innerText = \"Installed\";\r\n        }\r\n        // view source button\r\n        const viewSourceButtonElement = clone.querySelector('.viewsource');\r\n        viewSourceButtonElement.setAttribute('data-unique-id', viewSourceButtonUniqueId);\r\n        viewSourceButtonElement.onclick = () => {\r\n            vscode.postMessage({ command: 'openLink', url: data.luaUrl, callbackUniqueId: viewSourceButtonUniqueId, otherbuttonUniqueId: buttonUniqueId });\r\n        }\r\n        fileList.appendChild(clone);\r\n    });\r\n}\r\n\r\ndocument.addEventListener('DOMContentLoaded', () => {\r\n    vscode.postMessage({ command: 'getCache' });\r\n});\r\n\r\naddBtn.addEventListener(\"click\", () => {\r\n    addTextInputContainer.style.display = 'block';\r\n    if (addTextInput.value != '') {\r\n        if (cache == undefined) return;\r\n        if (isValidGithubLuaUrl(addTextInput.value)) {\r\n            cache.list.add(addTextInput.value);\r\n        }\r\n        cache.timestamp = Date.now();\r\n        vscode.postMessage({ command: 'saveCache', cache: (0,_util__WEBPACK_IMPORTED_MODULE_0__.toPrimitiveCache)(cache) });\r\n        addTextInput.value = '';\r\n    }\r\n});\r\n\r\nconst searchbar = document.getElementById('searchbar');\r\nsearchbar.addEventListener('input', () => {\r\n    const searchstring = searchbar.value.toLowerCase().replace(/\\s/g,'');\r\n    const regex = new RegExp('.*'+searchstring.split('').join('.*')+'.*');\r\n    fileList.querySelectorAll('.searchable').forEach(element => {\r\n        console.log(searchstring, element.innerText)\r\n        if (searchstring != '') {\r\n            element.parentElement.style.display = regex.test(element.innerText) ? 'block' : 'none';\r\n        }\r\n        else {\r\n            element.parentElement.style.display = 'block';\r\n        }\r\n    })\r\n});\n\n//# sourceURL=webpack://figura/./src/gui/script.js?");

/***/ }),

/***/ "./src/gui/util.js":
/*!*************************!*\
  !*** ./src/gui/util.js ***!
  \*************************/
/***/ ((module) => {

eval("/**\r\n * Get file name from username and download url as format author#originalname.lua\r\n * @param {string} username \r\n * @param {string} url \r\n * @returns \r\n */\r\nfunction getFileNameToSaveWith(username, url) {\r\n    const pathname = (new URL(url)).pathname.split('/');\r\n    const originalFilename = pathname[pathname.length-1];\r\n    let filename = username+'#'+originalFilename;\r\n    if (filename.toLowerCase().endsWith('.lua')) filename = filename.substring(0, filename.length-('.lua'.length));\r\n    filename = filename.replaceAll('.',''); // dots are not allowed\r\n    filename += '.lua';\r\n    return filename;\r\n}\r\n\r\n/**\r\n * Convert a primitive Array cache back into a Set cache\r\n * @returns cache\r\n */\r\nfunction parseCache(primitiveCache) {\r\n    return {\r\n        timestamp: primitiveCache.timestamp,\r\n        list: new Set(primitiveCache.list)\r\n    };\r\n}\r\n\r\n/**\r\n * Convert a Set cache into a primitive Array cache\r\n * @returns cache\r\n */\r\nfunction toPrimitiveCache(cache) {\r\n    return {\r\n        timestamp: cache.timestamp,\r\n        list: [...cache.list]\r\n    };\r\n}\r\n\r\nmodule.exports = { getFileNameToSaveWith, parseCache, toPrimitiveCache }\n\n//# sourceURL=webpack://figura/./src/gui/util.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/gui/script.js");
/******/ 	
/******/ })()
;
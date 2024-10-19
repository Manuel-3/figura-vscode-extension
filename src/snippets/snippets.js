const fs = require('fs');
const path = require('path');
const snippets = require('./lua/snippets.json');

function parseFiles(folder, category) {
    const files = fs.readdirSync(folder);
    for (const file of files) {
        const fullpath = path.join(folder,file);
        if (fs.lstatSync(fullpath).isDirectory()) {
            parseFiles(fullpath, path.basename(fullpath));
            continue;
        }
        if (!file.toLowerCase().endsWith('.lua')) continue;
        const name = file.substring(0,file.length-4);
        const lines = fs.readFileSync(fullpath).toString().replaceAll('\r\n','\n').split('\n');
        let prefix = null;
        let description = '';
        let metaLines = 0;
        for (const line of lines) {
            if (line.startsWith('--!') || line.startsWith('--?')) {
                if (line.startsWith('--?')) {
                    description += line.substring(line.startsWith('--? ') ? 4 : 3) + '\n';
                } else {
                    prefix = line.substring(3).trim();
                }
                ++metaLines;
            }
            else {
                break;
            }
        }
        const code = lines.slice(metaLines);
        snippets[name] = {
            prefix: prefix ?? name,
            body: code,
            description: description,
            category: category
        };
    }
}

parseFiles(path.join(__dirname,'lua'))

module.exports = snippets
const express = require('express');
const fs = require('fs');
const path = require('path');
const vfs = require('./vfs/FileSystem.js');

const publicPath = path.resolve(__dirname, 'public');

const app = express();
let virtualFs;
const osChoice = {
    ubuntu: false,
    debian: false,
    redhat: false
};

app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));


app.get('/', (req, res) => {
    res.render('index');
});

function handleCommand(req, res, command, path) {
    function handleLs(option, path) {
        if (virtualFs.fileOrDir(path) || !virtualFs.validPath(path)) return ['ls: No such file or directory'];
        if (option === '') return virtualFs.traverseAndList(path);
        if (option === '-l') {
            let foundFiles = virtualFs.traverseAndList(path);
            let retVal = [];
            for (let i of foundFiles) {
                let fileData = virtualFs.find([...path, i]);
                let fileDataString = `${fileData["permission"]} ${fileData["hard-links"]} ${fileData["owner-name"]} 
                                      ${fileData["owner-group"]} ${fileData["size"]} ${fileData["last-modified"]} ${i}`;
                retVal.push(fileDataString);
            }
            return retVal;
        } else return ['Not a valid command'];
    }
    function handleTree(path) {
        function generateNodes(arr, newPath=path) {
            if (arr.length !== 0) {
                return arr.reduce((acc, curr) => {
                    acc.push(curr);
                    acc.push(generateNodes(virtualFs.traverseAndList([...newPath, curr]), [...newPath, curr]));
                    return acc;
                }, []);
            }
            return [];
        }
        function parseTree(tree, level=0) {
            let parsedTree = [];
            let offset = new Array(4 * level).join('_');
            for (let i of tree) {
                if (Array.isArray(i)){
                    if (i.length > 0) {
                        parsedTree = [...parsedTree, ...(parseTree(i, level + 1))];
                    }
                } else {
                    parsedTree.push('' + offset + i);
                }
            }
            return parsedTree
        }
        return (virtualFs.fileOrDir(path) || !virtualFs.validPath(path)) ?
            ['tree: No such file or directory'] : parseTree(generateNodes((virtualFs.traverseAndList(path)))) ;
    }
    function handleCat(path) {
        if (!virtualFs.fileOrDir(path)) return ["cat: No such file or directory"];
        return [virtualFs.cat(path)];
    }
    function handleMkdir(path, content) {
        if (virtualFs.fileOrDir(path) || !virtualFs.validPath(path)) return ['mkdir: No such file or directory'];
        if (virtualFs.validPath([...path, content])) return [`mkdir: ${content}: File exists`];
        virtualFs.makeDirectory(path, content);
        return ['']

    }
    function handleWrite(path, content) {
        if (!virtualFs.fileOrDir(path) || !virtualFs.validPath(path)) return ['write: No such file or directory']
        virtualFs.write(path, content);
        return ['']
    }

    let parsedPath = (path === undefined) ? '' : path;
    parsedPath = parsedPath === '/' ? [''] : parsedPath.split('/');

    switch (command) {
        case 'ls':
            return handleLs(req.query["option"], parsedPath);

        case 'tree':
            return handleTree(parsedPath);

        case 'cat':
            return handleCat(parsedPath);

        case 'mkdir':
            return handleMkdir(parsedPath, req.body["content"]);

        case 'write':
            return handleWrite(parsedPath, req.body["content"]);


        default:
            return ["Use one of the forms"];
    }
}

app.get('/vfs', (req, res) => {
    if (req.query["os"]) {
        for (let i of Object.keys(osChoice)) {
            osChoice[i] = (i === req.query["os"]);
        }
    }
    res.render('terminal', {...osChoice,
        terminalOutput: handleCommand(req, res, req.query["command"], req.query["path"])
    });
});

app.post('/vfs', (req, res) => {
    res.render('terminal', {...osChoice,
        terminalOutput: handleCommand(req, res, req.body["command"], req.body["path"])
    });
});


app.listen(3000, () => {
    fs.readFile(path.join(__dirname, 'vfs', 'init.json'), 'utf8', (err, data) => {
        if (err) throw err;
        virtualFs = new vfs(JSON.parse(data));
    });
});

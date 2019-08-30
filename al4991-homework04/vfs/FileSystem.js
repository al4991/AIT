const moment = require('moment');

class FileSystem {
    constructor(data) {
        this.data = data["fs"];
    }

    fileOrDir(path) {
        /* Description: Returns true if the path leads to a file, false if it leads to a directory
         *
         * Params: path
         * ex: /path/to/this/file would be passed in as
         * ['', 'path', 'to', 'this', 'file']
         *
         * Return:  boolean
         */
        return (path.slice(-1)[0].includes('.'));
    }

    validPath(path) {
        /* Description: Returns true if the path is valid.
         *
         * Params: path
         * ex: /path/to/this/file would be passed in as
         * ['', 'path', 'to', 'this', 'file']
         *
         * Return:  boolean
         */
        if (path[0] !== '') return false;
        if (path.length === 1) { return true}
        let travPtr = this.data;
        let dirs = ['/'].concat(path.slice(1,-1));
        let dest = path.slice(-1)[0];
        for (let i of dirs) {
            if (travPtr.hasOwnProperty(i)){
                travPtr = travPtr[i]["files"];
            }
            else return false;
        }
        return travPtr.hasOwnProperty(dest);
    }

    find(path) {
        /* Description: Returns object representing directory or file data
         *
         * Params: path
         * ex: /path/to/this/file would be passed in as
         * ['', 'path', 'to', 'this', 'file']
         *
         * Return: object that contains the data associated with the supplied path
         */
        if (path.length === 1) { return this.data['/']; }
        let dirs = ['/'].concat(path.slice(1, -1));
        let dest = path.slice(-1)[0];
        let travPtr = this.data;
        for (let i of dirs) {
            travPtr = travPtr[i]["files"];
        }
        return travPtr[dest];

        // Do error checking for invalid paths
    }

    traverseAndList(path) {
        /* Description: Functions as the ls command
         *
         * Params: path
         * ex: /path/to/this/file would be passed in as
         * ['', 'path', 'to', 'this', 'file']
         *
         * Return: return a list containing JSON object representations of the files in the dir.
         * If not a dir, then list is empty.
         */
        return this.fileOrDir(path) ? [] : Object.keys(this.find(path)["files"])

    }

    cat(path) {
        /* Description: Takes in path to a file and returns contents of said file
         *
         * Params: path
         * ex: /path/to/this/file would be passed in as
         * ['', 'path', 'to', 'this', 'file']
         *
         * Return: the contents of the file, or error message
         */
        return this.fileOrDir(path) ? this.find(path)["content"] : 'cat: Not a path to a file';
    }

    makeDirectory(path, dirName) {
        /* Description: Creates a new directory in directory within the path
         *
         * Params: path
         * ex: /path/to/this/file would be passed in as
         * ['', 'path', 'to', 'this', 'file']
         *
         * Return: nothing
         */
        if (!this.fileOrDir(path)){
            this.find(path)["files"][dirName] = {
                "permission": "drwxr--r--",
                "hard-links": 1,
                "owner-name": "root",
                "owner-group": "root",
                "last-modified": moment().format('MMM DD HH:mm'),
                "size": 6,
                "files": {}
            };
        }
    }

    write(path, content) {
        /* Description: Creates a new file or overwrites an existing file.
         *
         * Params: path
         * ex: /path/to/this/file would be passed in as
         * ['', 'path', 'to', 'this', 'file']
         *
         * Return: nothing
         */
        if (this.fileOrDir(path)) {
            const file = path.slice(-1)[0];
            const containingDirFiles = this.find(path.slice(0, -1))["files"];
            if (containingDirFiles.hasOwnProperty(file)) {
                containingDirFiles[file]["content"] = content;
                containingDirFiles[file]["last-modified"] = moment().format('MMM DD HH:mm');
            } else {
                containingDirFiles[file] = {
                    "permission": "-rwxr--r--",
                    "hard-links": 1,
                    "owner-name": "root",
                    "owner-group": "root",
                    "last-modified": moment().format('MMM DD HH:mm'),
                    "user": "staff",
                    "size": 6,
                    "content": content
                }
            }
        }
    }
}
// let x;
// fs.readFile('./vfs/init.json', 'utf8', function(err, data) {
//     if (err) {throw err;}
//     const parsedData = JSON.parse(data);
//     x = new FileSystem(parsedData['fs']);
//     // console.log(x.find(['', 'lib', 'modules']));
//     // console.log(x.traverseAndList(['']));
//     // console.log(x.cat(['', 'lib', 'modules', 'aba.txt']));
//     x.makeDirectory(['', 'lib'], "yeet");
//     x.write(['', 'lib', 'yeet', 'yah.txt'], 'yah yeet haha xd');
//     x.write(['', 'lib', 'modules', 'aba.txt'], "Hi world");
//     console.log(x.cat(['', 'lib', 'yeet', 'yah.txt']));
//     console.log(x.cat(['', 'lib', 'modules', 'aba.txt']));
// });

module.exports = FileSystem;

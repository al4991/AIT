const net = require('net');
const path = require('path');
const fs = require('fs');

const HTTP_STATUS_CODES = {
    200: 'OK',
    404: 'Not Found',
    500: 'Internal Server Error',
    301: 'Permanent Redirect'
};

const MIME_TYPES = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    html: 'text/html',
    css: 'text/css',
    txt: 'text/plain',

};

/* getExtension
parameters: fileName
    - filename is a string representing a filename lmao
return: string that is the file extension in lowercase

 */
function getExtension(fileName){
    if (fileName !== undefined) {
        if (fileName.indexOf('.') !== -1) {
            return fileName.split('.').slice(-1)[0];
        }
    }
    return '';
}

/*  getMIMEType
parameters: fileName
    - filename is a string representing a filename
return: the MIMEtype of a file based on its extension, or an empty string if it don't exist
 */
function getMIMEType(fileName){
    const ext = getExtension(fileName);
    if (MIME_TYPES.hasOwnProperty(ext)){
        return MIME_TYPES[ext];
    }
    return '';
}

class Request {
    // constructor(httpRequest) {
    //     this.request = httpRequest;
    //     [this.method, this.path,...this.data] = (httpRequest.split(' '));
    // }
    constructor(s) {
        const [method, path] = s.split(' ');
        this.method = method;
        this.path = path;
    }
}


class Response{
    /*
    creates new object using socket passed in as the internal socket for interfacing with
    the connected client (write, end, etc)
     */
    constructor(socket, statusCode=200, version='HTTP/1.1') {
        this.sock = socket;
        this.headers = {};
        this.body = '';
        this.statusCode = statusCode;
        this.version = version;
    }

    /* set - adds a new header key:value pair to the instance's header object
    parameters: name, value
        - name is the name of the response header
        - value is the value of the response header
    return: none
     */
    set(name, value) {
        this.headers[name] = value;
    }

    /* end - ends the connect by calling end on the objects socket
    parameters:
    return:
    */
    end() {
        this.sock.end();
    }

    /* statusLineToString returns the first line of an http response based on the properties defined in this
    Response instance, including the trailing newline
    parameters:
    return: a string representing the first line of http response
     */
    statusLineToString() {
        return this.version + ' ' + this.statusCode + ' ' + HTTP_STATUS_CODES[this.statusCode] + '\r\n';
    }

    /* headersToString
    parameters:
    return: returns a String representing the headers of this http response, with each having \r\n at the end
    */
    headersToString() {
        return Object.entries(this.headers)
            .reduce( (returnString, curr) => returnString + (curr[0] + ': ' + curr[1] + '\r\n'), '');
    }

    /* send- sets the body property based on other properties. closes connection after sending.
    parameters: body
        - the body of the http response
    return: none
     */
    send(body) {
        this.body = body;
        if (!this.headers.hasOwnProperty('Content-Type')) {
            this.headers['Content-Type'] = 'text/html';
        }
        let response = this.statusLineToString();
        response += this.headersToString();
        response += '\r\n';
        this.sock.write(response);
        this.sock.write(this.body);
        this.end();

    }

    /* status
    parameters: statusCode
        - statusCode is the status code of the http response
    return: response object (the same one that it was called on).
    */
    status(statusCode) {
        this.statusCode = statusCode;
        return this;
    }
}

class App{
    constructor(){
        this.routes = {};
        this.middleware = null;
        this.server = net.createServer((sock) => this.handleConnection(sock));
    }

    /* normalizePath
    parameters: path
        - path is a string
    return: a string that is the normalized path
        - normalized means all lowercase, with no special symbols.
        - should be in form: /path/path2/path3...
     */
    normalizePath(path) {

        const stitch = (accum, curr) => {
            if (curr !== '') { accum += '/' + curr; }
            return accum;
        };
        const fixChunk = (str) => {
            let cutOff;
            for (let i =0; i < str.length; i++) {
                if (!(/[a-z]/.test(str[i]))){
                    cutOff = i;
                    break;
                }
            }
            return str.slice(0, cutOff);
        };
        const fixArray = (arr) => {
            let cutOff;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] !== '' && !(/^[a-z]+$/.test(arr[i]))){
                    cutOff = i;
                    break;
                }
            }

            if (cutOff !== undefined) {
                const fixedChunk = fixChunk(arr[cutOff]);
                const returnArray = arr.slice(0, cutOff);
                returnArray.push(fixedChunk);
                return returnArray;
            }

            else { return arr; }
        };
        const returnVal = fixArray(path.toLowerCase().split('/')).reduce(stitch);
        if (returnVal === '') {return '/';}
        return returnVal;
    }

    /* createRouteKey
    parameters: method, path
        - method: will be an http method like GET/POST
        - path : the path part of a url as as string.
    return: returns a string to act as a property key.
        ex: createRouteKey('Get /FOO/?yeet')
        should output    'GET /foo'
     */
    createRouteKey(method, path) {
        return (method.toUpperCase() + ' ' + this.normalizePath(path));
    }

    /* get - adds to the routes for the object
    parameters: path, cb
        - path is a string representing the path
        - cb is a callback function to be called
            - Takes two args, a request object and a response object
    - the function should create a route key using get and the path, and add that
    to the routes of the object along with the cb function provided.

    return: none
    */
    get(path, cb) {
        this.routes[this.createRouteKey('Get', path)] = cb;
    }

    /* use - sets the middleware property for this instance of App
    parameters: cb
        - a function to be called before every route handler in routes
        - takes 3 args: a Request object, a Response object, and a next function
            - next represents the next functon to call after themiddle ware is done processing
            the Request
     return: none
     */
    use(cb) {
        this.middleware = cb;
    }

    /*  listen - binds the server to the gien port and host
    parameters: port, host
        - port is the port number to bind to
        - host is the host that the server will be running on
            - ex: 127.0.0.1
    return: none
     */
    listen(port, host) {
        this.server.listen(port, host);
    }

    /* handleConnection - function to be called when a client connects to the server. Specifies which function
    to call when this instance of App receives data from the connected client
    parameters: sock
        - sock is the socket representing the connection to the client
    return: none
     */
    handleConnection(sock) {
        sock.on('data', (data) => this.handleRequest(sock, data));
    }

    /* handleRequest - the function called when the sockt receives data from the client. Where we
    create a new Request object built off the binaryData, and a new Response object. Also calls the middle ware
    function if there is one.
    parameters: sock, binaryData
        - sock is the socket representing the connection to the client
        - binaryData is the data sent by the client.
    return: none
     */
    handleRequest(sock, binaryData) {
        const req = new Request('' + binaryData);
        const res = new Response(sock);
        if (this.middleware !== null) {
            this.middleware(req, res, (req,res) => this.processRoutes(req, res));
        }
        else {
            this.processRoutes(req, res);
        }
    }

    /* processRoutes - calls the appropriate function stored in routes to handle
    the incoming request based on method and path
    parameters: req, res
    - req is an incoming http request class instance
    - Res is the potential http response class instance
    return: none
     */
    processRoutes(req, res) {
        const routeKey = this.createRouteKey(req.method, req.path);
        if (this.routes.hasOwnProperty(routeKey) && this.routes[routeKey] !== undefined) {
            this.routes[routeKey](req, res);
        }
        else {
            const errResponse = new Response(res.sock, 404);
            errResponse.headers['Content-Type'] = 'text/plain';
            errResponse.send('Page not found haha ');
        }
    }
}


/*  serveStatic - a function that creates a middleware function
parameters: basePath
    - the location where we will attempt to read files fro m
return: a new functoin that takes three args
    - req, an instance of the Request class
    - res, an instance of the Response class
    - next, the next function to call
 */
function serveStatic(basePath) {
    return (req, res, next) => {
        const fn = path.join(basePath, req.path);
        fs.readFile(fn, (err, data) => {
            if (err) {
                next(req, res);
            }
            else {
                res.set('Content-Type', getMIMEType(req.path));
                res.status(200).send(data);
            }
        });
    };
}



module.exports = {
    HTTP_STATUS_CODES: HTTP_STATUS_CODES,
    MIME_TYPES: MIME_TYPES,
    getMIMEType: getMIMEType,
    getExtension: getExtension,
    static: serveStatic,
    Request: Request,
    Response: Response,
    App: App,
};

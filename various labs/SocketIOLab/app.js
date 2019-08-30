const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);
app.use(express.static('public'));

let x1 = 0;
let x2 = 0;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
})


io.on('connection', function(socket) {
    socket.emit('rendered', {x1, x2});
    console.log(socket.id, 'has connected');
    socket.on('1', () => {
        x1 += 5;
        if (x1 >= 500) {
            socket.emit('victory', 1)
        }
        else {
            socket.emit('rendered', {x1, x2})
        }
    })
    socket.on('2', () => {
        x2 += 5;
        if (x2 >= 500) {
            socket.emit('victory', 2)
        }
        else {
            socket.emit('rendered', {x1, x2})
        }
    })
})

server.listen(3000);

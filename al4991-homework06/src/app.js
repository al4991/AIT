const express = require("express");
const path = require('path');
const app = express();

app.use(express.static(__dirname + '/public'));

const port = process.env.PORT || 3000;

app.listen(port, () => {console.log(`Server is listening on ${port}`)});

console.log('1,2,3,4,5,6,7,8'.split(',').join(''))
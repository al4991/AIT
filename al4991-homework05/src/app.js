const express = require('express');
const db = require('./db');
const routes = require('./routes.js');
const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

app.get('/', routes.getIndex);

app.get('/books', routes.getBooks);

app.get('/books-new', routes.getBooksNew);

app.post('/books-new', routes.postBooksNew);

app.get('/books/:slug', routes.getDetails);

app.post('/books/:slug/comments', routes.postDetails);

app.listen(3000);

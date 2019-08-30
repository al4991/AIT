const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const routes = require('./routes');
const passport = require('passport');
const User = require('./db').user;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: 'keyboard cat',
    resave: false ,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', routes.getIndex);

app.get('/login', routes.getLogin);

app.post('/login', routes.postLogin);

app.get('/register', routes.getRegister);

app.post('/register', routes.postRegister);

app.get('/logout', routes.getLogout);

app.get('/lists', routes.getLists);

app.get('/fetchLists', routes.getFetchLists);

app.post('/deleteList', routes.postDeleteList);

app.post('/addList', routes.postAddList);

app.get('/list/:id', routes.getListId);

app.get('/fetchListDetails/:id', routes.getFetchListDetails);

app.post('/addSong', routes.postAddSong);

app.post('/deleteSong', routes.postDeleteSong);


app.listen(process.env.PORT || 3000);

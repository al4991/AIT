const mongoose = require('mongoose');
const sanitize = require('mongo-sanitize');
const path = require('path');
const session = require('express-session');

const db = require('./db');
const passport = require('passport');


const Playlist = db.playlist;
const Song = db.song;
const User = db.user;

function getIndex(req, res) {
    if (req.user) {
        res.redirect('/lists')
    } else {
        res.redirect('/login')
    }
}

function getLists(req, res) {
    if (!req.user) res.redirect('/');
    else {
        res.sendFile(path.join(__dirname, 'public', 'lists.html'));
    }
}

function getFetchLists(req, res){
    let cleanId = sanitize(req.user['_id']);
    Playlist.find({'creator': cleanId}, function(err, lists, count) {
        if (err) res.json({'err': err});
        else {
            res.json(lists);
        }
    });
}

function postDeleteList(req, res) {
    let cleanId = sanitize(req.body['id']);
    Song.deleteMany({'parent': cleanId}, function(err) {
        if (err) res.json({'err': err});
    });
    Playlist.deleteOne({'_id': cleanId}, function(err){
        if (err) res.json({'err': err});
        else {
            res.json({})
        }
    })
}

function postAddList(req, res) {
    let cleanName = sanitize(req.body["name"]);
    let cleanId = sanitize(req.user["_id"]);
    const newList = new Playlist({
        name: cleanName,
        creator: cleanId
    });
    newList.save(function(err) {
        if (err) res.json({'err': err});
        else {
            res.json(req.body);
        }
    });
}

function getListId(req, res) {
    if (req.user) {
        res.sendFile(path.join(__dirname, 'public', 'list_detail.html'));
    }
    else {
        res.redirect('/');
    }
}

function getFetchListDetails(req, res) {
    const playlistId = sanitize(req.params['id']);
    Playlist.find({'_id': playlistId}, function (err, lists, count) {
        if (err) res.json({'err': err});
        else {
            Song.find({'parent': playlistId}, function (err, songs, count) {
                if (err) res.json({'err': err});
                else {
                    res.json({
                        'lists' : lists[0],
                        'songs' : songs
                    });
                }
            });
        }
    })
}

function getLogin(req, res) {
    if (req.user) {
        res.redirect('/');
    }
    else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'))
    }
}

function postLogin(req, res) {
    passport.authenticate('local',
        {failureRedirect: '/login' })
    (req, res, function() {
        res.redirect('/');
    })
}

function getRegister(req, res) {
    if (req.user) {
        res.redirect('/');
    }
    else {
        res.sendFile(path.join(__dirname, 'public', 'register.html'));
    }
}

function postRegister(req, res) {
    User.register(new User({
        username: sanitize(req.body.username)}), sanitize(req.body.password), function(err, user) {
        if (err) res.redirect('/register');
        else {
            passport.authenticate('local')(req, res, function(){
                res.redirect('/');
            });
        }
    });

}

function getLogout(req, res) {
    req.logout();
    res.redirect('/');
}

function postAddSong(req, res) {
    let cleanName = sanitize(req.body["name"]);
    let cleanLink = sanitize(req.body["link"]);
    let cleanParent = sanitize(req.body["parent"])
    new Song({
        name: cleanName,
        link: cleanLink,
        parent: cleanParent
    }).save(function(err) {
        if (err) res.json({'err': err});
        else {
            res.json(req.body);
        }
    });
}

function postDeleteSong(req, res) {
    let cleanId = sanitize(req.body['id']);
    Song.deleteOne({'_id': cleanId}, function (err){
        if (err) res.json({'err': err});
        else {
            res.json({})
        }
    })
}

module.exports = {
    getIndex,
    getLists,
    getFetchLists,
    postDeleteList,
    postAddList,
    getListId,
    getFetchListDetails,
    getLogin,
    postLogin,
    getRegister,
    postRegister,
    getLogout,
    postAddSong,
    postDeleteSong
};
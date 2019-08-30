const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);

const Song = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    parent: {
        type: String,
        required: true,
    }
});

const Playlist = new mongoose.Schema({
	name: {
		type: String,
        required: true
	},
    creator: {
        type: String,
        required: true
    },
});

const User = new mongoose.Schema({
    username: String,
    password: String,
});

User.plugin(passportLocalMongoose);

const user =  mongoose.model("User", User);
const playlist = mongoose.model("Playlist", Playlist);
const song = mongoose.model("Song", Song);

module.exports = {
    user,
    playlist,
    song
};

// is the environment variable, NODE_ENV, set to PRODUCTION?
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
    // if we're in PRODUCTION mode, then read the configration from a file
    // use blocking file io to do this...
    const fs = require('fs');
    const path = require('path');
    const fn = path.join(__dirname, 'config.json');
    const data = fs.readFileSync(fn);

    // our configuration file will be in json, so parse it and set the
    // conenction string appropriately!
    const conf = JSON.parse(data);
    dbconf = conf.dbconf;
} else {
    // if we're not in PRODUCTION mode, then use
    dbconf = 'mongodb://localhost/al4991';
}
mongoose.connect(dbconf);



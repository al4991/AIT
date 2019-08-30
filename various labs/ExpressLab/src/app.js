const express = require('express');
const path = require('path');
const app = express();

const publicPath = path.resolve(__dirname, "public");


app.set('view engine', 'hbs');
app.use(express.urlencoded({extended: false}));
app.use(express.static(publicPath));
    // The xtended clause makes it so that any info passed in is not coerced into an object or anything other than a string

const pets = ['yeeto', 'sweeto'];
const birds = [{"Bald Eagle": 3}, {"Yellow Billed Duck": 7}, {"Great Cormorant": 4}];

app.post('/', (req, res) => {
    console.log(req.body);
    pets.push(req.body.name);
    res.redirect('/');  // Why redirect? makes it so that if you refresh the page, there wont be a post each time.
    //res.send(req.body);
});
app.get('/birds', (req, res) => {
    res.render('birds', birds);

});

app.get('/settings', (req,res) => {
    console.log("settings");

});

app.get('/', (req, res) => {
    let context;
    if (req.query.hasOwnProperty('name')) {
        context = {pets: pets};
    } else {
        context = {pets: pets.filter( s => s === req.query.name)};
    }
    res.render('home', context);
});
//req.query is builtinto express req object


app.listen(3000);







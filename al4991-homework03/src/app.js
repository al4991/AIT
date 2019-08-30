const webby = require('./webby.js');
const path = require('path');


// Initializing app and setting middleware
const app = new webby.App();
app.use(webby.static(path.join(__dirname, '..', 'public')));

// Setting up route for main page which should link to the gallery page
app.get('/', (req, res) => res.send(
`<html>
<link rel = "stylesheet" type = "text/css" href = "css/styles.css"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Tangerine">
<body> 
<h1> Are you ready to look at some rats </h1>
</br></br></br></br></br></br>
    <a href="/gallery"> Yes </a>
</body> 
</html>`));

// Setting up route for gallery. Will serve up between 1-4 images, with those images being random. Repeats allowed.
app.get('/gallery', (req, res) => {
    const numPics = Math.floor((Math.random() * 4) + 1);
    let returnHTML =
`<html> 
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Tangerine">
<link rel = "stylesheet" type = "text/css" href = "css/styles.css"/>
<body> 
<h1> Here ${numPics === 1 ? 'is' : 'are'} ${numPics} rat${numPics === 1 ? '' : 's' } 
<img src="https://img.fireden.net/v/image/1541/87/1541875332837.gif" style="width:100px">
</hl>  <div></br>
`;
    for (let i = 0; i < numPics; i++) {
        const rand = Math.floor((Math.random() * 4) + 1);
        returnHTML += ` <img style="width:350px" src="/img/animal${rand}.jpg" /> \n`;
    }
    returnHTML += `</div> </body></html>`;
    res.send(returnHTML);
});

// Setting up permanent redirect route
app.get('/pics', (req, res) => {
    res.set('Location', '/gallery');
    res.status(301).send('');
});

// Get's for static files
app.get('/img/animal1.jpg');
app.get('/img/animal2.jpg');
app.get('/img/animal3.jpg');
app.get('/img/animal4.jpg');
app.get('/css/styles.css');

app.listen(3000, '127.0.0.1');

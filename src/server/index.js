// added dotnev for envirnoment variable for API key
const dotenv = require('dotenv');
dotenv.config();

// Create empty Javascript object
projectData = [];

// Prepare Server
const express = require('express');
const app = express();

/* Dependencies */
const bodyParser = require('body-parser');
// to use json
app.use(bodyParser.json())
// to not use url encoded values
app.use(bodyParser.urlencoded({
  extended: false
}))

// Cors
const cors = require('cors');
app.use(cors());

// Create main project folder
app.use(express.static('dist'));


// Create Server
const port = 3000;
// Spin up the server
const server = app.listen(port, listening);
// Callback
function listening(){
    console.log(`Server running on localhost: ${port}`);
}

/* GET route */
// get Data from projectData Endpoint
app.get('/source', getData);

function getData(req, res){
    res.send(projectData);
}

// Define API Credentials
var keys = {
    'geonames_username': process.env.USERNAME_GEONAMES,
    'weatherbit_key': process.env.API_KEY_WEATHERBIT,
    'pixabay_key': process.env.API_KEY_pixabay
}

// API request
app.get('/keys', function (req, res) {
    res.json(keys);
})

/* POST route*/
app.post('/addToSource', addWeatherEntry);

function addWeatherEntry(req, res){
    newEntry = {
        city: req.body.city,
        country: req.body.country,
        lateral: req.body.lat,
        longitudinal: req.body.lng,
        startdate: req.body.startdate,
        enddate: req.body.enddate,
    }
    projectData.push(newEntry);
    res.send(projectData);
}

'use strict';

//=========== Load Packages ==========//
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');

//===== Setup Application (Server) ====//
const app = express();
app.use(cors());


//======== Global Variables ==========//
const PORT = process.env.PORT || 3111;


//========== Setup Routes ============//

//--Routes--//
app.get('/location', getGpsCoordinates);
app.get('/weather', getWeather);
app.get('/parks', getParks);
app.get('/pg', getPgSqlDatabase);


//--Route Callback: /location--//
function getGpsCoordinates(req, res){
  if (req.query.city === '') {
    res.status(500).send('Sorry, please enter a valid U.S. city');
    return;
  }

  const searchedCity = req.query.city; //comes from the front-end, req.query is the way we get data from the front-end.
  console.log(searchedCity);
  const locationApiKey = process.env.GEOCODE_API_KEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${locationApiKey}&q=${searchedCity}&format=json`;

  superagent.get(url)
    .then(result => {
      const dataObjFromJson = result.body[0];   //TODO: see video to see where .body comes from --> @ 3:40.
      const newLocation = new Location(
        searchedCity,
        dataObjFromJson.display_name,
        dataObjFromJson.lat,
        dataObjFromJson.lon
      );
      res.send(newLocation);
    })
    .catch(error => {
      res.status(500).send('LocationIQ failed');
      console.log(error.message);
    });
}

//--Route Callback: /weather--//
function getWeather(req, res){
  const searchedCity = req.query.search_query;
  // console.log('*********** CITY*************' , searchedCity);
  const weatherApiKey = process.env.WEATHER_API_KEY;
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?days=8&city=${searchedCity}&country=US&key=${weatherApiKey}`

  superagent.get(url)
    .then(result => {
      // console.log(result.body);
      const arr = result.body.data.map(weatherObject => new Weather(weatherObject));  // recall: a single line arrow function has an implied 'return'
      res.send(arr);
    })
    .catch(error => {
      res.status(500).send('Weatherbit failed');
      console.log(error.message);
    });
}

//--Route Callback: /parks--//
function getParks(req, res){
  const searchedCity = req.query.search_query;
  // console.log('********** CITY ***********', searchedCity);
  const parksApiKey = process.env.PARKS_API_KEY;
  const url = `https://developer.nps.gov/api/v1/parks?q=${searchedCity}&api_key=${parksApiKey}&limit=10`;

  superagent.get(url)
    .then(result => {
      console.log(result.body);
      const arr = result.body.data.map(parkObject => new Park(parkObject));
      res.send(arr);
    })
    .catch(error => {
      res.status(500).send('National Parks failed');
      console.log(error.message);
    });
}

//--Route Callback: /pg--//
function getPgSqlDatabase(req, res){
  const


  res.send('');

}


//========= Helper Functions =========//
//Constructor goes here//

function Location(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query; // this is what the front-end is calling the type of data they are looking for -- the query that is being passed in is being formatted and has been assigned as "formatted_query" -- this means that if the front-end calls this something else, then we will change this accordingly.
  this.longitude = longitude;
  this.latitude = latitude;
  //TODO: update this constructor to look like /weather and /parks
}

function Weather(weatherObject) {
  this.forecast = weatherObject.weather.description;
  this.time = weatherObject.valid_date;
}

function Park(parkObject){
  this.name = parkObject.name;
  this.address = parkObject.address;
  this.fee = parkObject.fee;
  this.description = parkObject.description;
  this.url = parkObject.url;
}

//=========== Start Server ===========//
app.listen(PORT, () => console.log(`we are up on PORT ${PORT}`));
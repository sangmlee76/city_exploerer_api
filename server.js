'use strict';

//=========== Load Packages ==========//
const express = require('express');
const cors = require('cors');
require('dotenv').config();


//===== Setup Application (Server) ====//
const app = express();
app.use(cors());


//======== Global Variables ==========//
const PORT = process.env.PORT || 3111;


//========== Setup Routes ============//
app.get('/', (request, response) => {
  response.send('you made it home');
});

app.get('/location', (req, res) => {
  if(req.query.city === ''){
    res.status(500).send('Sorry, something went wrong');
    return;
  }
  
  const dataArrayFromTheLocationJson = require('./data/location.json');
  const dataObjFromJson = dataArrayFromTheLocationJson[0];

  const searchedCity = req.query.city; //comes from the front-end, req.query is the way we get data from the front-end.


  const newLocation = new Location(
    searchedCity,
    dataObjFromJson.display_name,
    dataObjFromJson.lat,
    dataObjFromJson.lon
  );
  res.send(newLocation);
});

app.get('/weather', (req, res) => {
  const weatherData = require('./data/weather.json');
  const arr = weatherData.data.map(weatherObject => {
    const newWeatherObj = new Weather(weatherObject);
    return newWeatherObj;
  });
  res.send(arr);
});


  //========= Helper Functions =========//
  //Constructor goes here//

function Location(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query; // this is what the front-end is calling the type of data they are looking for -- the query that is being passed in is being formatted and has been assigned as "formatted_query" -- this means that if the front-end calls this something else, then we will change this accordingly.
  this.longitude = longitude;
  this.latitude = latitude;
}

function Weather(weatherObject){
  this.forecast = weatherObject.weather.description;
  this.time = weatherObject.valid_date;
}



  //=========== Start Server ===========//
  app.listen(PORT, () => console.log(`we are up on PORT ${PORT}`));
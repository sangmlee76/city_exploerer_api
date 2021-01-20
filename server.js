'use strict';

//=========== Load Packages ==========//
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');


//===== Setup Application (Server) ====//
const app = express();
app.use(cors());


//======== Global Variables ==========//
const PORT = process.env.PORT || 3111;


//========== Setup Routes ============//
app.get('/location', (req, res) => {
  if(req.query.city === ''){
    res.status(500).send('Sorry, something went wrong');
    return;
  }
  
  const searchedCity = req.query.city; //comes from the front-end, req.query is the way we get data from the front-end.
  console.log(searchedCity);
  const key = process.env.LOCATION_API_KEY;

  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${searchedCity}&format=json`; 
  
  superagent.get(url)
    .then(result => {
      const dataObjFromJson = result.body[0];   //TODO: see video to see where .body comes from
    });

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
      console.log(error.message)
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
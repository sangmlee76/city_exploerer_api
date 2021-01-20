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

//========(/location)=========//
app.get('/location', (req, res) => {
  if (req.query.city === '') {
    res.status(500).send('Sorry, something went wrong');
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
});

//=========(/weather)==========//
app.get('/weather', (req, res) => {
  const searchedCity = req.query.search_query;
  // console.log('*********** CITY*************' , searchedCity);
  const weatherApiKey = process.env.WEATHER_API_KEY;
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;

  const url = `https://api.weatherbit.io/v2.0/current?lat=${latitude}&lon=${longitude}&key=${weatherApiKey}&include=minutely`;

  superagent.get(url)
    .then(result => {
      console.log(result.body);

      const arr = weatherData.data.map(weatherObject => {
        const newWeatherObj = new Weather(weatherObject);
        return newWeatherObj;
      });
      res.send(arr);
    })
    .catch(error => {
      res.status(500).send('Weatherbit failed');
      console.log(error.message);
    });
});

//=========(/parks)==========//
app.get('/parks', (req, res) => {
  const searchedCity = req.query.search_query;
  // console.log('********** CITY ***********', searchedCity);
  const parksApiKey = process.env.PARKS_API_KEY;

  const url = `https://developer.nps.gov/api/v1/parks?q=${searchedCity}&api_key=${parksApiKey}`;

  superagent.get(url)
    .then(result => {
      // console.log(result.body);

      const arr = parksData.map(parkObject => {
        const newParkObj = new Park(parkObject);
        return newParkObj;
      });
      res.send(arr);
    })
    .catch(error => {
      res.status(500).send('National Parks failed');
      console.log(error.message);
    });  
});


//========= Helper Functions =========//
//Constructor goes here//

function Location(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query; // this is what the front-end is calling the type of data they are looking for -- the query that is being passed in is being formatted and has been assigned as "formatted_query" -- this means that if the front-end calls this something else, then we will change this accordingly.
  this.longitude = longitude;
  this.latitude = latitude;
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
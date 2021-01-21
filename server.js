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

const DATABASE_URL = process.env.DATABSE_URL;
const client = new pg.Client(DATABASE_URL);
client.on('error', (error) => console.log(error));

//======== Global Variables ==========//
const PORT = process.env.PORT || 3111;


//========== Setup Routes ============//

//--Routes--//
app.get('/location', getGpsCoordinates);
app.get('/weather', getWeather);
app.get('/parks', getParks);



//--Route Callback: /location--//
function getGpsCoordinates(req, res) {
  const searchedCity = req.query.city; //req.query is the way we get data from the front-end.
  // console.log(searchedCity);
  const locationApiKey = process.env.GEOCODE_API_KEY;

  const sqlQuery = 'SELECT * FROM city_explorer WHERE search_query=$1';
  const sqlArray = [searchedCity]; //TODO: get clarification on this line of code

  client.query(sqlQuery, sqlArray)
    .then(result => {
      console.log('result.rows', result.rows); //TODO: Did not get an empty array returned, there is an error that is crashing the app

      if (result.rows.length !== 0) {
        console.log('It exists already');
        res.send(result.rows[0]);
      } else {
        console.log('Created using superagent');
        if (req.query.city === '') {
          res.status(500).send('Sorry, please enter a valid U.S. city');
          return;
        }

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

    });



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

      // saves each query data into the database in the table
      const sqlQuery = 'INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES($1, $2, $3, $4)';
      const sqlArray = [newLocation.search_query, newLocation.formatted_query, newLocation.latitude, newLocation.longitude];

      client.query(sqlQuery, sqlArray);

      res.send(newLocation);
    })
    .catch(error => {
      res.status(500).send('LocationIQ failed');
      console.log(error.message);
    });
}

//--Route Callback: /weather--//
function getWeather(req, res) {
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
function getParks(req, res) {
  const searchedCity = req.query.search_query;
  // console.log('********** CITY ***********', searchedCity);
  const parksApiKey = process.env.PARKS_API_KEY;
  const url = `https://developer.nps.gov/api/v1/parks?q=${searchedCity}&api_key=${parksApiKey}&limit=10`;

  superagent.get(url) //TODO: Not all the data is coming back so need to investigate this
    .then(result => {
      // console.log(result.body);
      const arr = result.body.data.map(parkObject => new Park(parkObject));
      res.send(arr);
    })
    .catch(error => {
      res.status(500).send('National Parks failed');
      console.log(error.message);
    });
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

function Park(parkObject) {
  this.name = parkObject.name;
  this.address = parkObject.address;
  this.fee = parkObject.fee;
  this.description = parkObject.description;
  this.url = parkObject.url;
}



//=========== Start Server ===========//
client.connect();
app.listen(PORT, () => console.log(`we are up on PORT ${PORT}`));


/////////// PG SQL Set-up Steps ///////
// 1. create db
// 2. add pg, the package
// 3. create the client variable and pass it the DATABASE_URL
// 4. connect to the db
// 5. add to our route a check for if there is data in the db
// 6. create the table
// 7. create a schema.sql file
// 8. run the schema.sql file with psql -d city_explorer -f schema.sql
// 9. add to our route a check for if there is data in the db
// 10. check the table for the location


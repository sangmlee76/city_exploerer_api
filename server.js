'use strict';

//=========== Load Packages ==========//
const express = require('express');
const cors = require('cors');
const { response } = require('express');
require('dotenv').config();

//===== Setup Application (Sever) ====//
const app = express();
app.use(cors());

//======== Global Variables ==========//
const PORT = process.env.PORT || 3111;



//========== Setup Routes ============//
app.get('/', (request, response) => {
  response.send('you made it home');
});

app.get('/location', (req, res) => {
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
  const data = require('./data/weather.json');
  const
});

  //========= Helper Functions =========//
  //Constructor goes here//

  function Location(search_query, formatted_query, latitude, longitude) {
    this.search_query = search_query;
    this.formatted_query = formatted_query; // what is this? Need to revisit lecture video
    this.longitude = longitude;
    this.latitude = latitude;
  }

  //=========== Start Server ===========//
  app.listen(PORT, () => console.log(`we are up on PORT ${PORT}`));
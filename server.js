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
app.get('/',(request, response) => {
  response.send('you made it');
});

//=========== Start Server ===========//
app.listen(PORT, () => console.log(`we are up on PORT ${PORT}`));
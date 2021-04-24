'use strict';

// modules importing
const listener = require('./routes/listener');
const proof = require('./routes/life-proof');

// requiering the environment variables
require('dotenv').config();

// Require express to run server and routes
const express = require('express');
const app = express();

// Require postegrues
const pg = require('pg');

//Require Superagent with HTTP requests
const superagent = require('superagent');

// cors for cross origin allowance
const cors = require('cors');
app.use(cors());

//Intialize the main project folder
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Server setup
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));

// app routes
app.listen(PORT, listener.listening(PORT));
app.get('/proof', proof.lifeProof);

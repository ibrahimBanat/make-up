'use strict';

// requiering the environment variables
require('dotenv').config();

// Require express to run server and routes
const express = require('express');
const app = express();
const methodOverride = require('method-override');

// Require postegrues
const pg = require('pg');
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false },
});

//method override
app.use(methodOverride('_method'));

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

app.get('/', rootRouteHndler);
app.post('/productByPrice', getProduct);
app.get('/all', getAllProducts);
app.post('/add', add);
app.get('/myProducts', myProducts);
app.post('/details/:id', details);
app.put('/update/:id', update);
app.delete('/delete/:id', deleteProduct);
//functions

function rootRouteHndler(req, res) {
  //http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline&price_greater_than=10&price_less_than=14

  res.render('pages/index');
}

function getProduct(req, res) {
  let brand = req.body.brand;
  let bot = req.body.bot;
  let top = req.body.top;
  let url = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}&price_greater_than=${bot}&price_less_than=${top}`;
  superagent.get(url).then(result => {
    res.render('pages/productByprice', { data: result.body });
  });
}
function getAllProducts(req, res) {
  let url = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline`;
  superagent.get(url).then(result => {
    let data = result.body;
    let products = data.map(item => {
      return new Product(item);
    });
    res.render('pages/allProducts', { data: products });
    // res.send(products);
  });
}
function add(req, res) {
  let sql = `INSERT INTO product (name,price,image,description) VALUES($1, $2, $3, $4);`;
  let safe = req.body;
  let safeValues = [safe.name, safe.price, safe.image, safe.description];
  client.query(sql, safeValues).then(() => {
    res.redirect('/myProducts');
  });
}
function myProducts(req, res) {
  let sql = `SELECT * FROM product;`;
  client.query(sql).then(result => {
    res.render('pages/myProducts', { data: result.rows });
  });
}
function details(req, res) {
  let sql = `SELECT * FROM product WHERE id=$1`;
  let safeValues = [req.params.id];
  client.query(sql, safeValues).then(result => {
    res.render('pages/details', { data: result.rows[0] });
  });
}
function update(req, res) {
  let query = `UPDATE product SET name=$1, price=$2, image=$3, description=$4 WHERE id=$5;`;
  let safe = req.body;
  let safeValues = [
    safe.name,
    safe.price,
    safe.image,
    safe.description,
    req.params.id,
  ];
  client.query(query, safeValues).then(() => {
    res.redirect(307, `/details/${req.params.id}`);
  });
}
function deleteProduct(req, res) {
  let sql = `DELETE FROM product WHERE id=$1`;
  let safeValues = [req.params.id];
  client.query(sql, safeValues).then(() => {
    res.redirect('/myProducts');
  });
}

//helper function
const Product = function (data) {
  this.name = data.name;
  this.price = data.price;
  this.image = data.image_link;
  this.description = data.description;
};

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log('app is running . . .');
    console.log(`http://localhost:${PORT}/`);
  });
});

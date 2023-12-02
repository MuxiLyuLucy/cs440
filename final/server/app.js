require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const routes = require('./routes.js');

const app = express();
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(routes);


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Mongoose connected 🍃');
    app.listen(5001, () => {
      console.log('Server is up and running 🚀');
    });
  })
  .catch((error) => {
    console.log(error);
  });
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');

const app = express();

app.use(bodyParser.json());

app.use(`/${process.env.API_VERSION}/courses`, courseRoutes);
app.use(`/${process.env.API_VERSION}/users`, userRoutes);

mongoose.connect('mongodb://localhost:27017/educator', (error) => {
    if (error) {
        console.log(error);
    }
    console.log('Successefully connected to database.');
})

app.listen(3000, () => console.log('Listening on port 3000...'));
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const {CLIENT_ORIGIN} = require('./config');
const usersRouter = require('./users/users-router')
const activitiesRouter = require('./activities/activities-router')
const bcrypt = require('bcrypt')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors());

app.use('/api/users', usersRouter)
app.use('/api/activities', activitiesRouter)
app.get('/', (req, res) =>{
    res.send('Hello, world!')
})


 app.use(function errorHandler(error, req, res, next) {
       let response
       if (NODE_ENV === 'production') {
         response = { error: { message: 'server error' } }
       } else {
         console.error(error)
         response = { message: error.message, error }
       }
       res.status(500).json(response)
     })

module.exports = app
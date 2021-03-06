const path = require('path')
const express = require('express')
const xss = require('xss')
const UsersService = require('./users-service')
const bcrypt = require('bcrypt')

const usersRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
    id: user.id,
    fullname: xss(user.fullname),
    username: xss(user.username),
    password: xss(user.password),
    date_created: user.date_created,
  })


  usersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    UsersService.getAllUsers(knexInstance)
      .then(users => {
        res.json(users.map(serializeUser))
      })
      .catch(next)
  })
  .post(jsonParser, async (req, res, next) => {
    

    try{
      const salt = await bcrypt.genSalt()
      const hashedPassword = await bcrypt.hash(req.body.password, salt)

      //console.log(req.body.password)
      //console.log(hashedPassword)

      const { fullname, username } = req.body
      const password = hashedPassword;
    const newUser = { fullname, username, password }

    for (const [key, value] of Object.entries(newUser)) {
      if (value == null) {
        throw new Error(`Missing '${key}' in request body`)
      }
    }
  
      newUser.fullname = fullname;
      newUser.password = password;
      newUser.username = username;
  
       UsersService.insertUser(
        req.app.get('db'),
        newUser
      )
        .then(user => {
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${user.id}`))
            .json(serializeUser(user))
        }) 
       //res.status(201).send()
      
    }
    
catch(error){
  
     res.status(400).send(error.message) 
  
}
    
      
  })
   usersRouter
    .route(`/login`)
    .post(jsonParser, async (req, res, next) => {

      const knexInstance = req.app.get('db')
      UsersService.getAllUsers(knexInstance)
      .then(users => users.find(user => user.username == req.body.username))
      .then(async user => {if(user == null) {
         res.status(400).send(`Cannot find user`)
      }
      try{
       if( await bcrypt.compare(req.body.password, user.password)){
         res.send('Success')
       }
       else{
         res.status(400).send('Not Allowed')
       }
      }
      catch{
        res.status(500).send()
      }})

  })
    
 
  usersRouter
  .route('/:user_id')
  .all((req, res, next) => {
    UsersService.getById(
      req.app.get('db'),
      req.params.user_id
    )
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` }
          })
        }
        res.user = user
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeUser(res.user))
  })
  .delete((req, res, next) => {
    UsersService.deleteUser(
      req.app.get('db'),
      req.params.user_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { fullname, username, password } = req.body
    const userToUpdate = { fullname, username, password }

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'fullname', 'username', or 'password'`
        }
      })

    UsersService.updateUser(
      req.app.get('db'),
      req.params.user_id,
      userToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

  

  module.exports = usersRouter
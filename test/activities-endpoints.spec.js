const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeArticlesArray, makeMaliciousArticle } = require('./articles.fixtures')
const { makeUsersArray } = require('./users.fixtures')



describe('Activities Endpoints', function(){
let db

before('make knex instance', () => {

    db = knex({
        client: 'pg',
        connection: process.env.TEST_DATABASE_URL,
      })
      app.set('db', db)

})

after('disconnect from db', () => db.destroy())

before('clean the table', () => db.raw('TRUNCATE breakaway_users, breakaway_activities RESTART IDENTITY CASCADE'))

describe(`GET /api/activities`, () =>{
context(`Given no activities`, () =>{
    return supertest(app)
        .get('api/activities')
        .expect(200, [])
})



})








})
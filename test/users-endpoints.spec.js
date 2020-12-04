const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const usersRouter = require('../src/users/users-router')
const { makeUsersArray } = require('./users.fixtures')



describe('Users Endpoints', function() {
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

afterEach('cleanup',() => db.raw('TRUNCATE breakaway_users, breakaway_activities RESTART IDENTITY CASCADE'))

describe(`GET /api/users`, () =>{
context(`Given no users`, () =>{
   
    it('responds with status 200 and an empty list', () =>{
        
        return supertest(app)
        .get('/api/users')
        .expect(200, [])
    })
   
})

context('Given there are users in the database', () =>{
    const testUsers = makeUsersArray();
    //const testActivities = makeActivitiesArray();

    beforeEach('insert users', () => {
        return db
          .into('breakaway_users')
          .insert(testUsers) 
      })
      it('responds with 200 and all of the users', () => {
        return supertest(app)
          .get('/api/users')
          .expect(200, testUsers)
      })

      //create test for xss attack
})

})

describe(`GET /api/users/:user_id`, () =>{
    context(`Given no users`, () =>{
        it(`responds with 404 an error message`, () =>{
        const userId = 1234567;
        return supertest(app)
            .get(`/api/users/${userId}`)
            .expect(404, { error: { message: `User doesn't exist` } })
        })
    } )

    context(`Given there are users in the database`, () =>{
        const testUsers = makeUsersArray();

        beforeEach('insert users', () => {
            return db
              .into('breakaway_users')
              .insert(testUsers) 
          })

        it(`responds with 200 and the specified user`, () =>{
            const userId = 1;
            const expectedUser = testUsers[userId - 1]
            return supertest(app)
                .get(`/api/users/${userId}`)
                .expect(200, expectedUser)
        })

        //Create test for xss attack user


    })

})

describe(`POST /api/users`, () =>{
    
    it(`creates a user, responding with 201 and the user`, () =>{
        const newUser = {
            fullname: "John Green Pepper",
            username: "jpepper003",
            password: "ilikepepper"
        }
        return supertest(app)
            .post(`/api/users`)
            .send(newUser)
            .expect(201)
            .expect(res =>{
                expect(res.body.fullname).to.eql(newUser.fullname)
                expect(res.body.lastname).to.eql(newUser.lastname)
                expect(res.body.password).to.eql(newUser.password)
                expect(res.body).to.have.property('id')
                expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
                const expected = new Intl.DateTimeFormat('en-US').format(new Date())
                const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.date_created))
                expect(actual).to.eql(expected)
                })
                .then(res =>{
                    supertest(app)
                        .get(`/api/users/${res.body.id}`)
                        .expect(res.body)
                })

            

    })
    const requiredFields = ['fullname', 'lastname', 'password']

    requiredFields.forEach(field => {
        const newUser = {
            fullname: "John Green Pepper",
            username: "jpepper003",
            password: "ilikepepper"
        }

        it(`responds with an error message when the ${field} is missing`, () => {
            delete newUser[field]

            return supertest(app)
                .post('/api/users')
                .send(newUser)
                .expect(400, {
                    error: { message: `Missing '${field}' in request body` }
                  } )
        })
        //write test for 'removes XSS attack content from response'
      })
})




})
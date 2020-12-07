const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeActivitiesArray, makeMaliciousActivity } = require('./activities.fixtures')
const { makeUsersArray } = require('./users.fixtures')



describe.only('Activities Endpoints', function(){
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

describe(`GET /api/activities`, () =>{
context(`Given no activities`, () =>{
    it(`returns status code 200 and an empty list`, () =>{
        return supertest(app)
            .get('/api/activities')
            .expect(200, [])
    })
})

context('Given there are users in the database', () =>{
const testActivities = makeActivitiesArray();
const testUsers = makeUsersArray()
;
    beforeEach(`insert activities`, () =>{
        return db
            .into('breakaway_users')
            .insert(testUsers)
            .then(() =>{
                return db
                    .into('breakaway_activities')
                    .insert(testActivities)
            })
    })
    it(`responds with 200 and all of the activities`, () =>{
        return supertest(app)
            .get(`/api/activities`)
            .expect(200, testActivities)
    })

})
    context(`Given an xss attack activity`, () =>{
        const testUsers = makeUsersArray();
        const { maliciousActivity, expectedActivity } = makeMaliciousActivity();

        beforeEach(`insert malicious activity`, () =>{
            return db
                .into('breakaway_users')
                .insert(testUsers)
                .then(() =>{
                    return db
                        .into('breakaway_activities')
                        .insert(maliciousActivity)
                        
                })
        })

        it(`removes xss attack`, () =>{
               return supertest(app)
                   .get(`/api/activities`)
                   .expect(res =>{
                       expect(res.body[0].title).to.eql(expectedActivity.title)
                       expect(res.body[0].description).to.eql(expectedActivity.description) 
                   })
    }) 
    })
    
    
})

describe(`GET /api/activities/:activity_id`, () => {
    context(`Given no activities`, () => {
      it(`responds with 404`, () => {
        const activityId = 1234567
        return supertest(app)
          .get(`/api/activities/${activityId}`)
          .expect(404, { error: { message: `Activity doesn't exist` } })
      })
    })

    context('Given there are activities in the database', () => {
      const testUsers = makeUsersArray();
      const testActivities = makeActivitiesArray()

      beforeEach('insert activities', () => {
        return db
          .into('breakaway_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('breakaway_activities')
              .insert(testActivities)
          })
      })

      it('responds with 200 and the specified activity', () => {
        const activityId = 2
        const expectedActivity = testActivities[activityId - 1]
        return supertest(app)
          .get(`/api/activities/${activityId}`)
          .expect(200, expectedActivity)
      })
    })

    context(`Given an XSS attack activity`, () => {
      const testUsers = makeUsersArray();
      const { maliciousActivity, expectedActivity } = makeMaliciousActivity()

      beforeEach('insert malicious activity', () => {
        return db
          .into('breakaway_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('breakaway_activities')
              .insert([ maliciousActivity ])
          })
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/activities/${maliciousActivity.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedActivity.title)
            expect(res.body.description).to.eql(expectedActivity.description)
          })
      })
    })
  })
  describe(`POST /api/activities`, () => {
    const testUsers = makeUsersArray();
    beforeEach('insert malicious activity', () => {
      return db
        .into('breakaway_users')
        .insert(testUsers)
    })

    it(`creates an activity, responding with 201 and the new activity`, () => {
      const newActivity = {
        title: 'Test new activity',
        user_id: 1,
        duration:'23.45',
        distance:'3.78',
        description: 'Test new activity description...'
      }
      return supertest(app)
        .post('/api/activities')
        .send(newActivity)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newActivity.title)
         //user_id
          expect(res.body.duration).to.deep.eql(newActivity.duration)
          expect(res.body.distance).to.eql(newActivity.distance)
          expect(res.body.description).to.eql(newActivity.description)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/activities/${res.body.id}`)
          const expected = new Intl.DateTimeFormat('en-US').format(new Date())
          const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.date_published))
          expect(actual).to.eql(expected)
        })
        .then(res =>
          supertest(app)
            .get(`/api/activities/${res.body.id}`)
            .expect(res.body)
        )
    })

    const requiredFields = ['title', 'duration', 'distance', 'description']

    requiredFields.forEach(field => {
        const newActivity = {
            title: 'Test new activity',
            user_id: 1,
            duration:23.45,
            distance:3.78,
            description: 'Test new activity content...'
          }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newActivity[field]

        return supertest(app)
          .post('/api/activities')
          .send(newActivity)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })

    it('removes XSS attack content from response', () => {
      const { maliciousActivity, expectedActivity } = makeMaliciousActivity()
      return supertest(app)
        .post(`/api/activities`)
        .send(maliciousActivity)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(expectedActivity.title)
          expect(res.body.content).to.eql(expectedActivity.content)
        })
    })
  })
  describe(`DELETE /api/activities/:activity_id`, () =>{
      context(`Given there are no activities in the database`, () =>{
          const activityId = 1234567;
          it(`responds with 404`, () =>{
              return supertest(app)
                .get(`/api/activities/${activityId}`)
                .expect(404, { error: { message: `Activity doesn't exist` } })
          })
      })
      context(`Given there are activities in the database`, () =>{
          const testActivities = makeActivitiesArray();
          const testUsers = makeUsersArray();
          const activityId = 1;

          beforeEach(`insert activities`, () =>{
              return db
                .into('breakaway_users')
                .insert(testUsers)
                .then(() =>{
                    return db
                    .into('breakaway_activities')
                    .insert(testActivities)
                })
                
          })
          it(`deletes the activity with the specified id`, () =>{
              const activityId = 1;
              const expectedActivities = () => testActivities.filter( activity => activity.id !== activityId )
              supertest(app)
                .delete(`/api/activities/${activityId}`)
                .expect(404)
                .then(res =>{
                     supertest(app)
                        .get(`/api/activities`)
                        .expect(expectedActivities)
                })

          })
      })
  })
  describe(`PATCH /api/activities/:activity_id`, () => {
    context(`Given no activities`, () => {
      it(`responds with 404`, () => {
        const activityId = 123456
        return supertest(app)
          .delete(`/api/activities/${activityId}`)
          .expect(404, { error: { message: `Activity doesn't exist` } })
      })
    })

    context('Given there are activities in the database', () => {
      const testUsers = makeUsersArray();
      const testActivities = makeActivitiesArray()

      beforeEach('insert activities', () => {
        return db
          .into('breakaway_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('breakaway_activities')
              .insert(testActivities)
          })
      })

      it('responds with 204 and updates the activity', () => {
        const idToUpdate = 2
        const updateActivity = {
            title: 'Test update activity',
            user_id: 1,
            duration:'23.45',
            distance:'3.78',
            description: 'Test new  update activity content...'
        }
        const expectedActivity = {
          ...testActivities[idToUpdate - 1],
          ...updateActivity
        }
        return supertest(app)
          .patch(`/api/activities/${idToUpdate}`)
          .send(updateActivity)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/activities/${idToUpdate}`)
              .expect(expectedActivity)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/activities/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain either 'title', 'duration', 'distance', or 'description'`
            }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updateActivity = {
          title: 'updated activity title',
        }
        const expectedActivity = {
          ...testActivities[idToUpdate - 1],
          ...updateActivity
        }

        return supertest(app)
          .patch(`/api/activities/${idToUpdate}`)
          .send({
            ...updateActivity,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/activities/${idToUpdate}`)
              .expect(expectedActivity)
          )
      })
    })
  })
describe(`POST /api/users/login`, () =>{
  context(`Given there are no users in the database`, () =>{
    it(`responds with an error`, () =>{
      const userCredentials = {
        username: 'Bob Sample',
        password: 'Samplepw'
      }
      return supertest(app)
        .post(`/api/users/login`)
        .send(userCredentials)
        .expect(400)
    })
  context(`Given there are users in the database`, ()  =>{
    context(`Given invalid credentials are submitted`, () =>{
      it(`responds with 400 and an error message`, () =>{
        const userCredentials = {
          fullname:'Bob Sample',
          username: 'bobsample',
          password: 'Samplepw'
        }
        const invalidPasswordCredentials = {
          username: 'bobsample',
          password: 'WrongSamplepw'
        }
        const invalidUsernameCredentials = {
          username: 'nonexistentusername',
          password: 'WrongSamplepw'
        }
        return supertest(app)
          .post(`/api/users`)
          .send(userCredentials)
          .expect(201)
          .then(res => 
            supertest(app)
            .post(`/api/users/login`)
            .send(invalidPasswordCredentials)
            .expect(400, 'Not Allowed')) 
            .then(res => 
              supertest(app)
            .post(`/api/users/login`)
            .send(invalidUsernameCredentials)
            .expect(400, 'Cannot find user'))
      })
    })
  context(`Given valid credentials are submitted`, () =>{
    it(`responds with 200 and 'Success`, () =>{
      const userCredentials = {
        fullname:'Bob Sample',
        username: 'bobsample',
        password: 'Samplepw'
      }
     
      return supertest(app)
        .post(`/api/users`)
        .send(userCredentials)
        .expect(201)
        .then(res => 
          supertest(app)
          .post(`/api/users/login`)
          .send(userCredentials)
          .expect(200, 'Success')) 
    })
    
  })  
  })  
  })

})
})









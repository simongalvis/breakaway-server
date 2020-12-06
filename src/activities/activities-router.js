const path = require('path')
const express = require('express')
const xss = require('xss')
const ActivitiesService = require('./activities-service')

const activitiesRouter = express.Router()
const jsonParser = express.json()

const serializeActivity = activity => ({
    id: activity.id,
    user_id: activity.user_id,
    title: xss(activity.title),
    duration: xss(activity.duration),
    distance: xss(activity.distance),
    description: xss(activity.description),
    date_published: activity.date_published,
  })


  activitiesRouter
  .route('/')
  //hello
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    ActivitiesService.getAllActivities(knexInstance)
      .then(activities => {
        res.json(activities.map(serializeActivity))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { user_id, title, duration, distance, description } = req.body
    const newActivity = { user_id, title, duration, distance, description }

    for (const [key, value] of Object.entries(newActivity)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    newActivity.user_id = user_id;
    newActivity.title = title;
    newActivity.duration = duration;
    newActivity.distance = distance;
    newActivity.description = description;

    ActivitiesService.insertActivity(
      req.app.get('db'),
      newActivity
    )
      .then(activity => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${activity.id}`))
          .json(serializeActivity(activity))
      })
      .catch(next)
  })

  activitiesRouter
  .route('/:activity_id')
  .all((req, res, next) => {
    ActivitiesService.getById(
      req.app.get('db'),
      req.params.activity_id
    )
      .then(activity => {
        if (!activity) {
          return res.status(404).json({
            error: { message: `Activity doesn't exist` }
          })
        }
        res.activity = activity
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeActivity(res.activity))
  })
  .delete((req, res, next) => {
    ActivitiesService.deleteActivity(
      req.app.get('db'),
      req.params.activity_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, duration, distance, description } = req.body
    const activityToUpdate = { title, duration, distance, description }

    const numberOfValues = Object.values(activityToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'title', 'duration', 'distance', or 'description'`
        }
        //incluse user_id?
      })

    ActivitiesService.updateActivity(
      req.app.get('db'),
      req.params.activity_id,
      activityToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

  module.exports = activitiesRouter
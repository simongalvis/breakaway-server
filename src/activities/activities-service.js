const ActivitiesService = {
    getAllActivities(knex) {
      return knex.select('*').from('breakaway_activities')
    },
  
    insertActivity(knex, newActivity) {
      return knex
        .insert(newActivity)
        .into('breakaway_activities')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, id) {
      return knex
        .from('breakaway_activities')
        .select('*')
        .where('id', id)
        .first()
    },
  
    deleteActivity(knex, id) {
      return knex('breakaway_activities')
        .where({ id })
        .delete()
    },
  
    updateActivity(knex, id, newActivityFields) {
      return knex('breakaway_activities')
        .where({ id })
        .update(newActivityFields)
    },
  }
  
  module.exports = ActivitiesService
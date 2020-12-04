const UsersService = {
    getAllUsers(knex) {
      return knex.select('*').from('breakaway_users')
    },
  
    insertUser(knex, newUser) {
      return knex
        .insert(newUser)
        .into('breakaway_users')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, id) {
      return knex
        .from('breakaway_users')
        .select('*')
        .where('id', id)
        .first()
    },
  
    deleteUser(knex, id) {
      return knex('breakaway_users')
        .where({ id })
        .delete()
    },
  
    updateUser(knex, id, newUserFields) {
      return knex('breakaway_users')
        .where({ id })
        .update(newUserFields)
    },
  }
  
  module.exports = UsersService
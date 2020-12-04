function makeUsersArray() {
    return [
      {
        id: 1,
        fullname: 'Sam Gamgee',
        username: 'sam.gamgee@shire.com',
        password: 'secret',
        date_created: '2029-01-22T16:28:32.615Z'
        
      },
      {
        id: 2,
        fullname: 'Peregrin Took',
        username: 'peregrin.took@shire.com',
        password: 'secret',
        date_created: '2100-05-22T16:28:32.615Z'
        
      }
    ]
  }
  
  module.exports = {
    makeUsersArray
  }
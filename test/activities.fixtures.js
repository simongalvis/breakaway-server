function makeArticlesArray() {
    return [
      {
        id: 1,
        user_id: 1,
        title: 'Morning run',
        duration: 37.23,
        distance: 7,
        description: "Longest I've run in a while. Felt suprisingly good",
        date_created: '2029-01-22T16:28:32.615Z'
        
      },
      {
        id: 2,
        user_id: 2,
        title: 'Evening run',
        duration: 30.23,
        distance: 5,
        description: "Super tired but glad I'm getting these times",
        date_created: '2029-01-22T16:28:32.615Z'
        
      }
    ]
  }
  
  module.exports = {
    makeUsersArray
  }
function makeActivitiesArray() {
    return [
      {
        id: 1,
        user_id: 1,
        title: 'Morning run',
        duration: '37.23',
        distance: '7.00',
        description: "Longest I've run in a while. Felt suprisingly good",
        date_published: '2029-01-22T16:28:32.615Z'
        
      },
      {
        id: 2,
        user_id: 1,
        title: 'Evening run',
        duration: '30.23',
        distance: '5.01',
        description: "Super tired but glad I'm getting these times",
        date_published: '2029-01-22T16:28:32.615Z'
        
      }
    ]
  }
  function makeMaliciousActivity() {
    const maliciousActivity = {
      id: 911,
      user_id: 2,
      title: 'Naughty naughty very naughty <script>alert("xss");</script>',
      duration: '9.33',
      distance: '1.34',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      date_published: new Date().toISOString()
    }
    const expectedActivity = {
      ...maliciousActivity,
      title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
      maliciousActivity,
      expectedActivity,
    }
  }
  
  module.exports = {
    makeActivitiesArray,
    makeMaliciousActivity
  }
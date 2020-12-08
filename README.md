# Breakaway
- Breakaway allows users to track their athletic activities in one convenient location.

## Link to live app
- https://breakaway-client.vercel.app/

## Summary
- Breakaway users can create accounts and log activities such as runs, hikes, or runs. Upon subsequent logins, users will be able to see a list of their activities stored conveniently in one place. This is useful in allowing users to monitor their progress and challenge themselves by trying to match or surpass previous efforts.

## Screenshots

- Activities Page<br/>
![Activities Page](/src/images/sample-hero.jpg)

- Login Page
![Login Page](/src/images/breakaway-login.png)

- Add Activity Page
![Add Activity Page](/src/images/breakaway-add-activity.png)



## Built With
- React
- Nodejs
- Express
- SQL
- PostgreSQL
- CSS

In the project directory, you can run:

## Features
- Create an account with a hashed password unknown to anyone but the user
- Create activities which will populate the user activities dashboard
- Log in to account and find previously posted activities

##
## Author
- Simon Galvis

## Setup 
- Download this code and run ```sh npm install ``` to install dependencies needed to run the server

- Run the server locally in developer mode using ```sh npm run dev```

- Run the server regularly locally using ```sh npm run```

- Get a list of users: ```sh GET /api/users```

- Get a specific user: ```sh GET /api/users/user_id```

- Get a list of activities: ```sh GET /api/activities```

- Get a specific activity: ```sh GET /api/activities/activity_id```

- Post a user: ```sh POST /api/users```

- Post an activity: ```sh POST /api/activities```



### Additional notes
- Authentication with JWT is still being implemented. Currently, user passwords are hashed before being stored in the database. Still, use caution and avoid entering personal/sensitive information within the username, password, or activity contents.

# Bistro-restaurant-server
<hr>

GitHub Client Repository Link: https://github.com/Praneshchow/Bistro-restaurant-client

#### Used Technology: 

Frontend: React, React Router, Tailwind CSS, DaisyUI, TanStack Query, Firebase.  
Backend: Express.js, Node.js, MongoDB.  

## Server setup:

Initialize: `npm init -y`

Install express, cors, dotnet, mongodb: `npm i express cors dotenv mongodb`

JWT install: `npm install jsonwebtoken`

<hr>

### Run the Server: `nodemon index.js`

<hr>

### Backend Study info: 

-----------------------
#### Naming Convention
-----------------------
* users: useCollection
* app.get('/users')
* app.get('/users/:id')
* app.post('/users')
* app.patch('/users/:id')
* app.put('/users/:id')
* app.delete('/users/:id')


#### Secret key Generate:

Run this commands in terminal. 

In terminal go to node: `node`   

Access token secret (Key generate): `require('crypto').randomBytes(64).toString('hex')`  





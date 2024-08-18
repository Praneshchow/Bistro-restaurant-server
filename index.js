const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware. 
app.use(cors());
app.use(express.json());


const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  // bearer token.
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2pzzeio.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const menuCollection = client.db("bistroDB").collection("menu");     // select menu data. 
    const reviewCollection = client.db("bistroDB").collection("reviews");     // select menu data. 
    const cartCollection = client.db("bistroDB").collection("carts");     // select menu data. 
    const usersCollection = client.db("bistroDB").collection("users");     // select users data.


    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      console.log("token: ", token);
      res.send({ token });
    })

    // warning: use verifyJWT before using verifyAdmin. 
    const verifyAdmin = async(req, res, next) => {
      const email = req.decoded.email;
      const query = {email: email};
      const user = await usersCollection.findOne(query);
      if (user?.role !== 'admin'){
        return res.status(403).send({error: true, message: 'Forbidden message'});
      }
      next();
    }

    /* USERS AND ADMIN AUTHORIZATION. 
    * 1. Do not show secure links to those who should not see the links. 
    * 2. Use jwt token: verifyJWT. 
    * 3. Use verifyAdmin middleware. 
    * 
    */

    // users related apis
    app.get('/users', verifyJWT, verifyAdmin, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });


    app.post('/users', async (req, res) => {
      const user = req.body;
      // console.log("user: ", user);
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      console.log("existing user: ", existingUser);

      if (existingUser) {
        return res.send({ message: 'user already exists' });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    // security layer: verifyJWT.
    // email same.
    // check admin. 
    app.get('/users/admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };

      if (req.decoded.email !== email) {
        res.send({ admin: false })
      }

      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === 'admin' };
      console.log("result: ", result);
      res.send(result);
    })

    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      console.log("patch after id: ", id);
      
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })


    // menu related api (getting the data from mongodb). 
    app.get('/menu', async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    })

    // New menu add in the database. 
    app.post('/menu', verifyJWT, verifyAdmin, async (req, res) => {
      const newItem = req.body;
      const result = await menuCollection.insertOne(newItem);  
      res.send(result);
    })

    // review related api (getting the data from mongodb). 
    app.get('/reviews', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })


    // cart collection api. 
    app.get('/carts', verifyJWT, async (req, res) => {
      const email = req.query.email;
      console.log("email: ", email);
      if (!email) {
        res.send([]);
      }

      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ error: true, message: 'Forbidden Access' })
      }

      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    // cart collection. 
    app.post('/carts', async (req, res) => {
      const item = req.body;
      // console.log("item: ", item);
      const result = await cartCollection.insertOne(item);
      res.send(result);
    })

    // delete a item from the cart (Dashboard). 
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Bistro is running. ');
})

app.listen(port, () => {
  console.log(`Bistro is running on port ${port}`);
})







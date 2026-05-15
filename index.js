const express = require('express')
const dotenv = require('dotenv')
dotenv.config()

const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 8000

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
    try {

      const db = client.db("Wanderlust")
      const destinationCollection = db.collection("destinations")
      const bookingCollection = db.collection("bookings")

      app.get('/destinations', async (req, res) => {
        const cursor = destinationCollection.find({})
        const destinations = await cursor.toArray()
        res.send(destinations)
      })
      app.get('/destinations/:id', async (req, res) => {
        const id = req.params.id
        const destination = await destinationCollection.findOne({ _id: new ObjectId(id) })
        res.send(destination)
      })

      app.post('/destinations', async (req, res) => {
        const destination = req.body
        const result = await destinationCollection.insertOne(destination)
        res.send(result)
      })

      app.delete('/destinations/:id', async (req, res) => {
        const id = req.params.id
        const result = await destinationCollection.deleteOne({ _id: new ObjectId(id) })
        res.send(result)
      })

      app.get('/bookings', async (req, res) => {
        const { user_id } = req.query
        if (!user_id) {
          return res.status(400).send({ message: 'user_id is required' })
        }
        const cursor = bookingCollection.find({ user_id: String(user_id) })
        const bookings = await cursor.toArray()
        res.send(bookings)
      })
      app.post('/bookings', async (req, res) => {
        const booking = req.body
        const result = await bookingCollection.insertOne(booking)
        res.send(result)
      })
      app.delete('/bookings/:id', async (req, res) => {
        const id = req.params.id
        const { user_id } = req.query
        const result = await bookingCollection.deleteOne({
          _id: new ObjectId(id),
          user_id: String(user_id),
        })
        res.send(result)
      })
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

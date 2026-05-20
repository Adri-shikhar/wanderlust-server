const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const { verifyToken, parseClientUrls } = require('./middleware/verifyToken')

const app = express()
const port = process.env.PORT || 8000

app.use(
  cors({
    origin: parseClientUrls(),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(express.json())

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
    const db = client.db('Wanderlust')
    const destinationCollection = db.collection('destinations')
    const bookingCollection = db.collection('bookings')

    app.get('/destinations', async (req, res) => {
      const cursor = destinationCollection.find({})
      const destinations = await cursor.toArray()
      res.send(destinations)
    })

    app.get('/destinations/:id', verifyToken, async (req, res) => {
      const id = req.params.id
      let objectId
      try {
        objectId = new ObjectId(id)
      } catch {
        return res.status(404).send({ message: 'Not found' })
      }
      const destination = await destinationCollection.findOne({ _id: objectId })
      if (!destination) {
        return res.status(404).send({ message: 'Not found' })
      }
      res.send(destination)
    })

    app.post('/destinations', verifyToken, async (req, res) => {
      const destination = req.body
      const result = await destinationCollection.insertOne(destination)
      res.status(201).send(result)
    })

    app.delete('/destinations/:id', verifyToken, async (req, res) => {
      const id = req.params.id
      const result = await destinationCollection.deleteOne({
        _id: new ObjectId(id),
      })
      res.send(result)
    })

    app.get('/auth/me', verifyToken, (req, res) => {
      res.send({ user: req.user })
    })

    app.get('/bookings', verifyToken, async (req, res) => {
      const { user_id } = req.query
      if (!user_id) {
        return res.status(400).send({ message: 'user_id is required' })
      }
      const cursor = bookingCollection.find({ user_id: String(user_id) })
      const bookings = await cursor.toArray()
      res.send(bookings)
    })

    app.post('/bookings', verifyToken, async (req, res) => {
      const booking = req.body
      const result = await bookingCollection.insertOne(booking)
      res.status(201).send(result)
    })

    app.delete('/bookings/:id', verifyToken, async (req, res) => {
      const id = req.params.id
      const { user_id } = req.query
      const result = await bookingCollection.deleteOne({
        _id: new ObjectId(id),
        user_id: String(user_id),
      })
      res.send(result)
    })

    console.log('Pinged your deployment. You successfully connected to MongoDB!')
  } finally {
    // client stays open for the lifetime of the process
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
// const jwt=require('jsonwebtoken')
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qpavz6c.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const photoCollection = client.db("wildLover").collection("services");
    const latestCollection = client.db("wildLover").collection("latest");
    const myReviewsCollection = client.db("wildLover").collection("myReviews");

    //get services
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = photoCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await photoCollection.findOne(query);
      res.send(service);
    });
    //get latest shot
    app.get("/latest", async (req, res) => {
      const query = {};
      const cursor = latestCollection.find(query);
      const latest = await cursor.toArray();
      res.send(latest);
    });
    app.post("/addService", async (req, res) => {
      const service = req.body;
      const result = await photoCollection.insertOne(service);
      res.send(result);
    });

    //review get, post, delete part
    app.post("/myReviews", async (req, res) => {
      const review = req.body;
      const result = await myReviewsCollection.insertOne(review);
      res.send(result);
    });
    app.get("/myReviews", async (req, res) => {
      const query = {};
      const cursor = myReviewsCollection.find(query);
      const myReviews = await cursor.toArray();
      res.send(myReviews);
    });

    app.delete("/reviewDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await myReviewsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("WildRidder");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

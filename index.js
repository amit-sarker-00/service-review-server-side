const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
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

//jwt authentication
function verifyJWT(req, res, next) {
  next();
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    //jwt post
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
      console.log(user);
    });

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
    app.post("/addService", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded !== req.query.email) {
        res.status(403).send({ message: "forbidden" });
      }
      const service = req.body;
      const result = await photoCollection.insertOne(service);
      res.send(result);
    });

    //review get, post, delete,jwt part
    app.post("/myReviews", async (req, res) => {
      // const decoded=req.decoded
      // if(decoded !==req.query.email){
      //     res.status(403).send({message:"forbidden"})
      // }
      const review = req.body;

      const result = await myReviewsCollection.insertOne(review);
      res.send(result);
    });
    app.get("/myReviews", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
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

    app.get("/reviews/:name", async (req, res) => {
      const itemName = req.params.name;
      const query = { itemName };
      const result = await myReviewsCollection.find(query).toArray();
      res.send(result);
    });

    // update review part
    app.get("/updateReview/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updateReview = await myReviewsCollection.findOne(query);
      res.send(updateReview);
    });

    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const update = req.body;
      console.log(updateReview);
      const option = { upsert: true };
      const updateReview = {
        $set: {
          name: updateReview.name,
          ServiceName: update.ServiceName,
          description: update.description,
          email: update.email,
          image: update.image,
        },
      };
      const result = await myReviewsCollection.updateOne(
        filter,
        updateReview,
        option
      );
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

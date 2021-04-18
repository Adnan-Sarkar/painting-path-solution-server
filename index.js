const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require('mongodb').ObjectId
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.skycx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
client.connect((err) => {
    const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("services");
    const ordersCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
    const reviewsCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");
    const adminsCollection = client.db(`${process.env.DB_NAME}`).collection("admin");


    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        console.log(email);
        adminsCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })

    app.post('/addAdmin', (req, res) => {
        const newAdmin = req.body;
        adminsCollection.insertOne(newAdmin)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.post('/addReview', (req, res) => {
        const newReview = req.body;
        reviewsCollection.insertOne(newReview)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.get('/reviews', (req, res) => {
        reviewsCollection.find()
        .toArray((err, services) => {
            res.send(services)
        })
    })

    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        ordersCollection.insertOne(newOrder)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.get('/orders', (req, res) => {
        ordersCollection.find({userEmail: req.query.email})
        .toArray((err, orders) => {
            res.send(orders)
        })
    })

    app.get('/ordersList', (req, res) => {
        ordersCollection.find()
        .toArray((err, services) => {
            res.send(services)
        })
    })

    app.get('/services', (req, res) => {
        serviceCollection.find()
        .toArray((err, services) => {
            res.send(services)
        })
    })

    app.get('/singleService/:id', (req, res) => {
        serviceCollection.find({ _id: ObjectId(req.params.id) })
        .toArray((err, documents) => {
            res.send(documents[0]);
        })
    })

    app.post('/addService', (req, res) => {
        const newService = req.body;
        console.log('adding new data', newService);
        serviceCollection.insertOne(newService)
        .then(result => {
            console.log("inserted count", result.insertedCount);
            res.send(result.insertedCount > 0)
        })
    })

    app.patch('/updateStatus/:id', (req, res) => {
        ordersCollection.updateOne({ _id: ObjectId(req.params.id) },
        {
            $set: { status: req.body.status }
        })
        .then(result => {
            res.send(result.modifiedCount > 0)
        })
    })

    app.delete('/delete/:id', (req, res) => {
        serviceCollection.deleteOne({ _id: ObjectId(req.params.id) })
        .then(result => {
            console.log(result);
        })
    })

});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

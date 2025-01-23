const express = require('express');
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');

// Correcting CORS middleware usage
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dkwhsex.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
        // Connect the client to the server (this should be done once and not in the finally block)
        await client.connect();
        const moviesDB = client.db("movieverseDB").collection("movies");

        // 6 data get from all data and sort also ratings
        app.get('/femovies', async (req, res) => {
            try {
                // Sort by rating in descending order (highest rating first), and limit to 6 results
                const result = await moviesDB.find().sort({ rating: -1 }).limit(6).toArray();
                res.send(result);  // Send the result to the client
            } catch (err) {
                console.error('Error fetching movies:', err);
                res.status(500).send({ error: 'Failed to fetch movies' });
            }
        });

        // get all movies
        app.get('/allmvies', async (req, res) => {
            const result = await moviesDB.find().toArray();
            res.send(result)
        })

        // post movie
        app.post('/addmovies', async (req, res) => {
            const menu = req.body;
            const result = await moviesDB.insertOne(menu);  // Insert movie details into the database
            res.send(result);  // Send a response with the result of the insert operation
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);  // Exit the process if MongoDB connection fails
    }
}

run();

app.get('/', (req, res) => {
    res.send('Hello eraainna madrcd');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

const express = require('express');
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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

        // Get all movies
        app.get('/allmvies', async (req, res) => {
            const result = await moviesDB.find().toArray();
            res.send(result);
        });

        // Add a new movie
        app.post('/addmovies', async (req, res) => {
            const movie = req.body;
            const result = await moviesDB.insertOne(movie);  // Insert movie details into the database
            res.send(result);  // Send a response with the result of the insert operation
        });

        // Find a movie by ID
        app.get("/findmovie/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await moviesDB.findOne(query);
            res.send(result);
        });

        // Delete a movie
        app.delete("/movie/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await moviesDB.deleteOne(query);
            res.send(result);
        });

        // Add movie to favorites
        app.post("/addToFavorites/:id", async (req, res) => {
            const movieId = req.params.id;
            const query = { _id: new ObjectId(movieId) };

            try {
                // Update the movie's 'isFavorite' field to true
                const updateResult = await moviesDB.updateOne(query, {
                    $set: { isFavorite: true }
                });

                if (updateResult.modifiedCount === 0) {
                    return res.status(404).send({ message: "Movie not found or already in favorites" });
                }

                res.send({ message: "Movie added to favorites!" });
            } catch (err) {
                console.error("Error adding to favorites:", err);
                res.status(500).send({ message: "Failed to add to favorites" });
            }
        });

        // Get all favorite movies
        app.get("/getFavorites", async (req, res) => {
            try {
                // Find all movies where 'isFavorite' is true
                const favoriteMovies = await moviesDB.find({ isFavorite: true }).toArray();

                if (favoriteMovies.length === 0) {
                    return res.status(404).send({ message: "No favorite movies found." });
                }

                res.send(favoriteMovies);
            } catch (err) {
                console.error("Error fetching favorite movies:", err);
                res.status(500).send({ message: "Failed to fetch favorite movies" });
            }
        });

        // Remove a movie from favorites
        app.delete("/removeFromFavorites/:id", async (req, res) => {
            const movieId = req.params.id;
            const query = { _id: new ObjectId(movieId) };

            try {
                // Update the movie's 'isFavorite' field to false
                const updateResult = await moviesDB.updateOne(query, {
                    $set: { isFavorite: false }
                });

                if (updateResult.modifiedCount === 0) {
                    return res.status(404).send({ message: "Movie not found or not a favorite" });
                }

                res.send({ message: "Movie removed from favorites!" });
            } catch (err) {
                console.error("Error removing from favorites:", err);
                res.status(500).send({ message: "Failed to remove from favorites" });
            }
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

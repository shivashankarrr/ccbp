const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const databasePath = path.join(__dirname, "moviesData.db");
let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//get all movies
app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `
    SELECT movie_name FROM movie`;
  const allMovies = await database.get(getAllMoviesQuery);
  response.send(convertDBObjectToResponseObject(allMovies));
});

// post movie
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postNewMovieQuery = `
    INSERT INTO movie
    (director_id,movie_name,lead_actor)
    VALUES(
        '${directorId}',
        '${movieName}',
        '${leadActor}'
    );`;
  await database.run(postNewMovieQuery);
  response.send("Movie Successfully Added");
});

//get movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
    *
    FROM
    movie
    WHERE 
    movie_id = ${movieId};`;
  const movieDetails = await database.get(getMovieQuery);
  response.send(convertDBObjectToResponseObject(movieDetails));
});

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
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
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

// update movie table
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieDetailsQuery = `
    UPDATE
    movie
    SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE
    movie_id = ${movieId};`;
  await database.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

//delete movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE
    FROM
    movie
    WHERE
    movie_id = ${movieId};`;
  await database.run(deleteQuery);
  response.send("Movie Removed");
});

//get all directors
app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `
    SELECT
    *
    FROM
    director;`;
  const allDirectors = await database.all(getAllDirectorsQuery);
  response.send(convertDBObjectToResponseObject(allDirectors));
});

//get director movies
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
    *
    FROM
    movie
    WHERE
    director_id = ${directorId};`;
  directorMovies = await database.get(getDirectorMoviesQuery);
  response.send(
    directorMovies.map((eachMovie) => ({
      directorId: eachMovie.director_id,
      directorName: eachMovie.directorName,
    }))
  );
});
module.exports = app;

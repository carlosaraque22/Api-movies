// Importando librerias para poder usar express
const express = require('express')
const app = express();
// Importando cors para permitir que postman y cualquier web pueda hacernos request
const cors = require('cors');
// Importando funciones usadas en los endpoints
const auth = require('./auth')
const movies = require('./movies');

app.use(express.json())
app.use(cors())

// Registrar usuarios y guardar en la base de datos
app.post('/auth/signup', auth.signUp)

// Login con usuario y contraseña para obtener el token que se usara para los demas endpoints
app.post('/auth/signin', auth.signIn)

// url para pedir peliculas aleatorias, si se manda una keyword se mandaran peliculas que tengan esa keyword, si no, se mandaran peliculas aleatorias
app.get('/movies', movies.getMoviesByKeyword)

// Url para guardar mis peliculas favoritas en una db
app.post('/movies/favorites', movies.addFavoriteMovies)

// Url para pedir las peliculas que tengo guardadas en favoritas
app.get('/movies/favorites', movies.getFavoriteMovies)

// Puerto en el cual correra nuestra api
const PORT = process.env.PORT || 8074

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
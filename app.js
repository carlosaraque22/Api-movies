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

// Endpoint para Registrar usuarios y guardarlos en la base de datos, utiliza la funcion signUp que es importada del archivo auth
app.post('/auth/signup', auth.signUp)

// Endpoint para realizar un Login con usuario y contraseña para obtener un token que se usara para los demas endpoints, utiliza la funcion signIn importada del archivo auth
app.post('/auth/signin', auth.signIn)

// Endpoint para pedir peliculas aleatorias, si el cliente manda una keyword, se devolveran peliculas que tengan esa keyword, si no, se mandaran peliculas aleatorias, utiliza la funcion getMoviesByKeyword importada del archivo movies
app.get('/movies', movies.getMoviesByKeyword)

// Endpoint que se encargara de guardar las peliculas favoritas de los usuarios en una db, utiliza la funcion addFavoriteMovies importada del archivo movies
app.post('/movies/favorites', movies.addFavoriteMovies)

// Endpopint para pedir las peliculas que los usuarios tienen guardadas en favoritos, utiliza la funcion getFavoriteMovies importada del archivo movies
app.get('/movies/favorites', movies.getFavoriteMovies)

// Puerto en el cual correra nuestra api
const PORT = process.env.PORT || 8074

// Le especificamos a nuestra api que escuche en el puerto que le pasamos a traves de la const PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
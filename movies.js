// Importando la libreria para usar el jwt
const jwt = require('jsonwebtoken');
// libreria para generar numeros randoms para el "suggestionScore"
const random = require('random');
// importando axios para hacer las request a la pagina themovies
const axios = require('axios').default;
// Libreria para obtener la fecha actual
const dateTime = require('node-datetime');
// Creando y dando formato a la fecha obtenida por la libreria
const dt = dateTime.create();
const formatted = dt.format('m-d-Y');
// Importando librerias que simularan la base de datos json para los favoritos
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');

// Inicializando la base de datos que se encargara de almacenar las peliculas favoritas de los usuarios
const favoritasDb = new JsonDB(new Config('./Favoritas', true, true, '/'));

/* Funcion que se encarga de hacer la request a la pagina de themoviedb.org, si el cliente pasa una keyword las peliculas enviadas al cliente 
 seran filtradas por esa keyword, si no pasan nada se enviaran al cliente peliculas aleatorias */
const getMoviesByKeyword = (req, res) => {
    try {
        const token = req.headers.token
        jwt.verify(token, 'secretkey', (error) => {
            if (error) {
                res.json("El usuario no esta logeado");
            } else {
                const parameters = req.query
                const keyword = parameters.keyword
                const page = parameters.page
                if (keyword) {
                    axios.get(
                            `https://api.themoviedb.org/3/search/movie?api_key=a55c741f30c031d381696c5b342d7713&query=${keyword}&page=${page}`
                        )
                        .then(function(response) {
                            // handle success
                            const movies = response.data
                            for (let i = 0; i < movies.results.length; i++) {
                                movies.results[i].suggestionScore = random.int((min = 0), (max = 99)) // Un entero entre el min y el max
                            }
                            movies.results.sort(function comparer(a, b) {
                                if (a.suggestionScore > b.suggestionScore) {
                                    return -1;
                                }
                                if (a.suggestionScore < b.suggestionScore) {
                                    return 1;
                                }
                                // Si a es igual a b
                                return 0;
                            });
                            res.send(
                                movies
                            )
                        })
                        .catch(function(error) {
                            res.send("Por favor introduzca una keyword valida")
                            console.log(error);
                        })
                        .then(function() {
                            // always executed
                        });
                } else {
                    axios.get(
                            `https://api.themoviedb.org/3/discover/movie?api_key=a55c741f30c031d381696c5b342d7713&page=${page}`
                        )
                        .then(function(response) {
                            // handle success
                            const movies = response.data
                            for (let i = 0; i < movies.results.length; i++) {
                                movies.results[i].suggestionScore = random.int((min = 0), (max = 99)) // Un entero entre el min y el max
                            }
                            movies.results.sort(function comparer(a, b) {
                                if (a.suggestionScore > b.suggestionScore) {
                                    return -1;
                                }
                                if (a.suggestionScore < b.suggestionScore) {
                                    return 1;
                                }
                                // si a es igual a b
                                return 0;
                            });
                            res.send(
                                movies
                            )
                        })
                        .catch(function(error) {
                            res.send("Por favor introduzca una keyword valida")
                            console.log(error);
                        })
                        .then(function() {
                            // always executed
                        });
                }
            }
        })
    } catch (error) {
        console.log(error)
    }
};

const addFavoriteMovies = (req, res) => {
    try {
        const token = req.headers.token
        jwt.verify(token, 'secretkey', (error) => {
            if (error) {
                res.json("El usuario no se encuentra autenticado");
            } else {
                const decoded = jwt.decode(token);
                const body = req.body
                const path = "/" + body.title
                const user = "/" + decoded.user
                body.addedAt = formatted
                favoritasDb.push(user + path, body)
                res.send("Pelicula guardada exitosamente en favoritos")
            }
        })
    } catch (error) {
        console.log(error)
        res.send("Ocurrio un error, intente de nuevo por favor")
    }
}

const getFavoriteMovies = (req, res) => {
    try {
        const token = req.headers.token
        jwt.verify(token, 'secretkey', (error) => {
            if (error) {
                res.json("El usuario no esta logeado");
            } else {
                const decoded = jwt.decode(token);
                const moviesdb = favoritasDb.getData("/")
                const movies = moviesdb[decoded.user]
                const dbfavoritas = Object.values(movies)
                for (let i = 0; i < dbfavoritas.length; i++) {
                    dbfavoritas[i].suggestionForTodayScore = random.int((min = 0), (max = 99)) // Un entero entre el min y el max

                }
                dbfavoritas.sort(function comparer(a, b) {
                    if (a.suggestionForTodayScore > b.suggestionForTodayScore) {
                        return -1;
                    }
                    if (a.suggestionForTodayScore < b.suggestionForTodayScore) {
                        return 1;
                    }
                    // si a es igual a b
                    return 0;
                });
                let moviesfav = ["Peliculas Favoritas"]
                for (let i = 0; i < dbfavoritas.length; i++) {
                    moviesfav.push(dbfavoritas[i])
                }
                res.send(moviesfav)
            }
        })
    } catch (error) {
        console.log(error)
        res.send("Ocurrio un error, por favor intentelo de nuevo")
    }
}
module.exports = { getMoviesByKeyword, addFavoriteMovies, getFavoriteMovies }
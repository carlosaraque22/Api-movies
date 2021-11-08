// Importando librerias para poder usar express
const express = require('express')
const app = express();
// Importando cors para permitir que postman y cualquier web pueda hacernos request
var cors = require('cors')
    // Importando libreria para usar json web token
const jwt = require('jsonwebtoken');
// Importando librerias para usar la base de datos json
const Database = require("easy-json-database");
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
// importando librerias para encriptar la password
const bcrypt = require('bcrypt');
const saltRounds = 10;
// importando axios para hacer las request a la pagina themovies
const axios = require('axios').default;
// libreria para generar numeros randoms para el "suggestionScore"
const random = require('random')
    // libreria para guardar la fecha actual
const dateTime = require('node-datetime');
const e = require('express');
const dt = dateTime.create();
const formatted = dt.format('m-d-Y');

app.use(express.json())
app.use(cors())

// Configuracion del archivo .json que hara de base de datos
const usuarios = new JsonDB(new Config('./Usuarios', true, true, '/'))
const favoritas = new Database("./Favoritas.json", {
    snapshots: {
        enabled: true,
        interval: 24 * 60 * 60 * 1000,
        folder: './backups/'
    }
});

// Endpoint para probar que la api esta en funcionamiento
app.get('/api', async(req, res) => {
    res.json({ status: 'ok' })
})

// Registrar usuarios y guardar en la base de datos
app.post('/api/registro', (req, res) => {
    try {
        const data = req.body
        const path = "/" + data.email
        const email = data.email
        const firstName = data.firstName
        const lastName = data.lastName
        const password = data.password
        const data1 = usuarios.getData("/")
        if (email !== undefined && email in data1) {
            res.send("El usuario ya se encuentra registrado")
        } else if (email !== undefined && firstName !== undefined && lastName !== undefined && password !== undefined) {
            bcrypt.hash(password, saltRounds, function(err, password) {
                usuarios.push(path, { firstName, lastName, password })
                res.send("Usuario registrado con éxito")
            });
        } else {
            res.send("Por favor introduzca correctamente todos los campos necesarios")
        }
    } catch (error) {
        console.log(error)
        res.send('Error al registrar el usuario')
    }
})

app.post('/api/login', (req, res) => {
    try {
        const data = req.body
        const email = data.email
        const data1 = usuarios.getData("/")
        if (email !== undefined) {
            if (email in data1) {
                const password1 = data.password
                bcrypt.compare(password1, data1[email].password, function(err, result) {
                    if (result) {
                        jwt.sign({ user: email }, 'secretkey', { expiresIn: '1h' }, (err, token) => {
                            if (token) {
                                res.json({
                                    token
                                })
                            } else {
                                console.log(err)
                                res.send("Error al iniciar sesión")
                            }
                        })
                    } else {
                        res.send("Usuario o contraseña incorrecta")
                    }
                    console.log(err)
                });
            } else {
                res.send("Este usuario no esta registrado")
            }
        } else {
            res.send("Por favor introduzca un usuario")
        }

    } catch (error) {
        console.log("Error al intentar correr el login")
    }
})

app.get('/api/movies', (req, res) => {
    try {
        const token = req.headers.token
        jwt.verify(token, 'secretkey', (error) => {
            if (error) {
                res.json("El usuario no esta logeado");
            } else {
                const parameters = req.query
                const keyword = parameters.keyword
                const page = parameters.page
                if (keyword && keyword !== "") {
                    axios.get(
                            `https://api.themoviedb.org/3/search/movie?api_key=a55c741f30c031d381696c5b342d7713&query=${keyword}&page=${page}`
                        )
                        .then(function(response) {
                            // handle success
                            const movies = response.data
                                // const numero = movies.total_results
                            for (let i = 0; i < movies.results.length; i++) {
                                movies.results[i].suggestionScore = random.int((min = 0), (max = 99)) // uniform integer in [ min, max ]
                            }
                            movies.results.sort(function comparer(a, b) {
                                if (a.suggestionScore > b.suggestionScore) {
                                    return -1;
                                }
                                if (a.suggestionScore < b.suggestionScore) {
                                    return 1;
                                }
                                // a must be equal to b
                                return 0;
                            });
                            console.log(movies);
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
                                // const numero = movies.total_results
                            for (let i = 0; i < movies.results.length; i++) {
                                movies.results[i].suggestionScore = random.int((min = 0), (max = 99)) // uniform integer in [ min, max ]
                            }
                            movies.results.sort(function comparer(a, b) {
                                if (a.suggestionScore > b.suggestionScore) {
                                    return -1;
                                }
                                if (a.suggestionScore < b.suggestionScore) {
                                    return 1;
                                }
                                // a must be equal to b
                                return 0;
                            });
                            console.log(movies);
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
})

app.post('/api/movies/favoritas', (req, res) => {
    try {
        const token = req.headers.token
        jwt.verify(token, 'secretkey', (error) => {
            if (error) {
                res.json("El usuario no esta logeado");
            } else {
                const data = req.body
                const path = data.title
                data.addedAt = formatted
                favoritas.set(path, data)
                res.send("Pelicula guardada exitosamente en favoritos")
            }
        })
    } catch (error) {
        console.log(error)
        res.send("Ocurrio un error, intente de nuevo por favor")
    }
})

app.get('/api/movies/getfavoritas', (req, res) => {
    try {
        const token = req.headers.token
        jwt.verify(token, 'secretkey', (error) => {
            if (error) {
                res.json("El usuario no esta logeado");
            } else {
                const data2 = favoritas.all();
                for (let i = 0; i < data2.length; i++) {
                    data2[i].data.suggestionForTodayScore = random.int((min = 0), (max = 99)) // uniform integer in [ min, max ]

                }
                data2.sort(function comparer(a, b) {
                    if (a.data.suggestionForTodayScore > b.data.suggestionForTodayScore) {
                        return -1;
                    }
                    if (a.data.suggestionForTodayScore < b.data.suggestionForTodayScore) {
                        return 1;
                    }
                    // a must be equal to b
                    return 0;
                });
                res.send(data2)
            }
        })
    } catch (error) {
        console.log(error)
        res.json("algo fallo")
    }
})

// Puerto en el cual correra nuestra api
const PORT = process.env.PORT || 8074

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
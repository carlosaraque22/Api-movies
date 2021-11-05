// Importando librerias para poder usar express
const express = require('express')
const app = express();
// Importando cors para permitir que postman y cualquier web pueda hacernos request
var cors = require('cors')
    // Importando libreria para usar json web token
const jwt = require('jsonwebtoken');
// Importando librerias para usar la base de datos json
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
// importando librerias para encriptar la password
const bcrypt = require('bcrypt');
const saltRounds = 10;
const axios = require('axios').default;

app.use(express.json())
app.use(cors())

// Configuracion del archivo .json que hara de base de datos
const db = new JsonDB(new Config('./Usuarios', true, false, '/'))

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
        const data1 = db.getData("/")
        if (email !== undefined && email in data1) {
            res.send("El usuario ya se encuentra registrado")
        } else if (email !== undefined && firstName !== undefined && lastName !== undefined && password !== undefined) {
            bcrypt.hash(password, saltRounds, function(err, password) {
                db.push(path, { firstName, lastName, password })
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
        const data1 = db.getData("/")
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
                if (keyword) {
                    axios.get(
                            `https://api.themoviedb.org/3/keyword/${keyword}/movies?api_key=a55c741f30c031d381696c5b342d7713`
                        )
                        .then(function(response) {
                            // handle success
                            res.json(response.data)
                            console.log(response.data.results[2]);
                        })
                        .catch(function(error) {
                            res.send("Algo fallo")
                            console.log(error);
                        })
                        .then(function() {
                            // always executed
                        });
                } else if (!keyword) {
                    console.log(keyword)
                    res.send("Por favor introduzca una keyword valida")
                } else {

                }
            }
        })
    } catch (error) {
        console.log(error)
    }
})

// Puerto en el cual correra nuestra api
const PORT = process.env.PORT || 8074

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
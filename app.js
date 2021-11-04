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

app.use(express.json())
app.use(cors())

// Configuracion del archivo .json que hara de base de datos
const db = new JsonDB(new Config('./Usuarios', true, false, '/'))

// Endpoint para probar que la api esta en funcionamiento
app.get('/api', async (req, res) => {
    res.json({ status: 'ok' })
})

// Registrar usuarios y guardar en la base de datos
app.post('/registro', (req, res) => {
    try {
        const data = req.body
        const path = "/" + data.email
        const email = data.email
        const firstName = data.firstName
        const lastName = data.lastName
        const password = data.password
        const data1 = db.getData("/")
        if (email in data1) {
            res.json("El usuario ya se encuentra registrado")
        } else {
            bcrypt.hash(password, saltRounds, function (err, password) {
                db.push(path, { firstName, lastName, password })
                res.json("Usuario registrado con éxito")
            });
        }
    } catch (error) {
        console.log(error)
        res.json('Error al registrar el usuario')
    }
})

app.post('/login', (req, res) => {
    try {
        const data = req.body
        const email = data.email
        const data1 = db.getData("/")
        if (email in data1) {
            const password1 = data.password
            bcrypt.compare(password1, data1[email].password, function (err, result) {
                if (result) {
                    jwt.sign({ user: email }, 'secretkey', {expiresIn: '1h'}, (err, token) => {
                        res.json({
                            token
                        })
                    })
                }
                else {
                    res.json("Email o Password incorrecta")
                }
            });
        }
        else {
            res.json("Este usuario no esta registrado")
        }
    } catch (error) {
        console.log("Error al intentar correr el login")
    }
})

// Puerto en el cual correra nuestra api
const PORT = process.env.PORT || 8074

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
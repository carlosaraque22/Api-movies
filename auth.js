// Importando librerias para el db json usuarios
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
// Importando la libreria para usar el jwt
const jwt = require('jsonwebtoken');
// importando librerias para encriptar la password
const bcrypt = require('bcrypt');
// El numero de saltos que tendra la password al ser encriptada
const saltRounds = 10;

const usersDb = new JsonDB(new Config('./users', true, true, '/'));

/* Funcion que se encarga de guardar el usuario y sus datos en la db(usersDb), devuelve exitoso si logra encriptar la contraseña 
y almacenarla en la db, si falla devuelve error */
const signUp = (req, res) => {
    try {
        const body = req.body
        const path = "/" + body.email
        const email = body.email
        const firstName = body.firstName
        const lastName = body.lastName
        const password = body.password
        const dbUsuarios = usersDb.getData("/")
        if (email !== undefined && email in dbUsuarios) {
            res.send("El usuario ya se encuentra registrado")
        } else if (email !== undefined && firstName !== undefined && lastName !== undefined && password !== undefined) {
            bcrypt.hash(password, saltRounds, function(err, password) {
                usersDb.push(path, { firstName, lastName, password })
                res.send("Usuario registrado con éxito")
                if (err) {
                    console.log(err)
                    res.send("Ocurrio un error, intentelo de nuevo por favor")
                }
            });
        } else {
            res.send("Por favor introduzca correctamente todos los campos necesarios")
        }
    } catch (error) {
        console.log(error)
        res.send("Error al registrar el usuario")
    }
}

/* Funcion que se encarga de verificar que el passowrd e email pasados por el cliente son correctos,
si son correctos devuelve un token el cual sera necesarios para los endpoints de movies, si alguno de los datos es incorrecto devuelve un error */
const signIn = (req, res) => {
    try {
        const body = req.body
        const email = body.email
        if (email !== undefined) {
            const dbusers = usersDb.getData("/")
            if (email in dbusers) {
                const password = body.password
                bcrypt.compare(password, dbusers[email].password, function(err, result) {
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
                        console.log(err)
                    }
                });
            } else {
                res.send("Este usuario no esta registrado")
            }
        } else {
            res.send("Por favor introduzca un usuario")
        }

    } catch (error) {
        console.log(error)
        res.send("Ocurrio un error inesperado")
    }
}

// Exportando las funciones para luego importarlas en el app.js
module.exports = { signUp, signIn }
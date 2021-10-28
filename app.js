const express = require('express')
const app = express();
var cors = require('cors')
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.json())
app.use(cors())

const db = new JsonDB(new Config('./Usuarios', true, false, '/'))

app.get('/api', async (req, res) => {
    res.json({ status: 'ok' })
})
// Registrar usuarios y guardar en la base de datos
app.post('/registro', (req, res) => {
    const id = uuid.v4()
    try {
        const path = `/usuario/`
        const datos = req.body
        const user = datos.user
        var data1 = db.getData("/usuario");
        if (data1 === user) {
            console.log("Este usuario ya existe")
            res.json(" Este usuario ya existe ")
        } else {
            const password = datos.password
            db.push(path, { user, password })
            res.json({ user, password })
        }
    } catch (error) {
        console.log(error)
        res.json('Error al registrar el usuario')
    }
})

const PORT = process.env.PORT || 8074

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
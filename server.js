const express = require("express")

const talleres = require("./Controlador/talleres_controlador")
const asistencia = require("./Controlador/asistencia_controlador")
const usuarios = require("./Controlador/usuario_controlador")

const app = express()

app.use(express.json())

const PORT = 4000

//ejemplo de una peticion por medio de una ruta principal GET
app.get('/saludo', (req, res) => {
    res.json({mensaje: "Hola, esto es una prueba en GET"})
})

app.post("/eco", (req, res) => {
    const {texto} = req.body
    if(!texto){
        return res.status(400).json({error: "El texto es obligatorio"})
    }
    res.status(201).json({eco: texto})
})

app.get("/talleres", talleres.listarTalleres)
app.get("/talleres/:id", talleres.obtenerTaller)
app.post("/talleres/registrar", talleres.registrarAlumno)

app.post("/asistencias", asistencia.registrarAsistencia)
app.get("/asistencias/:tallerId", asistencia.consultarAsistencias)

app.get("/usuarios", usuarios.listarUsuarios)
app.get("/usuarios/:id", usuarios.obtenerUsuario)

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})
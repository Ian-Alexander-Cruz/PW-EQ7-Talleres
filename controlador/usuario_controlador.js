const bcrypt = require("bcryptjs")

const usuariosModel = require("../modelo/usuario_modelo")

const {validarCorreo, validarBoleta, validarContraseña} = require("../validaciones")

function esDuplicado(error){
    return error.code === "ER_DUP_ENTRY" || error.code === "23505"
}

async function listarUsuarios(req, res) {
    try{
        const usuarios = await usuariosModel.listar();
        res.json(usuarios)
    }catch {
        res.status(500).json({error: error.message})
    }
}

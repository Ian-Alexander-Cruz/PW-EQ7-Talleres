//vamos a dejarles 2 de las 3 funciones para validar
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexBoleta = /^20[2-3]\d(0[1-9]|1[0-5])\d{4}$/;

function validarCorreo(correo){
    return regexEmail.test(correo)
}

function validarBoleta(boleta){
    return regexBoleta.test(boleta)
}


function validarContrasena(contrasena){
    if (typeof contrasena !== "string") return false
    return contrasena.length >= 8
}

function validarNombre(nombre) {
    if (typeof nombre !== "string") return false;

    nombre = nombre.trim();

    if (nombre.length === 0 || nombre.length > 50) {
        return false;
    }

    return /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre);
}

module.exports = {validarBoleta, validarContrasena, validarCorreo, validarNombre}
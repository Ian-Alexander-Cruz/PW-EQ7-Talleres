const bcrypt = require('bcryptjs');

const AsistenciaModel = require('../Modelo/asistencia_modelo');

async function registrarAsistencia(req, res) {
    try {
        const nuevaAsistencia = await AsistenciaModel.registrarAsistencia(req.body);
        res.status(201).json(nuevaAsistencia);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

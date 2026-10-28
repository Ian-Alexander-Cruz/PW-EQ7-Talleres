const bcrypt = require('bcryptjs');

const AsistenciaModel = require('../Modelo/asistencia_modelo');

async function registrarAsistencia(req, res) {
    const { taller_id, nombre_alumno, boleta } = req.body;
    if (!taller_id || !nombre_alumno || !boleta) {
        return res.status(400).json({ error: 'taller_id, nombre_alumno y boleta son obligatorios' });
    }

    try{
        if (await AsistenciaModel.existeAsistencia({ boleta })) {
            return res.status(409).json({ error: 'El alumno ya estaba registrado en un taller o en otro taller' });
        }

        const asistencia = await AsistenciaModel.registrarAsistencia({ 
            tallerId: taller_id, 
            nombreAlumno: nombre_alumno, 
            boleta 
        });
        res.status(201).json(asistencia);
    }catch (error) {
        res.status(500).json({ error: error.message });
    } 
}

async function listarAsistenciasDeTaller(req, res) {
    try {
        const tallerId = req.params.id;
        const asistencias = await AsistenciaModel.consultarAsistenciasPorTaller(tallerId);
        res.json(asistencias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {registrarAsistencia, listarAsistenciasDeTaller};
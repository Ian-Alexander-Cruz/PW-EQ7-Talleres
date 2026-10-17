const bcrypt = require('bcryptjs');

const TalleresModel = require('../Modelo/talleres_modelo');

async function listarTalleres(req, res){
    try{
        const talleres = await talleressModel.listar();
        res.json(talleres);
    } catch {
        res.status(500).json({error: error.message});
    }
    
}
async function obtenerTaller(req, res) {
    try{
        const taller = await UsuariosModel.obtenerPorId(req.params.id);
        if(!taller) return res.status(404).json({error : 'Taller no encontrado'});
        res.json(taller);
    } catch (error){
        res.status(500).json({error: error.message});
    }
}
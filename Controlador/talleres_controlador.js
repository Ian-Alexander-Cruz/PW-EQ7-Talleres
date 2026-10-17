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

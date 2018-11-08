const express = require('express');

const app = express();

const fs = require('fs');
const path = require('path');

const { verificaToken } = require('../middlewares/auth');

app.get('/imagen/:tipo/:img', verificaToken, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    // Valida tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            error: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', ')
            }
        })
    }

    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        let pathNoImagen = path.resolve(__dirname, `../assets/no-image.jpg`);
        res.sendFile(pathNoImagen);
    }

});

module.exports = app;
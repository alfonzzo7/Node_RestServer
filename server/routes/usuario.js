const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');
const { verificaToken, verificaAdmin } = require('../middlewares/auth');

const app = express();

app.get('/usuarios', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: {
                        message: err
                    }
                });
            }

            Usuario.count({ estado: true }, (err, total) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        error: {
                            message: err
                        }
                    });
                }

                res.json({
                    ok: true,
                    usuarios: usuarios,
                    total: total
                });
            });
        });
});

app.post('/usuarios', [verificaToken, verificaAdmin], (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: {
                    message: err
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.put('/usuarios/:id', [verificaToken, verificaAdmin], (req, res) => {
    let validParams = ['nombre', 'img', 'role', 'estado'];

    let id = req.params.id;
    let body = _.pick(req.body, validParams);

    let options = {
        new: true,
        runValidators: true
    };

    Usuario.findByIdAndUpdate(id, body, options, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: {
                    message: err
                }
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.delete('/usuarios/:id', [verificaToken, verificaAdmin], (req, res) => {
    let id = req.params.id;

    let eliminar = req.query.eliminar || false;
    eliminar = Boolean(eliminar);

    if (eliminar) {
        Usuario.findByIdAndRemove(id, (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: {
                        message: err
                    }
                });
            }

            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    error: {
                        message: 'Usuario no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                usuario: usuarioDB,
                message: 'Usuario Eliminado'
            });
        });
    } else {
        let options = {
            new: true
        };

        Usuario.findByIdAndUpdate(id, { estado: false }, options, (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: {
                        message: err
                    }
                });
            }

            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    error: {
                        message: 'Usuario no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                usuario: usuarioDB,
                message: 'Usuario Dado de Baja'
            });
        });
    }

});

module.exports = app;
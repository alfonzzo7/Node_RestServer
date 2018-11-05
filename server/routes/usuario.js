const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');

const app = express();

app.get('/usuarios', function(req, res) {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    error: err
                });
            }

            Usuario.count({ estado: true }, (err, total) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        error: err
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

app.post('/usuarios', function(req, res) {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.put('/usuarios/:id', function(req, res) {
    let validParams = ['nombre', 'img', 'role', 'estado'];

    let id = req.params.id;
    let body = _.pick(req.body, validParams);

    let options = {
        new: true,
        runValidators: true
    };

    Usuario.findByIdAndUpdate(id, body, options, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
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

app.delete('/usuarios/:id', function(req, res) {
    let id = req.params.id;

    let eliminar = req.query.eliminar || false;
    eliminar = Boolean(eliminar);

    if (eliminar) {
        Usuario.findByIdAndRemove(id, (err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    error: err
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
    } else {
        let options = {
            new: true
        };

        Usuario.findByIdAndUpdate(id, { estado: false }, options, (err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    error: err
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
    }

});

module.exports = app;
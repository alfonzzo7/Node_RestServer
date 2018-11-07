const express = require('express');

const Categoria = require('../models/categoria');
const { verificaToken, verificaAdmin } = require('../middlewares/auth');

const app = express();

//=============================================================
// Mostrar Categorias
//=============================================================
app.get('/categorias', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: {
                        message: err
                    }
                });
            }

            Categoria.count({}, (err, total) => {
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
                    categorias: categorias,
                    total: total
                });
            });
        });
});

//=============================================================
// Mostrar Categoria por ID
//=============================================================
app.get('/categorias/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Categoria.find({ _id: id })
        .populate('usuario', 'nombre email')
        .exec((err, categoria) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: {
                        message: err
                    }
                });
            }

            if (!categoria) {
                return res.status(400).json({
                    ok: false,
                    error: {
                        message: 'Categoria no encontrada'
                    }
                });
            }

            res.json({
                ok: true,
                categoria: categoria
            });

        });
});

//=============================================================
// Crear Categoria
//=============================================================
app.post('/categorias', [verificaToken, verificaAdmin], (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario
    });

    categoria.save((err, categoriaDB) => {
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
            categoria: categoriaDB
        });
    });
});

//=============================================================
// Actualizar Categoria
//=============================================================
app.put('/categorias/:id', [verificaToken, verificaAdmin], (req, res) => {
    let id = req.params.id;

    let categoria = {
        descripcion: req.body.descripcion,
        usuario: req.usuario
    };

    let options = {
        new: true,
        runValidators: true,
        context: 'query'
    };

    Categoria.findByIdAndUpdate(id, categoria, options, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: {
                    message: err
                }
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//=============================================================
// Borrar Categoria
//=============================================================
app.delete('/categorias/:id', [verificaToken, verificaAdmin], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: {
                    message: err
                }
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
            message: 'Categoria Eliminado'
        });
    });
});

module.exports = app;
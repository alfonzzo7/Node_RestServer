const express = require('express');

const Producto = require('../models/producto');
const { verificaToken } = require('../middlewares/auth');

const app = express();

//=============================================================
// Obtener Productos
//=============================================================
app.get('/productos', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: {
                        message: err
                    }
                });
            }

            Producto.count({ disponible: true }, (err, total) => {
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
                    productos: productos,
                    total: total
                });
            });
        });
});

//=============================================================
// Obtener Producto por ID
//=============================================================
app.get('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Producto.find({ _id: id })
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, producto) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: {
                        message: err
                    }
                });
            }

            if (!producto) {
                return res.status(400).json({
                    ok: false,
                    error: {
                        message: 'Producto no encontrada'
                    }
                });
            }

            res.json({
                ok: true,
                producto: producto
            });

        });
});

//=============================================================
// Obtener Productos
//=============================================================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .sort('nombre')
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: {
                        message: err
                    }
                });
            }

            Producto.count({ nombre: regex }, (err, total) => {
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
                    productos: productos,
                    total: total
                });
            });
        });
});

//=============================================================
// Crear Producto
//=============================================================
app.post('/productos', verificaToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: Number(body.precioUni),
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario
    });

    producto.save((err, productoDB) => {
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
            producto: productoDB
        });
    });
});

//=============================================================
// Actualizar Producto
//=============================================================
app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let body = req.body;

    let producto = {
        nombre: body.nombre,
        precioUni: Number(body.precioUni),
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario
    };

    let options = {
        new: true,
        runValidators: true,
        context: 'query'
    };

    Producto.findByIdAndUpdate(id, producto, options, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: {
                    message: err
                }
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

//=============================================================
// Borrar Producto
//=============================================================
app.delete('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let options = {
        new: true
    };

    Producto.findByIdAndUpdate(id, { disponible: false, usuario: req.usuario }, options, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: {
                    message: err
                }
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB,
            message: 'Producto Dado de Baja'
        });
    });
});

module.exports = app;
//=============================================================
// Puerto
//=============================================================
process.env.PORT = process.env.PORT || 3000;

//=============================================================
// Entorno
//=============================================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//=============================================================
// BBDD
//=============================================================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

//=============================================================
// Vencimiento Token
//=============================================================
process.env.CADUCIDAD_TOKEN = '30d';

//=============================================================
// SEED autenticación
//=============================================================
process.env.SEED = process.env.SEED || 'secret-desarrollo';

//=============================================================
// Google Client ID
//=============================================================
process.env.CLIENT_ID = process.env.CLIENT_ID || '1087576169748-a9k8n3dsqvef1eln9pgpg722j99b0ofp.apps.googleusercontent.com';
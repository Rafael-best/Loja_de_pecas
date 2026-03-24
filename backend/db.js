const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "admin", 
    database: "loja_pecas",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exporta permitindo usar await/async
module.exports = pool.promise();

const db = require('./db');

async function testarBanco() {
    try {
        const [result] = await db.query('SELECT 1');
        console.log('✅ Conectado ao banco!');
        console.log(result);
    } catch (erro) {
        console.error('❌ Erro na conexão:');
        console.error(erro);
    }
}

testarBanco();
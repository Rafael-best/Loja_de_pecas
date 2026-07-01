const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,

    user: 'root',
    password: 'root',

    database: 'loja_pecas',

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    charset: 'utf8mb4'
});

// Teste automático da conexão
(async () => {
    try {

        const connection = await pool.getConnection();

        console.log('====================================');
        console.log('✅ Banco de dados conectado!');
        console.log('Database: loja_pecas');
        console.log('====================================');

        connection.release();

    } catch (erro) {

        console.error('====================================');
        console.error('❌ Erro ao conectar ao MySQL');
        console.error(erro.message);
        console.error('====================================');

    }
})();

module.exports = pool;
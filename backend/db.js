require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Teste automático da conexão
(async () => {
    try {

        const connection = await pool.connect();

        console.log('====================================');
        console.log('✅ Banco de dados conectado!');
        console.log('🐘 PostgreSQL');
        console.log('🗄️ Database: loja_pecas');
        console.log('====================================');

        connection.release();

    } catch (erro) {

        console.error('====================================');
        console.error('❌ Erro ao conectar ao PostgreSQL');
        console.error('====================================');
        console.error(erro.message);
        console.error('====================================');

    }
})();

module.exports = pool;
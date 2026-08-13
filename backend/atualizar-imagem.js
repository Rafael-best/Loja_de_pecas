const db = require('./db');

async function atualizarImagem() {
    try {

        const urlImagem =
            'https://topyijkvygoprbitwlwa.supabase.co/storage/v1/object/public/produtos/Rolamento%206204.jpg';

        const update = await db.query(`
            UPDATE produtos
            SET imagem_produto = $1
            WHERE id_produto = 1
            RETURNING id_produto, nome_produto, imagem_produto
        `, [urlImagem]);

        console.log('====================================');
        console.log('✅ IMAGEM ATUALIZADA');
        console.log('====================================');
        console.log(update.rows[0]);

        const consulta = await db.query(`
            SELECT
                id_produto,
                nome_produto,
                imagem_produto
            FROM produtos
            WHERE id_produto = 1
        `);

        console.log('====================================');
        console.log('🔎 VERIFICAÇÃO');
        console.log('====================================');
        console.log(consulta.rows[0]);

        await db.end();

    } catch (erro) {

        console.error('====================================');
        console.error('❌ ERRO');
        console.error('====================================');
        console.error(erro);

        process.exit(1);
    }
}

atualizarImagem();
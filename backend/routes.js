const express = require('express');
const router = express.Router();
const db = require('./db');

// =====================================================
// CLIENTES
// =====================================================

// LISTAR CLIENTES
router.get('/clientes', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM clientes ORDER BY id_cliente'
        );

        res.json(result.rows);

    } catch (err) {
        console.error('Erro ao listar clientes:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});


// CADASTRAR CLIENTE
router.post('/clientes', async (req, res) => {
    try {

        const {
            nome_cliente,
            endereco_cliente,
            telefone_cliente,
            email_cliente,
            senha_cliente
        } = req.body;

        const sql = `
            INSERT INTO clientes
            (
                nome_cliente,
                endereco_cliente,
                telefone_cliente,
                email_cliente,
                senha_cliente
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const result = await db.query(sql, [
            nome_cliente,
            endereco_cliente,
            telefone_cliente,
            email_cliente,
            senha_cliente
        ]);

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error('Erro ao cadastrar cliente:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});


// LOGIN CLIENTE
router.post('/login', async (req, res) => {
    try {

        const {
            email_cliente,
            senha_cliente
        } = req.body;

        const sql = `
            SELECT *
            FROM clientes
            WHERE email_cliente = $1
            AND senha_cliente = $2
        `;

        const result = await db.query(sql, [
            email_cliente,
            senha_cliente
        ]);

        if (result.rows.length > 0) {

            res.json({
                success: true,
                user: result.rows[0]
            });

        } else {

            res.json({
                success: false,
                message: 'Login inválido'
            });

        }

    } catch (err) {

        console.error('Erro no login:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});


// =====================================================
// FORNECEDORES
// =====================================================

// LISTAR FORNECEDORES
router.get('/fornecedores', async (req, res) => {
    try {

        const result = await db.query(
            'SELECT * FROM fornecedores ORDER BY id_fornecedor'
        );

        res.json(result.rows);

    } catch (err) {

        console.error('Erro ao listar fornecedores:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});


// CADASTRAR FORNECEDOR
router.post('/fornecedores', async (req, res) => {
    try {

        const {
            nome_fornecedor,
            endereco_fornecedor,
            telefone_fornecedor,
            email_fornecedor
        } = req.body;

        const sql = `
            INSERT INTO fornecedores
            (
                nome_fornecedor,
                endereco_fornecedor,
                telefone_fornecedor,
                email_fornecedor
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const result = await db.query(sql, [
            nome_fornecedor,
            endereco_fornecedor,
            telefone_fornecedor,
            email_fornecedor
        ]);

        res.status(201).json(result.rows[0]);

    } catch (err) {

        console.error('Erro ao cadastrar fornecedor:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});


// =====================================================
// PRODUTOS
// =====================================================

// LISTAR PRODUTOS
router.get('/produtos', async (req, res) => {

    try {

        const sql = `
            SELECT
                p.*,
                f.nome_fornecedor
            FROM produtos p
            LEFT JOIN fornecedores f
                ON p.id_fornecedor = f.id_fornecedor
            ORDER BY p.id_produto
        `;

        const result = await db.query(sql);

        console.log(
            'Produtos encontrados:',
            result.rows.length
        );

        res.json(result.rows);

    } catch (err) {

        console.error(
            'ERRO AO LISTAR PRODUTOS:',
            err
        );

        res.status(500).json({
            success: false,
            erro: err.message
        });
    }
});


// CADASTRAR PRODUTO
router.post('/produtos', async (req, res) => {
    try {

        const {
            nome_produto,
            descricao_produto,
            preco_produto,
            quantidade_estoque,
            id_fornecedor,
            imagem_produto
        } = req.body;

        const sql = `
            INSERT INTO produtos
            (
                nome_produto,
                descricao_produto,
                preco_produto,
                quantidade_estoque,
                id_fornecedor,
                imagem_produto
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await db.query(sql, [
            nome_produto,
            descricao_produto,
            preco_produto,
            quantidade_estoque,
            id_fornecedor,
            imagem_produto || null
        ]);

        res.status(201).json(result.rows[0]);

    } catch (err) {

        console.error('Erro ao cadastrar produto:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});


// =====================================================
// PEDIDOS
// =====================================================

// LISTAR PEDIDOS
router.get('/pedidos', async (req, res) => {
    try {

        const sql = `
            SELECT
                p.*,
                c.nome_cliente
            FROM pedidos p
            LEFT JOIN clientes c
                ON p.id_cliente = c.id_cliente
            ORDER BY p.id_pedido DESC
        `;

        const result = await db.query(sql);

        res.json(result.rows);

    } catch (err) {

        console.error('Erro ao listar pedidos:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});


// BUSCAR PEDIDO POR ID COM ITENS
router.get('/pedidos/:id', async (req, res) => {
    try {

        const { id } = req.params;

        const pedidoResult = await db.query(`
            SELECT
                p.*,
                c.nome_cliente
            FROM pedidos p
            LEFT JOIN clientes c
                ON p.id_cliente = c.id_cliente
            WHERE p.id_pedido = $1
        `, [id]);

        if (pedidoResult.rows.length === 0) {

            return res.status(404).json({
                erro: 'Pedido não encontrado'
            });

        }

        const itensResult = await db.query(`
            SELECT
                i.*,
                pr.nome_produto
            FROM itens_pedido i
            LEFT JOIN produtos pr
                ON i.id_produto = pr.id_produto
            WHERE i.id_pedido = $1
        `, [id]);

        res.json({
            pedido: pedidoResult.rows[0],
            itens: itensResult.rows
        });

    } catch (err) {

        console.error('Erro ao buscar pedido:', err);

        res.status(500).json({
            erro: err.message
        });
    }
});


// CRIAR PEDIDO
router.post('/pedidos', async (req, res) => {

    try {

        const {
            id_cliente,
            forma_pagamento,
            status_pedido,
            total_pedido
        } = req.body;


        // Verificar cliente
        const clienteResult = await db.query(
            'SELECT * FROM clientes WHERE id_cliente = $1',
            [id_cliente]
        );


        if (clienteResult.rows.length === 0) {

            return res.status(404).json({
                erro: 'Cliente não encontrado'
            });

        }


        const sql = `
            INSERT INTO pedidos
            (
                id_cliente,
                data_pedido,
                forma_pagamento,
                status_pedido,
                total_pedido
            )
            VALUES (
                $1,
                NOW(),
                $2,
                $3,
                $4
            )
            RETURNING *
        `;


        const result = await db.query(sql, [
            id_cliente,
            forma_pagamento || null,
            status_pedido || 'Pendente',
            total_pedido || 0
        ]);


        res.status(201).json({
            message: 'Pedido criado com sucesso',
            id_pedido: result.rows[0].id_pedido,
            pedido: result.rows[0]
        });


    } catch (err) {

        console.error(
            'Erro ao criar pedido:',
            err
        );

        res.status(500).json({
            erro: err.message || 'Erro ao criar pedido'
        });
    }
});


// =====================================================
// ITENS DO PEDIDO
// =====================================================

// ADICIONAR ITEM AO PEDIDO
router.post('/pedidos/:id/itens', async (req, res) => {

    const client = await db.connect();

    try {

        const { id } = req.params;

        const {
            id_produto,
            quantidade
        } = req.body;


        if (
            !quantidade ||
            Number(quantidade) <= 0
        ) {

            return res.status(400).json({
                erro: 'Quantidade inválida'
            });

        }


        await client.query('BEGIN');


        // Verificar pedido
        const pedidoResult = await client.query(
            'SELECT * FROM pedidos WHERE id_pedido = $1',
            [id]
        );


        if (pedidoResult.rows.length === 0) {

            await client.query('ROLLBACK');

            return res.status(404).json({
                erro: 'Pedido não encontrado'
            });

        }


        if (
            pedidoResult.rows[0].status_pedido ===
            'Cancelado'
        ) {

            await client.query('ROLLBACK');

            return res.status(400).json({
                erro: 'Não é possível alterar um pedido cancelado'
            });

        }


        // Buscar produto
        const produtoResult = await client.query(
            'SELECT * FROM produtos WHERE id_produto = $1',
            [id_produto]
        );


        if (produtoResult.rows.length === 0) {

            await client.query('ROLLBACK');

            return res.status(404).json({
                erro: 'Produto não encontrado'
            });

        }


        const produto = produtoResult.rows[0];


        if (
            Number(produto.quantidade_estoque) <
            Number(quantidade)
        ) {

            await client.query('ROLLBACK');

            return res.status(400).json({
                erro: 'Estoque insuficiente'
            });

        }


        const preco =
            produto.preco_produto;


        // Inserir item
        await client.query(`
            INSERT INTO itens_pedido
            (
                id_pedido,
                id_produto,
                quantidade,
                preco_unitario
            )
            VALUES ($1, $2, $3, $4)
        `, [
            id,
            id_produto,
            quantidade,
            preco
        ]);


        // Baixar estoque
        await client.query(`
            UPDATE produtos
            SET quantidade_estoque =
                quantidade_estoque - $1
            WHERE id_produto = $2
        `, [
            quantidade,
            id_produto
        ]);


        // Atualizar total do pedido
        await client.query(`
            UPDATE pedidos
            SET total_pedido = (
                SELECT COALESCE(
                    SUM(
                        quantidade *
                        preco_unitario
                    ),
                    0
                )
                FROM itens_pedido
                WHERE id_pedido = $1
            )
            WHERE id_pedido = $2
        `, [
            id,
            id
        ]);


        await client.query('COMMIT');


        res.json({
            message: 'Item adicionado com sucesso'
        });


    } catch (err) {

        await client.query('ROLLBACK');

        console.error(
            'Erro ao adicionar item:',
            err
        );

        res.status(500).json({
            erro: err.message ||
                'Erro ao adicionar item'
        });

    } finally {

        client.release();

    }
});


// =====================================================
// ATUALIZAR STATUS DO PEDIDO
// =====================================================

router.patch('/pedidos/:id/status', async (req, res) => {

    try {

        const { id } = req.params;
        const { status } = req.body;


        if (!status) {

            return res.status(400).json({
                erro: 'Status é obrigatório'
            });

        }


        const pedidoResult = await db.query(
            'SELECT * FROM pedidos WHERE id_pedido = $1',
            [id]
        );


        if (pedidoResult.rows.length === 0) {

            return res.status(404).json({
                erro: 'Pedido não encontrado'
            });

        }


        await db.query(`
            UPDATE pedidos
            SET status_pedido = $1
            WHERE id_pedido = $2
        `, [
            status,
            id
        ]);


        res.json({
            message: 'Status atualizado com sucesso'
        });


    } catch (err) {

        console.error(
            'Erro ao atualizar status:',
            err
        );

        res.status(500).json({
            erro: err.message
        });
    }
});


// =====================================================
// CANCELAR PEDIDO
// =====================================================

router.patch('/pedidos/:id/cancelar', async (req, res) => {

    const client = await db.connect();

    try {

        const { id } = req.params;

        await client.query('BEGIN');


        const pedidoResult = await client.query(
            'SELECT * FROM pedidos WHERE id_pedido = $1',
            [id]
        );


        if (pedidoResult.rows.length === 0) {

            await client.query('ROLLBACK');

            return res.status(404).json({
                erro: 'Pedido não encontrado'
            });

        }


        if (
            pedidoResult.rows[0].status_pedido ===
            'Cancelado'
        ) {

            await client.query('ROLLBACK');

            return res.status(400).json({
                erro: 'Pedido já está cancelado'
            });

        }


        // Buscar itens
        const itensResult = await client.query(`
            SELECT *
            FROM itens_pedido
            WHERE id_pedido = $1
        `, [id]);


        // Devolver estoque
        for (
            const item of itensResult.rows
        ) {

            await client.query(`
                UPDATE produtos
                SET quantidade_estoque =
                    quantidade_estoque + $1
                WHERE id_produto = $2
            `, [
                item.quantidade,
                item.id_produto
            ]);

        }


        // Cancelar pedido
        await client.query(`
            UPDATE pedidos
            SET status_pedido = 'Cancelado'
            WHERE id_pedido = $1
        `, [id]);


        await client.query('COMMIT');


        res.json({
            message: 'Pedido cancelado com sucesso'
        });


    } catch (err) {

        await client.query('ROLLBACK');

        console.error(
            'Erro ao cancelar pedido:',
            err
        );

        res.status(500).json({
            erro: err.message
        });

    } finally {

        client.release();

    }
});


// =====================================================
// ITENS DO PEDIDO
// =====================================================

// LISTAR TODOS OS ITENS
router.get('/itens', async (req, res) => {

    try {

        const sql = `
            SELECT
                i.*,
                p.nome_produto
            FROM itens_pedido i
            LEFT JOIN produtos p
                ON i.id_produto = p.id_produto
            ORDER BY i.id_item
        `;

        const result = await db.query(sql);

        res.json(result.rows);

    } catch (err) {

        console.error(
            'Erro ao listar itens:',
            err
        );

        res.status(500).json({
            erro: err.message
        });
    }
});


// CADASTRO DIRETO DE ITEM
router.post('/itens', async (req, res) => {

    try {

        const {
            id_pedido,
            id_produto,
            quantidade,
            preco_unitario
        } = req.body;


        const sql = `
            INSERT INTO itens_pedido
            (
                id_pedido,
                id_produto,
                quantidade,
                preco_unitario
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;


        const result = await db.query(sql, [
            id_pedido,
            id_produto,
            quantidade,
            preco_unitario
        ]);


        res.status(201).json(
            result.rows[0]
        );


    } catch (err) {

        console.error(
            'Erro ao cadastrar item:',
            err
        );

        res.status(500).json({
            erro: err.message
        });
    }
});


// =====================================================
// EXPORTAR
// =====================================================

module.exports = router;
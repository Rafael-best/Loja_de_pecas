const express = require('express');
const router = express.Router();
const db = require('./db'); // conexão com PostgreSQL

// =====================
// CLIENTES
// =====================

// LISTAR CLIENTES
router.get('/clientes', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM clientes');
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao listar clientes:', err);
        res.status(500).json({
            success: false,
            error: err.message
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

        res.json(result.rows[0]);

    } catch (err) {
        console.error('Erro ao cadastrar cliente:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


// LOGIN
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
            success: false,
            error: err.message
        });
    }
});


// =====================
// FORNECEDORES
// =====================

// LISTAR FORNECEDORES
router.get('/fornecedores', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM fornecedores'
        );

        res.json(result.rows);

    } catch (err) {
        console.error('Erro ao listar fornecedores:', err);
        res.status(500).json({
            success: false,
            error: err.message
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

        res.json(result.rows[0]);

    } catch (err) {
        console.error('Erro ao cadastrar fornecedor:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


// =====================
// PRODUTOS
// =====================

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
        `;

        const result = await db.query(sql);

        res.json(result.rows);

    } catch (err) {
        console.error('Erro ao listar produtos:', err);
        res.status(500).json({
            success: false,
            error: err.message
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
            id_fornecedor
        } = req.body;

        const sql = `
            INSERT INTO produtos
            (
                nome_produto,
                descricao_produto,
                preco_produto,
                quantidade_estoque,
                id_fornecedor
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const result = await db.query(sql, [
            nome_produto,
            descricao_produto,
            preco_produto,
            quantidade_estoque,
            id_fornecedor
        ]);

        res.json(result.rows[0]);

    } catch (err) {
        console.error('Erro ao cadastrar produto:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


// =====================
// PEDIDOS
// =====================

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
        `;

        const result = await db.query(sql);

        res.json(result.rows);

    } catch (err) {
        console.error('Erro ao listar pedidos:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


// CADASTRAR PEDIDO
router.post('/pedidos', async (req, res) => {
    try {
        const {
            id_cliente,
            data_pedido,
            forma_pagamento,
            status_pedido,
            total_pedido
        } = req.body;

        const sql = `
            INSERT INTO pedidos
            (
                id_cliente,
                data_pedido,
                forma_pagamento,
                status_pedido,
                total_pedido
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const result = await db.query(sql, [
            id_cliente,
            data_pedido,
            forma_pagamento,
            status_pedido,
            total_pedido
        ]);

        res.json(result.rows[0]);

    } catch (err) {
        console.error('Erro ao cadastrar pedido:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


// =====================
// ITENS DO PEDIDO
// =====================

// LISTAR ITENS
router.get('/itens', async (req, res) => {
    try {
        const sql = `
            SELECT
                i.*,
                p.nome_produto
            FROM itens_pedido i
            LEFT JOIN produtos p
                ON i.id_produto = p.id_produto
        `;

        const result = await db.query(sql);

        res.json(result.rows);

    } catch (err) {
        console.error('Erro ao listar itens:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


// CADASTRAR ITEM DO PEDIDO
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

        res.json(result.rows[0]);

    } catch (err) {
        console.error('Erro ao cadastrar item:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


module.exports = router;


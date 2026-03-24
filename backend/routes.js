const express = require('express');
const router = express.Router();
const db = require('./db'); // conexão com mysql2 (promise)

// =====================
// CLIENTES
// =====================

// LISTAR
router.get('/clientes', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM clientes');
        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// CADASTRAR
router.post('/clientes', async (req, res) => {
    try {
        const { nome_cliente, endereco_cliente, telefone_cliente, email_cliente, senha_cliente } = req.body;

        const sql = `INSERT INTO clientes 
        (nome_cliente, endereco_cliente, telefone_cliente, email_cliente, senha_cliente)
        VALUES (?, ?, ?, ?, ?)`;

        const [result] = await db.query(sql, [
            nome_cliente,
            endereco_cliente,
            telefone_cliente,
            email_cliente,
            senha_cliente
        ]);

        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email_cliente, senha_cliente } = req.body;

        const sql = `SELECT * FROM clientes 
                     WHERE email_cliente = ? AND senha_cliente = ?`;

        const [result] = await db.query(sql, [email_cliente, senha_cliente]);

        if (result.length > 0) {
            res.json({ success: true, user: result[0] });
        } else {
            res.json({ success: false, message: 'Login inválido' });
        }

    } catch (err) {
        res.status(500).json(err);
    }
});

// =====================
// FORNECEDORES
// =====================

router.get('/fornecedores', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM fornecedores');
        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/fornecedores', async (req, res) => {
    try {
        const { nome_fornecedor, endereco_fornecedor, telefone_fornecedor, email_fornecedor } = req.body;

        const sql = `INSERT INTO fornecedores 
        (nome_fornecedor, endereco_fornecedor, telefone_fornecedor, email_fornecedor)
        VALUES (?, ?, ?, ?)`;

        const [result] = await db.query(sql, [
            nome_fornecedor,
            endereco_fornecedor,
            telefone_fornecedor,
            email_fornecedor
        ]);

        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// =====================
// PRODUTOS
// =====================

router.get('/produtos', async (req, res) => {
    try {
        const sql = `
            SELECT p.*, f.nome_fornecedor 
            FROM produtos p
            LEFT JOIN fornecedores f ON p.id_fornecedor = f.id_fornecedor
        `;

        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/produtos', async (req, res) => {
    try {
        const { nome_produto, descricao_produto, preco_produto, quantidade_estoque, id_fornecedor } = req.body;

        const sql = `INSERT INTO produtos 
        (nome_produto, descricao_produto, preco_produto, quantidade_estoque, id_fornecedor)
        VALUES (?, ?, ?, ?, ?)`;

        const [result] = await db.query(sql, [
            nome_produto,
            descricao_produto,
            preco_produto,
            quantidade_estoque,
            id_fornecedor
        ]);

        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// =====================
// PEDIDOS
// =====================

router.get('/pedidos', async (req, res) => {
    try {
        const sql = `
            SELECT p.*, c.nome_cliente 
            FROM pedidos p
            LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
        `;

        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/pedidos', async (req, res) => {
    try {
        const { id_cliente, data_pedido, forma_pagamento, status_pedido, total_pedido } = req.body;

        const sql = `INSERT INTO pedidos 
        (id_cliente, data_pedido, forma_pagamento, status_pedido, total_pedido)
        VALUES (?, ?, ?, ?, ?)`;

        const [result] = await db.query(sql, [
            id_cliente,
            data_pedido,
            forma_pagamento,
            status_pedido,
            total_pedido
        ]);

        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// =====================
// ITENS DO PEDIDO
// =====================

router.get('/itens', async (req, res) => {
    try {
        const sql = `
            SELECT i.*, p.nome_produto 
            FROM itens_pedido i
            LEFT JOIN produtos p ON i.id_produto = p.id_produto
        `;

        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/itens', async (req, res) => {
    try {
        const { id_pedido, id_produto, quantidade, preco_unitario } = req.body;

        const sql = `INSERT INTO itens_pedido 
        (id_pedido, id_produto, quantidade, preco_unitario)
        VALUES (?, ?, ?, ?)`;

        const [result] = await db.query(sql, [
            id_pedido,
            id_produto,
            quantidade,
            preco_unitario
        ]);

        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
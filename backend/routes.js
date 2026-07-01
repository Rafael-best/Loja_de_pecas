const express = require('express');
const router = express.Router();
const db = require('./db');

// =====================
// CLIENTES
// =====================

// LISTAR CLIENTES
router.get('/clientes', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM clientes');
        res.json(result);
    } catch (err) {
        res.status(500).json(err);
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
            (nome_cliente, endereco_cliente, telefone_cliente, email_cliente, senha_cliente)
            VALUES (?, ?, ?, ?, ?)
        `;

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

// LOGIN CLIENTE
router.post('/login', async (req, res) => {
    try {
        const { email_cliente, senha_cliente } = req.body;

        const sql = `
            SELECT * FROM clientes
            WHERE email_cliente = ? AND senha_cliente = ?
        `;

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

// LISTAR FORNECEDORES
router.get('/fornecedores', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM fornecedores');
        res.json(result);
    } catch (err) {
        res.status(500).json(err);
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
            (nome_fornecedor, endereco_fornecedor, telefone_fornecedor, email_fornecedor)
            VALUES (?, ?, ?, ?)
        `;

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

// LISTAR PRODUTOS
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
            (nome_produto, descricao_produto, preco_produto, quantidade_estoque, id_fornecedor)
            VALUES (?, ?, ?, ?, ?)
        `;

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

// LISTAR PEDIDOS
router.get('/pedidos', async (req, res) => {
    try {
        const sql = `
            SELECT p.*, c.nome_cliente
            FROM pedidos p
            LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
            ORDER BY p.id_pedido DESC
        `;

        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        res.status(500).json(err);
    }
});

// BUSCAR PEDIDO POR ID COM ITENS
router.get('/pedidos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [pedido] = await db.query(`
            SELECT p.*, c.nome_cliente
            FROM pedidos p
            LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
            WHERE p.id_pedido = ?
        `, [id]);

        if (pedido.length === 0) {
            return res.status(404).json({ erro: 'Pedido não encontrado' });
        }

        const [itens] = await db.query(`
            SELECT i.*, pr.nome_produto
            FROM itens_pedido i
            LEFT JOIN produtos pr ON i.id_produto = pr.id_produto
            WHERE i.id_pedido = ?
        `, [id]);

        res.json({
            pedido: pedido[0],
            itens
        });
    } catch (err) {
        res.status(500).json(err);
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

        const [cliente] = await db.query(
            'SELECT * FROM clientes WHERE id_cliente = ?',
            [id_cliente]
        );

        if (cliente.length === 0) {
            return res.status(404).json({ erro: 'Cliente não encontrado' });
        }

        const sql = `
            INSERT INTO pedidos
            (id_cliente, data_pedido, forma_pagamento, status_pedido, total_pedido)
            VALUES (?, NOW(), ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            id_cliente,
            forma_pagamento || null,
            status_pedido || 'Pendente',
            total_pedido || 0
        ]);

        res.json({
            message: 'Pedido criado com sucesso',
            id_pedido: result.insertId
        });
    } catch (err) {
        console.error('Erro ao criar pedido:', err);
        res.status(500).json({
            erro: err.sqlMessage || err.message || 'Erro ao criar pedido'
        });
    }
});

// ADICIONAR ITEM AO PEDIDO
router.post('/pedidos/:id/itens', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_produto, quantidade } = req.body;

        if (!quantidade || Number(quantidade) <= 0) {
            return res.status(400).json({ erro: 'Quantidade inválida' });
        }

        const [pedido] = await db.query(
            'SELECT * FROM pedidos WHERE id_pedido = ?',
            [id]
        );

        if (pedido.length === 0) {
            return res.status(404).json({ erro: 'Pedido não encontrado' });
        }

        if (pedido[0].status_pedido === 'Cancelado') {
            return res.status(400).json({ erro: 'Não é possível alterar um pedido cancelado' });
        }

        const [produto] = await db.query(
            'SELECT * FROM produtos WHERE id_produto = ?',
            [id_produto]
        );

        if (produto.length === 0) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }

        if (Number(produto[0].quantidade_estoque) < Number(quantidade)) {
            return res.status(400).json({ erro: 'Estoque insuficiente' });
        }

        const preco = produto[0].preco_produto;

        await db.query(`
            INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario)
            VALUES (?, ?, ?, ?)
        `, [id, id_produto, quantidade, preco]);

        await db.query(`
            UPDATE produtos
            SET quantidade_estoque = quantidade_estoque - ?
            WHERE id_produto = ?
        `, [quantidade, id_produto]);

        await db.query(`
            UPDATE pedidos
            SET total_pedido = (
                SELECT COALESCE(SUM(quantidade * preco_unitario), 0)
                FROM itens_pedido
                WHERE id_pedido = ?
            )
            WHERE id_pedido = ?
        `, [id, id]);

        res.json({ message: 'Item adicionado com sucesso' });
    } catch (err) {
        console.error('Erro ao adicionar item:', err);
        res.status(500).json({
            erro: err.sqlMessage || err.message || 'Erro ao adicionar item'
        });
    }
});

// ATUALIZAR STATUS DO PEDIDO
router.patch('/pedidos/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ erro: 'Status é obrigatório' });
        }

        const [pedido] = await db.query(
            'SELECT * FROM pedidos WHERE id_pedido = ?',
            [id]
        );

        if (pedido.length === 0) {
            return res.status(404).json({ erro: 'Pedido não encontrado' });
        }

        await db.query(`
            UPDATE pedidos
            SET status_pedido = ?
            WHERE id_pedido = ?
        `, [status, id]);

        res.json({ message: 'Status atualizado com sucesso' });
    } catch (err) {
        res.status(500).json(err);
    }
});

// CANCELAR PEDIDO
router.patch('/pedidos/:id/cancelar', async (req, res) => {
    try {
        const { id } = req.params;

        const [pedido] = await db.query(
            'SELECT * FROM pedidos WHERE id_pedido = ?',
            [id]
        );

        if (pedido.length === 0) {
            return res.status(404).json({ erro: 'Pedido não encontrado' });
        }

        if (pedido[0].status_pedido === 'Cancelado') {
            return res.status(400).json({ erro: 'Pedido já está cancelado' });
        }

        const [itens] = await db.query(`
            SELECT * FROM itens_pedido
            WHERE id_pedido = ?
        `, [id]);

        for (const item of itens) {
            await db.query(`
                UPDATE produtos
                SET quantidade_estoque = quantidade_estoque + ?
                WHERE id_produto = ?
            `, [item.quantidade, item.id_produto]);
        }

        await db.query(`
            UPDATE pedidos
            SET status_pedido = 'Cancelado'
            WHERE id_pedido = ?
        `, [id]);

        res.json({ message: 'Pedido cancelado com sucesso' });
    } catch (err) {
        res.status(500).json(err);
    }
});

// =====================
// ITENS DO PEDIDO
// =====================

// LISTAR TODOS OS ITENS
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

// CADASTRO DIRETO DE ITEM
router.post('/itens', async (req, res) => {
    try {
        const { id_pedido, id_produto, quantidade, preco_unitario } = req.body;

        const sql = `
            INSERT INTO itens_pedido
            (id_pedido, id_produto, quantidade, preco_unitario)
            VALUES (?, ?, ?, ?)
        `;

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
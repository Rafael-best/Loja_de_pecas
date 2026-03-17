const express = require("express");
const router = express.Router();
const db = require("./db");

// ======================
// CLIENTES
// ======================

// listar clientes
router.get("/clientes", async (req, res) => {
    const [rows] = await db.query("SELECT * FROM clientes");
    res.json(rows);
});

// criar cliente
router.post("/clientes", async (req, res) => {
    const { nome_cliente, endereco_cliente, telefone_cliente, email_cliente } = req.body;

    await db.query(
        "INSERT INTO clientes (nome_cliente, endereco_cliente, telefone_cliente, email_cliente) VALUES (?, ?, ?, ?)",
        [nome_cliente, endereco_cliente, telefone_cliente, email_cliente]
    );

    res.json({ message: "Cliente criado" });
});

// ======================
// FORNECEDORES
// ======================

// listar fornecedores
router.get("/fornecedores", async (req, res) => {
    const [rows] = await db.query("SELECT * FROM fornecedores");
    res.json(rows);
});

// criar fornecedor
router.post("/fornecedores", async (req, res) => {
    const { nome_fornecedor, endereco_fornecedor, telefone_fornecedor, email_fornecedor } = req.body;

    await db.query(
        "INSERT INTO fornecedores (nome_fornecedor, endereco_fornecedor, telefone_fornecedor, email_fornecedor) VALUES (?, ?, ?, ?)",
        [nome_fornecedor, endereco_fornecedor, telefone_fornecedor, email_fornecedor]
    );

    res.json({ message: "Fornecedor criado" });
});

// ======================
// PRODUTOS
// ======================

// listar produtos
router.get("/produtos", async (req, res) => {
    const [rows] = await db.query(`
        SELECT produtos.*, fornecedores.nome_fornecedor
        FROM produtos
        LEFT JOIN fornecedores
        ON produtos.id_fornecedor = fornecedores.id_fornecedor
    `);

    res.json(rows);
});

// criar produto
router.post("/produtos", async (req, res) => {
    const {
        nome_produto,
        descricao_produto,
        preco_produto,
        quantidade_estoque,
        id_fornecedor
    } = req.body;

    await db.query(
        `INSERT INTO produtos 
        (nome_produto, descricao_produto, preco_produto, quantidade_estoque, id_fornecedor)
        VALUES (?, ?, ?, ?, ?)`,
        [nome_produto, descricao_produto, preco_produto, quantidade_estoque, id_fornecedor]
    );

    res.json({ message: "Produto criado" });
});

// ======================
// VENDAS
// ======================

// listar vendas
router.get("/vendas", async (req, res) => {
    const [rows] = await db.query(`
        SELECT vendas.*, clientes.nome_cliente, produtos.nome_produto
        FROM vendas
        LEFT JOIN clientes ON vendas.id_cliente = clientes.id_cliente
        LEFT JOIN produtos ON vendas.id_produto = produtos.id_produto
    `);

    res.json(rows);
});

// criar venda
router.post("/vendas", async (req, res) => {
    const {
        id_cliente,
        id_produto,
        data_venda,
        quantidade,
        total
    } = req.body;

    await db.query(
        `INSERT INTO vendas
        (id_cliente, id_produto, data_venda, quantidade, total)
        VALUES (?, ?, ?, ?, ?)`,
        [id_cliente, id_produto, data_venda, quantidade, total]
    );

    res.json({ message: "Venda registrada" });
});

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("./db");


// ======================
// CLIENTES
// ======================

// listar
router.get("/clientes", async (req, res) => {
    const [rows] = await db.query("SELECT * FROM clientes");
    res.json(rows);
});

// criar
router.post("/clientes", async (req, res) => {

    const { nome_cliente, endereco_cliente, telefone_cliente, email_cliente } = req.body;

    if(!nome_cliente){
        return res.status(400).json({erro:"Nome obrigatório"});
    }

    await db.query(
        "INSERT INTO clientes (nome_cliente,endereco_cliente,telefone_cliente,email_cliente) VALUES (?,?,?,?)",
        [nome_cliente,endereco_cliente,telefone_cliente,email_cliente]
    );

    res.json({message:"Cliente criado"});
});

// atualizar
router.put("/clientes/:id", async (req,res)=>{

    const {id} = req.params;
    const {nome_cliente,endereco_cliente,telefone_cliente,email_cliente} = req.body;

    await db.query(
        "UPDATE clientes SET nome_cliente=?, endereco_cliente=?, telefone_cliente=?, email_cliente=? WHERE id_cliente=?",
        [nome_cliente,endereco_cliente,telefone_cliente,email_cliente,id]
    );

    res.json({message:"Cliente atualizado"});
});

// deletar
router.delete("/clientes/:id", async(req,res)=>{

    const {id} = req.params;

    await db.query(
        "DELETE FROM clientes WHERE id_cliente=?",
        [id]
    );

    res.json({message:"Cliente deletado"});
});


// ======================
// PRODUTOS
// ======================

router.get("/produtos", async (req,res)=>{

    const [rows] = await db.query(`
        SELECT produtos.*, fornecedores.nome_fornecedor
        FROM produtos
        LEFT JOIN fornecedores
        ON produtos.id_fornecedor = fornecedores.id_fornecedor
    `);

    res.json(rows);
});

router.post("/produtos", async(req,res)=>{

    const {nome_produto,descricao_produto,preco_produto,quantidade_estoque,id_fornecedor} = req.body;

    if(!nome_produto){
        return res.status(400).json({erro:"Nome obrigatório"});
    }

    await db.query(`
        INSERT INTO produtos
        (nome_produto,descricao_produto,preco_produto,quantidade_estoque,id_fornecedor)
        VALUES (?,?,?,?,?)
    `,
    [nome_produto,descricao_produto,preco_produto,quantidade_estoque,id_fornecedor]);

    res.json({message:"Produto criado"});
});

router.put("/produtos/:id", async(req,res)=>{

    const {id} = req.params;

    const {nome_produto,descricao_produto,preco_produto,quantidade_estoque,id_fornecedor} = req.body;

    await db.query(`
        UPDATE produtos
        SET nome_produto=?, descricao_produto=?, preco_produto=?, quantidade_estoque=?, id_fornecedor=?
        WHERE id_produto=?
    `,
    [nome_produto,descricao_produto,preco_produto,quantidade_estoque,id_fornecedor,id]);

    res.json({message:"Produto atualizado"});
});

router.delete("/produtos/:id", async(req,res)=>{

    const {id} = req.params;

    await db.query(
        "DELETE FROM produtos WHERE id_produto=?",
        [id]
    );

    res.json({message:"Produto deletado"});
});


// ======================
// VENDAS
// ======================

router.get("/vendas", async(req,res)=>{

    const [rows] = await db.query(`
        SELECT vendas.*, clientes.nome_cliente, produtos.nome_produto
        FROM vendas
        LEFT JOIN clientes ON vendas.id_cliente = clientes.id_cliente
        LEFT JOIN produtos ON vendas.id_produto = produtos.id_produto
    `);

    res.json(rows);
});

router.post("/vendas", async(req,res)=>{

    const {id_cliente,id_produto,data_venda,quantidade,total} = req.body;

    await db.query(`
        INSERT INTO vendas
        (id_cliente,id_produto,data_venda,quantidade,total)
        VALUES (?,?,?,?,?)
    `,
    [id_cliente,id_produto,data_venda,quantidade,total]);

    res.json({message:"Venda registrada"});
});

module.exports = router;
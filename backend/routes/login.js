const express = require("express");
const router = express.Router();

const db = require("../db");

// =======================================
// LOGIN
// =======================================

router.post("/", async (req, res) => {

    try {

        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Informe e-mail e senha."
            });
        }

        const sql = `
            SELECT *
            FROM clientes
            WHERE email = ?
            LIMIT 1
        `;

        const [cliente] = await db.query(sql, [email]);

        if (cliente.length === 0) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }

        if (cliente[0].senha !== senha) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Senha incorreta."
            });
        }

        res.json({
            sucesso: true,
            mensagem: "Login realizado com sucesso.",
            usuario: {
                id: cliente[0].id_cliente,
                nome: cliente[0].nome,
                email: cliente[0].email
            }
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno do servidor."
        });

    }

});

module.exports = router;
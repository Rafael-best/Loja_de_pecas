"use strict";

/* ============================================================
   recuperarSenha.js

   Fluxo de "esqueci minha senha":

   1. POST /api/recuperar-senha           { email_cliente }
      Gera um token de uso único (válido por 1h) e envia por
      e-mail um link para /redefinir-senha.html?token=...

   2. GET  /api/recuperar-senha/:token
      Verifica se o token ainda é válido (existe e não expirou).

   3. POST /api/recuperar-senha/:token    { senha_nova }
      Define a nova senha (com hash) e invalida o token.

   Os tokens ficam em memória (Map). Isso é suficiente para um
   projeto de porte pequeno/médio com uma única instância do
   servidor rodando; se um dia isso rodar em múltiplas instâncias
   (load balancer) ou precisar sobreviver a um restart do processo,
   troque o Map por uma tabela no banco (id_cliente, token_hash,
   expira_em).

   ENVIO DE E-MAIL:
   Sem configurar as variáveis de ambiente SMTP_HOST, SMTP_PORT,
   SMTP_USER e SMTP_PASS (e ter o pacote "nodemailer" instalado),
   o link de redefinição só é impresso no console do servidor —
   ninguém recebe e-mail de verdade. Isso é intencional: preferimos
   um modo "funciona sem configurar nada" a travar o cadastro por
   falta de um provedor de e-mail. Assim que vocês tiverem um
   serviço de e-mail (Gmail com senha de app, SendGrid, etc.), só
   preencher o .env que o envio real liga sozinho.
============================================================ */

const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../db");

const BCRYPT_SALT_ROUNDS = 10;
const TOKEN_VALIDADE_MS = 60 * 60 * 1000; // 1 hora

// token -> { idCliente, expiraEm }
const tokensAtivos = new Map();

function limparTokensExpirados() {
    const agora = Date.now();
    for (const [token, dados] of tokensAtivos.entries()) {
        if (dados.expiraEm < agora) {
            tokensAtivos.delete(token);
        }
    }
}

function gerarToken() {
    return crypto.randomBytes(32).toString("hex");
}

// Tenta enviar e-mail de verdade. Se o nodemailer não estiver
// instalado ou as variáveis de ambiente não estiverem definidas,
// apenas retorna false (sem quebrar o fluxo).
async function tentarEnviarEmail(destinatario, link) {
    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USER,
        SMTP_PASS
    } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return false;
    }

    let nodemailer;

    try {
        nodemailer = require("nodemailer");
    } catch {
        console.warn(
            "SMTP configurado, mas o pacote 'nodemailer' não está instalado. " +
            "Rode: npm install nodemailer"
        );
        return false;
    }

    const transportador = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: Number(SMTP_PORT) === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });

    await transportador.sendMail({
        from: `"Auto Peça Certa" <${SMTP_USER}>`,
        to: destinatario,
        subject: "Redefinição de senha - Auto Peça Certa",
        html: `
            <p>Você pediu para redefinir sua senha.</p>
            <p><a href="${link}">Clique aqui para criar uma nova senha</a></p>
            <p>Se não foi você, pode ignorar este e-mail.</p>
            <p>O link expira em 1 hora.</p>
        `
    });

    return true;
}

// =====================================================
// 1) SOLICITAR RECUPERAÇÃO
// =====================================================

router.post("/", async (req, res) => {
    try {
        limparTokensExpirados();

        const { email_cliente } = req.body;

        if (!email_cliente) {
            return res.status(400).json({
                erro: "Informe o e-mail."
            });
        }

        const resultado = await db.query(
            "SELECT id_cliente, nome_cliente FROM clientes WHERE email_cliente = $1",
            [email_cliente]
        );

        const cliente = resultado.rows[0];

        // Resposta genérica sempre igual, exista ou não o e-mail,
        // pra não deixar alguém descobrir quais e-mails têm conta
        // só de tentar recuperar a senha deles.
        const respostaPadrao = {
            success: true,
            message:
                "Se este e-mail estiver cadastrado, você vai receber um link de redefinição."
        };

        if (!cliente) {
            return res.json(respostaPadrao);
        }

        const token = gerarToken();

        tokensAtivos.set(token, {
            idCliente: cliente.id_cliente,
            expiraEm: Date.now() + TOKEN_VALIDADE_MS
        });

        const origem =
            req.headers.origin ||
            `${req.protocol}://${req.get("host")}`;

        const link = `${origem}/redefinir-senha.html?token=${token}`;

        const enviado = await tentarEnviarEmail(email_cliente, link);

        if (enviado) {
            console.log(`Link de redefinição enviado por e-mail para ${email_cliente}.`);
        } else {
            // Modo dev: sem SMTP configurado, o link só aparece no console.
            console.log("=======================================================");
            console.log("EMAIL NÃO CONFIGURADO — link de redefinição de senha:");
            console.log(link);
            console.log("=======================================================");
        }

        // Em produção, com e-mail configurado, remova o campo "link"
        // da resposta abaixo — ele só existe pra dar pra testar sem
        // precisar configurar SMTP.
        res.json({
            ...respostaPadrao,
            ...(enviado ? {} : { link_dev: link })
        });

    } catch (err) {
        console.error("Erro ao solicitar recuperação de senha:", err);

        res.status(500).json({
            erro: "Não foi possível processar sua solicitação agora."
        });
    }
});

// =====================================================
// 2) VALIDAR TOKEN (a página de redefinição chama isso ao carregar)
// =====================================================

router.get("/:token", (req, res) => {
    limparTokensExpirados();

    const dados = tokensAtivos.get(req.params.token);

    if (!dados) {
        return res.status(404).json({
            valido: false,
            erro: "Link inválido ou expirado."
        });
    }

    res.json({ valido: true });
});

// =====================================================
// 3) DEFINIR NOVA SENHA
// =====================================================

router.post("/:token", async (req, res) => {
    try {
        limparTokensExpirados();

        const { token } = req.params;
        const { senha_nova } = req.body;

        const dados = tokensAtivos.get(token);

        if (!dados) {
            return res.status(404).json({
                erro: "Link inválido ou expirado. Solicite a recuperação novamente."
            });
        }

        if (!senha_nova || senha_nova.length < 8) {
            return res.status(400).json({
                erro: "A nova senha precisa ter pelo menos 8 caracteres."
            });
        }

        const novoHash = await bcrypt.hash(senha_nova, BCRYPT_SALT_ROUNDS);

        await db.query(
            "UPDATE clientes SET senha_cliente = $1 WHERE id_cliente = $2",
            [novoHash, dados.idCliente]
        );

        // token só pode ser usado uma vez
        tokensAtivos.delete(token);

        res.json({
            success: true,
            message: "Senha redefinida com sucesso. Você já pode fazer login."
        });

    } catch (err) {
        console.error("Erro ao redefinir senha:", err);

        res.status(500).json({
            erro: "Não foi possível redefinir sua senha agora."
        });
    }
});

module.exports = router;

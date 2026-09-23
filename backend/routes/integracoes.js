"use strict";

/* ============================================================
   integracoes.js

   Endpoints que conversam com APIs públicas e gratuitas:

   - ViaCEP / Brasil API .......... endereço a partir do CEP
   - CNPJá (open.cnpja.com) ....... dados cadastrais de empresa
   - FIPE (Parallelum + BrasilAPI). marca/modelo/ano/preço de veículo
   - Brasil API ................... bancos (e é a base do CEP acima)

   Nenhuma delas exige chave de API para o uso feito aqui.
   Todas usam fetch nativo do Node 18+.
============================================================ */

const express = require("express");
const router = express.Router();

const cepService = require("../services/cepService");

const VIACEP_BASE = "https://viacep.com.br/ws";
const CNPJA_BASE = "https://open.cnpja.com/office";
const BRASILAPI_BASE = "https://brasilapi.com.br/api";
const FIPE_BASE = "https://fipe.parallelum.com.br/api/v1";

const TIPOS_VEICULO_VALIDOS = ["carros", "motos", "caminhoes"];

function tratarErro(res, err, mensagemPadrao) {
    const status = err.status || 502;

    console.error(mensagemPadrao, err.message || err);

    res.status(status).json({
        erro: err.message || mensagemPadrao
    });
}

// =====================================================
// CEP — ViaCEP (endereço) + Brasil API (endereço + coordenadas)
// =====================================================

// GET /api/integracoes/cep/:cep  -> usa Brasil API v2 (traz coordenadas quando disponíveis)
router.get("/cep/:cep", async (req, res) => {
    try {
        const endereco = await cepService.buscarCep(req.params.cep);
        res.json(endereco);
    } catch (err) {
        tratarErro(res, err, "Erro ao consultar CEP");
    }
});

// GET /api/integracoes/cep/:cep/viacep -> resposta "crua" do ViaCEP, caso prefira o formato original
router.get("/cep/:cep/viacep", async (req, res) => {
    try {
        const cep = cepService.limparCep(req.params.cep);

        if (cep.length !== 8) {
            return res.status(400).json({
                erro: "CEP inválido. Use o formato 00000-000."
            });
        }

        const resposta = await fetch(`${VIACEP_BASE}/${cep}/json/`);
        const dados = await resposta.json();

        if (dados.erro) {
            return res.status(404).json({
                erro: "CEP não encontrado."
            });
        }

        res.json(dados);
    } catch (err) {
        tratarErro(res, err, "Erro ao consultar ViaCEP");
    }
});

// =====================================================
// CNPJ — CNPJá (gratuita, sem chave, limite de 5 req/min por IP)
// =====================================================

router.get("/cnpj/:cnpj", async (req, res) => {
    try {
        const cnpj = String(req.params.cnpj || "").replace(/\D/g, "");

        if (cnpj.length !== 14) {
            return res.status(400).json({
                erro: "CNPJ inválido. Use 14 dígitos, com ou sem pontuação."
            });
        }

        const resposta = await fetch(`${CNPJA_BASE}/${cnpj}`);

        if (resposta.status === 404) {
            return res.status(404).json({
                erro: "CNPJ não encontrado."
            });
        }

        if (resposta.status === 429) {
            return res.status(429).json({
                erro: "Limite da API CNPJá atingido (5 consultas/min). Tente novamente em instantes."
            });
        }

        if (!resposta.ok) {
            throw new Error("Falha ao consultar o CNPJá.");
        }

        const dados = await resposta.json();

        res.json(dados);
    } catch (err) {
        tratarErro(res, err, "Erro ao consultar CNPJ");
    }
});

// =====================================================
// FIPE — marca -> modelo -> ano -> valor (Parallelum)
// =====================================================

function validarTipoVeiculo(tipo, res) {
    if (!TIPOS_VEICULO_VALIDOS.includes(tipo)) {
        res.status(400).json({
            erro: `Tipo de veículo inválido. Use: ${TIPOS_VEICULO_VALIDOS.join(", ")}.`
        });
        return false;
    }
    return true;
}

// GET /api/integracoes/fipe/marcas/:tipo  (tipo = carros | motos | caminhoes)
router.get("/fipe/marcas/:tipo", async (req, res) => {
    try {
        const { tipo } = req.params;

        if (!validarTipoVeiculo(tipo, res)) return;

        const resposta = await fetch(`${FIPE_BASE}/${tipo}/marcas`);

        if (!resposta.ok) {
            throw new Error("Falha ao consultar marcas na FIPE.");
        }

        res.json(await resposta.json());
    } catch (err) {
        tratarErro(res, err, "Erro ao consultar marcas FIPE");
    }
});

// GET /api/integracoes/fipe/modelos/:tipo/:marcaId
router.get("/fipe/modelos/:tipo/:marcaId", async (req, res) => {
    try {
        const { tipo, marcaId } = req.params;

        if (!validarTipoVeiculo(tipo, res)) return;

        const resposta = await fetch(
            `${FIPE_BASE}/${tipo}/marcas/${marcaId}/modelos`
        );

        if (!resposta.ok) {
            throw new Error("Falha ao consultar modelos na FIPE.");
        }

        const dados = await resposta.json();

        // a API retorna { modelos: [...], anos: [...] }; expomos só os modelos
        res.json(dados.modelos || dados);
    } catch (err) {
        tratarErro(res, err, "Erro ao consultar modelos FIPE");
    }
});

// GET /api/integracoes/fipe/anos/:tipo/:marcaId/:modeloId
router.get("/fipe/anos/:tipo/:marcaId/:modeloId", async (req, res) => {
    try {
        const { tipo, marcaId, modeloId } = req.params;

        if (!validarTipoVeiculo(tipo, res)) return;

        const resposta = await fetch(
            `${FIPE_BASE}/${tipo}/marcas/${marcaId}/modelos/${modeloId}/anos`
        );

        if (!resposta.ok) {
            throw new Error("Falha ao consultar anos na FIPE.");
        }

        res.json(await resposta.json());
    } catch (err) {
        tratarErro(res, err, "Erro ao consultar anos FIPE");
    }
});

// GET /api/integracoes/fipe/valor/:tipo/:marcaId/:modeloId/:anoId
router.get("/fipe/valor/:tipo/:marcaId/:modeloId/:anoId", async (req, res) => {
    try {
        const { tipo, marcaId, modeloId, anoId } = req.params;

        if (!validarTipoVeiculo(tipo, res)) return;

        const resposta = await fetch(
            `${FIPE_BASE}/${tipo}/marcas/${marcaId}/modelos/${modeloId}/anos/${anoId}`
        );

        if (!resposta.ok) {
            throw new Error("Falha ao consultar valor FIPE.");
        }

        res.json(await resposta.json());
    } catch (err) {
        tratarErro(res, err, "Erro ao consultar valor FIPE");
    }
});

// GET /api/integracoes/fipe/preco/:codigo  -> consulta direta por código FIPE (ex.: 001004-9), via Brasil API
router.get("/fipe/preco/:codigo", async (req, res) => {
    try {
        const { codigo } = req.params;

        const resposta = await fetch(
            `${BRASILAPI_BASE}/fipe/preco/v1/${encodeURIComponent(codigo)}`
        );

        if (resposta.status === 404) {
            return res.status(404).json({
                erro: "Código FIPE não encontrado."
            });
        }

        if (!resposta.ok) {
            throw new Error("Falha ao consultar preço FIPE.");
        }

        res.json(await resposta.json());
    } catch (err) {
        tratarErro(res, err, "Erro ao consultar preço FIPE");
    }
});

// =====================================================
// BANCOS — Brasil API
// =====================================================

router.get("/bancos", async (req, res) => {
    try {
        const resposta = await fetch(`${BRASILAPI_BASE}/banks/v1`);

        if (!resposta.ok) {
            throw new Error("Falha ao consultar bancos.");
        }

        res.json(await resposta.json());
    } catch (err) {
        tratarErro(res, err, "Erro ao consultar bancos");
    }
});

module.exports = router;

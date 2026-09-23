"use strict";

/* ============================================================
   cepService.js

   Busca endereço + coordenadas de um CEP usando a Brasil API
   (que já engloba ViaCEP como um dos provedores por trás dela).

   Usa fetch nativo do Node (18+). Se seu Node for mais antigo,
   rode `npm install node-fetch` e troque a linha abaixo por:
   const fetch = require('node-fetch');
============================================================ */

const BRASILAPI_BASE = "https://brasilapi.com.br/api";

function limparCep(cepBruto) {
    return String(cepBruto || "").replace(/\D/g, "");
}

function formatarCep(cep) {
    const limpo = limparCep(cep);

    if (limpo.length !== 8) {
        return cep;
    }

    return `${limpo.slice(0, 5)}-${limpo.slice(5)}`;
}

/**
 * Busca um CEP na Brasil API v2, que já retorna coordenadas
 * (latitude/longitude) quando o provedor de origem as fornece.
 * Nem todo CEP tem coordenadas — nesse caso lat/lon voltam null
 * e quem chamar deve tratar a ausência (ex.: comparar só cidade/UF).
 */
async function buscarCep(cepBruto) {
    const cep = limparCep(cepBruto);

    if (cep.length !== 8) {
        const erro = new Error("CEP inválido. Use o formato 00000-000.");
        erro.status = 400;
        throw erro;
    }

    let resposta;

    try {
        resposta = await fetch(`${BRASILAPI_BASE}/cep/v2/${cep}`);
    } catch (falhaRede) {
        const erro = new Error("Não foi possível consultar o CEP agora.");
        erro.status = 502;
        throw erro;
    }

    if (resposta.status === 404) {
        const erro = new Error("CEP não encontrado.");
        erro.status = 404;
        throw erro;
    }

    if (!resposta.ok) {
        const erro = new Error("Falha ao consultar o CEP.");
        erro.status = 502;
        throw erro;
    }

    const dados = await resposta.json();

    const coordenadas = dados?.location?.coordinates;

    const latitude = coordenadas?.latitude
        ? Number(coordenadas.latitude)
        : null;

    const longitude = coordenadas?.longitude
        ? Number(coordenadas.longitude)
        : null;

    return {
        cep: formatarCep(dados.cep || cep),
        estado: dados.state || null,
        cidade: dados.city || null,
        bairro: dados.neighborhood || null,
        rua: dados.street || null,
        latitude: Number.isFinite(latitude) ? latitude : null,
        longitude: Number.isFinite(longitude) ? longitude : null
    };
}

/**
 * Calcula a distância em linha reta (km) entre duas coordenadas
 * usando a fórmula de Haversine. Não depende de nenhuma API paga.
 */
function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // raio médio da Terra em km
    const toRad = (graus) => (graus * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Compara dois endereços de CEP quando não há coordenadas
 * disponíveis para os dois (fallback qualitativo, sem custo
 * de nenhuma API paga de geolocalização).
 */
function compararRegiao(destino, origem) {
    if (!destino || !origem) {
        return "desconhecida";
    }

    if (
        destino.cidade &&
        origem.cidade &&
        normalizar(destino.cidade) === normalizar(origem.cidade)
    ) {
        return "mesma_cidade";
    }

    if (
        destino.estado &&
        origem.estado &&
        normalizar(destino.estado) === normalizar(origem.estado)
    ) {
        return "mesmo_estado";
    }

    return "outro_estado";
}

function normalizar(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

module.exports = {
    buscarCep,
    limparCep,
    formatarCep,
    calcularDistanciaKm,
    compararRegiao
};

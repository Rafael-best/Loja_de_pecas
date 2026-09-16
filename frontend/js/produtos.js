/* ============================================================
   AUTO PEÇA CERTA
   produtos.js
   Catálogo • Pesquisa • Filtros • Modal • Carrinho • API
============================================================ */

"use strict";

/* ============================================================
   CONFIGURAÇÃO
============================================================ */

const APC_PRODUCTS_CONFIG = {
    apiBase: "http://localhost:3000/api",
    productsEndpoint: "/produtos",
    itemsPerPage: 12,

    storage: {
        cart: "carrinho",
        cartLegacy: "clienteCarrinho"
    }
};


/* ============================================================
   PRODUTOS TEMPORÁRIOS

   Estes produtos aparecem enquanto a API/banco ainda
   não estiver disponível.

   Quando GET /api/produtos funcionar, a API assume.
============================================================ */

const APC_FALLBACK_PRODUCTS = [

    {
        id: 1,
        nome: "Pastilha de Freio Dianteira",
        codigo: "FR-001",
        categoria: "freios",
        marca: "Bosch",
        preco: 189.90,
        precoAntigo: 229.90,
        estoque: 18,
        destaque: "Oferta",
        oferta: true,
        vendidos: 148,
        avaliacao: 4.9,
        imagem: "assets/images/produtos/pastilha-freio.png",
        descricao:
            "Jogo de pastilhas de freio dianteiras para aplicações automotivas selecionadas."
    },

    {
        id: 2,
        nome: "Disco de Freio Ventilado",
        codigo: "FR-002",
        categoria: "freios",
        marca: "TRW",
        preco: 279.90,
        precoAntigo: 319.90,
        estoque: 12,
        destaque: "Oferta",
        oferta: true,
        vendidos: 92,
        avaliacao: 4.8,
        imagem: "assets/images/produtos/disco-freio.png",
        descricao:
            "Disco de freio ventilado desenvolvido para oferecer frenagem consistente."
    },

    {
        id: 3,
        nome: "Kit Correia Dentada",
        codigo: "MT-001",
        categoria: "motor",
        marca: "Gates",
        preco: 349.90,
        estoque: 9,
        vendidos: 75,
        avaliacao: 4.9,
        imagem: "assets/images/produtos/kit-correia.png",
        descricao:
            "Kit de correia dentada para manutenção preventiva do sistema de sincronismo."
    },

    {
        id: 4,
        nome: "Vela de Ignição Iridium",
        codigo: "MT-002",
        categoria: "motor",
        marca: "NGK",
        preco: 69.90,
        estoque: 36,
        vendidos: 215,
        avaliacao: 4.9,
        imagem: "assets/images/produtos/vela-ignicao.png",
        descricao:
            "Vela de ignição com eletrodo de irídio para aplicações compatíveis."
    },

    {
        id: 5,
        nome: "Filtro de Óleo",
        codigo: "FT-001",
        categoria: "filtros",
        marca: "Mann Filter",
        preco: 39.90,
        estoque: 42,
        vendidos: 340,
        avaliacao: 4.8,
        imagem: "assets/images/produtos/filtro-oleo.png",
        descricao:
            "Filtro de óleo destinado à retenção de partículas presentes no lubrificante."
    },

    {
        id: 6,
        nome: "Filtro de Ar do Motor",
        codigo: "FT-002",
        categoria: "filtros",
        marca: "Mahle",
        preco: 59.90,
        estoque: 27,
        vendidos: 176,
        avaliacao: 4.7,
        imagem: "assets/images/produtos/filtro-ar.png",
        descricao:
            "Elemento filtrante para o sistema de admissão do motor."
    },

    {
        id: 7,
        nome: "Amortecedor Dianteiro",
        codigo: "SP-001",
        categoria: "suspensao",
        marca: "Monroe",
        preco: 389.90,
        precoAntigo: 429.90,
        estoque: 8,
        oferta: true,
        vendidos: 84,
        avaliacao: 4.8,
        imagem: "assets/images/produtos/amortecedor.png",
        descricao:
            "Amortecedor dianteiro para aplicações selecionadas."
    },

    {
        id: 8,
        nome: "Kit Batente do Amortecedor",
        codigo: "SP-002",
        categoria: "suspensao",
        marca: "Axios",
        preco: 119.90,
        estoque: 15,
        vendidos: 103,
        avaliacao: 4.7,
        imagem: "assets/images/produtos/batente.png",
        descricao:
            "Kit de batente e componentes auxiliares para suspensão."
    },

    {
        id: 9,
        nome: "Bateria Automotiva 60Ah",
        codigo: "EL-001",
        categoria: "eletrica",
        marca: "Moura",
        preco: 549.90,
        estoque: 11,
        destaque: "Mais vendido",
        vendidos: 296,
        avaliacao: 4.9,
        imagem: "assets/images/produtos/bateria.png",
        descricao:
            "Bateria automotiva 12 V e 60 Ah para veículos compatíveis."
    },

    {
        id: 10,
        nome: "Lâmpada LED Automotiva",
        codigo: "EL-002",
        categoria: "eletrica",
        marca: "Philips",
        preco: 169.90,
        estoque: 23,
        vendidos: 124,
        avaliacao: 4.7,
        imagem: "assets/images/produtos/lampada-led.png",
        descricao:
            "Lâmpada automotiva LED para aplicações compatíveis."
    },

    {
        id: 11,
        nome: "Óleo Lubrificante 5W30",
        codigo: "OL-001",
        categoria: "oleos",
        marca: "Mobil",
        preco: 54.90,
        estoque: 58,
        vendidos: 421,
        avaliacao: 4.9,
        imagem: "assets/images/produtos/oleo-5w30.png",
        descricao:
            "Lubrificante de viscosidade 5W30 para motores com especificação compatível."
    },

    {
        id: 12,
        nome: "Fluido de Freio DOT 4",
        codigo: "OL-002",
        categoria: "oleos",
        marca: "Bosch",
        preco: 44.90,
        estoque: 31,
        vendidos: 188,
        avaliacao: 4.8,
        imagem: "assets/images/produtos/fluido-freio.png",
        descricao:
            "Fluido para sistemas de freio que exijam especificação DOT 4."
    },

    {
        id: 13,
        nome: "Filtro de Combustível",
        codigo: "FT-003",
        categoria: "filtros",
        marca: "Tecfil",
        preco: 47.90,
        estoque: 20,
        vendidos: 136,
        avaliacao: 4.7,
        imagem: "assets/images/produtos/filtro-combustivel.png",
        descricao:
            "Filtro desenvolvido para retenção de impurezas presentes no combustível."
    },

    {
        id: 14,
        nome: "Cabo de Vela",
        codigo: "MT-003",
        categoria: "motor",
        marca: "NGK",
        preco: 159.90,
        estoque: 14,
        vendidos: 89,
        avaliacao: 4.8,
        imagem: "assets/images/produtos/cabo-vela.png",
        descricao:
            "Jogo de cabos de ignição para aplicações compatíveis."
    },

    {
        id: 15,
        nome: "Sensor de Temperatura",
        codigo: "EL-003",
        categoria: "eletrica",
        marca: "Bosch",
        preco: 94.90,
        estoque: 17,
        vendidos: 73,
        avaliacao: 4.6,
        imagem: "assets/images/produtos/sensor-temperatura.png",
        descricao:
            "Sensor utilizado no monitoramento da temperatura do sistema."
    },

    {
        id: 16,
        nome: "Terminal de Direção",
        codigo: "SP-003",
        categoria: "suspensao",
        marca: "Nakata",
        preco: 109.90,
        estoque: 21,
        vendidos: 118,
        avaliacao: 4.8,
        imagem: "assets/images/produtos/terminal-direcao.png",
        descricao:
            "Terminal de direção para aplicações selecionadas."
    },

    {
        id: 17,
        nome: "Cilindro Mestre de Freio",
        codigo: "FR-003",
        categoria: "freios",
        marca: "TRW",
        preco: 299.90,
        estoque: 6,
        vendidos: 51,
        avaliacao: 4.7,
        imagem: "assets/images/produtos/cilindro-mestre.png",
        descricao:
            "Componente hidráulico do sistema de freio para aplicações compatíveis."
    },

    {
        id: 18,
        nome: "Alternador Automotivo",
        codigo: "EL-004",
        categoria: "eletrica",
        marca: "Bosch",
        preco: 899.90,
        precoAntigo: 999.90,
        estoque: 4,
        oferta: true,
        vendidos: 39,
        avaliacao: 4.8,
        imagem: "assets/images/produtos/alternador.png",
        descricao:
            "Alternador destinado ao sistema de geração elétrica do veículo."
    },

    {
        id: 19,
        nome: "Bomba de Água",
        codigo: "MT-004",
        categoria: "motor",
        marca: "Urba",
        preco: 229.90,
        estoque: 10,
        vendidos: 96,
        avaliacao: 4.7,
        imagem: "assets/images/produtos/bomba-agua.png",
        descricao:
            "Bomba para circulação do líquido de arrefecimento."
    },

    {
        id: 20,
        nome: "Aditivo para Radiador",
        codigo: "OL-003",
        categoria: "oleos",
        marca: "Paraflu",
        preco: 39.90,
        estoque: 46,
        vendidos: 257,
        avaliacao: 4.8,
        imagem: "assets/images/produtos/aditivo-radiador.png",
        descricao:
            "Fluido aditivo para sistemas de arrefecimento compatíveis."
    },

    {
        id: 21,
        nome: "Bieleta da Suspensão",
        codigo: "SP-004",
        categoria: "suspensao",
        marca: "Nakata",
        preco: 89.90,
        estoque: 19,
        vendidos: 145,
        avaliacao: 4.7,
        imagem: "assets/images/produtos/bieleta.png",
        descricao:
            "Bieleta para ligação da barra estabilizadora em aplicações compatíveis."
    },

    {
        id: 22,
        nome: "Sapatas de Freio Traseiras",
        codigo: "FR-004",
        categoria: "freios",
        marca: "Fras-le",
        preco: 139.90,
        estoque: 13,
        vendidos: 82,
        avaliacao: 4.7,
        imagem: "assets/images/produtos/sapata-freio.png",
        descricao:
            "Jogo de sapatas para sistemas de freio traseiro compatíveis."
    },

    {
        id: 23,
        nome: "Filtro de Cabine",
        codigo: "FT-004",
        categoria: "filtros",
        marca: "Tecfil",
        preco: 49.90,
        estoque: 32,
        vendidos: 201,
        avaliacao: 4.8,
        imagem: "assets/images/produtos/filtro-cabine.png",
        descricao:
            "Filtro para retenção de partículas no sistema de ventilação da cabine."
    },

    {
        id: 24,
        nome: "Motor de Partida",
        codigo: "EL-005",
        categoria: "eletrica",
        marca: "Bosch",
        preco: 749.90,
        estoque: 0,
        vendidos: 47,
        avaliacao: 4.8,
        imagem: "assets/images/produtos/motor-partida.png",
        descricao:
            "Motor elétrico responsável pelo acionamento inicial do motor do veículo."
    }

];


/* ============================================================
   ESTADO
============================================================ */

const productsState = {

    products: [],

    filteredProducts: [],

    page: 1,

    category: "",

    search: "",

    brands: new Set(),

    minPrice: null,

    maxPrice: null,

    availableOnly: false,

    offersOnly: false,

    sort: "relevancia",

    view: "grid",

    selectedProduct: null,

    usingFallback: false

};


/* ============================================================
   ATALHO DOM
============================================================ */

const $ = (id) => document.getElementById(id);


/* ============================================================
   ELEMENTOS
============================================================ */

const elements = {

    productsGrid: $("productsGrid"),

    productsLoading: $("productsLoading"),

    productsEmpty: $("productsEmpty"),

    productsError: $("productsError"),

    resultCount: $("productsResultCount"),

    activeFilterDescription: $("activeFilterDescription"),

    catalogTitle: $("catalogTitle"),

    catalogDescription: $("catalogDescription"),

    catalogSearchForm: $("catalogSearchForm"),

    catalogSearchInput: $("catalogSearchInput"),

    headerSearchForm: $("headerSearchForm"),

    headerSearchInput: $("headerSearchInput"),

    mobileSearchForm: $("mobileSearchForm"),

    mobileSearchInput: $("mobileSearchInput"),

    filterSearchInput: $("filterSearchInput"),

    sortProducts: $("sortProducts"),

    availableOnly: $("availableOnlyFilter"),

    offersOnly: $("offersOnlyFilter"),

    minPrice: $("minPriceInput"),

    maxPrice: $("maxPriceInput"),

    applyPrice: $("applyPriceButton"),

    clearFilters: $("clearFiltersButton"),

    emptyClearFilters: $("emptyClearFiltersButton"),

    clearCategory: $("clearCategoryButton"),

    quickCategories: $("quickCategoriesGrid"),

    brandFilters: $("brandFilters"),

    activeFilters: $("activeFilters"),

    activeFilterTags: $("activeFilterTags"),

    pagination: $("catalogPagination"),

    paginationNumbers: $("paginationNumbers"),

    previousPage: $("previousPageButton"),

    nextPage: $("nextPageButton"),

    gridView: $("gridViewButton"),

    listView: $("listViewButton"),

    mobileFilterButton: $("mobileFilterButton"),

    mobileFilterCount: $("mobileFilterCount"),

    filters: $("catalogFilters"),

    filtersBackdrop: $("filtersBackdrop"),

    closeFilters: $("closeFiltersButton"),

    retryProducts: $("retryProductsButton"),

    modal: $("productModal"),

    modalClose: $("productModalClose"),

    modalImage: $("productModalImage"),

    modalBadge: $("productModalBadge"),

    modalCategory: $("productModalCategory"),

    modalName: $("productModalName"),

    modalCode: $("productModalCode"),

    modalDescription: $("productModalDescription"),

    modalStock: $("productModalStock"),

    modalStockIndicator: $("productModalStockIndicator"),

    modalOldPrice: $("productModalOldPrice"),

    modalPrice: $("productModalPrice"),

    modalInstallment: $("productModalInstallment"),

    modalQuantity: $("modalQuantity"),

    modalQuantityDecrease: $("modalQuantityDecrease"),

    modalQuantityIncrease: $("modalQuantityIncrease"),

    modalAddCart: $("modalAddToCartButton"),

    toast: $("productToast"),

    toastTitle: $("productToastTitle"),

    toastText: $("productToastText")

};


/* ============================================================
   FORMATADORES
============================================================ */

function formatMoney(value) {

    const number = Number(value) || 0;

    return number.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function normalizeText(value) {

    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

}


function normalizeCategory(value) {

    const normalized = normalizeText(value);

    const aliases = {

        freio: "freios",
        freios: "freios",

        motor: "motor",
        motores: "motor",

        suspensao: "suspensao",

        eletrica: "eletrica",
        eletrico: "eletrica",

        filtro: "filtros",
        filtros: "filtros",

        oleo: "oleos",
        oleos: "oleos",
        fluidos: "oleos"

    };

    return aliases[normalized] || normalized;

}


function categoryName(category) {

    const names = {

        freios: "Freios",

        motor: "Motor",

        suspensao: "Suspensão",

        eletrica: "Elétrica",

        filtros: "Filtros",

        oleos: "Óleos e Fluidos"

    };

    return names[category] || "Todos os produtos";

}


/* ============================================================
   PLACEHOLDER DE IMAGEM

   Assim a página NÃO fica com imagem quebrada caso você
   ainda não tenha colocado os PNGs na pasta.
============================================================ */

function createPlaceholder(product) {

    const category = categoryName(product.categoria);

    const svg = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="700"
            height="520"
            viewBox="0 0 700 520"
        >

            <defs>

                <linearGradient
                    id="bg"
                    x1="0"
                    x2="1"
                    y1="0"
                    y2="1"
                >

                    <stop
                        offset="0%"
                        stop-color="#f8fbff"
                    />

                    <stop
                        offset="100%"
                        stop-color="#eaf2fb"
                    />

                </linearGradient>

            </defs>

            <rect
                width="700"
                height="520"
                rx="34"
                fill="url(#bg)"
            />

            <circle
                cx="350"
                cy="205"
                r="90"
                fill="#1471ff"
                opacity=".08"
            />

            <circle
                cx="350"
                cy="205"
                r="62"
                fill="#1471ff"
                opacity=".12"
            />

            <text
                x="350"
                y="220"
                text-anchor="middle"
                font-size="70"
                font-family="Arial"
                fill="#1471ff"
            >
                ⚙
            </text>

            <text
                x="350"
                y="345"
                text-anchor="middle"
                font-size="26"
                font-weight="700"
                font-family="Arial"
                fill="#18324c"
            >
                ${escapeSvg(product.nome)}
            </text>

            <text
                x="350"
                y="382"
                text-anchor="middle"
                font-size="18"
                font-family="Arial"
                fill="#718197"
            >
                ${escapeSvg(category)}
            </text>

        </svg>
    `;

    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg)
    );

}


function escapeSvg(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

}


/* ============================================================
   NORMALIZA PRODUTO DA API
============================================================ */

function normalizeProduct(product, index = 0) {

    const id =
        product.id ??
        product.id_produto ??
        product.produto_id ??
        index + 1;

    const name =
        product.nome ??
        product.nome_produto ??
        product.name ??
        "Produto";

    const category =
        normalizeCategory(
            product.categoria ??
            product.nome_categoria ??
            product.category ??
            ""
        );

    const price =
        Number(
            product.preco ??
            product.valor ??
            product.price ??
            0
        );

    const oldPriceRaw =
        product.precoAntigo ??
        product.preco_antigo ??
        product.oldPrice ??
        null;

    const stock =
        Number(
            product.estoque ??
            product.quantidade_estoque ??
            product.stock ??
            0
        );

    return {

        id,

        nome: name,

        codigo:
            product.codigo ??
            product.codigo_produto ??
            product.sku ??
            `APC-${String(id).padStart(4, "0")}`,

        categoria: category,

        marca:
            product.marca ??
            product.nome_marca ??
            product.brand ??
            "Auto Peça Certa",

        preco: price,

        precoAntigo:
            oldPriceRaw !== null
                ? Number(oldPriceRaw)
                : null,

        estoque: stock,

        destaque:
            product.destaque ??
            product.badge ??
            "",

        oferta:
            Boolean(
                product.oferta ??
                product.promocao ??
                (
                    oldPriceRaw !== null &&
                    Number(oldPriceRaw) > price
                )
            ),

        vendidos:
            Number(
                product.vendidos ??
                product.total_vendidos ??
                0
            ),

        avaliacao:
            Number(
                product.avaliacao ??
                product.rating ??
                4.8
            ),

        imagem:
            product.imagem ??
            product.url_imagem ??
            product.image ??
            "",

        descricao:
            product.descricao ??
            product.description ??
            "Consulte as informações e a compatibilidade antes da compra."

    };

}


/* ============================================================
   CARREGAMENTO
============================================================ */

async function loadProducts() {

    showLoading();

    try {

        const response = await fetch(
            `${APC_PRODUCTS_CONFIG.apiBase}${APC_PRODUCTS_CONFIG.productsEndpoint}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                `API respondeu ${response.status}`
            );

        }

        const data = await response.json();

        const list = Array.isArray(data)
            ? data
            : (
                data.produtos ||
                data.products ||
                data.data ||
                []
            );

        if (!Array.isArray(list)) {

            throw new Error(
                "Formato de produtos inválido."
            );

        }

        productsState.products =
            list.map(normalizeProduct);

        productsState.usingFallback = false;

    }
    catch (error) {

        console.warn(
            "[Auto Peça Certa] API de produtos indisponível. " +
            "Usando catálogo local temporário.",
            error
        );

        productsState.products =
            APC_FALLBACK_PRODUCTS.map(normalizeProduct);

        productsState.usingFallback = true;

    }

    buildBrandFilters();

    readFiltersFromURL();

    applyFilters();

}


/* ============================================================
   LOADING
============================================================ */

function showLoading() {

    if (elements.productsLoading) {

        elements.productsLoading.hidden = false;

    }

    if (elements.productsGrid) {

        elements.productsGrid.hidden = true;

    }

    if (elements.productsEmpty) {

        elements.productsEmpty.hidden = true;

    }

    if (elements.productsError) {

        elements.productsError.hidden = true;

    }

}


/* ============================================================
   URL
============================================================ */

function readFiltersFromURL() {

    const params =
        new URLSearchParams(window.location.search);

    const category =
        normalizeCategory(
            params.get("categoria") || ""
        );

    const search =
        params.get("busca") || "";

    if (category) {

        productsState.category = category;

    }

    if (search) {

        productsState.search = search;

        syncSearchInputs(search);

    }

    syncCategoryControls();

}


function updateURL() {

    const params =
        new URLSearchParams();

    if (productsState.category) {

        params.set(
            "categoria",
            productsState.category
        );

    }

    if (productsState.search) {

        params.set(
            "busca",
            productsState.search
        );

    }

    const query = params.toString();

    const newURL =
        window.location.pathname +
        (query ? `?${query}` : "");

    window.history.replaceState(
        {},
        "",
        newURL
    );

}


/* ============================================================
   FILTROS
============================================================ */

function applyFilters() {

    let result = [...productsState.products];

    const search =
        normalizeText(productsState.search);

    if (search) {

        result = result.filter(product => {

            const haystack =
                normalizeText(
                    [
                        product.nome,
                        product.codigo,
                        product.marca,
                        product.categoria,
                        categoryName(product.categoria),
                        product.descricao
                    ].join(" ")
                );

            return haystack.includes(search);

        });

    }


    if (productsState.category) {

        result = result.filter(
            product =>
                product.categoria ===
                productsState.category
        );

    }


    if (productsState.brands.size > 0) {

        result = result.filter(
            product =>
                productsState.brands.has(
                    product.marca
                )
        );

    }


    if (productsState.minPrice !== null) {

        result = result.filter(
            product =>
                product.preco >=
                productsState.minPrice
        );

    }


    if (productsState.maxPrice !== null) {

        result = result.filter(
            product =>
                product.preco <=
                productsState.maxPrice
        );

    }


    if (productsState.availableOnly) {

        result = result.filter(
            product =>
                product.estoque > 0
        );

    }


    if (productsState.offersOnly) {

        result = result.filter(
            product =>
                product.oferta
        );

    }


    result = sortProducts(result);

    productsState.filteredProducts = result;

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                result.length /
                APC_PRODUCTS_CONFIG.itemsPerPage
            )
        );

    if (productsState.page > totalPages) {

        productsState.page = totalPages;

    }

    updateURL();

    updateCatalogHeader();

    renderProducts();

    renderActiveFilters();

    updateFilterCounter();

}


/* ============================================================
   ORDENAÇÃO
============================================================ */

function sortProducts(products) {

    const result = [...products];

    switch (productsState.sort) {

        case "menor-preco":

            result.sort(
                (a, b) =>
                    a.preco - b.preco
            );

            break;


        case "maior-preco":

            result.sort(
                (a, b) =>
                    b.preco - a.preco
            );

            break;


        case "nome":

            result.sort(
                (a, b) =>
                    a.nome.localeCompare(
                        b.nome,
                        "pt-BR"
                    )
            );

            break;


        case "mais-vendidos":

            result.sort(
                (a, b) =>
                    b.vendidos - a.vendidos
            );

            break;


        default:

            result.sort(
                (a, b) => {

                    if (
                        Boolean(b.oferta) !==
                        Boolean(a.oferta)
                    ) {

                        return Number(b.oferta) -
                               Number(a.oferta);

                    }

                    return b.vendidos - a.vendidos;

                }
            );

    }

    return result;

}


/* ============================================================
   CABEÇALHO DO CATÁLOGO
============================================================ */

function updateCatalogHeader() {

    const total =
        productsState.filteredProducts.length;

    if (elements.resultCount) {

        elements.resultCount.textContent =
            total === 1
                ? "1 produto encontrado"
                : `${total} produtos encontrados`;

    }

    if (
        elements.activeFilterDescription
    ) {

        if (productsState.usingFallback) {

            elements.activeFilterDescription.textContent =
                "Catálogo local carregado";

        }
        else {

            elements.activeFilterDescription.textContent =
                "Estoque conectado ao sistema";

        }

    }

    if (productsState.category) {

        const name =
            categoryName(
                productsState.category
            );

        if (elements.catalogTitle) {

            elements.catalogTitle.textContent =
                name;

        }

        if (elements.catalogDescription) {

            elements.catalogDescription.textContent =
                `Confira as opções disponíveis em ${name}.`;

        }

    }
    else {

        if (elements.catalogTitle) {

            elements.catalogTitle.textContent =
                productsState.search
                    ? "Resultados da pesquisa"
                    : "Todos os produtos";

        }

        if (elements.catalogDescription) {

            elements.catalogDescription.textContent =
                productsState.search
                    ? `Resultados para “${productsState.search}”.`
                    : "Explore as peças disponíveis na Auto Peça Certa.";

        }

    }

}


/* ============================================================
   RENDERIZA PRODUTOS
============================================================ */

function renderProducts() {

    if (!elements.productsGrid) {

        return;

    }

    if (elements.productsLoading) {

        elements.productsLoading.hidden = true;

    }

    if (elements.productsError) {

        elements.productsError.hidden = true;

    }

    const products =
        productsState.filteredProducts;

    if (products.length === 0) {

        elements.productsGrid.hidden = true;

        if (elements.productsEmpty) {

            elements.productsEmpty.hidden = false;

        }

        if (elements.pagination) {

            elements.pagination.hidden = true;

        }

        return;

    }

    if (elements.productsEmpty) {

        elements.productsEmpty.hidden = true;

    }

    const start =
        (productsState.page - 1) *
        APC_PRODUCTS_CONFIG.itemsPerPage;

    const end =
        start +
        APC_PRODUCTS_CONFIG.itemsPerPage;

    const pageProducts =
        products.slice(start, end);

    elements.productsGrid.innerHTML =
        pageProducts
            .map(createProductCard)
            .join("");

    elements.productsGrid.hidden = false;

    elements.productsGrid.classList.toggle(
        "list-view",
        productsState.view === "list"
    );

    bindProductCardEvents();

    renderPagination();

}


/* ============================================================
   CARD
============================================================ */

function createProductCard(product, index) {

    const image =
        product.imagem ||
        createPlaceholder(product);

    const placeholder =
        createPlaceholder(product);

    const oldPrice =
        product.precoAntigo &&
        product.precoAntigo > product.preco
            ? `
                <span class="product-old-price">
                    ${formatMoney(product.precoAntigo)}
                </span>
            `
            : `
                <span class="product-old-price">
                    &nbsp;
                </span>
            `;

    const badge =
        getProductBadge(product);

    const stock =
        getStockData(product);

    const stars =
        createStars(product.avaliacao);

    return `
        <article
            class="product-card"
            data-product-id="${product.id}"
            style="animation-delay:${Math.min(index, 8) * 45}ms"
        >

            <div class="product-card-image">

                ${badge}

                <span
                    class="product-stock-badge ${stock.className}"
                >
                    ${stock.shortText}
                </span>

                <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(product.nome)}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='${escapeHtml(placeholder)}';
                    "
                >

            </div>


            <div class="product-card-content">

                <span class="product-category-label">
                    ${escapeHtml(categoryName(product.categoria))}
                </span>

                <h3>
                    ${escapeHtml(product.nome)}
                </h3>

                <span class="product-code">
                    Cód. ${escapeHtml(product.codigo)}
                </span>

                <span class="product-brand">
                    ${escapeHtml(product.marca)}
                </span>


                <div class="product-rating">

                    <span class="product-rating-stars">
                        ${stars}
                    </span>

                    <span>
                        ${Number(product.avaliacao).toFixed(1)}
                    </span>

                </div>


                <div class="product-price-area">

                    ${oldPrice}

                    <strong class="product-price">
                        ${formatMoney(product.preco)}
                    </strong>

                    <span class="product-installment">
                        ou 6x de
                        ${formatMoney(product.preco / 6)}
                    </span>

                </div>


                <div class="product-card-actions">

                    <button
                        type="button"
                        class="product-details-button"
                        data-product-details="${product.id}"
                        aria-label="Ver detalhes de ${escapeHtml(product.nome)}"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </button>


                    <button
                        type="button"
                        class="product-add-cart"
                        data-product-cart="${product.id}"
                        ${product.estoque <= 0 ? "disabled" : ""}
                    >

                        <i class="fa-solid ${
                            product.estoque > 0
                                ? "fa-cart-plus"
                                : "fa-ban"
                        }"></i>

                        ${
                            product.estoque > 0
                                ? "Adicionar"
                                : "Indisponível"
                        }

                    </button>

                </div>

            </div>

        </article>
    `;

}


/* ============================================================
   BADGE
============================================================ */

function getProductBadge(product) {

    if (product.oferta) {

        return `
            <span class="product-badge offer">
                OFERTA
            </span>
        `;

    }

    if (
        normalizeText(product.destaque)
            .includes("novo")
    ) {

        return `
            <span class="product-badge new">
                NOVO
            </span>
        `;

    }

    if (product.destaque) {

        return `
            <span class="product-badge">
                ${escapeHtml(product.destaque)}
            </span>
        `;

    }

    return "";

}


/* ============================================================
   ESTOQUE
============================================================ */

function getStockData(product) {

    if (product.estoque <= 0) {

        return {
            className: "out",
            shortText: "Sem estoque",
            fullText: "Produto indisponível"
        };

    }

    if (product.estoque <= 5) {

        return {
            className: "low",
            shortText: "Últimas unidades",
            fullText:
                `Apenas ${product.estoque} em estoque`
        };

    }

    return {
        className: "",
        shortText: "Em estoque",
        fullText:
            `${product.estoque} unidades disponíveis`
    };

}


/* ============================================================
   ESTRELAS
============================================================ */

function createStars(rating) {

    const rounded =
        Math.round(Number(rating) || 0);

    let html = "";

    for (let i = 1; i <= 5; i++) {

        html += `
            <i class="${
                i <= rounded
                    ? "fa-solid"
                    : "fa-regular"
            } fa-star"></i>
        `;

    }

    return html;

}


/* ============================================================
   EVENTOS DOS CARDS
============================================================ */

function bindProductCardEvents() {

    document
        .querySelectorAll(
            "[data-product-details]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openProductModal(
                        button.dataset.productDetails
                    );

                }
            );

        });


    document
        .querySelectorAll(
            "[data-product-cart]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const product =
                        findProduct(
                            button.dataset.productCart
                        );

                    if (!product) {

                        return;

                    }

                    addToCart(
                        product,
                        1
                    );

                    animateCartButton(button);

                }
            );

        });

}


/* ============================================================
   PROCURA PRODUTO
============================================================ */

function findProduct(id) {

    return productsState.products.find(
        product =>
            String(product.id) === String(id)
    );

}


/* ============================================================
   MARCAS
============================================================ */

function buildBrandFilters() {

    if (!elements.brandFilters) {

        return;

    }

    const brands =
        [
            ...new Set(
                productsState.products
                    .map(product => product.marca)
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    "pt-BR"
                )
        );

    elements.brandFilters.innerHTML =
        brands
            .map(
                brand => `
                    <label class="filter-checkbox">

                        <input
                            type="checkbox"
                            value="${escapeHtml(brand)}"
                            data-brand-filter
                        >

                        <span class="checkbox-box">
                            <i class="fa-solid fa-check"></i>
                        </span>

                        ${escapeHtml(brand)}

                    </label>
                `
            )
            .join("");

    document
        .querySelectorAll(
            "[data-brand-filter]"
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                () => {

                    if (input.checked) {

                        productsState.brands.add(
                            input.value
                        );

                    }
                    else {

                        productsState.brands.delete(
                            input.value
                        );

                    }

                    productsState.page = 1;

                    applyFilters();

                }
            );

        });

}


/* ============================================================
   CATEGORIA
============================================================ */

function setCategory(category) {

    productsState.category =
        normalizeCategory(category);

    productsState.page = 1;

    syncCategoryControls();

    applyFilters();

    scrollToCatalog();

}


function syncCategoryControls() {

    document
        .querySelectorAll(
            ".quick-category"
        )
        .forEach(button => {

            const value =
                normalizeCategory(
                    button.dataset.category || ""
                );

            button.classList.toggle(
                "active",
                value === productsState.category
            );

        });


    document
        .querySelectorAll(
            'input[name="categoria"]'
        )
        .forEach(input => {

            input.checked =
                normalizeCategory(input.value) ===
                productsState.category;

        });


    if (elements.clearCategory) {

        elements.clearCategory.hidden =
            !productsState.category;

    }

}


/* ============================================================
   PESQUISA
============================================================ */

function setSearch(value) {

    productsState.search =
        String(value || "").trim();

    productsState.page = 1;

    syncSearchInputs(
        productsState.search
    );

    applyFilters();

}


function syncSearchInputs(value) {

    [
        elements.catalogSearchInput,
        elements.headerSearchInput,
        elements.mobileSearchInput,
        elements.filterSearchInput
    ]
    .filter(Boolean)
    .forEach(input => {

        if (input.value !== value) {

            input.value = value;

        }

    });

}


/* ============================================================
   FILTROS ATIVOS
============================================================ */

function renderActiveFilters() {

    if (
        !elements.activeFilters ||
        !elements.activeFilterTags
    ) {

        return;

    }

    const filters = [];


    if (productsState.search) {

        filters.push({
            type: "search",
            label:
                `Busca: ${productsState.search}`
        });

    }


    if (productsState.category) {

        filters.push({
            type: "category",
            label:
                categoryName(
                    productsState.category
                )
        });

    }


    productsState.brands.forEach(
        brand => {

            filters.push({
                type: "brand",
                value: brand,
                label: brand
            });

        }
    );


    if (productsState.minPrice !== null) {

        filters.push({
            type: "minPrice",
            label:
                `A partir de ${formatMoney(productsState.minPrice)}`
        });

    }


    if (productsState.maxPrice !== null) {

        filters.push({
            type: "maxPrice",
            label:
                `Até ${formatMoney(productsState.maxPrice)}`
        });

    }


    if (productsState.availableOnly) {

        filters.push({
            type: "available",
            label: "Em estoque"
        });

    }


    if (productsState.offersOnly) {

        filters.push({
            type: "offers",
            label: "Ofertas"
        });

    }


    elements.activeFilters.hidden =
        filters.length === 0;


    elements.activeFilterTags.innerHTML =
        filters
            .map(
                (filter, index) => `
                    <span class="active-filter-tag">

                        ${escapeHtml(filter.label)}

                        <button
                            type="button"
                            data-remove-filter="${index}"
                            aria-label="Remover filtro"
                        >
                            <i class="fa-solid fa-xmark"></i>
                        </button>

                    </span>
                `
            )
            .join("");


    document
        .querySelectorAll(
            "[data-remove-filter]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const filter =
                        filters[
                            Number(
                                button.dataset.removeFilter
                            )
                        ];

                    removeFilter(filter);

                }
            );

        });

}


/* ============================================================
   REMOVE UM FILTRO
============================================================ */

function removeFilter(filter) {

    if (!filter) {

        return;

    }

    switch (filter.type) {

        case "search":

            productsState.search = "";

            syncSearchInputs("");

            break;


        case "category":

            productsState.category = "";

            syncCategoryControls();

            break;


        case "brand":

            productsState.brands.delete(
                filter.value
            );

            document
                .querySelectorAll(
                    "[data-brand-filter]"
                )
                .forEach(input => {

                    if (
                        input.value ===
                        filter.value
                    ) {

                        input.checked = false;

                    }

                });

            break;


        case "minPrice":

            productsState.minPrice = null;

            if (elements.minPrice) {

                elements.minPrice.value = "";

            }

            break;


        case "maxPrice":

            productsState.maxPrice = null;

            if (elements.maxPrice) {

                elements.maxPrice.value = "";

            }

            break;


        case "available":

            productsState.availableOnly = false;

            if (elements.availableOnly) {

                elements.availableOnly.checked =
                    false;

            }

            break;


        case "offers":

            productsState.offersOnly = false;

            if (elements.offersOnly) {

                elements.offersOnly.checked =
                    false;

            }

            break;

    }

    productsState.page = 1;

    applyFilters();

}


/* ============================================================
   CONTADOR DOS FILTROS
============================================================ */

function updateFilterCounter() {

    let count = 0;

    if (productsState.category) count++;

    if (productsState.search) count++;

    count += productsState.brands.size;

    if (productsState.minPrice !== null) count++;

    if (productsState.maxPrice !== null) count++;

    if (productsState.availableOnly) count++;

    if (productsState.offersOnly) count++;

    if (elements.mobileFilterCount) {

        elements.mobileFilterCount.hidden =
            count === 0;

        elements.mobileFilterCount.textContent =
            count;

    }

}


/* ============================================================
   LIMPA TUDO
============================================================ */

function clearAllFilters() {

    productsState.category = "";

    productsState.search = "";

    productsState.brands.clear();

    productsState.minPrice = null;

    productsState.maxPrice = null;

    productsState.availableOnly = false;

    productsState.offersOnly = false;

    productsState.page = 1;


    syncSearchInputs("");

    syncCategoryControls();


    document
        .querySelectorAll(
            "[data-brand-filter]"
        )
        .forEach(input => {

            input.checked = false;

        });


    if (elements.minPrice) {

        elements.minPrice.value = "";

    }


    if (elements.maxPrice) {

        elements.maxPrice.value = "";

    }


    if (elements.availableOnly) {

        elements.availableOnly.checked =
            false;

    }


    if (elements.offersOnly) {

        elements.offersOnly.checked =
            false;

    }


    applyFilters();

}


/* ============================================================
   PAGINAÇÃO
============================================================ */

function renderPagination() {

    if (
        !elements.pagination ||
        !elements.paginationNumbers
    ) {

        return;

    }

    const totalPages =
        Math.ceil(
            productsState.filteredProducts.length /
            APC_PRODUCTS_CONFIG.itemsPerPage
        );


    if (totalPages <= 1) {

        elements.pagination.hidden = true;

        return;

    }


    elements.pagination.hidden = false;


    if (elements.previousPage) {

        elements.previousPage.disabled =
            productsState.page <= 1;

    }


    if (elements.nextPage) {

        elements.nextPage.disabled =
            productsState.page >= totalPages;

    }


    let pages = [];


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        if (
            page === 1 ||
            page === totalPages ||
            Math.abs(
                page - productsState.page
            ) <= 2
        ) {

            pages.push(page);

        }

    }


    pages = [...new Set(pages)];


    elements.paginationNumbers.innerHTML =
        pages
            .map(
                page => `
                    <button
                        type="button"
                        class="${
                            page === productsState.page
                                ? "active"
                                : ""
                        }"
                        data-page="${page}"
                    >
                        ${page}
                    </button>
                `
            )
            .join("");


    elements.paginationNumbers
        .querySelectorAll("[data-page]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    goToPage(
                        Number(
                            button.dataset.page
                        )
                    );

                }
            );

        });

}


/* ============================================================
   IR PARA PÁGINA
============================================================ */

function goToPage(page) {

    productsState.page = page;

    renderProducts();

    scrollToCatalog();

}


/* ============================================================
   MODAL
============================================================ */

function openProductModal(id) {

    const product =
        findProduct(id);

    if (
        !product ||
        !elements.modal
    ) {

        return;

    }


    productsState.selectedProduct =
        product;


    const placeholder =
        createPlaceholder(product);


    if (elements.modalImage) {

        elements.modalImage.src =
            product.imagem || placeholder;

        elements.modalImage.alt =
            product.nome;

        elements.modalImage.onerror =
            function () {

                this.onerror = null;

                this.src = placeholder;

            };

    }


    if (elements.modalCategory) {

        elements.modalCategory.textContent =
            categoryName(
                product.categoria
            ).toUpperCase();

    }


    if (elements.modalName) {

        elements.modalName.textContent =
            product.nome;

    }


    if (elements.modalCode) {

        elements.modalCode.textContent =
            product.codigo;

    }


    if (elements.modalDescription) {

        elements.modalDescription.textContent =
            product.descricao;

    }


    const stock =
        getStockData(product);


    if (elements.modalStock) {

        elements.modalStock.textContent =
            stock.fullText;

    }


    if (elements.modalStockIndicator) {

        elements.modalStockIndicator.className =
            `stock-indicator ${stock.className}`;

    }


    if (elements.modalPrice) {

        elements.modalPrice.textContent =
            formatMoney(product.preco);

    }


    if (elements.modalInstallment) {

        elements.modalInstallment.textContent =
            `ou 6x de ${formatMoney(product.preco / 6)}`;

    }


    if (elements.modalOldPrice) {

        if (
            product.precoAntigo &&
            product.precoAntigo >
            product.preco
        ) {

            elements.modalOldPrice.hidden =
                false;

            elements.modalOldPrice.textContent =
                formatMoney(
                    product.precoAntigo
                );

        }
        else {

            elements.modalOldPrice.hidden =
                true;

        }

    }


    if (elements.modalBadge) {

        if (product.oferta) {

            elements.modalBadge.hidden =
                false;

            elements.modalBadge.textContent =
                "OFERTA";

        }
        else if (product.destaque) {

            elements.modalBadge.hidden =
                false;

            elements.modalBadge.textContent =
                product.destaque;

        }
        else {

            elements.modalBadge.hidden =
                true;

        }

    }


    if (elements.modalQuantity) {

        elements.modalQuantity.value = 1;

        elements.modalQuantity.max =
            Math.max(
                1,
                product.estoque
            );

    }


    if (elements.modalAddCart) {

        elements.modalAddCart.disabled =
            product.estoque <= 0;

        elements.modalAddCart.innerHTML =
            product.estoque > 0
                ? `
                    <i class="fa-solid fa-cart-plus"></i>
                    Adicionar ao carrinho
                `
                : `
                    <i class="fa-solid fa-ban"></i>
                    Produto indisponível
                `;

    }


    elements.modal.hidden = false;

    document.body.style.overflow =
        "hidden";

}


/* ============================================================
   FECHA MODAL
============================================================ */

function closeProductModal() {

    if (!elements.modal) {

        return;

    }

    elements.modal.hidden = true;

    productsState.selectedProduct = null;

    document.body.style.overflow = "";

}


/* ============================================================
   QUANTIDADE MODAL
============================================================ */

function changeModalQuantity(amount) {

    if (
        !elements.modalQuantity ||
        !productsState.selectedProduct
    ) {

        return;

    }

    const max =
        Math.max(
            1,
            productsState.selectedProduct.estoque
        );

    let quantity =
        Number(
            elements.modalQuantity.value
        ) || 1;

    quantity += amount;

    quantity =
        Math.min(
            max,
            Math.max(
                1,
                quantity
            )
        );

    elements.modalQuantity.value =
        quantity;

}


/* ============================================================
   CARRINHO
============================================================ */

function readCart() {

    const keys = [
        APC_PRODUCTS_CONFIG.storage.cart,
        APC_PRODUCTS_CONFIG.storage.cartLegacy
    ];

    for (const key of keys) {

        try {

            const value =
                JSON.parse(
                    localStorage.getItem(key)
                );

            if (Array.isArray(value)) {

                return value;

            }

        }
        catch (error) {

            console.warn(
                `Carrinho inválido em ${key}.`,
                error
            );

        }

    }

    return [];

}


/* ============================================================
   SALVA CARRINHO
============================================================ */

function saveCart(cart) {

    /*
       Gravamos nas duas chaves por compatibilidade com
       versões anteriores do projeto.
    */

    localStorage.setItem(
        APC_PRODUCTS_CONFIG.storage.cart,
        JSON.stringify(cart)
    );

    localStorage.setItem(
        APC_PRODUCTS_CONFIG.storage.cartLegacy,
        JSON.stringify(cart)
    );

    updateCartCounters();

    window.dispatchEvent(
        new CustomEvent(
            "apc:cart-updated",
            {
                detail: {
                    cart
                }
            }
        )
    );

}


/* ============================================================
   ADICIONA AO CARRINHO
============================================================ */

function addToCart(
    product,
    quantity = 1
) {

    if (!product) {

        return;

    }


    if (product.estoque <= 0) {

        showToast(
            "Produto indisponível",
            "Este item está sem estoque."
        );

        return;

    }


    let requested =
        Math.max(
            1,
            Number(quantity) || 1
        );


    const cart =
        readCart();


    const existing =
        cart.find(
            item =>
                String(
                    item.id ??
                    item.id_produto
                ) ===
                String(product.id)
        );


    if (existing) {

        const currentQuantity =
            Number(
                existing.quantidade ??
                existing.quantity ??
                1
            );

        requested =
            Math.min(
                product.estoque,
                currentQuantity +
                requested
            );

        existing.quantidade =
            requested;

        existing.quantity =
            requested;

        existing.preco =
            product.preco;

        existing.nome =
            product.nome;

        existing.imagem =
            product.imagem ||
            createPlaceholder(product);

        existing.estoque =
            product.estoque;

    }
    else {

        requested =
            Math.min(
                product.estoque,
                requested
            );

        cart.push({

            id: product.id,

            id_produto: product.id,

            nome: product.nome,

            codigo: product.codigo,

            marca: product.marca,

            categoria: product.categoria,

            preco: product.preco,

            quantidade: requested,

            quantity: requested,

            estoque: product.estoque,

            imagem:
                product.imagem ||
                createPlaceholder(product)

        });

    }


    saveCart(cart);


    showToast(
        "Produto adicionado",
        `${product.nome} foi adicionado ao carrinho.`
    );

}


/* ============================================================
   CONTADORES DO CARRINHO
============================================================ */

function updateCartCounters() {

    const cart =
        readCart();

    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                (
                    Number(
                        item.quantidade ??
                        item.quantity
                    ) || 0
                ),
            0
        );


    document
        .querySelectorAll(
            "#cartCount, #mobileCartCount"
        )
        .forEach(element => {

            element.textContent =
                String(total);

        });

}


/* ============================================================
   TOAST
============================================================ */

let toastTimer = null;


function showToast(
    title,
    text
) {

    if (!elements.toast) {

        return;

    }


    if (elements.toastTitle) {

        elements.toastTitle.textContent =
            title;

    }


    if (elements.toastText) {

        elements.toastText.textContent =
            text;

    }


    elements.toast.classList.add(
        "show"
    );


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(
            () => {

                elements.toast.classList.remove(
                    "show"
                );

            },
            3300
        );

}


/* ============================================================
   ANIMAÇÃO DO BOTÃO
============================================================ */

function animateCartButton(button) {

    if (!button) {

        return;

    }

    const original =
        button.innerHTML;

    button.innerHTML = `
        <i class="fa-solid fa-check"></i>
        Adicionado
    `;

    button.style.transform =
        "scale(.97)";

    setTimeout(
        () => {

            button.style.transform = "";

        },
        180
    );

    setTimeout(
        () => {

            button.innerHTML =
                original;

        },
        1200
    );

}


/* ============================================================
   FILTROS MOBILE
============================================================ */

function openFilters() {

    if (elements.filters) {

        elements.filters.classList.add(
            "open"
        );

    }

    if (elements.filtersBackdrop) {

        elements.filtersBackdrop.classList.add(
            "show"
        );

    }

    document.body.style.overflow =
        "hidden";

}


function closeFilters() {

    if (elements.filters) {

        elements.filters.classList.remove(
            "open"
        );

    }

    if (elements.filtersBackdrop) {

        elements.filtersBackdrop.classList.remove(
            "show"
        );

    }

    document.body.style.overflow = "";

}


/* ============================================================
   VIEW
============================================================ */

function setView(view) {

    productsState.view = view;

    if (elements.gridView) {

        elements.gridView.classList.toggle(
            "active",
            view === "grid"
        );

    }

    if (elements.listView) {

        elements.listView.classList.toggle(
            "active",
            view === "list"
        );

    }

    if (elements.productsGrid) {

        elements.productsGrid.classList.toggle(
            "list-view",
            view === "list"
        );

    }

}


/* ============================================================
   SCROLL CATÁLOGO
============================================================ */

function scrollToCatalog() {

    const catalog =
        document.getElementById(
            "catalogo"
        );

    if (!catalog) {

        return;

    }

    const header =
        document.querySelector(
            ".site-header"
        );

    const headerHeight =
        header
            ? header.offsetHeight
            : 0;

    const top =
        catalog.getBoundingClientRect().top +
        window.scrollY -
        headerHeight -
        15;

    window.scrollTo({
        top,
        behavior: "smooth"
    });

}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ============================================================
   EVENTOS DE BUSCA
============================================================ */

function bindSearchEvents() {

    if (elements.catalogSearchForm) {

        elements.catalogSearchForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                setSearch(
                    elements.catalogSearchInput
                        ?.value
                );

                scrollToCatalog();

            }
        );

    }


    if (elements.headerSearchForm) {

        elements.headerSearchForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                setSearch(
                    elements.headerSearchInput
                        ?.value
                );

                scrollToCatalog();

            }
        );

    }


    if (elements.mobileSearchForm) {

        elements.mobileSearchForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                setSearch(
                    elements.mobileSearchInput
                        ?.value
                );

                scrollToCatalog();

            }
        );

    }


    if (elements.filterSearchInput) {

        let timer;

        elements.filterSearchInput.addEventListener(
            "input",
            () => {

                clearTimeout(timer);

                timer =
                    setTimeout(
                        () => {

                            setSearch(
                                elements
                                    .filterSearchInput
                                    .value
                            );

                        },
                        250
                    );

            }
        );

    }

}


/* ============================================================
   EVENTOS DOS FILTROS
============================================================ */

function bindFilterEvents() {

    document
        .querySelectorAll(
            ".quick-category"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    setCategory(
                        button.dataset.category
                    );

                }
            );

        });


    document
        .querySelectorAll(
            'input[name="categoria"]'
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                () => {

                    if (input.checked) {

                        setCategory(
                            input.value
                        );

                    }

                }
            );

        });


    document
        .querySelectorAll(
            "[data-filter-toggle]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const target =
                        document.getElementById(
                            button.dataset.filterToggle
                        );

                    if (!target) {

                        return;

                    }

                    target.classList.toggle(
                        "collapsed"
                    );

                    button.classList.toggle(
                        "collapsed"
                    );

                }
            );

        });


    if (elements.availableOnly) {

        elements.availableOnly.addEventListener(
            "change",
            () => {

                productsState.availableOnly =
                    elements.availableOnly.checked;

                productsState.page = 1;

                applyFilters();

            }
        );

    }


    if (elements.offersOnly) {

        elements.offersOnly.addEventListener(
            "change",
            () => {

                productsState.offersOnly =
                    elements.offersOnly.checked;

                productsState.page = 1;

                applyFilters();

            }
        );

    }


    if (elements.applyPrice) {

        elements.applyPrice.addEventListener(
            "click",
            () => {

                const min =
                    Number(
                        elements.minPrice?.value
                    );

                const max =
                    Number(
                        elements.maxPrice?.value
                    );


                productsState.minPrice =
                    elements.minPrice?.value !== ""
                        ? Math.max(0, min)
                        : null;


                productsState.maxPrice =
                    elements.maxPrice?.value !== ""
                        ? Math.max(0, max)
                        : null;


                if (
                    productsState.minPrice !== null &&
                    productsState.maxPrice !== null &&
                    productsState.minPrice >
                    productsState.maxPrice
                ) {

                    const temporary =
                        productsState.minPrice;

                    productsState.minPrice =
                        productsState.maxPrice;

                    productsState.maxPrice =
                        temporary;

                    if (elements.minPrice) {

                        elements.minPrice.value =
                            productsState.minPrice;

                    }

                    if (elements.maxPrice) {

                        elements.maxPrice.value =
                            productsState.maxPrice;

                    }

                }


                productsState.page = 1;

                applyFilters();

            }
        );

    }


    if (elements.clearFilters) {

        elements.clearFilters.addEventListener(
            "click",
            clearAllFilters
        );

    }


    if (elements.emptyClearFilters) {

        elements.emptyClearFilters.addEventListener(
            "click",
            clearAllFilters
        );

    }


    if (elements.clearCategory) {

        elements.clearCategory.addEventListener(
            "click",
            () => setCategory("")
        );

    }


    if (elements.sortProducts) {

        elements.sortProducts.addEventListener(
            "change",
            () => {

                productsState.sort =
                    elements.sortProducts.value;

                productsState.page = 1;

                applyFilters();

            }
        );

    }

}


/* ============================================================
   EVENTOS PAGINAÇÃO
============================================================ */

function bindPaginationEvents() {

    if (elements.previousPage) {

        elements.previousPage.addEventListener(
            "click",
            () => {

                if (productsState.page > 1) {

                    goToPage(
                        productsState.page - 1
                    );

                }

            }
        );

    }


    if (elements.nextPage) {

        elements.nextPage.addEventListener(
            "click",
            () => {

                const totalPages =
                    Math.ceil(
                        productsState
                            .filteredProducts
                            .length /
                        APC_PRODUCTS_CONFIG
                            .itemsPerPage
                    );

                if (
                    productsState.page <
                    totalPages
                ) {

                    goToPage(
                        productsState.page + 1
                    );

                }

            }
        );

    }

}


/* ============================================================
   EVENTOS VIEW
============================================================ */

function bindViewEvents() {

    if (elements.gridView) {

        elements.gridView.addEventListener(
            "click",
            () => setView("grid")
        );

    }


    if (elements.listView) {

        elements.listView.addEventListener(
            "click",
            () => setView("list")
        );

    }

}


/* ============================================================
   EVENTOS MODAL
============================================================ */

function bindModalEvents() {

    if (elements.modalClose) {

        elements.modalClose.addEventListener(
            "click",
            closeProductModal
        );

    }


    if (elements.modal) {

        elements.modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    elements.modal
                ) {

                    closeProductModal();

                }

            }
        );

    }


    if (elements.modalQuantityDecrease) {

        elements.modalQuantityDecrease
            .addEventListener(
                "click",
                () =>
                    changeModalQuantity(-1)
            );

    }


    if (elements.modalQuantityIncrease) {

        elements.modalQuantityIncrease
            .addEventListener(
                "click",
                () =>
                    changeModalQuantity(1)
            );

    }


    if (elements.modalQuantity) {

        elements.modalQuantity.addEventListener(
            "change",
            () => {

                if (
                    !productsState.selectedProduct
                ) {

                    return;

                }

                const max =
                    Math.max(
                        1,
                        productsState
                            .selectedProduct
                            .estoque
                    );

                let quantity =
                    Number(
                        elements.modalQuantity.value
                    ) || 1;

                quantity =
                    Math.max(
                        1,
                        Math.min(
                            max,
                            quantity
                        )
                    );

                elements.modalQuantity.value =
                    quantity;

            }
        );

    }


    if (elements.modalAddCart) {

        elements.modalAddCart.addEventListener(
            "click",
            () => {

                const product =
                    productsState.selectedProduct;

                if (!product) {

                    return;

                }

                const quantity =
                    Number(
                        elements.modalQuantity
                            ?.value
                    ) || 1;

                addToCart(
                    product,
                    quantity
                );

                closeProductModal();

            }
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                elements.modal &&
                !elements.modal.hidden
            ) {

                closeProductModal();

            }

        }
    );

}


/* ============================================================
   EVENTOS FILTRO MOBILE
============================================================ */

function bindMobileFilterEvents() {

    if (elements.mobileFilterButton) {

        elements.mobileFilterButton
            .addEventListener(
                "click",
                openFilters
            );

    }


    if (elements.closeFilters) {

        elements.closeFilters.addEventListener(
            "click",
            closeFilters
        );

    }


    if (elements.filtersBackdrop) {

        elements.filtersBackdrop
            .addEventListener(
                "click",
                closeFilters
            );

    }

}


/* ============================================================
   RETRY
============================================================ */

function bindRetry() {

    if (elements.retryProducts) {

        elements.retryProducts.addEventListener(
            "click",
            loadProducts
        );

    }

}


/* ============================================================
   ANIMAÇÃO AO ENTRAR NA TELA
============================================================ */

function initializeScrollAnimations() {

    if (
        !("IntersectionObserver" in window)
    ) {

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {

                        return;

                    }

                    entry.target.classList.add(
                        "apc-visible"
                    );

                    observer.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.12
            }
        );


    document
        .querySelectorAll(
            `
            .quick-category,
            .catalog-heading,
            .catalog-toolbar,
            .compatibility-content,
            .compatibility-visual,
            .products-benefits article
            `
        )
        .forEach(element => {

            element.classList.add(
                "apc-reveal"
            );

            observer.observe(element);

        });

}


/* ============================================================
   CSS MÍNIMO DAS REVEALS VIA JS

   Não depende de você alterar novamente o produtos.css.
============================================================ */

function injectRevealStyles() {

    if (
        document.getElementById(
            "apcProductsRuntimeStyles"
        )
    ) {

        return;

    }

    const style =
        document.createElement("style");

    style.id =
        "apcProductsRuntimeStyles";

    style.textContent = `

        .apc-reveal {
            opacity: 0;
            transform: translateY(22px);
            transition:
                opacity .65s ease,
                transform .65s cubic-bezier(.2,.8,.2,1);
        }

        .apc-reveal.apc-visible {
            opacity: 1;
            transform: translateY(0);
        }

        .products-benefits article:nth-child(2) {
            transition-delay: 70ms;
        }

        .products-benefits article:nth-child(3) {
            transition-delay: 140ms;
        }

        .products-benefits article:nth-child(4) {
            transition-delay: 210ms;
        }

    `;

    document.head.appendChild(style);

}


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

async function initializeProductsPage() {

    injectRevealStyles();

    bindSearchEvents();

    bindFilterEvents();

    bindPaginationEvents();

    bindViewEvents();

    bindModalEvents();

    bindMobileFilterEvents();

    bindRetry();

    updateCartCounters();

    initializeScrollAnimations();

    await loadProducts();

}


/* ============================================================
   DOM READY
============================================================ */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeProductsPage
    );

}
else {

    initializeProductsPage();

}
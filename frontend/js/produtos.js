/* =========================================================
   PRODUTOS.JS
   COMPONENT DATABASE
========================================================= */

const API =
  "http://localhost:3000/api";

const CAMINHO_IMAGENS =
  "assets/images/produtos";

const PLACEHOLDER_PRODUTO =
  `${CAMINHO_IMAGENS}/placeholder.webp`;

const PRODUTOS_POR_PAGINA =
  9;


/* =========================================================
   STATE
========================================================= */

let produtosCatalogo = [];

let produtosFiltrados = [];

let quantidadeVisivel =
  PRODUTOS_POR_PAGINA;

let modoVisualizacao =
  "grid";

let produtoQuickView =
  null;


/* =========================================================
   HERO
========================================================= */

const catalogHeroEyebrow =
  document.getElementById(
    "catalogHeroEyebrow"
  );

const catalogHeroTitleLine1 =
  document.getElementById(
    "catalogHeroTitleLine1"
  );

const catalogHeroTitleLine2 =
  document.getElementById(
    "catalogHeroTitleLine2"
  );

const catalogHeroDescription =
  document.getElementById(
    "catalogHeroDescription"
  );

const catalogRouteCategory =
  document.getElementById(
    "catalogRouteCategory"
  );


const HERO_CATEGORIAS = {

  todos: {

    eyebrow:
      "COMPONENT DATABASE",

    linha1:
      "Componentes que movem",

    linha2:
      "sua máquina.",

    descricao:
      "Encontre peças selecionadas para desempenho, segurança e confiabilidade.",

    route:
      "CATÁLOGO",

    classe:
      "catalog-theme-all"

  },


  motor: {

    eyebrow:
      "POWERTRAIN / ENGINE COMPONENTS",

    linha1:
      "Potência começa",

    linha2:
      "por dentro.",

    descricao:
      "Componentes desenvolvidos para manter o coração do seu veículo trabalhando no máximo.",

    route:
      "MOTOR",

    classe:
      "catalog-theme-engine"

  },


  freios: {

    eyebrow:
      "BRAKING SYSTEM / SAFETY COMPONENTS",

    linha1:
      "Controle quando",

    linha2:
      "cada metro importa.",

    descricao:
      "Componentes de frenagem para respostas precisas, segurança e confiança em cada parada.",

    route:
      "FREIOS",

    classe:
      "catalog-theme-brakes"

  },


  suspensao: {

    eyebrow:
      "CHASSIS / SUSPENSION SYSTEM",

    linha1:
      "Domine cada",

    linha2:
      "irregularidade.",

    descricao:
      "Estabilidade, conforto e controle para transformar a resposta do veículo em qualquer terreno.",

    route:
      "SUSPENSÃO",

    classe:
      "catalog-theme-suspension"

  },


  eletrica: {

    eyebrow:
      "ELECTRICAL SYSTEM / POWER NETWORK",

    linha1:
      "Energia para tudo",

    linha2:
      "acontecer.",

    descricao:
      "Componentes elétricos que mantêm cada sistema conectado, alimentado e pronto para funcionar.",

    route:
      "ELÉTRICA",

    classe:
      "catalog-theme-electric"

  },


  filtros: {

    eyebrow:
      "FILTRATION / PROTECTION SYSTEM",

    linha1:
      "Proteção começa",

    linha2:
      "antes do problema.",

    descricao:
      "Filtragem eficiente para preservar componentes essenciais e prolongar a vida útil do veículo.",

    route:
      "FILTROS",

    classe:
      "catalog-theme-filters"

  },


  oleos: {

    eyebrow:
      "LUBRICATION / FLUID SYSTEM",

    linha1:
      "Performance também",

    linha2:
      "é fluidez.",

    descricao:
      "Lubrificação, proteção térmica e eficiência para sistemas que não podem parar.",

    route:
      "ÓLEOS & FLUIDOS",

    classe:
      "catalog-theme-fluids"

  }

};


/* =========================================================
   ELEMENTS
========================================================= */

const catalogGrid =
  document.getElementById(
    "catalogGrid"
  );

const catalogLoading =
  document.getElementById(
    "catalogLoading"
  );

const catalogEmpty =
  document.getElementById(
    "catalogEmpty"
  );

const catalogSearch =
  document.getElementById(
    "catalogSearch"
  );

const clearCatalogSearch =
  document.getElementById(
    "clearCatalogSearch"
  );

const catalogSort =
  document.getElementById(
    "catalogSort"
  );

const viewGrid =
  document.getElementById(
    "viewGrid"
  );

const viewList =
  document.getElementById(
    "viewList"
  );

const filterInStock =
  document.getElementById(
    "filterInStock"
  );

const priceMin =
  document.getElementById(
    "priceMin"
  );

const priceMax =
  document.getElementById(
    "priceMax"
  );

const brandFilters =
  document.getElementById(
    "brandFilters"
  );

const clearAllFilters =
  document.getElementById(
    "clearAllFilters"
  );

const emptyClearFilters =
  document.getElementById(
    "emptyClearFilters"
  );

const activeFilters =
  document.getElementById(
    "activeFilters"
  );

const filterCount =
  document.getElementById(
    "filterCount"
  );

const resultCount =
  document.getElementById(
    "resultCount"
  );

const resultsTitle =
  document.getElementById(
    "resultsTitle"
  );

const catalogTotalProducts =
  document.getElementById(
    "catalogTotalProducts"
  );

const catalogAvailableProducts =
  document.getElementById(
    "catalogAvailableProducts"
  );

const catalogCategoryCount =
  document.getElementById(
    "catalogCategoryCount"
  );

const loadMoreProducts =
  document.getElementById(
    "loadMoreProducts"
  );

const paginationStatus =
  document.getElementById(
    "paginationStatus"
  );

const catalogPagination =
  document.getElementById(
    "catalogPagination"
  );

const openFilters =
  document.getElementById(
    "openFilters"
  );

const closeFilters =
  document.getElementById(
    "closeFilters"
  );

const catalogFilters =
  document.getElementById(
    "catalogFilters"
  );

const filtersBackdrop =
  document.getElementById(
    "filtersBackdrop"
  );

const catalogToast =
  document.getElementById(
    "catalogToast"
  );


const quickView =
  document.getElementById(
    "quickView"
  );

const quickViewBackdrop =
  document.getElementById(
    "quickViewBackdrop"
  );

const quickViewClose =
  document.getElementById(
    "quickViewClose"
  );

const quickViewImage =
  document.getElementById(
    "quickViewImage"
  );

const quickViewCategory =
  document.getElementById(
    "quickViewCategory"
  );

const quickViewName =
  document.getElementById(
    "quickViewName"
  );

const quickViewCode =
  document.getElementById(
    "quickViewCode"
  );

const quickViewBrand =
  document.getElementById(
    "quickViewBrand"
  );

const quickViewStock =
  document.getElementById(
    "quickViewStock"
  );

const quickViewPrice =
  document.getElementById(
    "quickViewPrice"
  );

const quickViewAdd =
  document.getElementById(
    "quickViewAdd"
  );

const quickViewDetails =
  document.getElementById(
    "quickViewDetails"
  );


const categoryFilters =
  Array.from(
    document.querySelectorAll(
      "[data-filter-category]"
    )
  );


/* =========================================================
   HELPERS
========================================================= */

function numeroSeguro(valor) {

  const numero =
    Number(valor);

  return Number.isFinite(numero)
    ? numero
    : 0;

}


function formatarMoeda(valor) {

  return numeroSeguro(valor)
    .toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );

}


function normalizarTexto(valor) {

  return String(valor || "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();

}


function obterCampo(
  objeto,
  campos,
  padrao = ""
) {

  for (
    const campo of campos
  ) {

    if (
      objeto?.[campo] !== undefined &&
      objeto?.[campo] !== null &&
      String(
        objeto[campo]
      ).trim() !== ""
    ) {

      return objeto[campo];

    }

  }


  return padrao;

}


function animar(
  elemento,
  frames,
  options
) {

  if (
    !elemento ||
    typeof elemento.animate !==
    "function"
  ) {

    return null;

  }


  return elemento.animate(
    frames,
    options
  );

}


/* =========================================================
   HERO CATEGORY
========================================================= */

function obterCategoriaURL() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const categoria =
    normalizarTexto(
      params.get(
        "categoria"
      )
    );


  if (
    HERO_CATEGORIAS[
      categoria
    ]
  ) {

    return categoria;

  }


  return "todos";

}


function aplicarHeroCategoria() {

  const categoria =
    obterCategoriaURL();


  const config =
    HERO_CATEGORIAS[
      categoria
    ];


  document.body.classList.remove(
    "catalog-theme-all",
    "catalog-theme-engine",
    "catalog-theme-brakes",
    "catalog-theme-suspension",
    "catalog-theme-electric",
    "catalog-theme-filters",
    "catalog-theme-fluids"
  );


  document.body.classList.add(
    config.classe
  );


  catalogHeroEyebrow.textContent =
    config.eyebrow;


  catalogHeroTitleLine1.textContent =
    config.linha1;


  catalogHeroTitleLine2.textContent =
    config.linha2;


  catalogHeroDescription.textContent =
    config.descricao;


  if (
    catalogRouteCategory
  ) {

    catalogRouteCategory.textContent =
      config.route;

  }


  animar(
    catalogHeroTitleLine1,
    [
      {
        opacity: 0,
        transform:
          "translateX(-45px)",
        clipPath:
          "inset(0 100% 0 0)"
      },
      {
        opacity: 1,
        transform:
          "translateX(0)",
        clipPath:
          "inset(0 0 0 0)"
      }
    ],
    {
      duration: 700,
      easing:
        "cubic-bezier(.16,1,.3,1)",
      fill: "both"
    }
  );


  animar(
    catalogHeroTitleLine2,
    [
      {
        opacity: 0,
        transform:
          "translateX(45px)",
        clipPath:
          "inset(0 0 0 100%)"
      },
      {
        opacity: 1,
        transform:
          "translateX(0)",
        clipPath:
          "inset(0 0 0 0)"
      }
    ],
    {
      duration: 750,
      delay: 160,
      easing:
        "cubic-bezier(.16,1,.3,1)",
      fill: "both"
    }
  );

}


/* =========================================================
   IMAGE
========================================================= */

function obterImagem(imagem) {

  const valor =
    String(
      imagem || ""
    ).trim();


  if (!valor) {
    return PLACEHOLDER_PRODUTO;
  }


  if (
    valor.startsWith("http://") ||
    valor.startsWith("https://") ||
    valor.startsWith("data:")
  ) {

    return valor;

  }


  const nome =
    valor
      .split(/[\\/]/)
      .pop();


  return (
    `${CAMINHO_IMAGENS}/` +
    encodeURIComponent(nome)
  );

}


/* =========================================================
   CART
========================================================= */

function obterCarrinho() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "carrinho"
      )
    ) || [];

  } catch {

    return [];

  }

}


function salvarCarrinho(
  carrinho
) {

  localStorage.setItem(
    "carrinho",
    JSON.stringify(
      carrinho
    )
  );


  window.dispatchEvent(
    new CustomEvent(
      "carrinhoAtualizado"
    )
  );


  window.SiteUI
    ?.atualizarCarrinho?.();

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function mostrarToast(
  mensagem,
  tipo = "success"
) {

  clearTimeout(
    toastTimer
  );


  catalogToast.classList.remove(
    "show",
    "error",
    "warning"
  );


  if (
    tipo !== "success"
  ) {

    catalogToast.classList.add(
      tipo
    );

  }


  catalogToast.textContent =
    mensagem;


  void catalogToast.offsetWidth;


  catalogToast.classList.add(
    "show"
  );


  toastTimer =
    setTimeout(
      () => {

        catalogToast.classList.remove(
          "show"
        );

      },
      2500
    );

}


/* =========================================================
   API
========================================================= */

async function carregarProdutos() {

  try {

    const resposta =
      await fetch(
        `${API}/produtos`
      );


    if (!resposta.ok) {

      throw new Error(
        "API indisponível"
      );

    }


    const dados =
      await resposta.json();


    produtosCatalogo =
      Array.isArray(dados)
        ? dados
        : [];


    localStorage.setItem(
      "produtosMock",
      JSON.stringify(
        produtosCatalogo
      )
    );


  } catch (erro) {

    console.warn(
      erro
    );


    try {

      produtosCatalogo =
        JSON.parse(
          localStorage.getItem(
            "produtosMock"
          )
        ) || [];

    } catch {

      produtosCatalogo = [];

    }

  }


  catalogLoading.style.display =
    "none";

}


/* =========================================================
   METRICS
========================================================= */

function atualizarMetricasHero() {

  catalogTotalProducts.textContent =
    String(
      produtosCatalogo.length
    ).padStart(
      3,
      "0"
    );


  const disponiveis =
    produtosCatalogo.filter(
      produto =>
        numeroSeguro(
          produto.quantidade_estoque
        ) > 0
    ).length;


  catalogAvailableProducts.textContent =
    String(
      disponiveis
    ).padStart(
      3,
      "0"
    );


  const categorias =
    new Set(
      produtosCatalogo.map(
        produto =>
          normalizarTexto(
            obterCampo(
              produto,
              [
                "categoria_produto",
                "categoria"
              ]
            )
          )
      )
    );


  catalogCategoryCount.textContent =
    String(
      categorias.size
    ).padStart(
      2,
      "0"
    );

}


/* =========================================================
   BRAND FILTERS
========================================================= */

function renderizarFiltrosMarca() {

  brandFilters.innerHTML =
    "";


  const marcas =
    [
      ...new Set(
        produtosCatalogo
          .map(
            produto =>
              obterCampo(
                produto,
                [
                  "marca_produto",
                  "marca"
                ]
              )
          )
          .filter(Boolean)
      )
    ].sort();


  marcas.forEach(
    marca => {

      const label =
        document.createElement(
          "label"
        );


      label.className =
        "filter-check";


      label.innerHTML = `
        <input
          type="checkbox"
          value="${marca}"
          data-filter-brand
        >

        <span></span>

        ${marca}
      `;


      label
        .querySelector("input")
        .addEventListener(
          "change",
          atualizarCatalogo
        );


      brandFilters.appendChild(
        label
      );

    }
  );

}


/* =========================================================
   FILTER URL
========================================================= */

function aplicarFiltrosDaURL() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const categoria =
    normalizarTexto(
      params.get(
        "categoria"
      )
    );


  const busca =
    params.get(
      "busca"
    );


  if (busca) {

    catalogSearch.value =
      busca;

  }


  if (categoria) {

    const input =
      categoryFilters.find(
        item =>
          normalizarTexto(
            item.value
          ) ===
          categoria
      );


    if (input) {

      input.checked = true;

    }

  }

}


/* =========================================================
   FILTER
========================================================= */

function aplicarFiltros() {

  const busca =
    normalizarTexto(
      catalogSearch.value
    );


  const categorias =
    categoryFilters
      .filter(
        input =>
          input.checked
      )
      .map(
        input =>
          normalizarTexto(
            input.value
          )
      );


  const marcas =
    Array.from(
      document.querySelectorAll(
        "[data-filter-brand]:checked"
      )
    )
      .map(
        input =>
          normalizarTexto(
            input.value
          )
      );


  const min =
    priceMin.value !== ""
      ? numeroSeguro(
          priceMin.value
        )
      : null;


  const max =
    priceMax.value !== ""
      ? numeroSeguro(
          priceMax.value
        )
      : null;


  produtosFiltrados =
    produtosCatalogo.filter(
      produto => {

        const nome =
          normalizarTexto(
            produto.nome_produto
          );


        const marca =
          normalizarTexto(
            obterCampo(
              produto,
              [
                "marca_produto",
                "marca"
              ]
            )
          );


        const categoria =
          normalizarTexto(
            obterCampo(
              produto,
              [
                "categoria_produto",
                "categoria"
              ]
            )
          );


        const codigo =
          normalizarTexto(
            obterCampo(
              produto,
              [
                "codigo_produto",
                "codigo",
                "sku"
              ]
            )
          );


        const preco =
          numeroSeguro(
            produto.preco_produto
          );


        const estoque =
          numeroSeguro(
            produto.quantidade_estoque
          );


        return (
          (
            !busca ||
            nome.includes(busca) ||
            marca.includes(busca) ||
            categoria.includes(busca) ||
            codigo.includes(busca)
          ) &&
          (
            categorias.length === 0 ||
            categorias.includes(
              categoria
            )
          ) &&
          (
            marcas.length === 0 ||
            marcas.includes(
              marca
            )
          ) &&
          (
            !filterInStock.checked ||
            estoque > 0
          ) &&
          (
            min === null ||
            preco >= min
          ) &&
          (
            max === null ||
            preco <= max
          )
        );

      }
    );


  ordenarProdutos();

}


/* =========================================================
   SORT
========================================================= */

function ordenarProdutos() {

  switch (
    catalogSort.value
  ) {

    case "menor-preco":

      produtosFiltrados.sort(
        (
          a,
          b
        ) =>
          numeroSeguro(
            a.preco_produto
          ) -
          numeroSeguro(
            b.preco_produto
          )
      );

      break;


    case "maior-preco":

      produtosFiltrados.sort(
        (
          a,
          b
        ) =>
          numeroSeguro(
            b.preco_produto
          ) -
          numeroSeguro(
            a.preco_produto
          )
      );

      break;


    case "nome":

      produtosFiltrados.sort(
        (
          a,
          b
        ) =>
          String(
            a.nome_produto
          ).localeCompare(
            b.nome_produto,
            "pt-BR"
          )
      );

      break;


    case "estoque":

      produtosFiltrados.sort(
        (
          a,
          b
        ) =>
          numeroSeguro(
            b.quantidade_estoque
          ) -
          numeroSeguro(
            a.quantidade_estoque
          )
      );

      break;

  }

}


/* =========================================================
   CARD
========================================================= */

function criarCardProduto(
  produto,
  indice
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "catalog-product";


  const estoque =
    numeroSeguro(
      produto.quantidade_estoque
    );


  const categoria =
    obterCampo(
      produto,
      [
        "categoria_produto",
        "categoria"
      ],
      "Autopeças"
    );


  const marca =
    obterCampo(
      produto,
      [
        "marca_produto",
        "marca"
      ],
      "Não informada"
    );


  const codigo =
    obterCampo(
      produto,
      [
        "codigo_produto",
        "codigo",
        "sku"
      ],
      produto.id_produto
    );


  card.innerHTML = `
    <div class="catalog-product-media">

      <img
        src="${obterImagem(produto.imagem)}"
        alt="${produto.nome_produto || "Produto"}"
      >

      <span
        class="
          catalog-product-status
          ${
            estoque <= 0
              ? "danger"
              : estoque <= 5
                ? "warning"
                : ""
          }
        "
      >

        ${
          estoque <= 0
            ? "SEM ESTOQUE"
            : estoque <= 5
              ? `${estoque} RESTANTES`
              : "EM ESTOQUE"
        }

      </span>

      <button
        class="catalog-quick-button"
        type="button"
      >
        <i class="fa-solid fa-expand"></i>
      </button>

    </div>


    <div class="catalog-product-content">

      <div class="catalog-product-top">

        <span class="catalog-product-category">
          ${categoria.toUpperCase()}
        </span>

        <span class="catalog-product-code">
          COD ${codigo}
        </span>

      </div>

      <h3>
        ${produto.nome_produto}
      </h3>

      <span class="catalog-product-brand">

        <i class="fa-solid fa-certificate"></i>

        ${marca}

      </span>

      <div class="catalog-product-footer">

        <div class="catalog-product-price">

          <small>
            PREÇO
          </small>

          <strong>
            ${formatarMoeda(produto.preco_produto)}
          </strong>

        </div>

        <button
          class="catalog-add-cart"
          type="button"
          ${estoque <= 0 ? "disabled" : ""}
        >

          <i class="fa-solid fa-cart-plus"></i>

          ${
            estoque <= 0
              ? "INDISPONÍVEL"
              : "ADICIONAR"
          }

        </button>

      </div>

    </div>
  `;


  const quick =
    card.querySelector(
      ".catalog-quick-button"
    );


  quick.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      abrirQuickView(
        produto
      );

    }
  );


  const add =
    card.querySelector(
      ".catalog-add-cart"
    );


  add.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      adicionarProdutoCarrinho(
        produto,
        card,
        add
      );

    }
  );


  card.addEventListener(
    "click",
    () => {

      window.location.href =
        `produto.html?id=${produto.id_produto}`;

    }
  );


  setTimeout(
    () => {

      card.classList.add(
        "catalog-product-visible"
      );

    },
    indice * 55
  );


  return card;

}


/* =========================================================
   RENDER
========================================================= */

function renderizarCatalogo() {

  catalogGrid.innerHTML =
    "";


  const visiveis =
    produtosFiltrados.slice(
      0,
      quantidadeVisivel
    );


  if (
    visiveis.length === 0
  ) {

    catalogEmpty.hidden =
      false;

    catalogPagination.style.display =
      "none";

  } else {

    catalogEmpty.hidden =
      true;

  }


  visiveis.forEach(
    (
      produto,
      indice
    ) => {

      catalogGrid.appendChild(
        criarCardProduto(
          produto,
          indice
        )
      );

    }
  );


  resultCount.textContent =
    produtosFiltrados.length;


  paginationStatus.textContent =
    `${visiveis.length} de ${produtosFiltrados.length} produtos`;


  catalogPagination.style.display =
    produtosFiltrados.length > 0
      ? "flex"
      : "none";


  loadMoreProducts.style.display =
    visiveis.length <
    produtosFiltrados.length
      ? "flex"
      : "none";

}


/* =========================================================
   UPDATE
========================================================= */

function atualizarCatalogo() {

  quantidadeVisivel =
    PRODUTOS_POR_PAGINA;


  aplicarFiltros();

  renderizarCatalogo();

  atualizarTitulo();

}


/* =========================================================
   RESULT TITLE
========================================================= */

function atualizarTitulo() {

  const busca =
    catalogSearch.value.trim();


  const categorias =
    categoryFilters.filter(
      input =>
        input.checked
    );


  if (busca) {

    resultsTitle.textContent =
      `Resultados para "${busca}"`;

  } else if (
    categorias.length === 1
  ) {

    resultsTitle.textContent =
      categorias[0]
        .parentElement
        .textContent
        .trim();

  } else {

    resultsTitle.textContent =
      "Todos os produtos";

  }

}


/* =========================================================
   ADD CART
========================================================= */

function adicionarProdutoCarrinho(
  produto,
  card,
  botao
) {

  const estoque =
    numeroSeguro(
      produto.quantidade_estoque
    );


  const carrinho =
    obterCarrinho();


  const existente =
    carrinho.find(
      item =>
        Number(
          item.id_produto
        ) ===
        Number(
          produto.id_produto
        )
    );


  if (existente) {

    if (
      existente.quantidade >=
      estoque
    ) {

      mostrarToast(
        "Limite de estoque atingido.",
        "warning"
      );

      return;

    }


    existente.quantidade++;

  } else {

    carrinho.push({

      id_produto:
        produto.id_produto,

      nome_produto:
        produto.nome_produto,

      preco_produto:
        numeroSeguro(
          produto.preco_produto
        ),

      quantidade_estoque:
        estoque,

      imagem:
        produto.imagem,

      quantidade: 1

    });

  }


  salvarCarrinho(
    carrinho
  );


  const original =
    botao.innerHTML;


  botao.innerHTML =
    `
      <i class="fa-solid fa-check"></i>
      ADICIONADO
    `;


  animar(
    card,
    [
      {
        transform:
          "scale(1)"
      },
      {
        transform:
          "scale(.97)"
      },
      {
        transform:
          "scale(1.015)"
      },
      {
        transform:
          "scale(1)"
      }
    ],
    {
      duration: 420
    }
  );


  setTimeout(
    () => {

      botao.innerHTML =
        original;

    },
    1000
  );


  mostrarToast(
    "Produto adicionado ao Smart Cart."
  );

}


/* =========================================================
   QUICK
========================================================= */

function abrirQuickView(
  produto
) {

  produtoQuickView =
    produto;


  quickViewImage.src =
    obterImagem(
      produto.imagem
    );


  quickViewCategory.textContent =
    obterCampo(
      produto,
      [
        "categoria_produto",
        "categoria"
      ],
      "Autopeças"
    );


  quickViewName.textContent =
    produto.nome_produto;


  quickViewCode.textContent =
    obterCampo(
      produto,
      [
        "codigo_produto",
        "codigo",
        "sku"
      ],
      produto.id_produto
    );


  quickViewBrand.textContent =
    obterCampo(
      produto,
      [
        "marca_produto",
        "marca"
      ],
      "Não informada"
    );


  quickViewStock.textContent =
    `${numeroSeguro(
      produto.quantidade_estoque
    )} unidades`;


  quickViewPrice.textContent =
    formatarMoeda(
      produto.preco_produto
    );


  quickViewDetails.href =
    `produto.html?id=${produto.id_produto}`;


  quickView.hidden =
    false;


  document.body.style.overflow =
    "hidden";

}


function fecharQuick() {

  quickView.hidden =
    true;


  document.body.style.overflow =
    "";


  produtoQuickView =
    null;

}


/* =========================================================
   CLEAR
========================================================= */

function limparFiltros() {

  categoryFilters.forEach(
    input =>
      input.checked =
        false
  );


  document
    .querySelectorAll(
      "[data-filter-brand]"
    )
    .forEach(
      input =>
        input.checked =
          false
    );


  filterInStock.checked =
    false;


  priceMin.value =
    "";


  priceMax.value =
    "";


  catalogSearch.value =
    "";


  catalogSort.value =
    "relevancia";


  window.history.replaceState(
    {},
    "",
    "produtos.html"
  );


  aplicarHeroCategoria();

  atualizarCatalogo();

}


/* =========================================================
   FILTER MODULE
========================================================= */

function configurarModulosFiltro() {

  document
    .querySelectorAll(
      "[data-filter-toggle]"
    )
    .forEach(
      botao => {

        botao.addEventListener(
          "click",
          () => {

            botao
              .closest(
                ".filter-module"
              )
              .classList.toggle(
                "collapsed"
              );

          }
        );

      }
    );

}


/* =========================================================
   EVENTS
========================================================= */

catalogSearch.addEventListener(
  "input",
  atualizarCatalogo
);


clearCatalogSearch.addEventListener(
  "click",
  () => {

    catalogSearch.value =
      "";

    atualizarCatalogo();

  }
);


catalogSort.addEventListener(
  "change",
  atualizarCatalogo
);


filterInStock.addEventListener(
  "change",
  atualizarCatalogo
);


priceMin.addEventListener(
  "input",
  atualizarCatalogo
);


priceMax.addEventListener(
  "input",
  atualizarCatalogo
);


categoryFilters.forEach(
  input =>
    input.addEventListener(
      "change",
      atualizarCatalogo
    )
);


viewGrid.addEventListener(
  "click",
  () => {

    modoVisualizacao =
      "grid";


    catalogGrid.classList.remove(
      "list-view"
    );


    viewGrid.classList.add(
      "active"
    );


    viewList.classList.remove(
      "active"
    );

  }
);


viewList.addEventListener(
  "click",
  () => {

    modoVisualizacao =
      "list";


    catalogGrid.classList.add(
      "list-view"
    );


    viewList.classList.add(
      "active"
    );


    viewGrid.classList.remove(
      "active"
    );

  }
);


loadMoreProducts.addEventListener(
  "click",
  () => {

    quantidadeVisivel +=
      PRODUTOS_POR_PAGINA;


    renderizarCatalogo();

  }
);


clearAllFilters.addEventListener(
  "click",
  limparFiltros
);


emptyClearFilters.addEventListener(
  "click",
  limparFiltros
);


openFilters.addEventListener(
  "click",
  () => {

    catalogFilters.classList.add(
      "open"
    );


    filtersBackdrop.classList.add(
      "show"
    );

  }
);


closeFilters.addEventListener(
  "click",
  () => {

    catalogFilters.classList.remove(
      "open"
    );


    filtersBackdrop.classList.remove(
      "show"
    );

  }
);


filtersBackdrop.addEventListener(
  "click",
  () => {

    catalogFilters.classList.remove(
      "open"
    );


    filtersBackdrop.classList.remove(
      "show"
    );

  }
);


quickViewClose.addEventListener(
  "click",
  fecharQuick
);


quickViewBackdrop.addEventListener(
  "click",
  fecharQuick
);


quickViewAdd.addEventListener(
  "click",
  () => {

    if (!produtoQuickView) {
      return;
    }


    adicionarProdutoCarrinho(
      produtoQuickView,
      document.querySelector(
        ".quick-view-window"
      ),
      quickViewAdd
    );

  }
);


/* =========================================================
   INIT
========================================================= */

async function iniciarCatalogo() {

  aplicarHeroCategoria();

  configurarModulosFiltro();

  await carregarProdutos();

  atualizarMetricasHero();

  renderizarFiltrosMarca();

  aplicarFiltrosDaURL();

  aplicarFiltros();

  renderizarCatalogo();

  atualizarTitulo();


  window.SiteUI
    ?.atualizarCarrinho?.();

}


iniciarCatalogo();
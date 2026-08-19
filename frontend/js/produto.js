/* =========================================================
   PRODUTO.JS
   COMPONENT DETAIL / TECHNICAL VIEW
   Loja de Peças
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const API =
  "http://localhost:3000/api";

const CAMINHO_IMAGENS =
  "assets/images/produtos";

const PLACEHOLDER_PRODUTO =
  `${CAMINHO_IMAGENS}/placeholder.webp`;


/* =========================================================
   STATE
========================================================= */

let produtoAtual =
  null;

let produtosCatalogo =
  [];

let quantidadeSelecionada =
  1;

let relatedIndex =
  0;

let relatedPerView =
  4;

let cartConfirmationTimer =
  null;

let animacaoProdutoInicialFinalizada =
  false;


/* =========================================================
   ELEMENTS
========================================================= */


/* LOADING / ERROR */

const productLoading =
  document.getElementById(
    "productLoading"
  );

const productError =
  document.getElementById(
    "productError"
  );


/* HERO */

const productHero =
  document.getElementById(
    "productHero"
  );

const productMainImage =
  document.getElementById(
    "productMainImage"
  );

const productName =
  document.getElementById(
    "productName"
  );

const productBrand =
  document.getElementById(
    "productBrand"
  );

const productCategoryBadge =
  document.getElementById(
    "productCategoryBadge"
  );

const productCode =
  document.getElementById(
    "productCode"
  );

const productShortDescription =
  document.getElementById(
    "productShortDescription"
  );

const productPrice =
  document.getElementById(
    "productPrice"
  );

const productInstallment =
  document.getElementById(
    "productInstallment"
  );

const productStock =
  document.getElementById(
    "productStock"
  );

const productAvailability =
  document.getElementById(
    "productAvailability"
  );


/* TECH POINTS */

const techPointOne =
  document.getElementById(
    "techPointOne"
  );

const techPointTwo =
  document.getElementById(
    "techPointTwo"
  );

const techPointThree =
  document.getElementById(
    "techPointThree"
  );

const techPointStock =
  document.getElementById(
    "techPointStock"
  );

const techPointBrand =
  document.getElementById(
    "techPointBrand"
  );

const techPointCategory =
  document.getElementById(
    "techPointCategory"
  );


/* ROUTE */

const productRouteCategory =
  document.getElementById(
    "productRouteCategory"
  );

const productRouteName =
  document.getElementById(
    "productRouteName"
  );


/* DATA BAR */

const dataProductCode =
  document.getElementById(
    "dataProductCode"
  );

const dataProductBrand =
  document.getElementById(
    "dataProductBrand"
  );

const dataProductCategory =
  document.getElementById(
    "dataProductCategory"
  );

const dataProductStock =
  document.getElementById(
    "dataProductStock"
  );


/* DESCRIPTION / SPECS */

const productDescription =
  document.getElementById(
    "productDescription"
  );

const productSpecifications =
  document.getElementById(
    "productSpecifications"
  );


/* INVENTORY */

const inventoryNumber =
  document.getElementById(
    "inventoryNumber"
  );

const inventoryMeter =
  document.getElementById(
    "inventoryMeter"
  );

const inventoryMessage =
  document.getElementById(
    "inventoryMessage"
  );


/* QUANTITY */

const decreaseQuantity =
  document.getElementById(
    "decreaseQuantity"
  );

const increaseQuantity =
  document.getElementById(
    "increaseQuantity"
  );

const productQuantity =
  document.getElementById(
    "productQuantity"
  );

const quantityStockInfo =
  document.getElementById(
    "quantityStockInfo"
  );


/* ACTIONS */

const productAddCart =
  document.getElementById(
    "productAddCart"
  );

const productBuyNow =
  document.getElementById(
    "productBuyNow"
  );

const productCopyLink =
  document.getElementById(
    "productCopyLink"
  );

const productAddProgress =
  document.querySelector(
    ".product-add-progress"
  );


/* COMPATIBILITY */

const compatibilityPanel =
  document.querySelector(
    ".compatibility-panel"
  );

const compatibilityCategoryLink =
  document.getElementById(
    "compatibilityCategoryLink"
  );

const productCompatibilityText =
  document.getElementById(
    "productCompatibilityText"
  );


/* RELATED */

const relatedProducts =
  document.getElementById(
    "relatedProducts"
  );

const relatedPrev =
  document.getElementById(
    "relatedPrev"
  );

const relatedNext =
  document.getElementById(
    "relatedNext"
  );


/* CONFIRMATION */

const productCartConfirmation =
  document.getElementById(
    "productCartConfirmation"
  );


/* TOAST */

const productToast =
  document.getElementById(
    "productToast"
  );


/* =========================================================
   HELPERS
========================================================= */

function numeroSeguro(
  valor
) {

  const numero =
    Number(valor);


  return Number.isFinite(
    numero
  )
    ? numero
    : 0;

}


function formatarMoeda(
  valor
) {

  return numeroSeguro(
    valor
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

}


function normalizarTexto(
  valor
) {

  return String(
    valor || ""
  )
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

  if (!objeto) {
    return padrao;
  }


  for (
    const campo of campos
  ) {

    const valor =
      objeto[campo];


    if (
      valor !== undefined &&
      valor !== null &&
      String(valor).trim() !== ""
    ) {

      return valor;

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


function esperar(
  ms
) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );

}


/* =========================================================
   IMAGE
========================================================= */

function obterImagem(
  imagem
) {

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


  if (!nome) {
    return PLACEHOLDER_PRODUTO;
  }


  return (
    `${CAMINHO_IMAGENS}/` +
    encodeURIComponent(nome)
  );

}


/* =========================================================
   URL ID
========================================================= */

function obterIdProdutoURL() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const id =
    Number(
      params.get("id")
    );


  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {

    return null;

  }


  return id;

}


/* =========================================================
   CARRINHO
========================================================= */

function obterCarrinho() {

  try {

    const salvo =
      localStorage.getItem(
        "carrinho"
      );


    if (!salvo) {
      return [];
    }


    const carrinho =
      JSON.parse(
        salvo
      );


    return Array.isArray(carrinho)
      ? carrinho
      : [];

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


  if (
    window.SiteUI &&
    typeof window.SiteUI
      .atualizarCarrinho ===
      "function"
  ) {

    window.SiteUI
      .atualizarCarrinho();

  }

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer =
  null;


function mostrarToast(
  mensagem,
  tipo = "success"
) {

  if (!productToast) {
    return;
  }


  clearTimeout(
    toastTimer
  );


  productToast.classList.remove(
    "show",
    "error",
    "warning"
  );


  if (
    tipo === "error"
  ) {

    productToast.classList.add(
      "error"
    );

  }


  if (
    tipo === "warning"
  ) {

    productToast.classList.add(
      "warning"
    );

  }


  productToast.textContent =
    mensagem;


  void productToast.offsetWidth;


  productToast.classList.add(
    "show"
  );


  toastTimer =
    setTimeout(
      () => {

        productToast.classList.remove(
          "show"
        );

      },
      2600
    );

}


/* =========================================================
   LOADING
========================================================= */

function esconderLoading() {

  productLoading
    ?.classList.add(
      "hidden"
    );


  setTimeout(
    () => {

      if (
        productLoading
      ) {

        productLoading.style.display =
          "none";

      }

    },
    450
  );

}


/* =========================================================
   ERROR
========================================================= */

function mostrarErroProduto() {

  esconderLoading();


  if (
    productError
  ) {

    productError.hidden =
      false;

  }


  document.body.style.overflow =
    "hidden";

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


    if (
      !resposta.ok
    ) {

      throw new Error(
        "Não foi possível carregar os produtos."
      );

    }


    const dados =
      await resposta.json();


    if (
      !Array.isArray(
        dados
      )
    ) {

      throw new Error(
        "Formato inválido da API."
      );

    }


    produtosCatalogo =
      dados;


    localStorage.setItem(
      "produtosMock",
      JSON.stringify(
        dados
      )
    );


  } catch (erro) {

    console.warn(
      "Produto usando catálogo em cache:",
      erro
    );


    try {

      const cache =
        JSON.parse(
          localStorage.getItem(
            "produtosMock"
          )
        );


      produtosCatalogo =
        Array.isArray(cache)
          ? cache
          : [];

    } catch {

      produtosCatalogo =
        [];

    }

  }

}


/* =========================================================
   LOCALIZAR PRODUTO
========================================================= */

function localizarProduto(
  idProduto
) {

  return produtosCatalogo.find(
    produto =>
      Number(
        produto.id_produto
      ) ===
      Number(
        idProduto
      )
  ) || null;

}


/* =========================================================
   DADOS PRODUTO
========================================================= */

function obterDadosProduto(
  produto
) {

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
      `#${produto.id_produto}`
    );


  const descricao =
    obterCampo(
      produto,
      [
        "descricao_produto",
        "descricao",
        "detalhes_produto"
      ],
      `Componente automotivo ${produto.nome_produto || ""}. Consulte código, aplicação e especificações antes da instalação.`
    );


  const resumo =
    obterCampo(
      produto,
      [
        "descricao_curta",
        "resumo",
        "descricao_produto",
        "descricao"
      ],
      descricao
    );


  const estoque =
    numeroSeguro(
      produto.quantidade_estoque
    );


  return {

    categoria,
    marca,
    codigo,
    descricao,
    resumo,
    estoque

  };

}


/* =========================================================
   CATEGORY SLUG
========================================================= */

function slugCategoria(
  categoria
) {

  const normalizada =
    normalizarTexto(
      categoria
    );


  if (
    normalizada.includes(
      "freio"
    )
  ) {

    return "freios";

  }


  if (
    normalizada.includes(
      "motor"
    )
  ) {

    return "motor";

  }


  if (
    normalizada.includes(
      "suspens"
    )
  ) {

    return "suspensao";

  }


  if (
    normalizada.includes(
      "eletric"
    )
  ) {

    return "eletrica";

  }


  if (
    normalizada.includes(
      "filtro"
    )
  ) {

    return "filtros";

  }


  if (
    normalizada.includes(
      "oleo"
    ) ||
    normalizada.includes(
      "fluido"
    )
  ) {

    return "oleos";

  }


  return "";

}


/* =========================================================
   PREENCHER PRODUTO
========================================================= */

function preencherProduto() {

  if (
    !produtoAtual
  ) {
    return;
  }


  const dados =
    obterDadosProduto(
      produtoAtual
    );


  /* =====================================================
     TITLE
  ===================================================== */

  document.title =
    `${produtoAtual.nome_produto || "Produto"} | Loja de Peças`;


  /* =====================================================
     IMAGE
  ===================================================== */

  if (
    productMainImage
  ) {

    productMainImage.src =
      obterImagem(
        produtoAtual.imagem
      );


    productMainImage.alt =
      produtoAtual.nome_produto ||
      "Produto";


    productMainImage.addEventListener(
      "error",
      () => {

        if (
          productMainImage.src.includes(
            "placeholder.webp"
          )
        ) {

          return;

        }


        productMainImage.src =
          PLACEHOLDER_PRODUTO;

      },
      {
        once: true
      }
    );

  }


  /* =====================================================
     INFO
  ===================================================== */

  if (
    productName
  ) {

    productName.textContent =
      produtoAtual.nome_produto ||
      "Produto";

  }


  if (
    productBrand
  ) {

    productBrand.textContent =
      dados.marca;

  }


  if (
    productCategoryBadge
  ) {

    productCategoryBadge.textContent =
      dados.categoria.toUpperCase();

  }


  if (
    productCode
  ) {

    productCode.textContent =
      dados.codigo;

  }


  if (
    productShortDescription
  ) {

    productShortDescription.textContent =
      dados.resumo;

  }


  if (
    productPrice
  ) {

    productPrice.textContent =
      formatarMoeda(
        produtoAtual.preco_produto
      );

  }


  if (
    productInstallment
  ) {

    productInstallment.textContent =
      "Valor final confirmado no checkout.";

  }


  /* =====================================================
     STOCK
  ===================================================== */

  atualizarDadosEstoque(
    dados.estoque
  );


  /* =====================================================
     TECH POINTS
  ===================================================== */

  if (
    techPointStock
  ) {

    techPointStock.textContent =
      dados.estoque > 0
        ? `${dados.estoque} unidades`
        : "Sem estoque";

  }


  if (
    techPointBrand
  ) {

    techPointBrand.textContent =
      dados.marca;

  }


  if (
    techPointCategory
  ) {

    techPointCategory.textContent =
      dados.categoria;

  }


  /* =====================================================
     ROUTE
  ===================================================== */

  const slug =
    slugCategoria(
      dados.categoria
    );


  if (
    productRouteCategory
  ) {

    productRouteCategory.textContent =
      dados.categoria.toUpperCase();


    productRouteCategory.href =
      slug
        ? `produtos.html?categoria=${encodeURIComponent(slug)}`
        : "produtos.html";

  }


  if (
    productRouteName
  ) {

    productRouteName.textContent =
      produtoAtual.nome_produto ||
      "PRODUTO";

  }


  /* =====================================================
     DATA BAR
  ===================================================== */

  if (
    dataProductCode
  ) {

    dataProductCode.textContent =
      dados.codigo;

  }


  if (
    dataProductBrand
  ) {

    dataProductBrand.textContent =
      dados.marca;

  }


  if (
    dataProductCategory
  ) {

    dataProductCategory.textContent =
      dados.categoria;

  }


  if (
    dataProductStock
  ) {

    dataProductStock.textContent =
      `${dados.estoque} unidades`;

  }


  /* =====================================================
     DESCRIPTION
  ===================================================== */

  if (
    productDescription
  ) {

    productDescription.textContent =
      dados.descricao;

  }


  /* =====================================================
     SPECS
  ===================================================== */

  montarEspecificacoes(
    produtoAtual,
    dados
  );


  /* =====================================================
     COMPATIBILITY
  ===================================================== */

  if (
    productCompatibilityText
  ) {

    productCompatibilityText.textContent =
      `Confira código ${dados.codigo}, marca ${dados.marca} e as especificações do componente antes da instalação no veículo.`;

  }


  if (
    compatibilityCategoryLink
  ) {

    compatibilityCategoryLink.href =
      slug
        ? `produtos.html?categoria=${encodeURIComponent(slug)}`
        : "produtos.html";

  }


  /* =====================================================
     QUANTITY
  ===================================================== */

  quantidadeSelecionada =
    dados.estoque > 0
      ? 1
      : 0;


  atualizarQuantidade();


  /* =====================================================
     BUTTONS
  ===================================================== */

  if (
    productAddCart
  ) {

    productAddCart.disabled =
      dados.estoque <= 0;

  }


  if (
    productBuyNow
  ) {

    productBuyNow.disabled =
      dados.estoque <= 0;

  }

}


/* =========================================================
   ESTOQUE
========================================================= */

function atualizarDadosEstoque(
  estoque
) {

  if (
    productStock
  ) {

    productStock.textContent =
      `${estoque} ${
        estoque === 1
          ? "unidade"
          : "unidades"
      }`;

  }


  if (
    productAvailability
  ) {

    if (
      estoque <= 0
    ) {

      productAvailability.textContent =
        "Indisponível";

    } else if (
      estoque <= 5
    ) {

      productAvailability.textContent =
        "Últimas unidades";

    } else {

      productAvailability.textContent =
        "Disponível";

    }

  }


  if (
    inventoryNumber
  ) {

    inventoryNumber.textContent =
      String(estoque);

  }


  if (
    inventoryMessage
  ) {

    if (
      estoque <= 0
    ) {

      inventoryMessage.textContent =
        "Este componente está indisponível no momento.";

    } else if (
      estoque <= 5
    ) {

      inventoryMessage.textContent =
        "Estoque baixo. Restam poucas unidades disponíveis.";

    } else {

      inventoryMessage.textContent =
        "Componente disponível para compra.";

    }

  }


  const percentual =
    estoque <= 0
      ? 0
      : Math.min(
          100,
          Math.max(
            12,
            estoque * 5
          )
        );


  setTimeout(
    () => {

      if (
        inventoryMeter
      ) {

        inventoryMeter.style.width =
          `${percentual}%`;

      }

    },
    600
  );

}


/* =========================================================
   ESPECIFICAÇÕES
========================================================= */

function montarEspecificacoes(
  produto,
  dados
) {

  if (
    !productSpecifications
  ) {
    return;
  }


  productSpecifications.innerHTML =
    "";


  const specs = [];


  specs.push(
    [
      "Código",
      dados.codigo
    ]
  );


  specs.push(
    [
      "Marca",
      dados.marca
    ]
  );


  specs.push(
    [
      "Categoria",
      dados.categoria
    ]
  );


  specs.push(
    [
      "Estoque",
      `${dados.estoque} unidades`
    ]
  );


  const camposExtras = [

    {
      label:
        "Fabricante",
      keys:
        [
          "fabricante",
          "fabricante_produto"
        ]
    },

    {
      label:
        "Modelo",
      keys:
        [
          "modelo",
          "modelo_produto"
        ]
    },

    {
      label:
        "Aplicação",
      keys:
        [
          "aplicacao",
          "aplicacao_produto"
        ]
    },

    {
      label:
        "Material",
      keys:
        [
          "material",
          "material_produto"
        ]
    },

    {
      label:
        "Peso",
      keys:
        [
          "peso",
          "peso_produto"
        ]
    },

    {
      label:
        "Garantia",
      keys:
        [
          "garantia",
          "garantia_produto"
        ]
    }

  ];


  camposExtras.forEach(
    item => {

      const valor =
        obterCampo(
          produto,
          item.keys,
          ""
        );


      if (
        String(valor)
          .trim() !== ""
      ) {

        specs.push(
          [
            item.label,
            valor
          ]
        );

      }

    }
  );


  specs.forEach(
    (
      spec,
      indice
    ) => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "product-spec-row";


      const label =
        document.createElement(
          "span"
        );


      label.textContent =
        spec[0];


      const value =
        document.createElement(
          "strong"
        );


      value.textContent =
        spec[1];


      row.append(
        label,
        value
      );


      productSpecifications.appendChild(
        row
      );


      animar(
        row,
        [
          {
            opacity: 0,
            transform:
              "translateX(-14px)"
          },
          {
            opacity: 1,
            transform:
              "translateX(0)"
          }
        ],
        {
          duration: 420,
          delay:
            350 +
            indice * 70,
          easing:
            "cubic-bezier(.16,1,.3,1)",
          fill:
            "both"
        }
      );

    }
  );

}


/* =========================================================
   QUANTIDADE
========================================================= */

function atualizarQuantidade() {

  const estoque =
    produtoAtual
      ? numeroSeguro(
          produtoAtual.quantidade_estoque
        )
      : 0;


  if (
    productQuantity
  ) {

    productQuantity.textContent =
      String(
        quantidadeSelecionada
      );

  }


  if (
    quantityStockInfo
  ) {

    if (
      estoque <= 0
    ) {

      quantityStockInfo.textContent =
        "Sem estoque";

    } else {

      quantityStockInfo.textContent =
        `Máx. ${estoque}`;

    }

  }


  if (
    decreaseQuantity
  ) {

    decreaseQuantity.disabled =
      quantidadeSelecionada <= 1 ||
      estoque <= 0;

  }


  if (
    increaseQuantity
  ) {

    increaseQuantity.disabled =
      quantidadeSelecionada >=
        estoque ||
      estoque <= 0;

  }

}


/* =========================================================
   ADD QUANTITY
========================================================= */

function aumentarQuantidade() {

  if (
    !produtoAtual
  ) {
    return;
  }


  const estoque =
    numeroSeguro(
      produtoAtual.quantidade_estoque
    );


  if (
    quantidadeSelecionada >=
    estoque
  ) {

    mostrarToast(
      "Quantidade máxima de estoque atingida.",
      "warning"
    );


    return;

  }


  quantidadeSelecionada++;


  atualizarQuantidade();


  animar(
    productQuantity,
    [
      {
        transform:
          "translateY(-4px)",
        opacity: .4
      },
      {
        transform:
          "translateY(0)",
        opacity: 1
      }
    ],
    {
      duration: 240
    }
  );

}


/* =========================================================
   REMOVE QUANTITY
========================================================= */

function diminuirQuantidade() {

  if (
    quantidadeSelecionada <= 1
  ) {

    return;

  }


  quantidadeSelecionada--;


  atualizarQuantidade();


  animar(
    productQuantity,
    [
      {
        transform:
          "translateY(4px)",
        opacity: .4
      },
      {
        transform:
          "translateY(0)",
        opacity: 1
      }
    ],
    {
      duration: 240
    }
  );

}


/* =========================================================
   ADICIONAR AO CARRINHO
========================================================= */

async function adicionarAoCarrinho(
  redirecionarCheckout = false
) {

  if (
    !produtoAtual
  ) {
    return false;
  }


  const estoque =
    numeroSeguro(
      produtoAtual.quantidade_estoque
    );


  if (
    estoque <= 0
  ) {

    mostrarToast(
      "Este produto está sem estoque.",
      "warning"
    );


    return false;

  }


  if (
    quantidadeSelecionada <= 0
  ) {

    mostrarToast(
      "Selecione uma quantidade válida.",
      "warning"
    );


    return false;

  }


  const carrinho =
    obterCarrinho();


  const existente =
    carrinho.find(
      item =>
        Number(
          item.id_produto
        ) ===
        Number(
          produtoAtual.id_produto
        )
    );


  const quantidadeExistente =
    existente
      ? numeroSeguro(
          existente.quantidade
        )
      : 0;


  if (
    quantidadeExistente +
    quantidadeSelecionada >
    estoque
  ) {

    mostrarToast(
      "A quantidade solicitada ultrapassa o estoque disponível.",
      "warning"
    );


    executarShake(
      productAddCart
    );


    return false;

  }


  /* =====================================================
     PROGRESS ANIMATION
  ===================================================== */

  await executarAnimacaoAdicionar();


  /* =====================================================
     STORAGE
  ===================================================== */

  if (
    existente
  ) {

    existente.quantidade =
      quantidadeExistente +
      quantidadeSelecionada;

  } else {

    carrinho.push({

      id_produto:
        produtoAtual.id_produto,

      nome_produto:
        produtoAtual.nome_produto,

      preco_produto:
        numeroSeguro(
          produtoAtual.preco_produto
        ),

      quantidade_estoque:
        estoque,

      imagem:
        produtoAtual.imagem ||
        null,

      quantidade:
        quantidadeSelecionada

    });

  }


  salvarCarrinho(
    carrinho
  );


  mostrarConfirmacaoCarrinho();


  if (
    redirecionarCheckout
  ) {

    setTimeout(
      () => {

        window.location.href =
          "checkout.html";

      },
      450
    );

  }


  return true;

}


/* =========================================================
   ADD ANIMATION
========================================================= */

async function executarAnimacaoAdicionar() {

  if (
    !productAddCart
  ) {
    return;
  }


  productAddCart.disabled =
    true;


  const copy =
    productAddCart.querySelector(
      ".product-add-copy"
    );


  const icon =
    productAddCart.querySelector(
      ".product-add-icon"
    );


  const originalCopy =
    copy
      ? copy.innerHTML
      : "";


  const originalIcon =
    icon
      ? icon.innerHTML
      : "";


  if (
    productAddProgress
  ) {

    productAddProgress.style.width =
      "0%";


    productAddProgress.style.transition =
      "none";


    void productAddProgress.offsetWidth;


    productAddProgress.style.transition =
      "width .68s cubic-bezier(.16,1,.3,1)";


    productAddProgress.style.width =
      "100%";

  }


  if (
    copy
  ) {

    copy.innerHTML =
      `
        <small>
          COMPONENT PROCESS
        </small>

        <strong>
          Encaixando no carrinho...
        </strong>
      `;

  }


  if (
    icon
  ) {

    icon.innerHTML =
      '<i class="fa-solid fa-gears"></i>';


    animar(
      icon,
      [
        {
          transform:
            "rotate(0deg)"
        },
        {
          transform:
            "rotate(180deg)"
        },
        {
          transform:
            "rotate(360deg)"
        }
      ],
      {
        duration: 650,
        easing:
          "cubic-bezier(.4,0,.2,1)"
      }
    );

  }


  await esperar(
    720
  );


  if (
    copy
  ) {

    copy.innerHTML =
      `
        <small>
          100% LOCKED
        </small>

        <strong>
          Produto adicionado
        </strong>
      `;

  }


  if (
    icon
  ) {

    icon.innerHTML =
      '<i class="fa-solid fa-check"></i>';


    animar(
      icon,
      [
        {
          transform:
            "scale(.6)",
          opacity: .2
        },
        {
          transform:
            "scale(1.15)",
          opacity: 1
        },
        {
          transform:
            "scale(1)"
        }
      ],
      {
        duration: 400,
        easing:
          "cubic-bezier(.2,.8,.2,1)"
      }
    );

  }


  await esperar(
    600
  );


  if (
    copy
  ) {

    copy.innerHTML =
      originalCopy;

  }


  if (
    icon
  ) {

    icon.innerHTML =
      originalIcon;

  }


  if (
    productAddProgress
  ) {

    productAddProgress.style.transition =
      "width .25s ease";


    productAddProgress.style.width =
      "0%";

  }


  productAddCart.disabled =
    numeroSeguro(
      produtoAtual.quantidade_estoque
    ) <= 0;

}


/* =========================================================
   CONFIRMAÇÃO CARRINHO
========================================================= */

function mostrarConfirmacaoCarrinho() {

  if (
    !productCartConfirmation
  ) {
    return;
  }


  clearTimeout(
    cartConfirmationTimer
  );


  productCartConfirmation.hidden =
    false;


  const panel =
    productCartConfirmation.querySelector(
      ".cart-confirmation-panel"
    );


  animar(
    panel,
    [
      {
        opacity: 0,
        transform:
          "translateY(30px) scale(.97)"
      },
      {
        opacity: 1,
        transform:
          "translateY(0) scale(1)"
      }
    ],
    {
      duration: 450,
      easing:
        "cubic-bezier(.16,1,.3,1)"
    }
  );


  cartConfirmationTimer =
    setTimeout(
      () => {

        const animation =
          animar(
            panel,
            [
              {
                opacity: 1,
                transform:
                  "translateY(0)"
              },
              {
                opacity: 0,
                transform:
                  "translateY(18px)"
              }
            ],
            {
              duration: 280,
              easing: "ease",
              fill: "forwards"
            }
          );


        if (
          animation
        ) {

          animation.finished
            .then(
              () => {

                productCartConfirmation.hidden =
                  true;

              }
            )
            .catch(
              () => {

                productCartConfirmation.hidden =
                  true;

              }
            );

        } else {

          productCartConfirmation.hidden =
            true;

        }

      },
      3200
    );

}


/* =========================================================
   BUY NOW
========================================================= */

async function comprarAgora() {

  const sucesso =
    await adicionarAoCarrinho(
      true
    );


  if (
    !sucesso
  ) {

    return;

  }

}


/* =========================================================
   COPY LINK
========================================================= */

async function copiarLinkProduto() {

  try {

    if (
      navigator.clipboard &&
      window.isSecureContext
    ) {

      await navigator.clipboard.writeText(
        window.location.href
      );

    } else {

      const area =
        document.createElement(
          "textarea"
        );


      area.value =
        window.location.href;


      area.style.position =
        "fixed";


      area.style.opacity =
        "0";


      document.body.appendChild(
        area
      );


      area.select();


      document.execCommand(
        "copy"
      );


      area.remove();

    }


    mostrarToast(
      "Link do produto copiado."
    );


    animar(
      productCopyLink,
      [
        {
          transform:
            "scale(1)"
        },
        {
          transform:
            "scale(.96)"
        },
        {
          transform:
            "scale(1.04)"
        },
        {
          transform:
            "scale(1)"
        }
      ],
      {
        duration: 320
      }
    );


  } catch {

    mostrarToast(
      "Não foi possível copiar o link.",
      "error"
    );

  }

}


/* =========================================================
   ANIMAÇÃO INICIAL
========================================================= */

async function executarAnimacaoProdutoInicial() {

  if (
    animacaoProdutoInicialFinalizada
  ) {

    return;

  }


  animacaoProdutoInicialFinalizada =
    true;


  /* =====================================================
     IMAGE
  ===================================================== */

  animar(
    productMainImage,
    [
      {
        opacity: 0,
        transform:
          "translateY(30px) scale(.84)",
        filter:
          "blur(8px) drop-shadow(0 32px 28px rgba(0,0,0,.34))"
      },
      {
        opacity: 1,
        transform:
          "translateY(-7px) scale(1.025)",
        filter:
          "blur(0px) drop-shadow(0 32px 28px rgba(0,0,0,.34))"
      },
      {
        opacity: 1,
        transform:
          "translateY(0) scale(1)",
        filter:
          "blur(0px) drop-shadow(0 32px 28px rgba(0,0,0,.34))"
      }
    ],
    {
      duration: 950,
      easing:
        "cubic-bezier(.16,1,.3,1)",
      fill:
        "forwards"
    }
  );


  await esperar(
    500
  );


  /* =====================================================
     POINT 1
  ===================================================== */

  animar(
    techPointOne,
    [
      {
        opacity: 0,
        transform:
          "translateX(40px)"
      },
      {
        opacity: 1,
        transform:
          "translateX(0)"
      }
    ],
    {
      duration: 550,
      easing:
        "cubic-bezier(.16,1,.3,1)",
      fill:
        "forwards"
    }
  );


  await esperar(
    170
  );


  /* =====================================================
     POINT 2
  ===================================================== */

  animar(
    techPointTwo,
    [
      {
        opacity: 0,
        transform:
          "translateX(-40px)"
      },
      {
        opacity: 1,
        transform:
          "translateX(0)"
      }
    ],
    {
      duration: 550,
      easing:
        "cubic-bezier(.16,1,.3,1)",
      fill:
        "forwards"
    }
  );


  await esperar(
    170
  );


  /* =====================================================
     POINT 3
  ===================================================== */

  animar(
    techPointThree,
    [
      {
        opacity: 0,
        transform:
          "translateX(40px)"
      },
      {
        opacity: 1,
        transform:
          "translateX(0)"
      }
    ],
    {
      duration: 550,
      easing:
        "cubic-bezier(.16,1,.3,1)",
      fill:
        "forwards"
    }
  );


  /* =====================================================
     TECH POINT PULSE
  ===================================================== */

  document
    .querySelectorAll(
      ".tech-point-button"
    )
    .forEach(
      (
        button,
        indice
      ) => {

        setTimeout(
          () => {

            animar(
              button,
              [
                {
                  boxShadow:
                    "0 0 0 0 rgba(88,199,255,.35)"
                },
                {
                  boxShadow:
                    "0 0 0 10px rgba(88,199,255,0)"
                }
              ],
              {
                duration: 850,
                easing: "ease-out"
              }
            );

          },
          850 +
          indice * 150
        );

      }
    );

}


/* =========================================================
   PRODUCT PARALLAX
========================================================= */

function configurarProdutoInterativo() {

  const imageZone =
    document.querySelector(
      ".product-image-zone"
    );


  if (
    !imageZone ||
    !productMainImage ||
    window.matchMedia(
      "(pointer: coarse)"
    ).matches
  ) {

    return;

  }


  imageZone.addEventListener(
    "mousemove",
    evento => {

      const rect =
        imageZone
          .getBoundingClientRect();


      const x =
        (
          evento.clientX -
          rect.left
        ) /
        rect.width;


      const y =
        (
          evento.clientY -
          rect.top
        ) /
        rect.height;


      const moveX =
        (
          x -
          .5
        ) *
        18;


      const moveY =
        (
          y -
          .5
        ) *
        12;


      const rotateY =
        (
          x -
          .5
        ) *
        4;


      const rotateX =
        (
          .5 -
          y
        ) *
        3;


      productMainImage.style.transform =
        `
          translate3d(
            ${moveX}px,
            ${moveY}px,
            22px
          )
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          scale(1.015)
        `;


      const orbitOne =
        document.querySelector(
          ".orbit-one"
        );


      const orbitTwo =
        document.querySelector(
          ".orbit-two"
        );


      if (
        orbitOne
      ) {

        orbitOne.style.transform =
          `
            translate(
              ${moveX * -.35}px,
              ${moveY * -.35}px
            )
          `;

      }


      if (
        orbitTwo
      ) {

        orbitTwo.style.transform =
          `
            translate(
              ${moveX * .25}px,
              ${moveY * .25}px
            )
          `;

      }

    }
  );


  imageZone.addEventListener(
    "mouseleave",
    () => {

      productMainImage.style.transform =
        "";


      const orbitOne =
        document.querySelector(
          ".orbit-one"
        );


      const orbitTwo =
        document.querySelector(
          ".orbit-two"
        );


      if (
        orbitOne
      ) {

        orbitOne.style.transform =
          "";

      }


      if (
        orbitTwo
      ) {

        orbitTwo.style.transform =
          "";

      }

    }
  );

}


/* =========================================================
   TECH POINT HOVER
========================================================= */

function configurarTechPoints() {

  document
    .querySelectorAll(
      ".tech-point"
    )
    .forEach(
      point => {

        const button =
          point.querySelector(
            ".tech-point-button"
          );


        const info =
          point.querySelector(
            ".tech-point-info"
          );


        button?.addEventListener(
          "mouseenter",
          () => {

            animar(
              info,
              [
                {
                  transform:
                    "scale(1)"
                },
                {
                  transform:
                    "scale(1.055)"
                }
              ],
              {
                duration: 220,
                fill: "forwards"
              }
            );

          }
        );


        button?.addEventListener(
          "mouseleave",
          () => {

            animar(
              info,
              [
                {
                  transform:
                    "scale(1.055)"
                },
                {
                  transform:
                    "scale(1)"
                }
              ],
              {
                duration: 220,
                fill: "forwards"
              }
            );

          }
        );

      }
    );

}


/* =========================================================
   DETAIL CARDS
========================================================= */

function configurarAnimacaoDetalhes() {

  const cards =
    Array.from(
      document.querySelectorAll(
        ".product-detail-card"
      )
    );


  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {

    cards.forEach(
      card =>
        card.classList.add(
          "detail-visible"
        )
    );


    return;

  }


  const observer =
    new IntersectionObserver(
      entradas => {

        entradas.forEach(
          entrada => {

            if (
              !entrada.isIntersecting
            ) {

              return;

            }


            const indice =
              cards.indexOf(
                entrada.target
              );


            setTimeout(
              () => {

                entrada.target.classList.add(
                  "detail-visible"
                );

              },
              Math.max(
                0,
                indice
              ) * 120
            );


            observer.unobserve(
              entrada.target
            );

          }
        );

      },
      {
        threshold: .13
      }
    );


  cards.forEach(
    card =>
      observer.observe(
        card
      )
  );

}


/* =========================================================
   COMPATIBILITY ANIMATION
========================================================= */

function configurarAnimacaoCompatibilidade() {

  if (
    !compatibilityPanel
  ) {

    return;

  }


  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {

    compatibilityPanel.classList.add(
      "compatibility-active"
    );


    return;

  }


  const observer =
    new IntersectionObserver(
      entradas => {

        entradas.forEach(
          entrada => {

            if (
              !entrada.isIntersecting
            ) {

              return;

            }


            compatibilityPanel.classList.add(
              "compatibility-active"
            );


            const car =
              compatibilityPanel.querySelector(
                ".compatibility-car"
              );


            animar(
              car,
              [
                {
                  opacity: 0,
                  transform:
                    "translateX(-30px) scale(.9)"
                },
                {
                  opacity: 1,
                  transform:
                    "translateX(5px) scale(1.04)"
                },
                {
                  opacity: 1,
                  transform:
                    "translateX(0) scale(1)"
                }
              ],
              {
                duration: 700,
                easing:
                  "cubic-bezier(.16,1,.3,1)"
              }
            );


            observer.disconnect();

          }
        );

      },
      {
        threshold: .25
      }
    );


  observer.observe(
    compatibilityPanel
  );

}


/* =========================================================
   RELATED PRODUCTS
========================================================= */

function obterProdutosRelacionados() {

  if (
    !produtoAtual
  ) {

    return [];

  }


  const atual =
    obterDadosProduto(
      produtoAtual
    );


  const categoriaAtual =
    normalizarTexto(
      atual.categoria
    );


  let relacionados =
    produtosCatalogo.filter(
      produto => {

        if (
          Number(
            produto.id_produto
          ) ===
          Number(
            produtoAtual.id_produto
          )
        ) {

          return false;

        }


        const categoria =
          normalizarTexto(
            obterCampo(
              produto,
              [
                "categoria_produto",
                "categoria"
              ],
              ""
            )
          );


        return (
          categoriaAtual &&
          categoria ===
          categoriaAtual
        );

      }
    );


  if (
    relacionados.length < 4
  ) {

    const ids =
      new Set(
        relacionados.map(
          produto =>
            Number(
              produto.id_produto
            )
        )
      );


    produtosCatalogo.forEach(
      produto => {

        if (
          Number(
            produto.id_produto
          ) ===
          Number(
            produtoAtual.id_produto
          )
        ) {

          return;

        }


        if (
          ids.has(
            Number(
              produto.id_produto
            )
          )
        ) {

          return;

        }


        relacionados.push(
          produto
        );


        ids.add(
          Number(
            produto.id_produto
          )
        );

      }
    );

  }


  return relacionados;

}


/* =========================================================
   RELATED PER VIEW
========================================================= */

function atualizarRelatedPerView() {

  const largura =
    window.innerWidth;


  if (
    largura <= 700
  ) {

    relatedPerView =
      1;

  } else if (
    largura <= 950
  ) {

    relatedPerView =
      2;

  } else if (
    largura <= 1150
  ) {

    relatedPerView =
      3;

  } else {

    relatedPerView =
      4;

  }

}


/* =========================================================
   RENDER RELATED
========================================================= */

function renderizarRelacionados() {

  if (
    !relatedProducts
  ) {

    return;

  }


  relatedProducts.innerHTML =
    "";


  const relacionados =
    obterProdutosRelacionados();


  if (
    relacionados.length === 0
  ) {

    relatedProducts.innerHTML =
      `
        <div style="
          grid-column:1/-1;
          padding:30px;
          border:1px solid #dce5ed;
          border-radius:14px;
          background:#fff;
          color:#8292a1;
          text-align:center;
          font-size:8px;
        ">
          Nenhum produto relacionado disponível.
        </div>
      `;


    return;

  }


  const visiveis = [];


  for (
    let i = 0;
    i < Math.min(
      relatedPerView,
      relacionados.length
    );
    i++
  ) {

    const index =
      (
        relatedIndex +
        i
      ) %
      relacionados.length;


    visiveis.push(
      relacionados[index]
    );

  }


  visiveis.forEach(
    (
      produto,
      indice
    ) => {

      relatedProducts.appendChild(
        criarCardRelacionado(
          produto,
          indice
        )
      );

    }
  );

}


/* =========================================================
   RELATED CARD
========================================================= */

function criarCardRelacionado(
  produto,
  indice
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "related-product-card";


  const categoria =
    obterCampo(
      produto,
      [
        "categoria_produto",
        "categoria"
      ],
      "Autopeças"
    );


  const imagem =
    document.createElement(
      "div"
    );


  imagem.className =
    "related-product-image";


  const img =
    document.createElement(
      "img"
    );


  img.src =
    obterImagem(
      produto.imagem
    );


  img.alt =
    produto.nome_produto ||
    "Produto";


  img.loading =
    "lazy";


  img.addEventListener(
    "error",
    () => {

      if (
        img.src.includes(
          "placeholder.webp"
        )
      ) {

        return;

      }


      img.src =
        PLACEHOLDER_PRODUTO;

    },
    {
      once: true
    }
  );


  imagem.appendChild(
    img
  );


  const content =
    document.createElement(
      "div"
    );


  content.className =
    "related-product-content";


  const category =
    document.createElement(
      "span"
    );


  category.textContent =
    categoria.toUpperCase();


  const title =
    document.createElement(
      "h3"
    );


  title.textContent =
    produto.nome_produto ||
    "Produto";


  const footer =
    document.createElement(
      "div"
    );


  footer.className =
    "related-product-footer";


  const price =
    document.createElement(
      "strong"
    );


  price.textContent =
    formatarMoeda(
      produto.preco_produto
    );


  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.title =
    "Ver produto";


  button.innerHTML =
    '<i class="fa-solid fa-arrow-right"></i>';


  button.addEventListener(
    "click",
    evento => {

      evento.stopPropagation();


      window.location.href =
        `produto.html?id=${produto.id_produto}`;

    }
  );


  footer.append(
    price,
    button
  );


  content.append(
    category,
    title,
    footer
  );


  card.append(
    imagem,
    content
  );


  card.addEventListener(
    "click",
    () => {

      window.location.href =
        `produto.html?id=${produto.id_produto}`;

    }
  );


  animar(
    card,
    [
      {
        opacity: 0,
        transform:
          "translateX(24px) scale(.97)"
      },
      {
        opacity: 1,
        transform:
          "translateX(0) scale(1)"
      }
    ],
    {
      duration: 470,
      delay:
        indice * 70,
      easing:
        "cubic-bezier(.16,1,.3,1)",
      fill:
        "both"
    }
  );


  return card;

}


/* =========================================================
   RELATED NAV
========================================================= */

function proximoRelacionado() {

  const relacionados =
    obterProdutosRelacionados();


  if (
    relacionados.length <=
    relatedPerView
  ) {

    return;

  }


  animar(
    relatedProducts,
    [
      {
        opacity: 1,
        transform:
          "translateX(0)"
      },
      {
        opacity: .2,
        transform:
          "translateX(-30px)"
      }
    ],
    {
      duration: 180
    }
  );


  setTimeout(
    () => {

      relatedIndex =
        (
          relatedIndex + 1
        ) %
        relacionados.length;


      renderizarRelacionados();


      animar(
        relatedProducts,
        [
          {
            opacity: .2,
            transform:
              "translateX(30px)"
          },
          {
            opacity: 1,
            transform:
              "translateX(0)"
          }
        ],
        {
          duration: 300,
          easing:
            "cubic-bezier(.16,1,.3,1)"
        }
      );

    },
    160
  );

}


/* =========================================================
   PREVIOUS RELATED
========================================================= */

function anteriorRelacionado() {

  const relacionados =
    obterProdutosRelacionados();


  if (
    relacionados.length <=
    relatedPerView
  ) {

    return;

  }


  animar(
    relatedProducts,
    [
      {
        opacity: 1,
        transform:
          "translateX(0)"
      },
      {
        opacity: .2,
        transform:
          "translateX(30px)"
      }
    ],
    {
      duration: 180
    }
  );


  setTimeout(
    () => {

      relatedIndex =
        (
          relatedIndex -
          1 +
          relacionados.length
        ) %
        relacionados.length;


      renderizarRelacionados();


      animar(
        relatedProducts,
        [
          {
            opacity: .2,
            transform:
              "translateX(-30px)"
          },
          {
            opacity: 1,
            transform:
              "translateX(0)"
          }
        ],
        {
          duration: 300,
          easing:
            "cubic-bezier(.16,1,.3,1)"
        }
      );

    },
    160
  );

}


/* =========================================================
   SHAKE
========================================================= */

function executarShake(
  elemento
) {

  animar(
    elemento,
    [
      {
        transform:
          "translateX(0)"
      },
      {
        transform:
          "translateX(-5px)"
      },
      {
        transform:
          "translateX(5px)"
      },
      {
        transform:
          "translateX(-3px)"
      },
      {
        transform:
          "translateX(0)"
      }
    ],
    {
      duration: 320
    }
  );

}


/* =========================================================
   EVENTOS
========================================================= */

decreaseQuantity
  ?.addEventListener(
    "click",
    diminuirQuantidade
  );


increaseQuantity
  ?.addEventListener(
    "click",
    aumentarQuantidade
  );


productAddCart
  ?.addEventListener(
    "click",
    () => {

      adicionarAoCarrinho(
        false
      );

    }
  );


productBuyNow
  ?.addEventListener(
    "click",
    comprarAgora
  );


productCopyLink
  ?.addEventListener(
    "click",
    copiarLinkProduto
  );


relatedNext
  ?.addEventListener(
    "click",
    proximoRelacionado
  );


relatedPrev
  ?.addEventListener(
    "click",
    anteriorRelacionado
  );


window.addEventListener(
  "resize",
  () => {

    const anterior =
      relatedPerView;


    atualizarRelatedPerView();


    if (
      anterior !==
      relatedPerView
    ) {

      relatedIndex =
        0;


      renderizarRelacionados();

    }

  }
);


/* =========================================================
   STORAGE
========================================================= */

window.addEventListener(
  "storage",
  evento => {

    if (
      evento.key ===
      "carrinho"
    ) {

      if (
        window.SiteUI &&
        typeof window.SiteUI
          .atualizarCarrinho ===
          "function"
      ) {

        window.SiteUI
          .atualizarCarrinho();

      }

    }

  }
);


/* =========================================================
   INIT
========================================================= */

async function iniciarProduto() {

  const idProduto =
    obterIdProdutoURL();


  if (
    !idProduto
  ) {

    mostrarErroProduto();

    return;

  }


  await carregarProdutos();


  produtoAtual =
    localizarProduto(
      idProduto
    );


  if (
    !produtoAtual
  ) {

    mostrarErroProduto();

    return;

  }


  /* =====================================================
     DADOS
  ===================================================== */

  preencherProduto();


  atualizarRelatedPerView();


  renderizarRelacionados();


  /* =====================================================
     ANIMAÇÕES
  ===================================================== */

  configurarProdutoInterativo();

  configurarTechPoints();

  configurarAnimacaoDetalhes();

  configurarAnimacaoCompatibilidade();


  /* =====================================================
     GLOBAL SITE
  ===================================================== */

  if (
    window.SiteUI &&
    typeof window.SiteUI
      .atualizarCarrinho ===
      "function"
  ) {

    window.SiteUI
      .atualizarCarrinho();

  }


  /* =====================================================
     LIBERA PÁGINA
  ===================================================== */

  esconderLoading();


  await esperar(
    180
  );


  executarAnimacaoProdutoInicial();

}


/* =========================================================
   START
========================================================= */

iniciarProduto();
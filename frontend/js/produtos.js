/* =========================================================
   PRODUTOS.JS
   Loja de Peças
========================================================= */

const API = "http://localhost:3000/api";

const CAMINHO_IMAGENS_PRODUTOS =
  "assets/images/produtos";

const PLACEHOLDER_PRODUTO =
  `${CAMINHO_IMAGENS_PRODUTOS}/placeholder.webp`;

const ITENS_POR_PAGINA = 8;



/* =========================================================
   CLIENTE
========================================================= */

let cliente = null;

try {

  cliente = JSON.parse(
    localStorage.getItem(
      "clienteLogado"
    )
  );

} catch (error) {

  console.warn(
    "Não foi possível ler clienteLogado.",
    error
  );

}


/*
  IMPORTANTE:

  A página de produtos pode ser vista
  mesmo sem login.

  Então NÃO redirecionamos mais
  automaticamente para index.html.

  O login será exigido somente
  quando realmente for necessário.
*/

if (!cliente) {

  console.info(
    "Nenhum cliente logado. Catálogo funcionando como visitante."
  );

}



/* =========================================================
   ESTADO
========================================================= */

let produtos = [];

let paginaAtual = 1;



/* =========================================================
   ELEMENTOS
========================================================= */

const btnSair =
  document.getElementById(
    "btnSair"
  );

const campoBusca =
  document.getElementById(
    "campoBusca"
  );

const campoBuscaMobile =
  document.getElementById(
    "campoBuscaMobile"
  );

const filtroCategoria =
  document.getElementById(
    "filtroCategoria"
  );

const ordenacaoProdutos =
  document.getElementById(
    "ordenacaoProdutos"
  );

const listaProdutos =
  document.getElementById(
    "listaProdutos"
  );

const paginacaoCatalogo =
  document.getElementById(
    "paginacaoCatalogo"
  );

const resultadoCatalogo =
  document.getElementById(
    "resultadoCatalogo"
  )
  ||
  document.getElementById(
    "resultadoProdutos"
  );

const catalogEmptyState =
  document.getElementById(
    "catalogEmptyState"
  );

const filtroEstoque =
  document.getElementById(
    "filtroEstoque"
  );

const precoMinimo =
  document.getElementById(
    "precoMinimo"
  );

const precoMaximo =
  document.getElementById(
    "precoMaximo"
  );

const btnLimparFiltros =
  document.getElementById(
    "btnLimparFiltros"
  );



/* =========================================================
   SAIR
========================================================= */

if (btnSair) {

  btnSair.addEventListener(
    "click",
    () => {

      localStorage.removeItem(
        "clienteLogado"
      );

      window.location.href =
        "index.html";

    }
  );

}



/* =========================================================
   MOEDA
========================================================= */

function formatarMoeda(valor) {

  return Number(
    valor || 0
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

}



/* =========================================================
   TEXTO SEGURO
========================================================= */

function normalizarTexto(texto) {

  return String(
    texto || ""
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();

}



/* =========================================================
   CAMPOS ALTERNATIVOS
========================================================= */

function obterCampoProduto(
  produto,
  campos,
  padrao = ""
) {

  const valor =
    campos
      .map(
        campo =>
          produto?.[campo]
      )
      .find(
        item =>
          item !== null &&
          item !== undefined &&
          String(item).trim() !== ""
      );


  return valor ?? padrao;

}



/* =========================================================
   CATEGORIA
========================================================= */

function obterCategoriaProduto(
  produto
) {

  return obterCampoProduto(
    produto,
    [
      "categoria_produto",
      "categoria",
      "nome_categoria"
    ],
    "Autopeças"
  );

}



/* =========================================================
   MARCA
========================================================= */

function obterMarcaProduto(
  produto
) {

  return obterCampoProduto(
    produto,
    [
      "marca_produto",
      "marca",
      "nome_marca"
    ],
    "Não informada"
  );

}



/* =========================================================
   CÓDIGO
========================================================= */

function obterCodigoProduto(
  produto
) {

  return obterCampoProduto(
    produto,
    [
      "codigo_produto",
      "codigo",
      "sku"
    ],
    `#${produto.id_produto}`
  );

}



/* =========================================================
   CARRINHO
========================================================= */

function obterCarrinho() {

  try {

    const dados =
      JSON.parse(
        localStorage.getItem(
          "carrinho"
        )
      );

    return Array.isArray(dados)
      ? dados
      : [];

  } catch (error) {

    console.warn(
      "Erro ao ler carrinho.",
      error
    );

    return [];

  }

}



function salvarCarrinho(
  carrinho
) {

  try {

    localStorage.setItem(
      "carrinho",
      JSON.stringify(
        carrinho
      )
    );

  } catch (error) {

    console.error(
      "Erro ao salvar carrinho.",
      error
    );

  }


  atualizarBotaoCarrinho();

}



/* =========================================================
   CONTADOR DO CARRINHO
========================================================= */

function atualizarBotaoCarrinho() {

  const carrinho =
    obterCarrinho();


  const totalItens =
    carrinho.reduce(
      (
        total,
        item
      ) => {

        return (
          total
          +
          Number(
            item.quantidade || 0
          )
        );

      },
      0
    );


  /*
    NOVO HEADER
  */

  const cartCount =
    document.getElementById(
      "cartCount"
    );


  if (cartCount) {

    cartCount.textContent =
      totalItens;

  }


  /*
    COMPATIBILIDADE COM
    HTML ANTIGO
  */

  const btnCarrinho =
    document.getElementById(
      "btnCarrinho"
    );


  if (
    btnCarrinho &&
    !cartCount
  ) {

    btnCarrinho.textContent =
      `Carrinho (${totalItens})`;

  }


  /*
    site.js
  */

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

function mostrarToast(
  mensagem,
  tipo = "success"
) {

  const toast =
    document.getElementById(
      "toastMensagem"
    );


  if (!toast) {

    return;

  }


  toast.innerHTML = `

    <i class="${
      tipo === "warning"
      ? "fa-solid fa-triangle-exclamation"
      : tipo === "error"
      ? "fa-solid fa-circle-xmark"
      : "fa-solid fa-circle-check"
    }"></i>

    <span>
      ${mensagem}
    </span>

  `;


  toast.classList.add(
    "mostrar"
  );


  clearTimeout(
    toast._timeout
  );


  toast._timeout =
    setTimeout(
      () => {

        toast.classList.remove(
          "mostrar"
        );

      },
      2200
    );

}



/* =========================================================
   IMAGEM
========================================================= */

function obterCaminhoImagem(
  imagem
) {

  const valor =
    String(
      imagem || ""
    ).trim();


  if (!valor) {

    return PLACEHOLDER_PRODUTO;

  }


  /*
    Se backend já devolver URL completa.
  */

  if (
    valor.startsWith(
      "http://"
    )
    ||
    valor.startsWith(
      "https://"
    )
  ) {

    return valor;

  }


  /*
    Remove possíveis caminhos antigos.
  */

  const nomeArquivo =
    valor
      .split(/[\\/]/)
      .pop();


  return nomeArquivo
    ? `${CAMINHO_IMAGENS_PRODUTOS}/${encodeURIComponent(nomeArquivo)}`
    : PLACEHOLDER_PRODUTO;

}



/* =========================================================
   CRIAR IMAGEM
========================================================= */

function criarImagemProduto(
  produto
) {

  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "product-image-wrapper";


  const imagem =
    document.createElement(
      "img"
    );


  imagem.className =
    "product-card-image";


  imagem.src =
    obterCaminhoImagem(
      produto.imagem
      ||
      produto.imagem_produto
    );


  imagem.alt =
    `Imagem de ${
      produto.nome_produto
      ||
      "produto"
    }`;


  imagem.loading =
    "lazy";


  imagem.addEventListener(
    "error",
    function tratarErroImagem() {

      imagem.removeEventListener(
        "error",
        tratarErroImagem
      );


      imagem.src =
        PLACEHOLDER_PRODUTO;


      imagem.alt =
        "Imagem não disponível";

    }
  );


  wrapper.appendChild(
    imagem
  );


  return wrapper;

}



/* =========================================================
   ADICIONAR AO CARRINHO
========================================================= */

function adicionarAoCarrinho(
  idProduto
) {

  const produto =
    produtos.find(
      item =>
        Number(
          item.id_produto
        )
        ===
        Number(
          idProduto
        )
    );


  if (!produto) {

    mostrarToast(
      "Produto não encontrado.",
      "error"
    );

    return;

  }


  const estoque =
    Number(
      produto.quantidade_estoque || 0
    );


  if (estoque <= 0) {

    mostrarToast(
      "Este produto está sem estoque.",
      "warning"
    );

    return;

  }


  const carrinho =
    obterCarrinho();


  const itemExistente =
    carrinho.find(
      item =>
        Number(
          item.id_produto
        )
        ===
        Number(
          idProduto
        )
    );


  if (itemExistente) {

    if (
      Number(
        itemExistente.quantidade
      )
      >=
      estoque
    ) {

      mostrarToast(
        "Quantidade máxima em estoque atingida.",
        "warning"
      );

      return;

    }


    itemExistente.quantidade =
      Number(
        itemExistente.quantidade
      )
      +
      1;

  } else {

    carrinho.push({

      id_produto:
        produto.id_produto,

      nome_produto:
        produto.nome_produto,

      preco_produto:
        Number(
          produto.preco_produto || 0
        ),

      quantidade_estoque:
        estoque,

      imagem:
        produto.imagem
        ||
        produto.imagem_produto
        ||
        null,

      quantidade:
        1

    });

  }


  salvarCarrinho(
    carrinho
  );


  mostrarToast(
    "Produto adicionado ao carrinho."
  );

}



/* =========================================================
   DETALHE
========================================================= */

function criarDetalheProduto(
  rotulo,
  valor
) {

  const elemento =
    document.createElement(
      "div"
    );


  elemento.className =
    "product-detail";


  const titulo =
    document.createElement(
      "span"
    );


  titulo.textContent =
    rotulo;


  const conteudo =
    document.createElement(
      "strong"
    );


  conteudo.textContent =
    String(valor);


  elemento.append(
    titulo,
    conteudo
  );


  return elemento;

}



/* =========================================================
   CARD
========================================================= */

function criarCardProduto(
  produto
) {

  const codigo =
    obterCodigoProduto(
      produto
    );


  const marca =
    obterMarcaProduto(
      produto
    );


  const categoria =
    obterCategoriaProduto(
      produto
    );


  const estoque =
    Number(
      produto.quantidade_estoque || 0
    );


  const preco =
    Number(
      produto.preco_produto || 0
    );


  const descricao =
    obterCampoProduto(
      produto,
      [
        "descricao_produto",
        "descricao"
      ],
      "Peça automotiva disponível em nosso catálogo."
    );



  /* COLUNA BOOTSTRAP */

  const coluna =
    document.createElement(
      "div"
    );


  coluna.className =
    "col-12 col-sm-6 col-lg-4 col-xl-3";



  /* CARD */

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "modern-product-card card-produto";



  /* IMAGEM */

  const imagemWrapper =
    criarImagemProduto(
      produto
    );



  /* BADGES */

  const badges =
    document.createElement(
      "div"
    );


  badges.className =
    "product-badges";


  const badgeCategoria =
    document.createElement(
      "span"
    );


  badgeCategoria.className =
    "product-badge category";


  badgeCategoria.textContent =
    categoria;


  const badgeEstoque =
    document.createElement(
      "span"
    );


  badgeEstoque.className =
    estoque > 0
      ? "product-badge stock"
      : "product-badge no-stock";


  badgeEstoque.textContent =
    estoque > 0
      ? "Em estoque"
      : "Indisponível";


  badges.append(
    badgeCategoria,
    badgeEstoque
  );


  imagemWrapper.appendChild(
    badges
  );



  /* CONTEÚDO */

  const corpo =
    document.createElement(
      "div"
    );


  corpo.className =
    "modern-product-body";



  /* MARCA */

  const marcaEl =
    document.createElement(
      "span"
    );


  marcaEl.className =
    "product-brand";


  marcaEl.textContent =
    marca;



  /* TÍTULO */

  const titulo =
    document.createElement(
      "h3"
    );


  titulo.className =
    "product-title";


  titulo.textContent =
    produto.nome_produto
    ||
    "Produto";



  /* DESCRIÇÃO */

  const descricaoEl =
    document.createElement(
      "p"
    );


  descricaoEl.className =
    "product-description";


  descricaoEl.textContent =
    descricao;



  /* DETALHES */

  const detalhes =
    document.createElement(
      "div"
    );


  detalhes.className =
    "product-details-grid";


  detalhes.append(

    criarDetalheProduto(
      "Código",
      codigo
    ),

    criarDetalheProduto(
      "Estoque",
      estoque
    )

  );



  /* RODAPÉ */

  const rodape =
    document.createElement(
      "div"
    );


  rodape.className =
    "product-footer";



  const areaPreco =
    document.createElement(
      "div"
    );


  areaPreco.className =
    "product-price-area";


  const textoPreco =
    document.createElement(
      "small"
    );


  textoPreco.textContent =
    "Preço";


  const precoEl =
    document.createElement(
      "strong"
    );


  precoEl.className =
    "product-price";


  precoEl.textContent =
    formatarMoeda(
      preco
    );


  areaPreco.append(
    textoPreco,
    precoEl
  );



  const botao =
    document.createElement(
      "button"
    );


  botao.type =
    "button";


  botao.className =
    "product-buy-button";


  botao.disabled =
    estoque <= 0;


  botao.innerHTML =
    estoque > 0

      ? `
        <i class="fa-solid fa-cart-plus"></i>
        Adicionar
      `

      : `
        <i class="fa-solid fa-ban"></i>
        Indisponível
      `;


  botao.addEventListener(
    "click",
    () => {

      adicionarAoCarrinho(
        produto.id_produto
      );

    }
  );


  rodape.append(
    areaPreco,
    botao
  );



  corpo.append(
    marcaEl,
    titulo,
    descricaoEl,
    detalhes,
    rodape
  );


  card.append(
    imagemWrapper,
    corpo
  );


  coluna.appendChild(
    card
  );


  return coluna;

}



/* =========================================================
   URL
========================================================= */

function aplicarParametrosURL() {

  const parametros =
    new URLSearchParams(
      window.location.search
    );


  const buscaURL =
    parametros.get(
      "busca"
    );


  const categoriaURL =
    parametros.get(
      "categoria"
    );


  if (
    buscaURL &&
    campoBusca
  ) {

    campoBusca.value =
      buscaURL;

  }


  if (
    buscaURL &&
    campoBuscaMobile
  ) {

    campoBuscaMobile.value =
      buscaURL;

  }


  /*
    Categoria da URL será usada
    mesmo se não existir select
    filtroCategoria.
  */

  window.categoriaURL =
    categoriaURL
      ? normalizarTexto(
          categoriaURL
        )
      : "";

}



/* =========================================================
   FILTRO
========================================================= */

function filtrarProdutos() {

  const termo =
    normalizarTexto(
      campoBusca?.value || ""
    );


  const categoriaSelect =
    filtroCategoria?.value || "";


  const categoriaSelecionada =
    normalizarTexto(
      categoriaSelect
      ||
      window.categoriaURL
      ||
      ""
    );


  const somenteEstoque =
    Boolean(
      filtroEstoque?.checked
    );


  const min =
    Number(
      precoMinimo?.value || 0
    );


  const max =
    Number(
      precoMaximo?.value || 0
    );


  return produtos.filter(
    produto => {

      const textoPesquisavel =
        normalizarTexto(
          [
            produto.nome_produto,
            produto.descricao_produto,
            produto.descricao,
            obterCodigoProduto(
              produto
            ),
            obterMarcaProduto(
              produto
            ),
            obterCategoriaProduto(
              produto
            )
          ].join(" ")
        );


      const categoriaProduto =
        normalizarTexto(
          obterCategoriaProduto(
            produto
          )
        );


      const estoque =
        Number(
          produto.quantidade_estoque || 0
        );


      const preco =
        Number(
          produto.preco_produto || 0
        );


      const correspondeBusca =
        !termo
        ||
        textoPesquisavel.includes(
          termo
        );


      const correspondeCategoria =
        !categoriaSelecionada
        ||
        categoriaProduto.includes(
          categoriaSelecionada
        );


      const correspondeEstoque =
        !somenteEstoque
        ||
        estoque > 0;


      const correspondeMin =
        !min
        ||
        preco >= min;


      const correspondeMax =
        !max
        ||
        preco <= max;


      return (
        correspondeBusca
        &&
        correspondeCategoria
        &&
        correspondeEstoque
        &&
        correspondeMin
        &&
        correspondeMax
      );

    }
  );

}



/* =========================================================
   ORDENAR
========================================================= */

function ordenarProdutos(
  lista
) {

  const ordenacao =
    ordenacaoProdutos?.value
    ||
    "nome";


  const copia =
    [...lista];


  return copia.sort(
    (
      primeiro,
      segundo
    ) => {

      /*
        HTML novo
      */

      if (
        ordenacao ===
        "menor-preco"
        ||
        ordenacao ===
        "preco-asc"
      ) {

        return (
          Number(
            primeiro.preco_produto || 0
          )
          -
          Number(
            segundo.preco_produto || 0
          )
        );

      }


      if (
        ordenacao ===
        "maior-preco"
        ||
        ordenacao ===
        "preco-desc"
      ) {

        return (
          Number(
            segundo.preco_produto || 0
          )
          -
          Number(
            primeiro.preco_produto || 0
          )
        );

      }


      if (
        ordenacao ===
        "estoque-desc"
      ) {

        return (
          Number(
            segundo.quantidade_estoque || 0
          )
          -
          Number(
            primeiro.quantidade_estoque || 0
          )
        );

      }


      return String(
        primeiro.nome_produto || ""
      ).localeCompare(
        String(
          segundo.nome_produto || ""
        ),
        "pt-BR"
      );

    }
  );

}



/* =========================================================
   PAGINAÇÃO
========================================================= */

function renderizarPaginacao(
  totalPaginas
) {

  if (!paginacaoCatalogo) {

    return;

  }


  paginacaoCatalogo.innerHTML =
    "";


  if (
    totalPaginas <= 1
  ) {

    return;

  }


  function criarBotao(
    texto,
    pagina,
    desabilitado = false,
    atual = false
  ) {

    const botao =
      document.createElement(
        "button"
      );


    botao.type =
      "button";


    botao.className =
      "catalog-page-button";


    botao.textContent =
      texto;


    botao.disabled =
      desabilitado;


    if (atual) {

      botao.classList.add(
        "active"
      );

    }


    botao.addEventListener(
      "click",
      () => {

        paginaAtual =
          pagina;


        renderizarCatalogo();


        document
          .querySelector(
            ".catalog-title-area"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

      }
    );


    return botao;

  }



  paginacaoCatalogo.appendChild(

    criarBotao(
      "Anterior",
      paginaAtual - 1,
      paginaAtual === 1
    )

  );


  for (
    let pagina = 1;
    pagina <= totalPaginas;
    pagina++
  ) {

    paginacaoCatalogo.appendChild(

      criarBotao(
        String(pagina),
        pagina,
        false,
        pagina === paginaAtual
      )

    );

  }


  paginacaoCatalogo.appendChild(

    criarBotao(
      "Próxima",
      paginaAtual + 1,
      paginaAtual === totalPaginas
    )

  );

}



/* =========================================================
   RESULTADO
========================================================= */

function atualizarTextoResultado(
  quantidade
) {

  if (!resultadoCatalogo) {

    return;

  }


  resultadoCatalogo.textContent =
    quantidade === 1

      ? "1 produto encontrado"

      : `${quantidade} produtos encontrados`;

}



/* =========================================================
   RENDERIZAR
========================================================= */

function renderizarCatalogo() {

  if (!listaProdutos) {

    console.error(
      "#listaProdutos não encontrado."
    );

    return;

  }


  const filtrados =
    ordenarProdutos(
      filtrarProdutos()
    );


  atualizarTextoResultado(
    filtrados.length
  );


  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        filtrados.length
        /
        ITENS_POR_PAGINA
      )
    );


  if (
    paginaAtual >
    totalPaginas
  ) {

    paginaAtual =
      totalPaginas;

  }


  const inicio =
    (
      paginaAtual - 1
    )
    *
    ITENS_POR_PAGINA;


  const produtosPagina =
    filtrados.slice(
      inicio,
      inicio + ITENS_POR_PAGINA
    );


  listaProdutos.innerHTML =
    "";


  listaProdutos.setAttribute(
    "aria-busy",
    "false"
  );



  /* =====================================================
     VAZIO
  ===================================================== */

  if (
    produtosPagina.length === 0
  ) {

    if (catalogEmptyState) {

      catalogEmptyState.hidden =
        false;

    } else {

      listaProdutos.innerHTML = `

        <div class="col-12">

          <div class="catalog-empty">

            <span>

              <i class="fa-solid fa-box-open"></i>

            </span>

            <h3>
              Nenhum produto encontrado
            </h3>

            <p>
              Tente alterar sua busca
              ou os filtros.
            </p>

          </div>

        </div>

      `;

    }


    renderizarPaginacao(
      0
    );


    return;

  }



  if (catalogEmptyState) {

    catalogEmptyState.hidden =
      true;

  }



  produtosPagina.forEach(
    produto => {

      listaProdutos.appendChild(
        criarCardProduto(
          produto
        )
      );

    }
  );


  renderizarPaginacao(
    totalPaginas
  );

}



/* =========================================================
   CATEGORIAS
========================================================= */

function preencherCategorias() {

  if (!filtroCategoria) {

    return;

  }


  filtroCategoria.innerHTML =
    `
      <option value="">
        Todas as categorias
      </option>
    `;


  const categorias =
    [
      ...new Set(
        produtos.map(
          obterCategoriaProduto
        )
      )
    ]
    .filter(Boolean)
    .sort(
      (
        a,
        b
      ) => {

        return a.localeCompare(
          b,
          "pt-BR"
        );

      }
    );


  categorias.forEach(
    categoria => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        categoria;


      option.textContent =
        categoria;


      filtroCategoria.appendChild(
        option
      );

    }
  );

}



/* =========================================================
   ESTADO
========================================================= */

function mostrarEstado(
  mensagem,
  tipo = "info"
) {

  if (!listaProdutos) {

    return;

  }


  listaProdutos.innerHTML = `

    <div class="col-12">

      <div
        class="catalog-loading-state ${tipo}"
      >

        ${
          tipo === "error"

          ? `
            <i class="fa-solid fa-triangle-exclamation"></i>
          `

          : `
            <div
              class="spinner-border text-primary"
              role="status"
            ></div>
          `
        }

        <p>
          ${mensagem}
        </p>

      </div>

    </div>

  `;

}



/* =========================================================
   CARREGAR PRODUTOS
========================================================= */

async function carregarProdutos() {

  mostrarEstado(
    "Carregando produtos..."
  );


  try {

    const resposta =
      await fetch(
        `${API}/produtos`
      );


    if (!resposta.ok) {

      throw new Error(
        `Erro ${resposta.status} ao carregar produtos.`
      );

    }


    const dados =
      await resposta.json();


    if (
      !Array.isArray(dados)
    ) {

      throw new Error(
        "A API não retornou uma lista de produtos."
      );

    }


    produtos =
      dados;


    /*
      Apoio para carrinho / estoque.
    */

    localStorage.setItem(
      "produtosMock",
      JSON.stringify(
        produtos
      )
    );


    preencherCategorias();


    aplicarParametrosURL();


    renderizarCatalogo();


    atualizarBotaoCarrinho();

  } catch (error) {

    console.error(
      "Erro ao carregar catálogo:",
      error
    );


    /*
      FALLBACK LOCAL

      Se API cair mas houver produtosMock,
      ainda mostramos os últimos produtos.
    */

    try {

      const backup =
        JSON.parse(
          localStorage.getItem(
            "produtosMock"
          )
        );


      if (
        Array.isArray(backup)
        &&
        backup.length > 0
      ) {

        produtos =
          backup;


        preencherCategorias();


        aplicarParametrosURL();


        renderizarCatalogo();


        mostrarToast(
          "Backend indisponível. Mostrando dados salvos anteriormente.",
          "warning"
        );


        return;

      }

    } catch {

      /* ignora */

    }


    mostrarEstado(
      "Não foi possível carregar os produtos. Verifique se o backend está ligado.",
      "error"
    );

  }

}



/* =========================================================
   ATUALIZAR FILTROS
========================================================= */

function atualizarFiltros() {

  paginaAtual =
    1;


  /*
    Se usuário mexeu manualmente
    em categoria, removemos categoria URL.
  */

  renderizarCatalogo();

}



/* =========================================================
   BUSCA DESKTOP
========================================================= */

campoBusca?.addEventListener(
  "input",
  () => {

    paginaAtual =
      1;


    renderizarCatalogo();

  }
);



/* =========================================================
   BUSCA MOBILE
========================================================= */

campoBuscaMobile?.addEventListener(
  "input",
  () => {

    if (campoBusca) {

      campoBusca.value =
        campoBuscaMobile.value;

    }


    paginaAtual =
      1;


    renderizarCatalogo();

  }
);



/* =========================================================
   CATEGORIA
========================================================= */

filtroCategoria?.addEventListener(
  "change",
  () => {

    window.categoriaURL =
      "";


    atualizarFiltros();

  }
);



/* =========================================================
   ORDENAÇÃO
========================================================= */

ordenacaoProdutos?.addEventListener(
  "change",
  atualizarFiltros
);



/* =========================================================
   ESTOQUE
========================================================= */

filtroEstoque?.addEventListener(
  "change",
  atualizarFiltros
);



/* =========================================================
   PREÇO
========================================================= */

precoMinimo?.addEventListener(
  "input",
  atualizarFiltros
);


precoMaximo?.addEventListener(
  "input",
  atualizarFiltros
);



/* =========================================================
   LIMPAR FILTROS
========================================================= */

btnLimparFiltros?.addEventListener(
  "click",
  () => {

    if (campoBusca) {

      campoBusca.value =
        "";

    }


    if (campoBuscaMobile) {

      campoBuscaMobile.value =
        "";

    }


    if (filtroCategoria) {

      filtroCategoria.value =
        "";

    }


    if (ordenacaoProdutos) {

      ordenacaoProdutos.value =
        "";

    }


    if (filtroEstoque) {

      filtroEstoque.checked =
        false;

    }


    if (precoMinimo) {

      precoMinimo.value =
        "";

    }


    if (precoMaximo) {

      precoMaximo.value =
        "";

    }


    window.categoriaURL =
      "";


    const url =
      new URL(
        window.location.href
      );


    url.search = "";


    window.history.replaceState(
      {},
      "",
      url
    );


    paginaAtual =
      1;


    renderizarCatalogo();

  }
);



/* =========================================================
   BOTÃO BUSCAR VISUAL
========================================================= */

document
  .getElementById(
    "btnBuscaVisual"
  )
  ?.addEventListener(
    "click",
    () => {

      paginaAtual =
        1;


      renderizarCatalogo();

    }
  );



/* =========================================================
   DISPONIBILIZAR FUNÇÃO
========================================================= */

window.adicionarAoCarrinho =
  adicionarAoCarrinho;



/* =========================================================
   INICIAR
========================================================= */

atualizarBotaoCarrinho();

carregarProdutos();
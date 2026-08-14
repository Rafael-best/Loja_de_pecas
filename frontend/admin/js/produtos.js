/* =========================================================
   ADMIN PRODUTOS
========================================================= */

const API =
  "http://localhost:3000/api";


const IMAGENS_PRODUTOS =
  "../assets/images/produtos";


const PLACEHOLDER_PRODUTO =
  `${IMAGENS_PRODUTOS}/placeholder.webp`;


const ITENS_POR_PAGINA =
  10;


let produtosAdmin = [];

let produtosFiltradosAdmin = [];

let paginaAtualAdmin = 1;



/* =========================================================
   ELEMENTOS
========================================================= */

const btnAbrirSidebar =
  document.getElementById(
    "btnAbrirSidebar"
  );


const btnFecharSidebar =
  document.getElementById(
    "btnFecharSidebar"
  );


const sidebarOverlay =
  document.getElementById(
    "sidebarOverlay"
  );


const btnAtualizarProdutos =
  document.getElementById(
    "btnAtualizarProdutos"
  );


const btnNovoProduto =
  document.getElementById(
    "btnNovoProduto"
  );


const btnSairAdmin =
  document.getElementById(
    "btnSairAdmin"
  );


const buscaProdutoAdmin =
  document.getElementById(
    "buscaProdutoAdmin"
  );


const filtroCategoriaAdmin =
  document.getElementById(
    "filtroCategoriaAdmin"
  );


const filtroEstoqueAdmin =
  document.getElementById(
    "filtroEstoqueAdmin"
  );


const ordenacaoAdmin =
  document.getElementById(
    "ordenacaoAdmin"
  );


const btnLimparFiltrosAdmin =
  document.getElementById(
    "btnLimparFiltrosAdmin"
  );


const tabelaProdutosAdmin =
  document.getElementById(
    "tabelaProdutosAdmin"
  );


const cardsProdutosAdmin =
  document.getElementById(
    "cardsProdutosAdmin"
  );


const paginacaoProdutosAdmin =
  document.getElementById(
    "paginacaoProdutosAdmin"
  );


const resultadoProdutosAdmin =
  document.getElementById(
    "resultadoProdutosAdmin"
  );



/* =========================================================
   SIDEBAR
========================================================= */

function abrirSidebar() {

  document.body.classList.add(
    "sidebar-open"
  );

}


function fecharSidebar() {

  document.body.classList.remove(
    "sidebar-open"
  );

}


btnAbrirSidebar?.addEventListener(
  "click",
  abrirSidebar
);


btnFecharSidebar?.addEventListener(
  "click",
  fecharSidebar
);


sidebarOverlay?.addEventListener(
  "click",
  fecharSidebar
);



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
   TEXTO
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

function obterValorProduto(
  produto,
  campos,
  padrao = ""
) {

  for (
    const campo
    of campos
  ) {

    const valor =
      produto?.[campo];


    if (
      valor !== null
      &&
      valor !== undefined
      &&
      String(valor).trim() !== ""
    ) {

      return valor;

    }

  }


  return padrao;

}



function obterCategoria(
  produto
) {

  return obterValorProduto(
    produto,
    [
      "categoria_produto",
      "categoria",
      "nome_categoria"
    ],
    "Sem categoria"
  );

}



function obterMarca(
  produto
) {

  return obterValorProduto(
    produto,
    [
      "marca_produto",
      "marca",
      "nome_marca"
    ],
    "Sem marca"
  );

}



function obterCodigo(
  produto
) {

  return obterValorProduto(
    produto,
    [
      "codigo_produto",
      "codigo",
      "sku"
    ],
    produto.id_produto
      ? `#${produto.id_produto}`
      : "-"
  );

}



function obterDescricao(
  produto
) {

  return obterValorProduto(
    produto,
    [
      "descricao_produto",
      "descricao"
    ],
    "Sem descrição."
  );

}



/* =========================================================
   IMAGEM
========================================================= */

function obterImagem(
  produto
) {

  const imagem =
    String(
      produto.imagem
      ||
      produto.imagem_produto
      ||
      ""
    ).trim();


  if (!imagem) {

    return PLACEHOLDER_PRODUTO;

  }


  if (
    imagem.startsWith("http://")
    ||
    imagem.startsWith("https://")
  ) {

    return imagem;

  }


  const arquivo =
    imagem
      .split(/[\\/]/)
      .pop();


  return arquivo
    ? `${IMAGENS_PRODUTOS}/${encodeURIComponent(arquivo)}`
    : PLACEHOLDER_PRODUTO;

}



/* =========================================================
   STATUS
========================================================= */

function obterStatusProduto(
  produto
) {

  const estoque =
    Number(
      produto.quantidade_estoque || 0
    );


  if (
    estoque <= 0
  ) {

    return {
      texto:
        "Sem estoque",

      classe:
        "out"
    };

  }


  const status =
    normalizarTexto(
      produto.status_produto
      ||
      produto.status
      ||
      "ativo"
    );


  if (
    status === "inativo"
  ) {

    return {
      texto:
        "Inativo",

      classe:
        "inactive"
    };

  }


  return {
    texto:
      "Ativo",

    classe:
      "active"
  };

}



/* =========================================================
   ESTOQUE
========================================================= */

function obterClasseEstoque(
  estoque
) {

  const quantidade =
    Number(
      estoque || 0
    );


  if (
    quantidade <= 0
  ) {

    return "empty";

  }


  if (
    quantidade <= 5
  ) {

    return "low";

  }


  return "normal";

}



function obterPercentualEstoque(
  estoque
) {

  const quantidade =
    Number(
      estoque || 0
    );


  if (
    quantidade <= 0
  ) {

    return 0;

  }


  /*
    Escala visual.
    20 unidades = barra cheia.
  */

  return Math.min(
    (
      quantidade / 20
    ) * 100,
    100
  );

}



/* =========================================================
   CARREGAR
========================================================= */

async function carregarProdutosAdmin() {

  mostrarCarregamentoProdutos();


  const icone =
    btnAtualizarProdutos
      ?.querySelector("i");


  icone?.classList.add(
    "fa-spin"
  );


  try {

    const resposta =
      await fetch(
        `${API}/produtos`
      );


    if (!resposta.ok) {

      throw new Error(
        `Erro ${resposta.status}`
      );

    }


    const dados =
      await resposta.json();


    if (
      !Array.isArray(dados)
    ) {

      throw new Error(
        "A API não retornou uma lista."
      );

    }


    produtosAdmin =
      dados;


    /*
      Mantém cache igual ao catálogo.
    */

    localStorage.setItem(
      "produtosMock",
      JSON.stringify(
        produtosAdmin
      )
    );


    preencherCategoriasAdmin();


    atualizarProdutosAdmin();


  } catch (erro) {

    console.error(
      "Erro ao carregar produtos:",
      erro
    );


    /*
      Fallback local.
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
        backup.length
      ) {

        produtosAdmin =
          backup;


        preencherCategoriasAdmin();


        atualizarProdutosAdmin();


        return;

      }

    } catch {
      /* vazio */
    }


    mostrarErroProdutos();

  } finally {

    icone?.classList.remove(
      "fa-spin"
    );

  }

}



/* =========================================================
   CATEGORIAS
========================================================= */

function preencherCategoriasAdmin() {

  if (!filtroCategoriaAdmin) {

    return;

  }


  const valorAtual =
    filtroCategoriaAdmin.value;


  filtroCategoriaAdmin.innerHTML = `
    <option value="">
      Todas as categorias
    </option>
  `;


  const categorias =
    [
      ...new Set(
        produtosAdmin
          .map(
            produto =>
              obterCategoria(
                produto
              )
          )
          .filter(Boolean)
      )
    ]
      .sort(
        (
          a,
          b
        ) =>
          a.localeCompare(
            b,
            "pt-BR"
          )
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


      filtroCategoriaAdmin
        .appendChild(
          option
        );

    }
  );


  if (
    categorias.includes(
      valorAtual
    )
  ) {

    filtroCategoriaAdmin.value =
      valorAtual;

  }

}



/* =========================================================
   FILTRO
========================================================= */

function filtrarProdutosAdmin() {

  const termo =
    normalizarTexto(
      buscaProdutoAdmin?.value
      ||
      ""
    );


  const categoria =
    normalizarTexto(
      filtroCategoriaAdmin?.value
      ||
      ""
    );


  const estoqueFiltro =
    filtroEstoqueAdmin?.value
    ||
    "";


  produtosFiltradosAdmin =
    produtosAdmin.filter(
      produto => {

        const estoque =
          Number(
            produto.quantidade_estoque || 0
          );


        const texto =
          normalizarTexto(
            [
              produto.nome_produto,
              obterCodigo(produto),
              obterMarca(produto),
              obterCategoria(produto),
              obterDescricao(produto)
            ].join(" ")
          );


        const correspondeBusca =
          !termo
          ||
          texto.includes(
            termo
          );


        const correspondeCategoria =
          !categoria
          ||
          normalizarTexto(
            obterCategoria(
              produto
            )
          ) === categoria;


        let correspondeEstoque =
          true;


        if (
          estoqueFiltro === "disponivel"
        ) {

          correspondeEstoque =
            estoque > 0;

        }


        if (
          estoqueFiltro === "baixo"
        ) {

          correspondeEstoque =
            estoque > 0
            &&
            estoque <= 5;

        }


        if (
          estoqueFiltro === "sem"
        ) {

          correspondeEstoque =
            estoque <= 0;

        }


        return (
          correspondeBusca
          &&
          correspondeCategoria
          &&
          correspondeEstoque
        );

      }
    );

}



/* =========================================================
   ORDENAR
========================================================= */

function ordenarProdutosAdmin() {

  const ordenacao =
    ordenacaoAdmin?.value
    ||
    "nome";


  produtosFiltradosAdmin.sort(
    (
      a,
      b
    ) => {

      if (
        ordenacao ===
        "preco-asc"
      ) {

        return (
          Number(
            a.preco_produto || 0
          )
          -
          Number(
            b.preco_produto || 0
          )
        );

      }


      if (
        ordenacao ===
        "preco-desc"
      ) {

        return (
          Number(
            b.preco_produto || 0
          )
          -
          Number(
            a.preco_produto || 0
          )
        );

      }


      if (
        ordenacao ===
        "estoque-asc"
      ) {

        return (
          Number(
            a.quantidade_estoque || 0
          )
          -
          Number(
            b.quantidade_estoque || 0
          )
        );

      }


      if (
        ordenacao ===
        "estoque-desc"
      ) {

        return (
          Number(
            b.quantidade_estoque || 0
          )
          -
          Number(
            a.quantidade_estoque || 0
          )
        );

      }


      return String(
        a.nome_produto || ""
      )
        .localeCompare(
          String(
            b.nome_produto || ""
          ),
          "pt-BR"
        );

    }
  );

}



/* =========================================================
   ATUALIZAR
========================================================= */

function atualizarProdutosAdmin() {

  filtrarProdutosAdmin();

  ordenarProdutosAdmin();


  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        produtosFiltradosAdmin.length
        /
        ITENS_POR_PAGINA
      )
    );


  if (
    paginaAtualAdmin >
    totalPaginas
  ) {

    paginaAtualAdmin =
      totalPaginas;

  }


  renderizarEstatisticasAdmin();

  renderizarTabelaProdutosAdmin();

  renderizarCardsProdutosAdmin();

  renderizarPaginacaoAdmin();

}



/* =========================================================
   ESTATÍSTICAS
========================================================= */

function renderizarEstatisticasAdmin() {

  const total =
    produtosAdmin.length;


  const disponiveis =
    produtosAdmin.filter(
      produto =>
        Number(
          produto.quantidade_estoque || 0
        )
        > 0
    ).length;


  const baixo =
    produtosAdmin.filter(
      produto => {

        const estoque =
          Number(
            produto.quantidade_estoque || 0
          );


        return (
          estoque > 0
          &&
          estoque <= 5
        );

      }
    ).length;


  const sem =
    produtosAdmin.filter(
      produto =>
        Number(
          produto.quantidade_estoque || 0
        )
        <= 0
    ).length;


  definirTexto(
    "statTotalProdutos",
    total
  );


  definirTexto(
    "statDisponiveis",
    disponiveis
  );


  definirTexto(
    "statEstoqueBaixo",
    baixo
  );


  definirTexto(
    "statSemEstoque",
    sem
  );


  definirTexto(
    "badgeEstoque",
    baixo + sem
  );


  const badge =
    document.getElementById(
      "badgeEstoque"
    );


  if (badge) {

    badge.hidden =
      baixo + sem <= 0;

  }

}



/* =========================================================
   TEXTO
========================================================= */

function definirTexto(
  id,
  valor
) {

  const elemento =
    document.getElementById(
      id
    );


  if (elemento) {

    elemento.textContent =
      valor;

  }

}



/* =========================================================
   PÁGINA ATUAL
========================================================= */

function obterProdutosPagina() {

  const inicio =
    (
      paginaAtualAdmin - 1
    )
    *
    ITENS_POR_PAGINA;


  return produtosFiltradosAdmin
    .slice(
      inicio,
      inicio
      +
      ITENS_POR_PAGINA
    );

}



/* =========================================================
   TABELA
========================================================= */

function renderizarTabelaProdutosAdmin() {

  if (!tabelaProdutosAdmin) {

    return;

  }


  const lista =
    obterProdutosPagina();


  if (resultadoProdutosAdmin) {

    resultadoProdutosAdmin.textContent =
      produtosFiltradosAdmin.length === 1
        ? "1 produto"
        : `${produtosFiltradosAdmin.length} produtos`;

  }


  if (
    lista.length === 0
  ) {

    tabelaProdutosAdmin.innerHTML = `

      <tr>

        <td colspan="6">

          <div class="products-empty">

            <i class="fa-solid fa-box-open"></i>

            <span>
              Nenhum produto encontrado.
            </span>

          </div>

        </td>

      </tr>

    `;


    return;

  }


  tabelaProdutosAdmin.innerHTML =
    lista.map(
      produto => {

        const estoque =
          Number(
            produto.quantidade_estoque || 0
          );


        const classeEstoque =
          obterClasseEstoque(
            estoque
          );


        const percentual =
          obterPercentualEstoque(
            estoque
          );


        const status =
          obterStatusProduto(
            produto
          );


        return `

          <tr>

            <td>

              <div class="admin-product-cell">


                <div class="admin-product-image">

                  <img
                    src="${obterImagem(produto)}"
                    alt="${produto.nome_produto || "Produto"}"
                    onerror="
                      this.style.display='none';
                      this.nextElementSibling.style.display='flex';
                    "
                  >

                  <span>

                    <i class="fa-solid fa-image"></i>

                  </span>

                </div>


                <div class="admin-product-info">

                  <strong>
                    ${
                      produto.nome_produto
                      ||
                      "Produto"
                    }
                  </strong>

                  <small>
                    Código:
                    ${obterCodigo(produto)}
                    •
                    ${obterMarca(produto)}
                  </small>

                </div>


              </div>

            </td>


            <td>

              <span class="product-category-badge">

                ${obterCategoria(produto)}

              </span>

            </td>


            <td>

              <strong class="product-admin-price">

                ${formatarMoeda(
                  produto.preco_produto
                )}

              </strong>

            </td>


            <td>

              <div class="product-stock ${classeEstoque}">

                <strong>

                  ${estoque}
                  un.

                </strong>

                <div class="product-stock-bar">

                  <span
                    style="width:${percentual}%"
                  ></span>

                </div>

              </div>

            </td>


            <td>

              <span
                class="product-status ${status.classe}"
              >

                ${status.texto}

              </span>

            </td>


            <td>

              <div class="admin-product-actions">


                <button
                  type="button"
                  class="product-action-button view"
                  title="Visualizar"
                  onclick="visualizarProdutoAdmin(${produto.id_produto})"
                >

                  <i class="fa-regular fa-eye"></i>

                </button>


                <button
                  type="button"
                  class="product-action-button edit"
                  title="Editar"
                  onclick="editarProdutoAdmin(${produto.id_produto})"
                >

                  <i class="fa-solid fa-pen"></i>

                </button>


                <button
                  type="button"
                  class="product-action-button delete"
                  title="Excluir"
                  onclick="excluirProdutoAdmin(${produto.id_produto})"
                >

                  <i class="fa-solid fa-trash"></i>

                </button>


              </div>

            </td>


          </tr>

        `;

      }
    )
    .join("");

}



/* =========================================================
   MOBILE
========================================================= */

function renderizarCardsProdutosAdmin() {

  if (!cardsProdutosAdmin) {

    return;

  }


  const lista =
    obterProdutosPagina();


  cardsProdutosAdmin.innerHTML =
    lista.map(
      produto => {

        const estoque =
          Number(
            produto.quantidade_estoque || 0
          );


        return `

          <article class="admin-product-mobile-card">


            <div class="mobile-product-header">

              <img
                src="${obterImagem(produto)}"
                alt="${produto.nome_produto || "Produto"}"
                onerror="this.src='${PLACEHOLDER_PRODUTO}'"
              >


              <div>

                <strong>
                  ${
                    produto.nome_produto
                    ||
                    "Produto"
                  }
                </strong>

                <small>
                  ${obterCodigo(produto)}
                  •
                  ${obterMarca(produto)}
                </small>

              </div>

            </div>



            <div class="mobile-product-info-grid">


              <div class="mobile-product-info">

                <span>
                  Categoria
                </span>

                <strong>
                  ${obterCategoria(produto)}
                </strong>

              </div>


              <div class="mobile-product-info">

                <span>
                  Preço
                </span>

                <strong>
                  ${formatarMoeda(
                    produto.preco_produto
                  )}
                </strong>

              </div>


              <div class="mobile-product-info">

                <span>
                  Estoque
                </span>

                <strong>
                  ${estoque} un.
                </strong>

              </div>


              <div class="mobile-product-info">

                <span>
                  Status
                </span>

                <strong>
                  ${
                    obterStatusProduto(
                      produto
                    ).texto
                  }
                </strong>

              </div>


            </div>



            <div class="mobile-product-actions">


              <button
                type="button"
                onclick="visualizarProdutoAdmin(${produto.id_produto})"
              >

                <i class="fa-regular fa-eye"></i>

                Ver

              </button>


              <button
                type="button"
                onclick="editarProdutoAdmin(${produto.id_produto})"
              >

                <i class="fa-solid fa-pen"></i>

                Editar

              </button>


              <button
                type="button"
                onclick="excluirProdutoAdmin(${produto.id_produto})"
              >

                <i class="fa-solid fa-trash"></i>

                Excluir

              </button>


            </div>


          </article>

        `;

      }
    )
    .join("");

}



/* =========================================================
   PAGINAÇÃO
========================================================= */

function renderizarPaginacaoAdmin() {

  if (!paginacaoProdutosAdmin) {

    return;

  }


  const totalPaginas =
    Math.ceil(
      produtosFiltradosAdmin.length
      /
      ITENS_POR_PAGINA
    );


  paginacaoProdutosAdmin.innerHTML =
    "";


  if (
    totalPaginas <= 1
  ) {

    return;

  }


  paginacaoProdutosAdmin
    .appendChild(
      criarBotaoPaginaAdmin(
        "Anterior",
        paginaAtualAdmin - 1,
        paginaAtualAdmin === 1
      )
    );


  for (
    let pagina = 1;
    pagina <= totalPaginas;
    pagina++
  ) {

    const botao =
      criarBotaoPaginaAdmin(
        pagina,
        pagina,
        false
      );


    if (
      pagina === paginaAtualAdmin
    ) {

      botao.classList.add(
        "active"
      );

    }


    paginacaoProdutosAdmin
      .appendChild(
        botao
      );

  }


  paginacaoProdutosAdmin
    .appendChild(
      criarBotaoPaginaAdmin(
        "Próxima",
        paginaAtualAdmin + 1,
        paginaAtualAdmin === totalPaginas
      )
    );

}



function criarBotaoPaginaAdmin(
  texto,
  pagina,
  desabilitado
) {

  const botao =
    document.createElement(
      "button"
    );


  botao.type =
    "button";


  botao.className =
    "admin-page-button";


  botao.textContent =
    texto;


  botao.disabled =
    desabilitado;


  botao.addEventListener(
    "click",
    () => {

      paginaAtualAdmin =
        pagina;


      renderizarTabelaProdutosAdmin();

      renderizarCardsProdutosAdmin();

      renderizarPaginacaoAdmin();

    }
  );


  return botao;

}



/* =========================================================
   MODAL
========================================================= */

const modalProduto =
  document.getElementById(
    "modalProduto"
  );


const modalVisualizarProduto =
  document.getElementById(
    "modalVisualizarProduto"
  );


const formProdutoAdmin =
  document.getElementById(
    "formProdutoAdmin"
  );


function abrirModalProduto() {

  modalProduto?.classList.add(
    "open"
  );


  modalProduto?.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";

}


function fecharModalProduto() {

  modalProduto?.classList.remove(
    "open"
  );


  modalProduto?.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.style.overflow =
    "";


  limparMensagemProdutoAdmin();

}



function fecharVisualizacaoProduto() {

  modalVisualizarProduto
    ?.classList.remove(
      "open"
    );


  document.body.style.overflow =
    "";

}



/* =========================================================
   NOVO PRODUTO
========================================================= */

function novoProdutoAdmin() {

  formProdutoAdmin?.reset();


  definirValor(
    "produtoIdAdmin",
    ""
  );


  definirTexto(
    "modalProdutoLabel",
    "NOVO PRODUTO"
  );


  definirTexto(
    "modalProdutoTitulo",
    "Adicionar produto"
  );


  definirImagemPreview(
    PLACEHOLDER_PRODUTO
  );


  abrirModalProduto();

}



/* =========================================================
   EDITAR
========================================================= */

function editarProdutoAdmin(
  idProduto
) {

  const produto =
    produtosAdmin.find(
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

    return;

  }


  definirValor(
    "produtoIdAdmin",
    produto.id_produto
  );


  definirValor(
    "nomeProdutoAdmin",
    produto.nome_produto
    ||
    ""
  );


  definirValor(
    "codigoProdutoAdmin",
    obterCodigo(produto)
  );


  definirValor(
    "marcaProdutoAdmin",
    obterMarca(produto)
  );


  definirValor(
    "categoriaProdutoAdmin",
    obterCategoria(produto)
  );


  definirValor(
    "precoProdutoAdmin",
    Number(
      produto.preco_produto || 0
    )
  );


  definirValor(
    "estoqueProdutoAdmin",
    Number(
      produto.quantidade_estoque || 0
    )
  );


  definirValor(
    "descricaoProdutoAdmin",
    obterDescricao(produto)
  );


  definirValor(
    "imagemProdutoAdmin",
    produto.imagem
    ||
    produto.imagem_produto
    ||
    ""
  );


  definirValor(
    "statusProdutoAdmin",
    normalizarTexto(
      produto.status_produto
      ||
      produto.status
      ||
      "ativo"
    ) === "inativo"
      ? "inativo"
      : "ativo"
  );


  definirTexto(
    "modalProdutoLabel",
    "EDITAR PRODUTO"
  );


  definirTexto(
    "modalProdutoTitulo",
    "Editar produto"
  );


  definirImagemPreview(
    obterImagem(
      produto
    )
  );


  abrirModalProduto();

}



/* =========================================================
   VISUALIZAR
========================================================= */

function visualizarProdutoAdmin(
  idProduto
) {

  const produto =
    produtosAdmin.find(
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

    return;

  }


  const container =
    document.getElementById(
      "conteudoVisualizarProduto"
    );


  if (!container) {

    return;

  }


  const status =
    obterStatusProduto(
      produto
    );


  container.innerHTML = `

    <div class="product-view-image">

      <img
        src="${obterImagem(produto)}"
        alt="${produto.nome_produto || "Produto"}"
        onerror="this.src='${PLACEHOLDER_PRODUTO}'"
      >

    </div>


    <h3 class="product-view-title">

      ${
        produto.nome_produto
        ||
        "Produto"
      }

    </h3>


    <span class="product-view-subtitle">

      ${obterMarca(produto)}
      •
      ${obterCodigo(produto)}

    </span>


    <div class="product-view-grid">


      <div class="product-view-info">

        <span>
          Categoria
        </span>

        <strong>
          ${obterCategoria(produto)}
        </strong>

      </div>


      <div class="product-view-info">

        <span>
          Preço
        </span>

        <strong>
          ${formatarMoeda(
            produto.preco_produto
          )}
        </strong>

      </div>


      <div class="product-view-info">

        <span>
          Estoque
        </span>

        <strong>
          ${
            Number(
              produto.quantidade_estoque || 0
            )
          }
          unidades
        </strong>

      </div>


      <div class="product-view-info">

        <span>
          Status
        </span>

        <strong>
          ${status.texto}
        </strong>

      </div>


    </div>


    <div class="product-view-description">

      ${obterDescricao(produto)}

    </div>

  `;


  modalVisualizarProduto
    ?.classList.add(
      "open"
    );


  document.body.style.overflow =
    "hidden";

}



/* =========================================================
   EXCLUIR
========================================================= */

function excluirProdutoAdmin(
  idProduto
) {

  const produto =
    produtosAdmin.find(
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

    return;

  }


  /*
    POR ENQUANTO NÃO CHAMAMOS DELETE.

    Isso será conectado quando
    revisarmos o backend.
  */

  alert(
    `A exclusão de "${produto.nome_produto}" será conectada ao backend depois.`
  );

}



/* =========================================================
   SALVAR FORM
========================================================= */

formProdutoAdmin?.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const id =
      document
        .getElementById(
          "produtoIdAdmin"
        )
        ?.value;


    const nome =
      document
        .getElementById(
          "nomeProdutoAdmin"
        )
        ?.value
        .trim();


    if (!nome) {

      mostrarMensagemProdutoAdmin(
        "Informe o nome do produto.",
        "error"
      );

      return;

    }


    /*
      Aqui entra depois:

      POST /api/produtos
      PUT /api/produtos/:id

      Por enquanto não alteramos o banco.
    */

    mostrarMensagemProdutoAdmin(
      id
        ? "Alterações validadas. A edição será conectada ao backend depois."
        : "Produto validado. O cadastro será conectado ao backend depois.",
      "info"
    );

  }
);



/* =========================================================
   PREVIEW
========================================================= */

document
  .getElementById(
    "imagemProdutoAdmin"
  )
  ?.addEventListener(
    "input",
    event => {

      const valor =
        event.target.value.trim();


      if (!valor) {

        definirImagemPreview(
          PLACEHOLDER_PRODUTO
        );

        return;

      }


      if (
        valor.startsWith("http://")
        ||
        valor.startsWith("https://")
      ) {

        definirImagemPreview(
          valor
        );

        return;

      }


      const arquivo =
        valor
          .split(/[\\/]/)
          .pop();


      definirImagemPreview(
        `${IMAGENS_PRODUTOS}/${encodeURIComponent(arquivo)}`
      );

    }
  );



function definirImagemPreview(
  src
) {

  const imagem =
    document.getElementById(
      "previewImagemProduto"
    );


  if (!imagem) {

    return;

  }


  imagem.style.display =
    "block";


  const fallback =
    imagem.nextElementSibling;


  if (fallback) {

    fallback.style.display =
      "none";

  }


  imagem.src =
    src;

}



/* =========================================================
   HELPERS
========================================================= */

function definirValor(
  id,
  valor
) {

  const elemento =
    document.getElementById(
      id
    );


  if (elemento) {

    elemento.value =
      valor;

  }

}



function mostrarMensagemProdutoAdmin(
  texto,
  tipo
) {

  const mensagem =
    document.getElementById(
      "mensagemProdutoAdmin"
    );


  if (!mensagem) {

    return;

  }


  mensagem.innerHTML = `

    <div class="admin-form-alert ${tipo}">

      ${texto}

    </div>

  `;

}



function limparMensagemProdutoAdmin() {

  const mensagem =
    document.getElementById(
      "mensagemProdutoAdmin"
    );


  if (mensagem) {

    mensagem.innerHTML =
      "";

  }

}



/* =========================================================
   LOADING
========================================================= */

function mostrarCarregamentoProdutos() {

  if (tabelaProdutosAdmin) {

    tabelaProdutosAdmin.innerHTML = `

      <tr>

        <td colspan="6">

          <div class="products-loading">

            <div class="admin-spinner"></div>

            <span>
              Carregando produtos...
            </span>

          </div>

        </td>

      </tr>

    `;

  }


  if (cardsProdutosAdmin) {

    cardsProdutosAdmin.innerHTML =
      "";

  }

}



function mostrarErroProdutos() {

  if (!tabelaProdutosAdmin) {

    return;

  }


  tabelaProdutosAdmin.innerHTML = `

    <tr>

      <td colspan="6">

        <div class="products-empty">

          <i class="fa-solid fa-triangle-exclamation"></i>

          <span>
            Não foi possível carregar os produtos.
          </span>

        </div>

      </td>

    </tr>

  `;


  if (resultadoProdutosAdmin) {

    resultadoProdutosAdmin.textContent =
      "Erro ao carregar";

  }

}



/* =========================================================
   FILTROS
========================================================= */

function filtrosAlterados() {

  paginaAtualAdmin =
    1;


  atualizarProdutosAdmin();

}


buscaProdutoAdmin?.addEventListener(
  "input",
  filtrosAlterados
);


filtroCategoriaAdmin?.addEventListener(
  "change",
  filtrosAlterados
);


filtroEstoqueAdmin?.addEventListener(
  "change",
  filtrosAlterados
);


ordenacaoAdmin?.addEventListener(
  "change",
  filtrosAlterados
);



btnLimparFiltrosAdmin
  ?.addEventListener(
    "click",
    () => {

      if (buscaProdutoAdmin) {
        buscaProdutoAdmin.value = "";
      }


      if (filtroCategoriaAdmin) {
        filtroCategoriaAdmin.value = "";
      }


      if (filtroEstoqueAdmin) {
        filtroEstoqueAdmin.value = "";
      }


      if (ordenacaoAdmin) {
        ordenacaoAdmin.value = "nome";
      }


      paginaAtualAdmin =
        1;


      atualizarProdutosAdmin();

    }
  );



/* =========================================================
   MODAL EVENTOS
========================================================= */

btnNovoProduto?.addEventListener(
  "click",
  novoProdutoAdmin
);


document
  .getElementById(
    "btnFecharModalProduto"
  )
  ?.addEventListener(
    "click",
    fecharModalProduto
  );


document
  .getElementById(
    "btnCancelarProduto"
  )
  ?.addEventListener(
    "click",
    fecharModalProduto
  );


document
  .getElementById(
    "btnFecharVisualizacaoProduto"
  )
  ?.addEventListener(
    "click",
    fecharVisualizacaoProduto
  );


modalProduto
  ?.querySelector(
    ".admin-modal-backdrop"
  )
  ?.addEventListener(
    "click",
    fecharModalProduto
  );


modalVisualizarProduto
  ?.querySelector(
    ".admin-modal-backdrop"
  )
  ?.addEventListener(
    "click",
    fecharVisualizacaoProduto
  );


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      fecharModalProduto();

      fecharVisualizacaoProduto();

      fecharSidebar();

    }

  }
);



/* =========================================================
   ATUALIZAR
========================================================= */

btnAtualizarProdutos
  ?.addEventListener(
    "click",
    carregarProdutosAdmin
  );



/* =========================================================
   SAIR
========================================================= */

btnSairAdmin
  ?.addEventListener(
    "click",
    () => {

      localStorage.removeItem(
        "adminLogado"
      );


      window.location.href =
        "../login.html";

    }
  );



/* =========================================================
   GLOBAL
========================================================= */

window.visualizarProdutoAdmin =
  visualizarProdutoAdmin;


window.editarProdutoAdmin =
  editarProdutoAdmin;


window.excluirProdutoAdmin =
  excluirProdutoAdmin;



/* =========================================================
   INICIAR
========================================================= */

carregarProdutosAdmin();
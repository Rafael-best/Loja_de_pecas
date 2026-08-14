/* =========================================================
   ADMIN ESTOQUE
========================================================= */

const API =
  "http://localhost:3000/api";


const CAMINHO_IMAGENS =
  "../assets/images/produtos";


const PLACEHOLDER =
  `${CAMINHO_IMAGENS}/placeholder.webp`;


const LIMITE_ESTOQUE_BAIXO =
  5;


const ITENS_POR_PAGINA =
  10;


let produtosEstoque = [];

let produtosEstoqueFiltrados = [];

let paginaEstoqueAtual = 1;



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


const btnSairAdmin =
  document.getElementById(
    "btnSairAdmin"
  );


const btnAtualizarEstoque =
  document.getElementById(
    "btnAtualizarEstoque"
  );


const btnNovaMovimentacao =
  document.getElementById(
    "btnNovaMovimentacao"
  );


const buscaEstoque =
  document.getElementById(
    "buscaEstoque"
  );


const filtroSituacaoEstoque =
  document.getElementById(
    "filtroSituacaoEstoque"
  );


const filtroCategoriaEstoque =
  document.getElementById(
    "filtroCategoriaEstoque"
  );


const ordenacaoEstoque =
  document.getElementById(
    "ordenacaoEstoque"
  );


const btnLimparFiltrosEstoque =
  document.getElementById(
    "btnLimparFiltrosEstoque"
  );


const tabelaEstoque =
  document.getElementById(
    "tabelaEstoque"
  );


const cardsEstoqueMobile =
  document.getElementById(
    "cardsEstoqueMobile"
  );


const resultadoEstoque =
  document.getElementById(
    "resultadoEstoque"
  );


const paginacaoEstoque =
  document.getElementById(
    "paginacaoEstoque"
  );


const historicoMovimentacoes =
  document.getElementById(
    "historicoMovimentacoes"
  );


const modalMovimentacao =
  document.getElementById(
    "modalMovimentacao"
  );


const produtoMovimentacao =
  document.getElementById(
    "produtoMovimentacao"
  );


const estoqueAtualMovimentacao =
  document.getElementById(
    "estoqueAtualMovimentacao"
  );


const formMovimentacao =
  document.getElementById(
    "formMovimentacao"
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
   CAMPOS
========================================================= */

function obterCampo(
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

  return obterCampo(
    produto,
    [
      "categoria_produto",
      "categoria",
      "nome_categoria"
    ],
    "Sem categoria"
  );

}



function obterCodigo(
  produto
) {

  return obterCampo(
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



function obterMarca(
  produto
) {

  return obterCampo(
    produto,
    [
      "marca_produto",
      "marca",
      "nome_marca"
    ],
    "Sem marca"
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
    )
      .trim();


  if (!imagem) {

    return PLACEHOLDER;

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
    ? `${CAMINHO_IMAGENS}/${encodeURIComponent(arquivo)}`
    : PLACEHOLDER;

}



/* =========================================================
   SITUAÇÃO
========================================================= */

function obterSituacao(
  quantidade
) {

  const estoque =
    Number(
      quantidade || 0
    );


  if (
    estoque <= 0
  ) {

    return {
      classe: "empty",
      texto: "Sem estoque"
    };

  }


  if (
    estoque <= LIMITE_ESTOQUE_BAIXO
  ) {

    return {
      classe: "low",
      texto: "Estoque baixo"
    };

  }


  return {
    classe: "normal",
    texto: "Saudável"
  };

}



function percentualEstoque(
  quantidade
) {

  const estoque =
    Number(
      quantidade || 0
    );


  return Math.min(
    (
      estoque / 20
    ) * 100,
    100
  );

}



/* =========================================================
   CARREGAR
========================================================= */

async function carregarEstoque() {

  mostrarCarregamento();


  const icone =
    btnAtualizarEstoque
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
        "Resposta inválida"
      );

    }


    produtosEstoque =
      dados;


    localStorage.setItem(
      "produtosMock",
      JSON.stringify(
        produtosEstoque
      )
    );


  } catch (erro) {

    console.error(
      "Erro ao carregar estoque:",
      erro
    );


    try {

      const backup =
        JSON.parse(
          localStorage.getItem(
            "produtosMock"
          )
        );


      produtosEstoque =
        Array.isArray(backup)
          ? backup
          : [];

    } catch {

      produtosEstoque = [];

    }

  }


  preencherCategorias();

  preencherProdutosMovimentacao();

  atualizarEstoque();

  renderizarHistorico();


  icone?.classList.remove(
    "fa-spin"
  );

}



/* =========================================================
   CATEGORIAS
========================================================= */

function preencherCategorias() {

  if (!filtroCategoriaEstoque) {

    return;

  }


  filtroCategoriaEstoque.innerHTML = `
    <option value="">
      Todas as categorias
    </option>
  `;


  const categorias =
    [
      ...new Set(
        produtosEstoque
          .map(obterCategoria)
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


      filtroCategoriaEstoque
        .appendChild(
          option
        );

    }
  );

}



/* =========================================================
   PRODUTOS MODAL
========================================================= */

function preencherProdutosMovimentacao() {

  if (!produtoMovimentacao) {

    return;

  }


  produtoMovimentacao.innerHTML = `
    <option value="">
      Selecione um produto
    </option>
  `;


  [...produtosEstoque]
    .sort(
      (
        a,
        b
      ) =>
        String(
          a.nome_produto || ""
        )
          .localeCompare(
            String(
              b.nome_produto || ""
            ),
            "pt-BR"
          )
    )
    .forEach(
      produto => {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          produto.id_produto;


        option.textContent =
          `${produto.nome_produto || "Produto"} • ${Number(produto.quantidade_estoque || 0)} un.`;


        produtoMovimentacao
          .appendChild(
            option
          );

      }
    );

}



/* =========================================================
   FILTRAR
========================================================= */

function filtrarEstoque() {

  const termo =
    normalizarTexto(
      buscaEstoque?.value || ""
    );


  const situacao =
    filtroSituacaoEstoque?.value
    ||
    "";


  const categoria =
    normalizarTexto(
      filtroCategoriaEstoque?.value
      ||
      ""
    );


  produtosEstoqueFiltrados =
    produtosEstoque.filter(
      produto => {

        const quantidade =
          Number(
            produto.quantidade_estoque || 0
          );


        const dadosTexto =
          normalizarTexto(
            [
              produto.nome_produto,
              obterCodigo(produto),
              obterMarca(produto),
              obterCategoria(produto)
            ].join(" ")
          );


        const correspondeBusca =
          !termo
          ||
          dadosTexto.includes(
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


        let correspondeSituacao =
          true;


        if (
          situacao === "normal"
        ) {

          correspondeSituacao =
            quantidade >
            LIMITE_ESTOQUE_BAIXO;

        }


        if (
          situacao === "baixo"
        ) {

          correspondeSituacao =
            quantidade > 0
            &&
            quantidade <=
            LIMITE_ESTOQUE_BAIXO;

        }


        if (
          situacao === "sem"
        ) {

          correspondeSituacao =
            quantidade <= 0;

        }


        return (
          correspondeBusca
          &&
          correspondeCategoria
          &&
          correspondeSituacao
        );

      }
    );

}



/* =========================================================
   ORDENAR
========================================================= */

function ordenarEstoqueFiltrado() {

  const ordenacao =
    ordenacaoEstoque?.value
    ||
    "estoque-asc";


  produtosEstoqueFiltrados.sort(
    (
      a,
      b
    ) => {

      if (
        ordenacao === "estoque-desc"
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


      if (
        ordenacao === "nome"
      ) {

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
  );

}



/* =========================================================
   ATUALIZAR
========================================================= */

function atualizarEstoque() {

  filtrarEstoque();

  ordenarEstoqueFiltrado();

  renderizarIndicadores();

  renderizarTabela();

  renderizarCardsMobile();

  renderizarPaginacao();

}



/* =========================================================
   INDICADORES
========================================================= */

function renderizarIndicadores() {

  const totalUnidades =
    produtosEstoque.reduce(
      (
        total,
        produto
      ) =>
        total
        +
        Number(
          produto.quantidade_estoque || 0
        ),
      0
    );


  const saudavel =
    produtosEstoque.filter(
      produto =>
        Number(
          produto.quantidade_estoque || 0
        )
        >
        LIMITE_ESTOQUE_BAIXO
    )
      .length;


  const baixo =
    produtosEstoque.filter(
      produto => {

        const quantidade =
          Number(
            produto.quantidade_estoque || 0
          );


        return (
          quantidade > 0
          &&
          quantidade <=
          LIMITE_ESTOQUE_BAIXO
        );

      }
    )
      .length;


  const sem =
    produtosEstoque.filter(
      produto =>
        Number(
          produto.quantidade_estoque || 0
        )
        <= 0
    )
      .length;


  definirTexto(
    "totalUnidadesEstoque",
    totalUnidades
  );


  definirTexto(
    "totalEstoqueSaudavel",
    saudavel
  );


  definirTexto(
    "totalEstoqueBaixo",
    baixo
  );


  definirTexto(
    "totalSemEstoque",
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
      baixo + sem === 0;

  }



  const alerta =
    document.getElementById(
      "alertaEstoque"
    );


  const texto =
    document.getElementById(
      "textoAlertaEstoque"
    );


  if (alerta) {

    alerta.hidden =
      baixo + sem === 0;

  }


  if (texto) {

    texto.textContent =
      `${baixo} produto(s) com estoque baixo e ${sem} produto(s) sem estoque.`;

  }

}



/* =========================================================
   PRODUTOS DA PÁGINA
========================================================= */

function obterProdutosPagina() {

  const inicio =
    (
      paginaEstoqueAtual - 1
    )
    *
    ITENS_POR_PAGINA;


  return produtosEstoqueFiltrados
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

function renderizarTabela() {

  if (!tabelaEstoque) {

    return;

  }


  const lista =
    obterProdutosPagina();


  if (resultadoEstoque) {

    resultadoEstoque.textContent =
      produtosEstoqueFiltrados.length === 1
        ? "1 produto"
        : `${produtosEstoqueFiltrados.length} produtos`;

  }


  if (
    lista.length === 0
  ) {

    tabelaEstoque.innerHTML = `

      <tr>

        <td colspan="5">

          <div class="stock-loading">

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


  tabelaEstoque.innerHTML =
    lista.map(
      produto => {

        const quantidade =
          Number(
            produto.quantidade_estoque || 0
          );


        const situacao =
          obterSituacao(
            quantidade
          );


        return `

          <tr>

            <td>

              <div class="stock-product-cell">

                <div class="stock-product-image">

                  <img
                    src="${obterImagem(produto)}"
                    alt="${produto.nome_produto || "Produto"}"
                    onerror="this.src='${PLACEHOLDER}'"
                  >

                </div>


                <div class="stock-product-info">

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

            </td>


            <td>

              <span class="stock-category">

                ${obterCategoria(produto)}

              </span>

            </td>


            <td>

              <div
                class="stock-quantity ${situacao.classe}"
              >

                <strong>
                  ${quantidade} un.
                </strong>

                <div class="stock-bar">

                  <span
                    style="width:${percentualEstoque(quantidade)}%"
                  ></span>

                </div>

              </div>

            </td>


            <td>

              <span
                class="stock-situation ${situacao.classe}"
              >
                ${situacao.texto}
              </span>

            </td>


            <td>

              <button
                type="button"
                class="stock-adjust-button"
                onclick="abrirMovimentacaoProduto(${produto.id_produto})"
              >

                <i class="fa-solid fa-arrow-right-arrow-left"></i>

                Movimentar

              </button>

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

function renderizarCardsMobile() {

  if (!cardsEstoqueMobile) {

    return;

  }


  const lista =
    obterProdutosPagina();


  cardsEstoqueMobile.innerHTML =
    lista.map(
      produto => {

        const quantidade =
          Number(
            produto.quantidade_estoque || 0
          );


        const situacao =
          obterSituacao(
            quantidade
          );


        return `

          <article class="stock-mobile-card">

            <h4>
              ${
                produto.nome_produto
                ||
                "Produto"
              }
            </h4>

            <small>
              ${obterCodigo(produto)}
              •
              ${obterMarca(produto)}
            </small>


            <div class="stock-mobile-info">

              <div>

                <span>
                  Categoria
                </span>

                <strong>
                  ${obterCategoria(produto)}
                </strong>

              </div>


              <div>

                <span>
                  Quantidade
                </span>

                <strong>
                  ${quantidade} un.
                </strong>

              </div>


              <div>

                <span>
                  Situação
                </span>

                <strong>
                  ${situacao.texto}
                </strong>

              </div>


              <div>

                <span>
                  ID
                </span>

                <strong>
                  #${produto.id_produto}
                </strong>

              </div>

            </div>


            <button
              type="button"
              onclick="abrirMovimentacaoProduto(${produto.id_produto})"
            >

              <i class="fa-solid fa-arrow-right-arrow-left"></i>

              Registrar movimentação

            </button>

          </article>

        `;

      }
    )
      .join("");

}



/* =========================================================
   PAGINAÇÃO
========================================================= */

function renderizarPaginacao() {

  if (!paginacaoEstoque) {

    return;

  }


  const totalPaginas =
    Math.ceil(
      produtosEstoqueFiltrados.length
      /
      ITENS_POR_PAGINA
    );


  paginacaoEstoque.innerHTML =
    "";


  if (
    totalPaginas <= 1
  ) {

    return;

  }


  paginacaoEstoque
    .appendChild(
      criarBotaoPagina(
        "Anterior",
        paginaEstoqueAtual - 1,
        paginaEstoqueAtual === 1
      )
    );


  for (
    let pagina = 1;
    pagina <= totalPaginas;
    pagina++
  ) {

    const botao =
      criarBotaoPagina(
        pagina,
        pagina,
        false
      );


    if (
      pagina === paginaEstoqueAtual
    ) {

      botao.classList.add(
        "active"
      );

    }


    paginacaoEstoque
      .appendChild(
        botao
      );

  }


  paginacaoEstoque
    .appendChild(
      criarBotaoPagina(
        "Próxima",
        paginaEstoqueAtual + 1,
        paginaEstoqueAtual === totalPaginas
      )
    );

}



function criarBotaoPagina(
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

      paginaEstoqueAtual =
        pagina;


      renderizarTabela();

      renderizarCardsMobile();

      renderizarPaginacao();

    }
  );


  return botao;

}



/* =========================================================
   MODAL
========================================================= */

function abrirModalMovimentacao() {

  modalMovimentacao?.classList.add(
    "open"
  );


  modalMovimentacao?.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";

}



function fecharModalMovimentacao() {

  modalMovimentacao?.classList.remove(
    "open"
  );


  modalMovimentacao?.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.style.overflow =
    "";


  limparMensagemMovimentacao();

}



function abrirMovimentacaoProduto(
  idProduto
) {

  if (produtoMovimentacao) {

    produtoMovimentacao.value =
      idProduto;

  }


  atualizarEstoqueAtualModal();


  abrirModalMovimentacao();

}



function atualizarEstoqueAtualModal() {

  const id =
    Number(
      produtoMovimentacao?.value
      ||
      0
    );


  const produto =
    produtosEstoque.find(
      item =>
        Number(
          item.id_produto
        )
        === id
    );


  if (
    estoqueAtualMovimentacao
  ) {

    estoqueAtualMovimentacao.textContent =
      produto
        ? `${Number(produto.quantidade_estoque || 0)} unidades`
        : "--";

  }

}



/* =========================================================
   MOVIMENTAÇÕES LOCAL
========================================================= */

function obterHistorico() {

  try {

    const dados =
      JSON.parse(
        localStorage.getItem(
          "historicoEstoqueAdmin"
        )
      );


    return Array.isArray(dados)
      ? dados
      : [];

  } catch {

    return [];

  }

}



function salvarHistorico(
  historico
) {

  localStorage.setItem(
    "historicoEstoqueAdmin",
    JSON.stringify(
      historico
    )
  );

}



/* =========================================================
   FORM
========================================================= */

formMovimentacao?.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const idProduto =
      Number(
        produtoMovimentacao?.value
        ||
        0
      );


    const produto =
      produtosEstoque.find(
        item =>
          Number(
            item.id_produto
          )
          === idProduto
      );


    if (!produto) {

      mostrarMensagemMovimentacao(
        "Selecione um produto válido.",
        "error"
      );

      return;

    }


    const tipo =
      document
        .querySelector(
          'input[name="tipoMovimentacao"]:checked'
        )
        ?.value
      ||
      "entrada";


    const quantidade =
      Number(
        document
          .getElementById(
            "quantidadeMovimentacao"
          )
          ?.value
        ||
        0
      );


    if (
      quantidade <= 0
    ) {

      mostrarMensagemMovimentacao(
        "Informe uma quantidade válida.",
        "error"
      );

      return;

    }


    const estoqueAtual =
      Number(
        produto.quantidade_estoque || 0
      );


    if (
      tipo === "saida"
      &&
      quantidade >
      estoqueAtual
    ) {

      mostrarMensagemMovimentacao(
        "A saída não pode ser maior que o estoque atual.",
        "error"
      );

      return;

    }


    const motivo =
      document
        .getElementById(
          "motivoMovimentacao"
        )
        ?.value
      ||
      "Ajuste";


    const observacao =
      document
        .getElementById(
          "observacaoMovimentacao"
        )
        ?.value
        .trim()
      ||
      "";


    /*
      SIMULAÇÃO LOCAL.

      Ainda não enviamos PATCH/PUT.
    */

    const novoEstoque =
      tipo === "entrada"
        ? estoqueAtual + quantidade
        : estoqueAtual - quantidade;


    produto.quantidade_estoque =
      novoEstoque;


    /*
      Atualiza também cache local.
    */

    localStorage.setItem(
      "produtosMock",
      JSON.stringify(
        produtosEstoque
      )
    );


    const historico =
      obterHistorico();


    historico.unshift({

      id:
        Date.now(),

      id_produto:
        produto.id_produto,

      nome_produto:
        produto.nome_produto
        ||
        "Produto",

      tipo,

      quantidade,

      motivo,

      observacao,

      estoque_anterior:
        estoqueAtual,

      estoque_novo:
        novoEstoque,

      data:
        new Date()
          .toISOString()

    });


    salvarHistorico(
      historico.slice(
        0,
        100
      )
    );


    atualizarEstoque();

    preencherProdutosMovimentacao();

    renderizarHistorico();


    mostrarMensagemMovimentacao(
      "Movimentação registrada apenas no front. A integração com o banco será feita na etapa do backend.",
      "info"
    );


    document
      .getElementById(
        "quantidadeMovimentacao"
      )
      .value = "";


    document
      .getElementById(
        "observacaoMovimentacao"
      )
      .value = "";


    atualizarEstoqueAtualModal();

  }
);



/* =========================================================
   HISTÓRICO
========================================================= */

function renderizarHistorico() {

  if (!historicoMovimentacoes) {

    return;

  }


  const historico =
    obterHistorico();


  if (
    historico.length === 0
  ) {

    historicoMovimentacoes.innerHTML = `

      <div class="movement-empty">

        <i class="fa-solid fa-clock-rotate-left"></i>

        <strong>
          Nenhuma movimentação
        </strong>

        <span>
          As movimentações feitas no front aparecerão aqui.
        </span>

      </div>

    `;


    return;

  }


  historicoMovimentacoes.innerHTML =
    historico
      .slice(
        0,
        15
      )
      .map(
        item => {

          return `

            <div class="movement-item">

              <span class="movement-icon ${item.tipo}">

                <i
                  class="fa-solid ${
                    item.tipo === "entrada"
                      ? "fa-arrow-down"
                      : "fa-arrow-up"
                  }"
                ></i>

              </span>


              <div class="movement-info">

                <strong>
                  ${item.nome_produto}
                </strong>

                <small>
                  ${item.motivo}
                  •
                  ${formatarDataHora(item.data)}
                </small>

              </div>


              <div class="movement-value">

                <strong class="${item.tipo}">

                  ${
                    item.tipo === "entrada"
                      ? "+"
                      : "-"
                  }${item.quantidade}

                </strong>

                <small>
                  ${item.estoque_anterior}
                  →
                  ${item.estoque_novo}
                </small>

              </div>

            </div>

          `;

        }
      )
      .join("");

}



/* =========================================================
   DATA
========================================================= */

function formatarDataHora(
  valor
) {

  const data =
    new Date(valor);


  if (
    Number.isNaN(
      data.getTime()
    )
  ) {

    return "-";

  }


  return data.toLocaleString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}



/* =========================================================
   MENSAGEM
========================================================= */

function mostrarMensagemMovimentacao(
  texto,
  tipo
) {

  const elemento =
    document.getElementById(
      "mensagemMovimentacao"
    );


  if (!elemento) {

    return;

  }


  elemento.innerHTML = `

    <div class="admin-form-alert ${tipo}">

      ${texto}

    </div>

  `;

}



function limparMensagemMovimentacao() {

  const elemento =
    document.getElementById(
      "mensagemMovimentacao"
    );


  if (elemento) {

    elemento.innerHTML =
      "";

  }

}



/* =========================================================
   HELPERS
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
   LOADING
========================================================= */

function mostrarCarregamento() {

  if (!tabelaEstoque) {

    return;

  }


  tabelaEstoque.innerHTML = `

    <tr>

      <td colspan="5">

        <div class="stock-loading">

          <div class="admin-spinner"></div>

          <span>
            Carregando estoque...
          </span>

        </div>

      </td>

    </tr>

  `;

}



/* =========================================================
   FILTROS
========================================================= */

function filtrosAlterados() {

  paginaEstoqueAtual =
    1;


  atualizarEstoque();

}


buscaEstoque?.addEventListener(
  "input",
  filtrosAlterados
);


filtroSituacaoEstoque?.addEventListener(
  "change",
  filtrosAlterados
);


filtroCategoriaEstoque?.addEventListener(
  "change",
  filtrosAlterados
);


ordenacaoEstoque?.addEventListener(
  "change",
  filtrosAlterados
);



btnLimparFiltrosEstoque
  ?.addEventListener(
    "click",
    () => {

      if (buscaEstoque) {
        buscaEstoque.value = "";
      }

      if (filtroSituacaoEstoque) {
        filtroSituacaoEstoque.value = "";
      }

      if (filtroCategoriaEstoque) {
        filtroCategoriaEstoque.value = "";
      }

      if (ordenacaoEstoque) {
        ordenacaoEstoque.value =
          "estoque-asc";
      }


      paginaEstoqueAtual =
        1;


      atualizarEstoque();

    }
  );



/* =========================================================
   VER CRÍTICOS
========================================================= */

document
  .getElementById(
    "btnVerCriticos"
  )
  ?.addEventListener(
    "click",
    () => {

      if (
        filtroSituacaoEstoque
      ) {

        filtroSituacaoEstoque.value =
          "baixo";

      }


      paginaEstoqueAtual =
        1;


      atualizarEstoque();


      document
        .querySelector(
          ".stock-toolbar"
        )
        ?.scrollIntoView({
          behavior: "smooth"
        });

    }
  );



/* =========================================================
   MODAL EVENTOS
========================================================= */

btnNovaMovimentacao
  ?.addEventListener(
    "click",
    () => {

      formMovimentacao?.reset();


      atualizarEstoqueAtualModal();


      abrirModalMovimentacao();

    }
  );


document
  .getElementById(
    "btnFecharMovimentacao"
  )
  ?.addEventListener(
    "click",
    fecharModalMovimentacao
  );


document
  .getElementById(
    "btnCancelarMovimentacao"
  )
  ?.addEventListener(
    "click",
    fecharModalMovimentacao
  );


modalMovimentacao
  ?.querySelector(
    ".admin-modal-backdrop"
  )
  ?.addEventListener(
    "click",
    fecharModalMovimentacao
  );


produtoMovimentacao
  ?.addEventListener(
    "change",
    atualizarEstoqueAtualModal
  );



/* =========================================================
   HISTÓRICO
========================================================= */

document
  .getElementById(
    "btnLimparHistorico"
  )
  ?.addEventListener(
    "click",
    () => {

      localStorage.removeItem(
        "historicoEstoqueAdmin"
      );


      renderizarHistorico();

    }
  );



/* =========================================================
   ATUALIZAR
========================================================= */

btnAtualizarEstoque
  ?.addEventListener(
    "click",
    carregarEstoque
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
   ESC
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      fecharSidebar();

      fecharModalMovimentacao();

    }

  }
);



/* =========================================================
   GLOBAL
========================================================= */

window.abrirMovimentacaoProduto =
  abrirMovimentacaoProduto;



/* =========================================================
   INICIAR
========================================================= */

carregarEstoque();
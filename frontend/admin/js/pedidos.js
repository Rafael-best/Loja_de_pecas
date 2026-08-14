/* =========================================================
   ADMIN - PEDIDOS
========================================================= */

const API =
  "http://localhost:3000/api";


const ITENS_POR_PAGINA =
  10;


let pedidosAdmin = [];

let pedidosFiltrados = [];

let paginaAtual = 1;

let pedidoAberto = null;


/* =========================================================
   ELEMENTOS
========================================================= */

const btnAbrirSidebar =
  document.getElementById("btnAbrirSidebar");

const btnFecharSidebar =
  document.getElementById("btnFecharSidebar");

const sidebarOverlay =
  document.getElementById("sidebarOverlay");

const btnSairAdmin =
  document.getElementById("btnSairAdmin");

const btnAtualizarPedidos =
  document.getElementById("btnAtualizarPedidos");

const buscaPedidos =
  document.getElementById("buscaPedidos");

const filtroStatusPedidos =
  document.getElementById("filtroStatusPedidos");

const filtroPagamentoPedidos =
  document.getElementById("filtroPagamentoPedidos");

const ordenacaoPedidos =
  document.getElementById("ordenacaoPedidos");

const btnLimparFiltrosPedidos =
  document.getElementById("btnLimparFiltrosPedidos");

const tabelaPedidos =
  document.getElementById("tabelaPedidos");

const cardsPedidosMobile =
  document.getElementById("cardsPedidosMobile");

const resultadoPedidos =
  document.getElementById("resultadoPedidos");

const paginacaoPedidos =
  document.getElementById("paginacaoPedidos");

const modalPedido =
  document.getElementById("modalPedido");

const tituloModalPedido =
  document.getElementById("tituloModalPedido");

const conteudoModalPedido =
  document.getElementById("conteudoModalPedido");


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
   HELPERS
========================================================= */

function formatarMoeda(valor) {

  return Number(valor || 0)
    .toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );

}


function normalizarTexto(texto) {

  return String(texto || "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();

}


function escaparHtml(valor) {

  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function obterNomeCliente(pedido) {

  return (
    pedido.nome_cliente
    ||
    pedido.cliente
    ||
    pedido.nome
    ||
    `Cliente #${pedido.id_cliente || "-"}`
  );

}


function obterEmailCliente(pedido) {

  return (
    pedido.email_cliente
    ||
    pedido.email
    ||
    ""
  );

}


/* =========================================================
   DATA
========================================================= */

function formatarData(valor) {

  if (!valor) {

    return "-";

  }


  const data =
    new Date(valor);


  if (
    Number.isNaN(
      data.getTime()
    )
  ) {

    return String(valor);

  }


  return data.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );

}


function obterTimestamp(valor) {

  if (!valor) {

    return 0;

  }


  const data =
    new Date(valor);


  return Number.isNaN(
    data.getTime()
  )
    ? 0
    : data.getTime();

}


/* =========================================================
   STATUS
========================================================= */

function normalizarStatus(status) {

  const valor =
    normalizarTexto(status);


  if (
    valor.includes("cancel")
  ) {

    return "cancelado";

  }


  if (
    valor.includes("concl")
    ||
    valor.includes("entreg")
    ||
    valor.includes("finaliz")
  ) {

    return "concluido";

  }


  if (
    valor.includes("envi")
  ) {

    return "enviado";

  }


  if (
    valor.includes("separa")
  ) {

    return "separacao";

  }


  if (
    valor.includes("process")
    ||
    valor.includes("andamento")
  ) {

    return "processando";

  }


  return "pendente";

}


function obterStatusVisual(status) {

  const statusNormalizado =
    normalizarStatus(status);


  const mapa = {

    pendente: {
      classe: "pending",
      texto: "Pendente"
    },

    processando: {
      classe: "processing",
      texto: "Processando"
    },

    separacao: {
      classe: "separation",
      texto: "Em separação"
    },

    enviado: {
      classe: "sent",
      texto: "Enviado"
    },

    concluido: {
      classe: "completed",
      texto: "Concluído"
    },

    cancelado: {
      classe: "cancelled",
      texto: "Cancelado"
    }

  };


  return mapa[statusNormalizado];

}


/* =========================================================
   PAGAMENTO
========================================================= */

function obterIconePagamento(pagamento) {

  const valor =
    normalizarTexto(pagamento);


  if (
    valor.includes("pix")
  ) {

    return "fa-brands fa-pix";

  }


  if (
    valor.includes("cart")
  ) {

    return "fa-solid fa-credit-card";

  }


  if (
    valor.includes("boleto")
  ) {

    return "fa-solid fa-barcode";

  }


  return "fa-solid fa-wallet";

}


/* =========================================================
   ALTERAÇÕES LOCAIS
========================================================= */

function obterStatusLocais() {

  try {

    const dados =
      JSON.parse(
        localStorage.getItem(
          "statusPedidosAdmin"
        )
      );


    return (
      dados
      &&
      typeof dados === "object"
    )
      ? dados
      : {};

  } catch {

    return {};

  }

}


function salvarStatusLocal(
  idPedido,
  status
) {

  const statusLocais =
    obterStatusLocais();


  statusLocais[idPedido] =
    status;


  localStorage.setItem(
    "statusPedidosAdmin",
    JSON.stringify(
      statusLocais
    )
  );

}


function aplicarStatusLocais() {

  const statusLocais =
    obterStatusLocais();


  pedidosAdmin.forEach(
    pedido => {

      const status =
        statusLocais[
          pedido.id_pedido
        ];


      if (status) {

        pedido.status_pedido =
          status;

      }

    }
  );

}


/* =========================================================
   CARREGAR PEDIDOS
========================================================= */

async function carregarPedidosAdmin() {

  mostrarCarregamento();


  const icone =
    btnAtualizarPedidos
      ?.querySelector("i");


  icone?.classList.add(
    "fa-spin"
  );


  try {

    const resposta =
      await fetch(
        `${API}/pedidos`
      );


    const dados =
      await resposta.json();


    if (!resposta.ok) {

      throw new Error(
        dados.erro
        ||
        dados.message
        ||
        "Erro ao buscar pedidos."
      );

    }


    if (
      !Array.isArray(dados)
    ) {

      throw new Error(
        "Formato inválido recebido da API."
      );

    }


    pedidosAdmin =
      dados;


    aplicarStatusLocais();


    atualizarPedidos();

  } catch (erro) {

    console.error(
      "Erro ao carregar pedidos:",
      erro
    );


    mostrarErro(
      erro.message
      ||
      "Não foi possível carregar os pedidos."
    );

  } finally {

    icone?.classList.remove(
      "fa-spin"
    );

  }

}


/* =========================================================
   FILTRAR
========================================================= */

function filtrarPedidos() {

  const busca =
    normalizarTexto(
      buscaPedidos?.value
    );


  const statusFiltro =
    filtroStatusPedidos?.value
    ||
    "";


  const pagamentoFiltro =
    normalizarTexto(
      filtroPagamentoPedidos?.value
    );


  pedidosFiltrados =
    pedidosAdmin.filter(
      pedido => {

        const status =
          normalizarStatus(
            pedido.status_pedido
          );


        const pagamento =
          normalizarTexto(
            pedido.forma_pagamento
          );


        const textoBusca =
          normalizarTexto(
            [
              pedido.id_pedido,
              pedido.id_cliente,
              obterNomeCliente(pedido),
              obterEmailCliente(pedido),
              pedido.forma_pagamento,
              pedido.status_pedido
            ].join(" ")
          );


        const correspondeBusca =
          !busca
          ||
          textoBusca.includes(
            busca
          );


        const correspondeStatus =
          !statusFiltro
          ||
          status === statusFiltro;


        const correspondePagamento =
          !pagamentoFiltro
          ||
          pagamento.includes(
            pagamentoFiltro
          );


        return (
          correspondeBusca
          &&
          correspondeStatus
          &&
          correspondePagamento
        );

      }
    );

}


/* =========================================================
   ORDENAR
========================================================= */

function ordenarPedidos() {

  const ordenacao =
    ordenacaoPedidos?.value
    ||
    "recentes";


  pedidosFiltrados.sort(
    (
      a,
      b
    ) => {

      if (
        ordenacao === "antigos"
      ) {

        return (
          obterTimestamp(
            a.data_pedido
          )
          -
          obterTimestamp(
            b.data_pedido
          )
        );

      }


      if (
        ordenacao === "maior"
      ) {

        return (
          Number(
            b.total_pedido || 0
          )
          -
          Number(
            a.total_pedido || 0
          )
        );

      }


      if (
        ordenacao === "menor"
      ) {

        return (
          Number(
            a.total_pedido || 0
          )
          -
          Number(
            b.total_pedido || 0
          )
        );

      }


      const dataA =
        obterTimestamp(
          a.data_pedido
        );


      const dataB =
        obterTimestamp(
          b.data_pedido
        );


      if (
        dataA === dataB
      ) {

        return (
          Number(
            b.id_pedido || 0
          )
          -
          Number(
            a.id_pedido || 0
          )
        );

      }


      return dataB - dataA;

    }
  );

}


/* =========================================================
   ATUALIZAR
========================================================= */

function atualizarPedidos() {

  filtrarPedidos();

  ordenarPedidos();

  corrigirPaginaAtual();

  renderizarIndicadores();

  renderizarTabela();

  renderizarCardsMobile();

  renderizarPaginacao();

}


/* =========================================================
   INDICADORES
========================================================= */

function renderizarIndicadores() {

  const total =
    pedidosAdmin.length;


  const pendentes =
    pedidosAdmin.filter(
      pedido =>
        normalizarStatus(
          pedido.status_pedido
        )
        === "pendente"
    ).length;


  const andamento =
    pedidosAdmin.filter(
      pedido => {

        const status =
          normalizarStatus(
            pedido.status_pedido
          );


        return [
          "processando",
          "separacao",
          "enviado"
        ].includes(status);

      }
    ).length;


  const concluidos =
    pedidosAdmin.filter(
      pedido =>
        normalizarStatus(
          pedido.status_pedido
        )
        === "concluido"
    ).length;


  const valorTotal =
    pedidosAdmin.reduce(
      (
        totalAtual,
        pedido
      ) =>
        totalAtual
        +
        Number(
          pedido.total_pedido || 0
        ),
      0
    );


  definirTexto(
    "totalPedidos",
    total
  );


  definirTexto(
    "totalPendentes",
    pendentes
  );


  definirTexto(
    "totalAndamento",
    andamento
  );


  definirTexto(
    "totalConcluidos",
    concluidos
  );


  definirTexto(
    "valorTotalPedidos",
    formatarMoeda(
      valorTotal
    )
  );


  const badge =
    document.getElementById(
      "badgePedidos"
    );


  if (badge) {

    badge.textContent =
      pendentes;


    badge.hidden =
      pendentes === 0;

  }

}


/* =========================================================
   PÁGINA
========================================================= */

function corrigirPaginaAtual() {

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        pedidosFiltrados.length
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


  if (
    paginaAtual < 1
  ) {

    paginaAtual = 1;

  }

}


function obterPedidosPagina() {

  const inicio =
    (
      paginaAtual - 1
    )
    *
    ITENS_POR_PAGINA;


  return pedidosFiltrados.slice(
    inicio,
    inicio + ITENS_POR_PAGINA
  );

}


/* =========================================================
   TABELA
========================================================= */

function renderizarTabela() {

  if (!tabelaPedidos) {

    return;

  }


  if (resultadoPedidos) {

    resultadoPedidos.textContent =
      pedidosFiltrados.length === 1
        ? "1 pedido"
        : `${pedidosFiltrados.length} pedidos`;

  }


  const pedidos =
    obterPedidosPagina();


  if (
    pedidos.length === 0
  ) {

    tabelaPedidos.innerHTML = `

      <tr>

        <td colspan="7">

          <div class="orders-empty">

            <i class="fa-solid fa-receipt"></i>

            <strong>
              Nenhum pedido encontrado
            </strong>

            <span>
              Tente alterar os filtros utilizados.
            </span>

          </div>

        </td>

      </tr>

    `;


    return;

  }


  tabelaPedidos.innerHTML =
    pedidos.map(
      pedido => {

        const status =
          obterStatusVisual(
            pedido.status_pedido
          );


        const nome =
          obterNomeCliente(
            pedido
          );


        const email =
          obterEmailCliente(
            pedido
          );


        const inicial =
          nome
            .charAt(0)
            .toUpperCase();


        return `

          <tr>

            <td>

              <span class="order-number">
                #${escaparHtml(pedido.id_pedido)}
              </span>

            </td>


            <td>

              <div class="order-client">

                <span class="order-client-avatar">
                  ${escaparHtml(inicial)}
                </span>


                <div class="order-client-info">

                  <strong>
                    ${escaparHtml(nome)}
                  </strong>

                  <small>
                    ${
                      email
                        ? escaparHtml(email)
                        : `ID ${escaparHtml(pedido.id_cliente || "-")}`
                    }
                  </small>

                </div>

              </div>

            </td>


            <td>
              ${formatarData(pedido.data_pedido)}
            </td>


            <td>

              <span class="order-payment">

                <i class="${obterIconePagamento(pedido.forma_pagamento)}"></i>

                ${escaparHtml(pedido.forma_pagamento || "-")}

              </span>

            </td>


            <td>

              <span class="order-total">

                ${formatarMoeda(pedido.total_pedido)}

              </span>

            </td>


            <td>

              <span class="order-status ${status.classe}">
                ${status.texto}
              </span>

            </td>


            <td>

              <div class="order-actions">

                <button
                  type="button"
                  class="order-action-button"
                  title="Ver detalhes"
                  onclick="abrirPedido(${Number(pedido.id_pedido)})"
                >
                  <i class="fa-solid fa-eye"></i>
                </button>

              </div>

            </td>

          </tr>

        `;

      }
    ).join("");

}


/* =========================================================
   MOBILE
========================================================= */

function renderizarCardsMobile() {

  if (!cardsPedidosMobile) {

    return;

  }


  const pedidos =
    obterPedidosPagina();


  if (
    pedidos.length === 0
  ) {

    cardsPedidosMobile.innerHTML = `
      <div class="orders-empty">
        <i class="fa-solid fa-receipt"></i>

        <strong>
          Nenhum pedido encontrado
        </strong>
      </div>
    `;

    return;

  }


  cardsPedidosMobile.innerHTML =
    pedidos.map(
      pedido => {

        const status =
          obterStatusVisual(
            pedido.status_pedido
          );


        return `

          <article class="order-mobile-card">

            <div class="order-mobile-top">

              <strong>
                Pedido #${escaparHtml(pedido.id_pedido)}
              </strong>

              <span class="order-status ${status.classe}">
                ${status.texto}
              </span>

            </div>


            <div class="order-mobile-client">

              <strong>
                ${escaparHtml(obterNomeCliente(pedido))}
              </strong>

              <small>
                Cliente #${escaparHtml(pedido.id_cliente || "-")}
              </small>

            </div>


            <div class="order-mobile-grid">

              <div>

                <span>Data</span>

                <strong>
                  ${formatarData(pedido.data_pedido)}
                </strong>

              </div>


              <div>

                <span>Pagamento</span>

                <strong>
                  ${escaparHtml(pedido.forma_pagamento || "-")}
                </strong>

              </div>


              <div>

                <span>Total</span>

                <strong>
                  ${formatarMoeda(pedido.total_pedido)}
                </strong>

              </div>


              <div>

                <span>ID</span>

                <strong>
                  #${escaparHtml(pedido.id_pedido)}
                </strong>

              </div>

            </div>


            <button
              type="button"
              class="order-mobile-button"
              onclick="abrirPedido(${Number(pedido.id_pedido)})"
            >

              <i class="fa-solid fa-eye"></i>

              Ver detalhes

            </button>

          </article>

        `;

      }
    ).join("");

}


/* =========================================================
   PAGINAÇÃO
========================================================= */

function renderizarPaginacao() {

  if (!paginacaoPedidos) {

    return;

  }


  const totalPaginas =
    Math.ceil(
      pedidosFiltrados.length
      /
      ITENS_POR_PAGINA
    );


  paginacaoPedidos.innerHTML =
    "";


  if (
    totalPaginas <= 1
  ) {

    return;

  }


  paginacaoPedidos.appendChild(
    criarBotaoPagina(
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

    const botao =
      criarBotaoPagina(
        pagina,
        pagina,
        false
      );


    if (
      pagina === paginaAtual
    ) {

      botao.classList.add(
        "active"
      );

    }


    paginacaoPedidos.appendChild(
      botao
    );

  }


  paginacaoPedidos.appendChild(
    criarBotaoPagina(
      "Próxima",
      paginaAtual + 1,
      paginaAtual === totalPaginas
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

      paginaAtual =
        pagina;


      renderizarTabela();

      renderizarCardsMobile();

      renderizarPaginacao();


      document
        .querySelector(
          ".orders-card"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

    }
  );


  return botao;

}


/* =========================================================
   ABRIR PEDIDO
========================================================= */

async function abrirPedido(idPedido) {

  pedidoAberto =
    pedidosAdmin.find(
      pedido =>
        Number(pedido.id_pedido)
        ===
        Number(idPedido)
    );


  if (!pedidoAberto) {

    return;

  }


  abrirModal();


  tituloModalPedido.textContent =
    `Pedido #${idPedido}`;


  conteudoModalPedido.innerHTML = `

    <div class="modal-order-loading">

      <div class="admin-spinner"></div>

      <span>
        Carregando detalhes...
      </span>

    </div>

  `;


  try {

    const resposta =
      await fetch(
        `${API}/pedidos/${idPedido}`
      );


    const detalhe =
      await resposta.json();


    if (!resposta.ok) {

      throw new Error(
        detalhe.erro
        ||
        detalhe.message
        ||
        "Erro ao buscar detalhes."
      );

    }


    renderizarDetalhesPedido(
      pedidoAberto,
      detalhe
    );

  } catch (erro) {

    console.error(
      erro
    );


    conteudoModalPedido.innerHTML = `

      <div class="orders-empty">

        <i class="fa-solid fa-triangle-exclamation"></i>

        <strong>
          Não foi possível carregar os itens
        </strong>

        <span>
          ${escaparHtml(erro.message)}
        </span>

      </div>

    `;

  }

}


/* =========================================================
   DETALHES
========================================================= */

function renderizarDetalhesPedido(
  pedido,
  detalhe
) {

  const status =
    obterStatusVisual(
      pedido.status_pedido
    );


  const itens =
    Array.isArray(detalhe?.itens)
      ? detalhe.itens
      : [];


  conteudoModalPedido.innerHTML = `

    <div class="order-modal-content">


      <div class="order-modal-summary">


        <div class="order-modal-info">

          <small>Cliente</small>

          <strong>
            ${escaparHtml(obterNomeCliente(pedido))}
          </strong>

        </div>


        <div class="order-modal-info">

          <small>Data</small>

          <strong>
            ${formatarData(pedido.data_pedido)}
          </strong>

        </div>


        <div class="order-modal-info">

          <small>Pagamento</small>

          <strong>
            ${escaparHtml(pedido.forma_pagamento || "-")}
          </strong>

        </div>


        <div class="order-modal-info">

          <small>Total</small>

          <strong>
            ${formatarMoeda(pedido.total_pedido)}
          </strong>

        </div>


      </div>


      <section class="order-modal-section">

        <div class="order-modal-section-title">

          <i class="fa-solid fa-circle-info"></i>

          Situação do pedido

        </div>


        <span class="order-status ${status.classe}">
          ${status.texto}
        </span>

      </section>


      <section class="order-modal-section">

        <div class="order-modal-section-title">

          <i class="fa-solid fa-box-open"></i>

          Itens do pedido

        </div>


        ${
          itens.length
            ? criarTabelaItens(itens)
            : `
              <div class="orders-empty">

                <i class="fa-solid fa-box-open"></i>

                <strong>
                  Nenhum item encontrado
                </strong>

              </div>
            `
        }

      </section>


      <section class="order-modal-section">

        <div class="order-modal-section-title">

          <i class="fa-solid fa-pen-to-square"></i>

          Alterar status

        </div>


        <div class="order-status-control">

          <select id="novoStatusPedido">

            ${criarOpcoesStatus(
              normalizarStatus(
                pedido.status_pedido
              )
            )}

          </select>


          <button
            type="button"
            onclick="alterarStatusPedidoLocal()"
          >

            <i class="fa-solid fa-check"></i>

            Atualizar status

          </button>

        </div>


        <div class="order-local-warning">

          <i class="fa-solid fa-circle-info"></i>

          <span>
            Nesta etapa, a alteração do status fica salva
            apenas no navegador. Quando fizermos o backend
            administrativo, ela será gravada diretamente
            no banco de dados.
          </span>

        </div>

      </section>


    </div>

  `;

}


/* =========================================================
   ITENS
========================================================= */

function criarTabelaItens(itens) {

  return `

    <div class="orders-table-wrapper">

      <table class="order-items-table">

        <thead>

          <tr>

            <th>Produto</th>

            <th>Quantidade</th>

            <th>Unitário</th>

            <th>Subtotal</th>

          </tr>

        </thead>


        <tbody>

          ${itens.map(
            item => {

              const preco =
                Number(
                  item.preco_unitario || 0
                );


              const quantidade =
                Number(
                  item.quantidade || 0
                );


              return `

                <tr>

                  <td>
                    ${escaparHtml(
                      item.nome_produto
                      ||
                      `Produto #${item.id_produto || "-"}`
                    )}
                  </td>

                  <td>
                    ${quantidade}
                  </td>

                  <td>
                    ${formatarMoeda(preco)}
                  </td>

                  <td>
                    ${formatarMoeda(
                      preco * quantidade
                    )}
                  </td>

                </tr>

              `;

            }
          ).join("")}

        </tbody>

      </table>

    </div>

  `;

}


/* =========================================================
   OPÇÕES STATUS
========================================================= */

function criarOpcoesStatus(
  selecionado
) {

  const status = [

    {
      valor: "pendente",
      texto: "Pendente"
    },

    {
      valor: "processando",
      texto: "Processando"
    },

    {
      valor: "separacao",
      texto: "Em separação"
    },

    {
      valor: "enviado",
      texto: "Enviado"
    },

    {
      valor: "concluido",
      texto: "Concluído"
    },

    {
      valor: "cancelado",
      texto: "Cancelado"
    }

  ];


  return status.map(
    item => `

      <option
        value="${item.valor}"
        ${
          item.valor === selecionado
            ? "selected"
            : ""
        }
      >
        ${item.texto}
      </option>

    `
  ).join("");

}


/* =========================================================
   ALTERAR STATUS LOCAL
========================================================= */

function alterarStatusPedidoLocal() {

  if (!pedidoAberto) {

    return;

  }


  const select =
    document.getElementById(
      "novoStatusPedido"
    );


  if (!select) {

    return;

  }


  const novoStatus =
    select.value;


  const nomes = {

    pendente: "Pendente",

    processando: "Processando",

    separacao: "Em separação",

    enviado: "Enviado",

    concluido: "Concluído",

    cancelado: "Cancelado"

  };


  pedidoAberto.status_pedido =
    nomes[novoStatus]
    ||
    "Pendente";


  salvarStatusLocal(
    pedidoAberto.id_pedido,
    pedidoAberto.status_pedido
  );


  atualizarPedidos();


  const status =
    obterStatusVisual(
      pedidoAberto.status_pedido
    );


  const secao =
    document.querySelector(
      ".order-modal-section .order-status"
    );


  if (secao) {

    secao.className =
      `order-status ${status.classe}`;


    secao.textContent =
      status.texto;

  }

}


/* =========================================================
   MODAL
========================================================= */

function abrirModal() {

  modalPedido?.classList.add(
    "open"
  );


  modalPedido?.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";

}


function fecharModal() {

  modalPedido?.classList.remove(
    "open"
  );


  modalPedido?.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.style.overflow =
    "";


  pedidoAberto =
    null;

}


document
  .getElementById(
    "btnFecharPedido"
  )
  ?.addEventListener(
    "click",
    fecharModal
  );


modalPedido
  ?.querySelector(
    ".admin-modal-backdrop"
  )
  ?.addEventListener(
    "click",
    fecharModal
  );


/* =========================================================
   FILTROS
========================================================= */

function filtrosAlterados() {

  paginaAtual = 1;

  atualizarPedidos();

}


buscaPedidos?.addEventListener(
  "input",
  filtrosAlterados
);


filtroStatusPedidos?.addEventListener(
  "change",
  filtrosAlterados
);


filtroPagamentoPedidos?.addEventListener(
  "change",
  filtrosAlterados
);


ordenacaoPedidos?.addEventListener(
  "change",
  filtrosAlterados
);


btnLimparFiltrosPedidos
  ?.addEventListener(
    "click",
    () => {

      if (buscaPedidos) {

        buscaPedidos.value = "";

      }


      if (filtroStatusPedidos) {

        filtroStatusPedidos.value = "";

      }


      if (filtroPagamentoPedidos) {

        filtroPagamentoPedidos.value = "";

      }


      if (ordenacaoPedidos) {

        ordenacaoPedidos.value =
          "recentes";

      }


      paginaAtual = 1;


      atualizarPedidos();

    }
  );


/* =========================================================
   ATUALIZAR
========================================================= */

btnAtualizarPedidos
  ?.addEventListener(
    "click",
    carregarPedidosAdmin
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

      fecharModal();

    }

  }
);


/* =========================================================
   TEXTO
========================================================= */

function definirTexto(
  id,
  valor
) {

  const elemento =
    document.getElementById(id);


  if (elemento) {

    elemento.textContent =
      valor;

  }

}


/* =========================================================
   LOADING
========================================================= */

function mostrarCarregamento() {

  if (!tabelaPedidos) {

    return;

  }


  tabelaPedidos.innerHTML = `

    <tr>

      <td colspan="7">

        <div class="orders-loading">

          <div class="admin-spinner"></div>

          <span>
            Carregando pedidos...
          </span>

        </div>

      </td>

    </tr>

  `;


  if (cardsPedidosMobile) {

    cardsPedidosMobile.innerHTML =
      "";

  }

}


function mostrarErro(mensagem) {

  if (!tabelaPedidos) {

    return;

  }


  tabelaPedidos.innerHTML = `

    <tr>

      <td colspan="7">

        <div class="orders-empty">

          <i class="fa-solid fa-triangle-exclamation"></i>

          <strong>
            Erro ao carregar pedidos
          </strong>

          <span>
            ${escaparHtml(mensagem)}
          </span>

        </div>

      </td>

    </tr>

  `;


  if (resultadoPedidos) {

    resultadoPedidos.textContent =
      "Erro";

  }

}


/* =========================================================
   GLOBAL
========================================================= */

window.abrirPedido =
  abrirPedido;


window.alterarStatusPedidoLocal =
  alterarStatusPedidoLocal;


/* =========================================================
   INICIAR
========================================================= */

carregarPedidosAdmin();
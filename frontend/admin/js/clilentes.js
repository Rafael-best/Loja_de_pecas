/* =========================================================
   ADMIN CLIENTES
========================================================= */

const API =
  "http://localhost:3000/api";


const ITENS_POR_PAGINA =
  10;


let clientesAdmin = [];

let pedidosAdmin = [];

let clientesFiltrados = [];

let paginaAtual = 1;



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


const btnAtualizarClientes =
  document.getElementById(
    "btnAtualizarClientes"
  );


const buscaClientes =
  document.getElementById(
    "buscaClientes"
  );


const filtroClientes =
  document.getElementById(
    "filtroClientes"
  );


const ordenacaoClientes =
  document.getElementById(
    "ordenacaoClientes"
  );


const btnLimparFiltrosClientes =
  document.getElementById(
    "btnLimparFiltrosClientes"
  );


const tabelaClientes =
  document.getElementById(
    "tabelaClientes"
  );


const cardsClientesMobile =
  document.getElementById(
    "cardsClientesMobile"
  );


const resultadoClientes =
  document.getElementById(
    "resultadoClientes"
  );


const paginacaoClientes =
  document.getElementById(
    "paginacaoClientes"
  );


const modalCliente =
  document.getElementById(
    "modalCliente"
  );


const tituloModalCliente =
  document.getElementById(
    "tituloModalCliente"
  );


const conteudoModalCliente =
  document.getElementById(
    "conteudoModalCliente"
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
   HELPERS
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



function escaparHtml(valor) {

  return String(
    valor ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}



function formatarMoeda(valor) {

  return Number(
    valor || 0
  )
    .toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );

}



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
    "pt-BR"
  );

}



/* =========================================================
   BUSCAR PEDIDOS
========================================================= */

async function buscarPedidosClientes() {

  try {

    const resposta =
      await fetch(
        `${API}/pedidos`
      );


    const dados =
      await resposta.json();


    pedidosAdmin =
      resposta.ok
      &&
      Array.isArray(dados)

        ? dados

        : [];

  } catch (erro) {

    console.error(
      "Erro ao buscar pedidos:",
      erro
    );


    pedidosAdmin = [];

  }

}



/* =========================================================
   BUSCAR CLIENTES
========================================================= */

async function buscarClientesApi() {

  try {

    const resposta =
      await fetch(
        `${API}/clientes`
      );


    if (!resposta.ok) {

      return null;

    }


    const dados =
      await resposta.json();


    return Array.isArray(dados)
      ? dados
      : null;

  } catch {

    return null;

  }

}



/* =========================================================
   CRIAR CLIENTES PELOS PEDIDOS
========================================================= */

function criarClientesAPartirDosPedidos() {

  const mapa =
    new Map();


  pedidosAdmin.forEach(
    pedido => {

      const id =
        Number(
          pedido.id_cliente
        );


      if (!id) {

        return;

      }


      if (
        !mapa.has(id)
      ) {

        mapa.set(
          id,
          {

            id_cliente:
              id,

            nome_cliente:
              pedido.nome_cliente
              ||
              `Cliente #${id}`,

            email_cliente:
              pedido.email_cliente
              ||
              pedido.email
              ||
              "",

            telefone_cliente:
              pedido.telefone_cliente
              ||
              pedido.telefone
              ||
              ""

          }
        );

      }

    }
  );


  return [
    ...mapa.values()
  ];

}



/* =========================================================
   CARREGAR
========================================================= */

async function carregarClientes() {

  mostrarCarregamento();


  const icone =
    btnAtualizarClientes
      ?.querySelector("i");


  icone?.classList.add(
    "fa-spin"
  );


  await buscarPedidosClientes();


  const clientesApi =
    await buscarClientesApi();


  clientesAdmin =
    clientesApi
    ??
    criarClientesAPartirDosPedidos();


  enriquecerClientes();


  atualizarClientes();


  icone?.classList.remove(
    "fa-spin"
  );

}



/* =========================================================
   ENRIQUECER CLIENTES
========================================================= */

function enriquecerClientes() {

  clientesAdmin =
    clientesAdmin.map(
      cliente => {

        const pedidosCliente =
          pedidosAdmin.filter(
            pedido =>
              Number(
                pedido.id_cliente
              )
              ===
              Number(
                cliente.id_cliente
              )
          );


        const quantidadePedidos =
          pedidosCliente.length;


        const totalGasto =
          pedidosCliente.reduce(
            (
              total,
              pedido
            ) =>
              total
              +
              Number(
                pedido.total_pedido || 0
              ),
            0
          );


        const pedidosOrdenados =
          [...pedidosCliente]
            .sort(
              (
                a,
                b
              ) =>
                obterTimestamp(
                  b.data_pedido
                )
                -
                obterTimestamp(
                  a.data_pedido
                )
            );


        const ultimoPedido =
          pedidosOrdenados[0]
          ||
          null;


        return {

          ...cliente,

          quantidade_pedidos:
            quantidadePedidos,

          total_gasto:
            totalGasto,

          ultimo_pedido:
            ultimoPedido,

          pedidos:
            pedidosOrdenados

        };

      }
    );

}



/* =========================================================
   TIMESTAMP
========================================================= */

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
   PERFIL
========================================================= */

function obterPerfilCliente(
  cliente
) {

  const pedidos =
    Number(
      cliente.quantidade_pedidos || 0
    );


  const gasto =
    Number(
      cliente.total_gasto || 0
    );


  if (
    pedidos >= 5
    ||
    gasto >= 2000
  ) {

    return {
      classe:
        "vip",

      texto:
        "Recorrente"
    };

  }


  if (
    pedidos >= 1
  ) {

    return {
      classe:
        "active",

      texto:
        "Cliente"
    };

  }


  return {
    classe:
      "new",

    texto:
      "Novo"
  };

}



/* =========================================================
   FILTRO
========================================================= */

function filtrarClientes() {

  const busca =
    normalizarTexto(
      buscaClientes?.value
      ||
      ""
    );


  const filtro =
    filtroClientes?.value
    ||
    "";


  clientesFiltrados =
    clientesAdmin.filter(
      cliente => {

        const texto =
          normalizarTexto(
            [
              cliente.id_cliente,
              cliente.nome_cliente,
              cliente.nome,
              cliente.email_cliente,
              cliente.email,
              cliente.telefone_cliente,
              cliente.telefone
            ].join(" ")
          );


        const correspondeBusca =
          !busca
          ||
          texto.includes(
            busca
          );


        const pedidos =
          Number(
            cliente.quantidade_pedidos || 0
          );


        let correspondeFiltro =
          true;


        if (
          filtro ===
          "comprou"
        ) {

          correspondeFiltro =
            pedidos > 0;

        }


        if (
          filtro ===
          "sem-compra"
        ) {

          correspondeFiltro =
            pedidos === 0;

        }


        if (
          filtro ===
          "recorrente"
        ) {

          correspondeFiltro =
            pedidos >= 2;

        }


        return (
          correspondeBusca
          &&
          correspondeFiltro
        );

      }
    );

}



/* =========================================================
   ORDENAR
========================================================= */

function ordenarClientes() {

  const ordenacao =
    ordenacaoClientes?.value
    ||
    "nome";


  clientesFiltrados.sort(
    (
      a,
      b
    ) => {

      if (
        ordenacao ===
        "mais-pedidos"
      ) {

        return (
          Number(
            b.quantidade_pedidos || 0
          )
          -
          Number(
            a.quantidade_pedidos || 0
          )
        );

      }


      if (
        ordenacao ===
        "maior-gasto"
      ) {

        return (
          Number(
            b.total_gasto || 0
          )
          -
          Number(
            a.total_gasto || 0
          )
        );

      }


      if (
        ordenacao ===
        "ultimo-pedido"
      ) {

        return (
          obterTimestamp(
            b.ultimo_pedido?.data_pedido
          )
          -
          obterTimestamp(
            a.ultimo_pedido?.data_pedido
          )
        );

      }


      return String(
        a.nome_cliente
        ||
        a.nome
        ||
        ""
      )
        .localeCompare(
          String(
            b.nome_cliente
            ||
            b.nome
            ||
            ""
          ),
          "pt-BR"
        );

    }
  );

}



/* =========================================================
   ATUALIZAR
========================================================= */

function atualizarClientes() {

  filtrarClientes();

  ordenarClientes();

  corrigirPagina();

  renderizarIndicadores();

  renderizarTabela();

  renderizarCardsMobile();

  renderizarPaginacao();

}



/* =========================================================
   INDICADORES
========================================================= */

function renderizarIndicadores() {

  const totalClientes =
    clientesAdmin.length;


  const comPedidos =
    clientesAdmin.filter(
      cliente =>
        Number(
          cliente.quantidade_pedidos || 0
        )
        > 0
    ).length;


  const totalPedidos =
    clientesAdmin.reduce(
      (
        total,
        cliente
      ) =>
        total
        +
        Number(
          cliente.quantidade_pedidos || 0
        ),
      0
    );


  const totalGasto =
    clientesAdmin.reduce(
      (
        total,
        cliente
      ) =>
        total
        +
        Number(
          cliente.total_gasto || 0
        ),
      0
    );


  const mediaPedidos =
    totalClientes > 0
      ? totalPedidos
        /
        totalClientes
      : 0;


  const ticket =
    totalPedidos > 0
      ? totalGasto
        /
        totalPedidos
      : 0;


  definirTexto(
    "totalClientes",
    totalClientes
  );


  definirTexto(
    "clientesComPedidos",
    comPedidos
  );


  definirTexto(
    "mediaPedidosCliente",
    mediaPedidos.toFixed(1)
  );


  definirTexto(
    "ticketMedioClientes",
    formatarMoeda(
      ticket
    )
  );

}



/* =========================================================
   PAGINA
========================================================= */

function corrigirPagina() {

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        clientesFiltrados.length
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

}



function obterClientesPagina() {

  const inicio =
    (
      paginaAtual - 1
    )
    *
    ITENS_POR_PAGINA;


  return clientesFiltrados
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

  if (!tabelaClientes) {

    return;

  }


  if (
    resultadoClientes
  ) {

    resultadoClientes.textContent =
      clientesFiltrados.length === 1
        ? "1 cliente"
        : `${clientesFiltrados.length} clientes`;

  }


  const lista =
    obterClientesPagina();


  if (
    lista.length === 0
  ) {

    tabelaClientes.innerHTML = `

      <tr>

        <td colspan="7">

          <div class="clients-empty">

            <i class="fa-solid fa-users"></i>

            <strong>
              Nenhum cliente encontrado
            </strong>

            <span>
              Tente alterar sua busca ou os filtros.
            </span>

          </div>

        </td>

      </tr>

    `;


    return;

  }


  tabelaClientes.innerHTML =
    lista.map(
      cliente => {

        const nome =
          obterNomeCliente(
            cliente
          );


        const email =
          obterEmailCliente(
            cliente
          );


        const telefone =
          obterTelefoneCliente(
            cliente
          );


        const perfil =
          obterPerfilCliente(
            cliente
          );


        const inicial =
          nome.charAt(0)
            .toUpperCase();


        return `

          <tr>

            <td>

              <div class="client-main-cell">

                <span class="client-avatar">
                  ${escaparHtml(inicial)}
                </span>


                <div class="client-main-info">

                  <strong>
                    ${escaparHtml(nome)}
                  </strong>

                  <small>
                    Cliente #${escaparHtml(cliente.id_cliente || "-")}
                  </small>

                </div>

              </div>

            </td>


            <td>

              <div class="client-contact">

                <strong>
                  ${escaparHtml(email || "E-mail não informado")}
                </strong>

                <small>
                  ${escaparHtml(telefone || "Telefone não informado")}
                </small>

              </div>

            </td>


            <td>

              <span class="client-orders-count">
                ${Number(cliente.quantidade_pedidos || 0)}
              </span>

            </td>


            <td>

              <span class="client-total-spent">

                ${formatarMoeda(cliente.total_gasto)}

              </span>

            </td>


            <td>

              ${
                cliente.ultimo_pedido
                  ? formatarData(
                      cliente.ultimo_pedido.data_pedido
                    )
                  : "-"
              }

            </td>


            <td>

              <span
                class="client-profile-badge ${perfil.classe}"
              >
                ${perfil.texto}
              </span>

            </td>


            <td>

              <button
                type="button"
                class="client-action-button"
                onclick="abrirCliente(${Number(cliente.id_cliente)})"
                title="Ver cliente"
              >

                <i class="fa-solid fa-eye"></i>

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

  if (!cardsClientesMobile) {

    return;

  }


  const lista =
    obterClientesPagina();


  cardsClientesMobile.innerHTML =
    lista.map(
      cliente => {

        const nome =
          obterNomeCliente(
            cliente
          );


        const perfil =
          obterPerfilCliente(
            cliente
          );


        return `

          <article class="client-mobile-card">

            <div class="client-mobile-header">

              <span class="client-avatar">

                ${escaparHtml(
                  nome.charAt(0)
                    .toUpperCase()
                )}

              </span>


              <div>

                <strong>
                  ${escaparHtml(nome)}
                </strong>

                <small>
                  ${escaparHtml(obterEmailCliente(cliente) || `Cliente #${cliente.id_cliente}`)}
                </small>

              </div>


              <span
                class="client-profile-badge ${perfil.classe}"
              >
                ${perfil.texto}
              </span>

            </div>


            <div class="client-mobile-grid">

              <div>

                <span>
                  Pedidos
                </span>

                <strong>
                  ${Number(cliente.quantidade_pedidos || 0)}
                </strong>

              </div>


              <div>

                <span>
                  Total gasto
                </span>

                <strong>
                  ${formatarMoeda(cliente.total_gasto)}
                </strong>

              </div>


              <div>

                <span>
                  Última compra
                </span>

                <strong>
                  ${
                    cliente.ultimo_pedido
                      ? formatarData(
                          cliente.ultimo_pedido.data_pedido
                        )
                      : "-"
                  }
                </strong>

              </div>


              <div>

                <span>
                  ID
                </span>

                <strong>
                  #${cliente.id_cliente}
                </strong>

              </div>

            </div>


            <button
              type="button"
              class="client-mobile-button"
              onclick="abrirCliente(${Number(cliente.id_cliente)})"
            >

              <i class="fa-solid fa-eye"></i>

              Ver cliente

            </button>

          </article>

        `;

      }
    )
      .join("");

}



/* =========================================================
   CLIENT INFO
========================================================= */

function obterNomeCliente(
  cliente
) {

  return (
    cliente.nome_cliente
    ||
    cliente.nome
    ||
    `Cliente #${cliente.id_cliente || "-"}`
  );

}



function obterEmailCliente(
  cliente
) {

  return (
    cliente.email_cliente
    ||
    cliente.email
    ||
    ""
  );

}



function obterTelefoneCliente(
  cliente
) {

  return (
    cliente.telefone_cliente
    ||
    cliente.telefone
    ||
    ""
  );

}



/* =========================================================
   PAGINAÇÃO
========================================================= */

function renderizarPaginacao() {

  if (!paginacaoClientes) {

    return;

  }


  const totalPaginas =
    Math.ceil(
      clientesFiltrados.length
      /
      ITENS_POR_PAGINA
    );


  paginacaoClientes.innerHTML =
    "";


  if (
    totalPaginas <= 1
  ) {

    return;

  }


  paginacaoClientes.appendChild(
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


    paginacaoClientes.appendChild(
      botao
    );

  }


  paginacaoClientes.appendChild(
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

    }
  );


  return botao;

}



/* =========================================================
   MODAL
========================================================= */

function abrirCliente(
  idCliente
) {

  const cliente =
    clientesAdmin.find(
      item =>
        Number(
          item.id_cliente
        )
        ===
        Number(
          idCliente
        )
    );


  if (!cliente) {

    return;

  }


  const nome =
    obterNomeCliente(
      cliente
    );


  tituloModalCliente.textContent =
    nome;


  const perfil =
    obterPerfilCliente(
      cliente
    );


  const pedidos =
    Array.isArray(
      cliente.pedidos
    )
      ? cliente.pedidos
      : [];


  conteudoModalCliente.innerHTML = `

    <div class="client-modal-profile">


      <span class="client-modal-avatar">

        ${escaparHtml(
          nome.charAt(0)
            .toUpperCase()
        )}

      </span>


      <div>

        <h3>
          ${escaparHtml(nome)}
        </h3>

        <span>
          Cliente #${escaparHtml(cliente.id_cliente || "-")}
          •
          ${perfil.texto}
        </span>

      </div>


    </div>



    <div class="client-modal-stats">


      <div class="client-modal-stat">

        <span>
          Pedidos
        </span>

        <strong>
          ${Number(cliente.quantidade_pedidos || 0)}
        </strong>

      </div>


      <div class="client-modal-stat">

        <span>
          Total gasto
        </span>

        <strong>
          ${formatarMoeda(cliente.total_gasto)}
        </strong>

      </div>


      <div class="client-modal-stat">

        <span>
          Ticket médio
        </span>

        <strong>

          ${
            Number(cliente.quantidade_pedidos || 0) > 0

              ? formatarMoeda(
                  Number(cliente.total_gasto || 0)
                  /
                  Number(cliente.quantidade_pedidos)
                )

              : formatarMoeda(0)
          }

        </strong>

      </div>


    </div>



    <section class="client-modal-section">

      <div class="client-modal-section-title">

        <i class="fa-solid fa-address-card"></i>

        Dados do cliente

      </div>


      <div class="client-info-grid">


        <div class="client-info-box">

          <span>
            E-mail
          </span>

          <strong>
            ${escaparHtml(obterEmailCliente(cliente) || "Não informado")}
          </strong>

        </div>


        <div class="client-info-box">

          <span>
            Telefone
          </span>

          <strong>
            ${escaparHtml(obterTelefoneCliente(cliente) || "Não informado")}
          </strong>

        </div>


        <div class="client-info-box">

          <span>
            CPF
          </span>

          <strong>
            ${escaparHtml(
              cliente.cpf_cliente
              ||
              cliente.cpf
              ||
              "Não informado"
            )}
          </strong>

        </div>


        <div class="client-info-box">

          <span>
            Cadastro
          </span>

          <strong>

            ${
              cliente.data_cadastro
                ? formatarData(
                    cliente.data_cadastro
                  )
                : "Não informado"
            }

          </strong>

        </div>


      </div>

    </section>



    <section class="client-modal-section">

      <div class="client-modal-section-title">

        <i class="fa-solid fa-receipt"></i>

        Histórico de pedidos

      </div>


      ${
        pedidos.length

          ? `

            <div class="client-orders-history">

              ${pedidos
                .slice(0, 10)
                .map(
                  pedido => `

                    <div class="client-order-row">

                      <strong class="client-order-id">
                        #${escaparHtml(pedido.id_pedido)}
                      </strong>

                      <span>
                        ${formatarData(pedido.data_pedido)}
                      </span>

                      <span>
                        ${escaparHtml(pedido.status_pedido || "-")}
                      </span>

                      <strong>
                        ${formatarMoeda(pedido.total_pedido)}
                      </strong>

                    </div>

                  `
                )
                .join("")
              }

            </div>

          `

          : `

            <div class="clients-empty">

              <i class="fa-solid fa-cart-shopping"></i>

              <strong>
                Nenhuma compra registrada
              </strong>

              <span>
                Este cliente ainda não possui pedidos.
              </span>

            </div>

          `
      }

    </section>

  `;


  modalCliente?.classList.add(
    "open"
  );


  modalCliente?.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";

}



/* =========================================================
   FECHAR
========================================================= */

function fecharCliente() {

  modalCliente?.classList.remove(
    "open"
  );


  modalCliente?.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.style.overflow =
    "";

}



document
  .getElementById(
    "btnFecharCliente"
  )
  ?.addEventListener(
    "click",
    fecharCliente
  );


modalCliente
  ?.querySelector(
    ".admin-modal-backdrop"
  )
  ?.addEventListener(
    "click",
    fecharCliente
  );



/* =========================================================
   FILTROS
========================================================= */

function filtrosAlterados() {

  paginaAtual =
    1;


  atualizarClientes();

}


buscaClientes?.addEventListener(
  "input",
  filtrosAlterados
);


filtroClientes?.addEventListener(
  "change",
  filtrosAlterados
);


ordenacaoClientes?.addEventListener(
  "change",
  filtrosAlterados
);



btnLimparFiltrosClientes
  ?.addEventListener(
    "click",
    () => {

      if (buscaClientes) {

        buscaClientes.value =
          "";

      }


      if (filtroClientes) {

        filtroClientes.value =
          "";

      }


      if (ordenacaoClientes) {

        ordenacaoClientes.value =
          "nome";

      }


      paginaAtual =
        1;


      atualizarClientes();

    }
  );



/* =========================================================
   ATUALIZAR
========================================================= */

btnAtualizarClientes
  ?.addEventListener(
    "click",
    carregarClientes
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
      event.key ===
      "Escape"
    ) {

      fecharSidebar();

      fecharCliente();

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

  if (!tabelaClientes) {

    return;

  }


  tabelaClientes.innerHTML = `

    <tr>

      <td colspan="7">

        <div class="clients-loading">

          <div class="admin-spinner"></div>

          <span>
            Carregando clientes...
          </span>

        </div>

      </td>

    </tr>

  `;

}



/* =========================================================
   GLOBAL
========================================================= */

window.abrirCliente =
  abrirCliente;



/* =========================================================
   INICIAR
========================================================= */

carregarClientes();
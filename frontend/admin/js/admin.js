/* =========================================================
   ADMIN.JS
========================================================= */

const API =
  "http://localhost:3000/api";


let pedidosAdmin = [];

let produtosAdmin = [];


/* =========================================================
   ELEMENTOS
========================================================= */

const adminSidebar =
  document.getElementById(
    "adminSidebar"
  );

const sidebarOverlay =
  document.getElementById(
    "sidebarOverlay"
  );

const btnAbrirSidebar =
  document.getElementById(
    "btnAbrirSidebar"
  );

const btnFecharSidebar =
  document.getElementById(
    "btnFecharSidebar"
  );

const btnAtualizarDashboard =
  document.getElementById(
    "btnAtualizarDashboard"
  );

const btnSairAdmin =
  document.getElementById(
    "btnSairAdmin"
  );



/* =========================================================
   SIDEBAR MOBILE
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


btnAbrirSidebar
  ?.addEventListener(
    "click",
    abrirSidebar
  );


btnFecharSidebar
  ?.addEventListener(
    "click",
    fecharSidebar
  );


sidebarOverlay
  ?.addEventListener(
    "click",
    fecharSidebar
  );


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      fecharSidebar();

    }

  }
);



/* =========================================================
   DATA
========================================================= */

function atualizarData() {

  const elemento =
    document.getElementById(
      "dataAtual"
    );


  if (!elemento) {

    return;

  }


  elemento.textContent =
    new Date()
      .toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit",
          month: "long",
          year: "numeric"
        }
      );

}



/* =========================================================
   MOEDA
========================================================= */

function formatarMoeda(
  valor
) {

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



/* =========================================================
   DATA PEDIDO
========================================================= */

function formatarData(
  valor
) {

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


  return data
    .toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );

}



/* =========================================================
   NORMALIZAR STATUS
========================================================= */

function normalizarStatus(
  status
) {

  return String(
    status || ""
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
   STATUS CLASS
========================================================= */

function classeStatus(
  status
) {

  const valor =
    normalizarStatus(
      status
    );


  if (
    valor === "pendente"
  ) {

    return "pending";

  }


  if (
    valor === "enviado"
  ) {

    return "shipped";

  }


  if (
    valor === "entregue"
  ) {

    return "delivered";

  }


  if (
    valor === "cancelado"
  ) {

    return "canceled";

  }


  return "pending";

}



/* =========================================================
   CARREGAR PEDIDOS
========================================================= */

async function buscarPedidos() {

  try {

    const resposta =
      await fetch(
        `${API}/pedidos`
      );


    if (!resposta.ok) {

      throw new Error(
        `Erro ${resposta.status}`
      );

    }


    const dados =
      await resposta.json();


    pedidosAdmin =
      Array.isArray(dados)
        ? dados
        : [];

  } catch (erro) {

    console.error(
      "Erro ao carregar pedidos:",
      erro
    );


    pedidosAdmin = [];

  }

}



/* =========================================================
   CARREGAR PRODUTOS
========================================================= */

async function buscarProdutos() {

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


    produtosAdmin =
      Array.isArray(dados)
        ? dados
        : [];

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


      produtosAdmin =
        Array.isArray(backup)
          ? backup
          : [];

    } catch {

      produtosAdmin = [];

    }

  }

}



/* =========================================================
   RESUMO
========================================================= */

function atualizarResumo() {

  const totalPedidos =
    pedidosAdmin.length;


  const pendentes =
    pedidosAdmin.filter(
      pedido =>
        normalizarStatus(
          pedido.status_pedido
        )
        ===
        "pendente"
    ).length;


  const enviados =
    pedidosAdmin.filter(
      pedido =>
        normalizarStatus(
          pedido.status_pedido
        )
        ===
        "enviado"
    ).length;


  const entregues =
    pedidosAdmin.filter(
      pedido =>
        normalizarStatus(
          pedido.status_pedido
        )
        ===
        "entregue"
    ).length;


  const cancelados =
    pedidosAdmin.filter(
      pedido =>
        normalizarStatus(
          pedido.status_pedido
        )
        ===
        "cancelado"
    ).length;


  const estoqueBaixo =
    produtosAdmin.filter(
      produto =>
        Number(
          produto.quantidade_estoque || 0
        )
        <= 5
    ).length;


  definirTexto(
    "totalPedidos",
    totalPedidos
  );


  definirTexto(
    "pedidosPendentes",
    pendentes
  );


  definirTexto(
    "totalProdutos",
    produtosAdmin.length
  );


  definirTexto(
    "estoqueBaixo",
    estoqueBaixo
  );


  definirTexto(
    "statusPendentes",
    pendentes
  );


  definirTexto(
    "statusEnviados",
    enviados
  );


  definirTexto(
    "statusEntregues",
    entregues
  );


  definirTexto(
    "statusCancelados",
    cancelados
  );



  /* BADGES */

  atualizarBadge(
    "badgePedidos",
    pendentes
  );


  atualizarBadge(
    "badgeEstoque",
    estoqueBaixo
  );



  /* BARRAS */

  atualizarBarra(
    "barraPendentes",
    pendentes,
    totalPedidos
  );


  atualizarBarra(
    "barraEnviados",
    enviados,
    totalPedidos
  );


  atualizarBarra(
    "barraEntregues",
    entregues,
    totalPedidos
  );


  atualizarBarra(
    "barraCancelados",
    cancelados,
    totalPedidos
  );

}



/* =========================================================
   DEFINIR TEXTO
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
   BADGES
========================================================= */

function atualizarBadge(
  id,
  quantidade
) {

  const badge =
    document.getElementById(
      id
    );


  if (!badge) {

    return;

  }


  badge.textContent =
    quantidade;


  badge.hidden =
    quantidade <= 0;

}



/* =========================================================
   BARRA
========================================================= */

function atualizarBarra(
  id,
  quantidade,
  total
) {

  const barra =
    document.getElementById(
      id
    );


  if (!barra) {

    return;

  }


  const percentual =
    total > 0
      ? (
          quantidade /
          total
        ) * 100
      : 0;


  barra.style.width =
    `${Math.min(
      percentual,
      100
    )}%`;

}



/* =========================================================
   PEDIDOS RECENTES
========================================================= */

function renderizarPedidosRecentes() {

  const container =
    document.getElementById(
      "pedidosRecentes"
    );


  if (!container) {

    return;

  }


  if (
    pedidosAdmin.length === 0
  ) {

    container.innerHTML = `

      <div class="dashboard-empty">

        <i class="fa-solid fa-receipt"></i>

        <span>
          Nenhum pedido encontrado.
        </span>

      </div>

    `;


    return;

  }



  const lista =
    [...pedidosAdmin]
      .sort(
        (
          a,
          b
        ) => {

          const dataA =
            new Date(
              a.data_pedido || 0
            );


          const dataB =
            new Date(
              b.data_pedido || 0
            );


          return (
            dataB.getTime()
            -
            dataA.getTime()
          );

        }
      )
      .slice(
        0,
        5
      );



  container.innerHTML =
    lista.map(
      pedido => {

        return `

          <div class="recent-order">

            <div class="order-number">

              <small>
                Pedido
              </small>

              <strong>
                #${pedido.id_pedido}
              </strong>

            </div>


            <div class="order-client">

              <small>
                Cliente
              </small>

              <strong>
                ${
                  pedido.nome_cliente
                  ||
                  `Cliente #${pedido.id_cliente || "-"}`
                }
              </strong>

            </div>


            <div>

              <small>
                ${formatarData(
                  pedido.data_pedido
                )}
              </small>

              <strong>
                ${
                  pedido.forma_pagamento
                  ||
                  "-"
                }
              </strong>

            </div>


            <div class="order-total">

              <strong>
                ${formatarMoeda(
                  pedido.total_pedido
                )}
              </strong>

              <span
                class="order-status ${
                  classeStatus(
                    pedido.status_pedido
                  )
                }"
              >

                ${
                  pedido.status_pedido
                  ||
                  "Pendente"
                }

              </span>

            </div>

          </div>

        `;

      }
    )
    .join("");

}



/* =========================================================
   ESTOQUE BAIXO
========================================================= */

function renderizarEstoqueBaixo() {

  const container =
    document.getElementById(
      "listaEstoqueBaixo"
    );


  if (!container) {

    return;

  }


  const produtos =
    produtosAdmin
      .filter(
        produto =>
          Number(
            produto.quantidade_estoque || 0
          )
          <= 5
      )
      .sort(
        (
          a,
          b
        ) => {

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
      )
      .slice(
        0,
        6
      );


  if (
    produtos.length === 0
  ) {

    container.innerHTML = `

      <div class="dashboard-empty">

        <i class="fa-solid fa-circle-check"></i>

        <span>
          Nenhum produto com estoque baixo.
        </span>

      </div>

    `;


    return;

  }


  container.innerHTML =
    produtos.map(
      produto => {

        return `

          <div class="low-stock-item">

            <span class="low-stock-icon">

              <i class="fa-solid fa-box"></i>

            </span>


            <div>

              <strong>

                ${
                  produto.nome_produto
                  ||
                  "Produto"
                }

              </strong>

              <small>

                Código: ${
                  produto.codigo_produto
                  ||
                  produto.id_produto
                  ||
                  "-"
                }

              </small>

            </div>


            <div class="stock-amount">

              <strong>

                ${
                  Number(
                    produto.quantidade_estoque || 0
                  )
                }

              </strong>

              <small>
                unidades
              </small>

            </div>

          </div>

        `;

      }
    )
    .join("");

}



/* =========================================================
   CARREGAR DASHBOARD
========================================================= */

async function carregarDashboard() {

  const iconeAtualizar =
    btnAtualizarDashboard
      ?.querySelector(
        "i"
      );


  if (iconeAtualizar) {

    iconeAtualizar.classList.add(
      "fa-spin"
    );

  }


  await Promise.all([
    buscarPedidos(),
    buscarProdutos()
  ]);


  atualizarResumo();

  renderizarPedidosRecentes();

  renderizarEstoqueBaixo();


  if (iconeAtualizar) {

    iconeAtualizar.classList.remove(
      "fa-spin"
    );

  }

}



/* =========================================================
   ATUALIZAR
========================================================= */

btnAtualizarDashboard
  ?.addEventListener(
    "click",
    carregarDashboard
  );



/* =========================================================
   SAIR
========================================================= */

btnSairAdmin
  ?.addEventListener(
    "click",
    () => {

      /*
        Quando criarmos autenticação
        administrativa real,
        trocamos para adminLogado.
      */

      localStorage.removeItem(
        "adminLogado"
      );


      window.location.href =
        "login.html";

    }
  );



/* =========================================================
   INICIAR
========================================================= */

atualizarData();

carregarDashboard();
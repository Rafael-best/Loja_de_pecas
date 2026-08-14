let clientePedido = null;

try {
  clientePedido = JSON.parse(
    localStorage.getItem("clienteLogado")
  );
} catch (error) {
  console.warn("Erro ao ler clienteLogado:", error);
}


/*
  TEMPORÁRIO PARA DESENVOLVIMENTO

  Se não existir clienteLogado,
  usa o cliente de ID 1.

  Depois, quando ajustarmos login/backend,
  podemos remover esse fallback.
*/

if (!clientePedido) {

  console.warn(
    "Nenhum cliente logado encontrado. Usando cliente de teste."
  );

  clientePedido = {
    id_cliente: 1,
    nome_cliente: "Cliente"
  };

}


const API = "http://localhost:3000/api";



/* =====================================================
   FORMATAR MOEDA
===================================================== */

function formatarMoeda(valor) {

  const numero = Number(valor || 0);

  return numero.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

}



/* =====================================================
   FORMATAR DATA
===================================================== */

function formatarData(data) {

  if (!data) {
    return "-";
  }

  const dataConvertida =
    new Date(data);

  if (
    Number.isNaN(
      dataConvertida.getTime()
    )
  ) {
    return data;
  }

  return dataConvertida.toLocaleString(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short"
    }
  );

}



/* =====================================================
   CLASSE VISUAL DO STATUS
===================================================== */

function obterClasseStatus(status) {

  const valor =
    String(status || "")
      .toLowerCase()
      .trim();


  if (valor === "pendente") {
    return "bg-warning";
  }


  if (valor === "enviado") {
    return "bg-primary";
  }


  if (valor === "entregue") {
    return "bg-success";
  }


  if (valor === "cancelado") {
    return "bg-danger";
  }


  return "bg-secondary";

}



/* =====================================================
   TEXTO DO STATUS
===================================================== */

function obterTextoStatus(status) {

  if (!status) {
    return "Sem status";
  }

  return status;

}



/* =====================================================
   CARREGAR PEDIDOS
===================================================== */

async function carregarPedidos() {

  const listaPedidos =
    document.getElementById(
      "listaPedidos"
    );


  if (!listaPedidos) {

    console.error(
      "Elemento #listaPedidos não encontrado."
    );

    return;

  }


  listaPedidos.innerHTML = `
    <div class="text-center py-5">
      <div
        class="spinner-border text-primary"
        role="status"
      >
        <span class="visually-hidden">
          Carregando...
        </span>
      </div>

      <p class="mt-3 text-muted">
        Carregando seus pedidos...
      </p>
    </div>
  `;


  try {

    const resposta =
      await fetch(
        `${API}/pedidos`
      );


    if (!resposta.ok) {

      throw new Error(
        `Erro ao buscar pedidos. Status: ${resposta.status}`
      );

    }


    const pedidos =
      await resposta.json();


    if (!Array.isArray(pedidos)) {

      throw new Error(
        "A API de pedidos não retornou uma lista."
      );

    }



    /* =================================================
       FILTRAR PEDIDOS DO CLIENTE
    ================================================= */

    const meusPedidos =
      pedidos.filter(
        pedido =>
          Number(pedido.id_cliente) ===
          Number(clientePedido.id_cliente)
      );



    /* =================================================
       NENHUM PEDIDO
    ================================================= */

    if (
      meusPedidos.length === 0
    ) {

      listaPedidos.innerHTML = `
        <div class="orders-empty">

          <span>
            <i class="fa-solid fa-box-open"></i>
          </span>

          <h3>
            Nenhum pedido realizado ainda
          </h3>

          <p>
            Quando você fizer uma compra,
            ela aparecerá aqui.
          </p>

          <a href="produtos.html">
            Ver produtos

            <i class="fa-solid fa-arrow-right"></i>
          </a>

        </div>
      `;

      return;

    }



    /* =================================================
       ORDENAR MAIS RECENTES PRIMEIRO
    ================================================= */

    meusPedidos.sort(
      (a, b) => {

        const dataA =
          new Date(
            a.data_pedido || 0
          );

        const dataB =
          new Date(
            b.data_pedido || 0
          );

        return (
          dataB.getTime() -
          dataA.getTime()
        );

      }
    );



    let html = "";


    /* =================================================
       CARREGAR DETALHES
    ================================================= */

    for (
      const pedido
      of meusPedidos
    ) {

      let itens = [];


      try {

        const respostaDetalhe =
          await fetch(
            `${API}/pedidos/${pedido.id_pedido}`
          );


        if (
          respostaDetalhe.ok
        ) {

          const detalhe =
            await respostaDetalhe.json();


          if (
            Array.isArray(
              detalhe.itens
            )
          ) {

            itens =
              detalhe.itens;

          }

        }

      }
      catch (error) {

        console.warn(
          `Erro ao carregar itens do pedido ${pedido.id_pedido}:`,
          error
        );

      }



      /* =================================================
         ITENS
      ================================================= */

      const itensHtml =
        itens.length > 0

        ?

        itens.map(
          item => {

            const quantidade =
              Number(
                item.quantidade || 0
              );


            const preco =
              Number(
                item.preco_unitario || 0
              );


            const subtotal =
              quantidade * preco;


            return `
              <tr>

                <td>
                  ${item.nome_produto || "Produto"}
                </td>

                <td>
                  ${quantidade}
                </td>

                <td>
                  ${formatarMoeda(preco)}
                </td>

                <td>
                  ${formatarMoeda(subtotal)}
                </td>

              </tr>
            `;

          }
        ).join("")

        :

        `
          <tr>

            <td
              colspan="4"
              class="text-center text-muted"
            >
              Nenhum item encontrado neste pedido.
            </td>

          </tr>
        `;



      /* =================================================
         CARD DO PEDIDO
      ================================================= */

      html += `
        <div
          class="card order-card shadow-sm border-0 mb-4"
          data-order-id="${pedido.id_pedido}"
          data-order-status="${pedido.status_pedido || ""}"
        >

          <div class="card-body">


            <div
              class="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3"
            >

              <div>

                <small class="text-muted">
                  Pedido
                </small>

                <h4 class="mb-1">
                  #${pedido.id_pedido}
                </h4>

                <small class="text-muted">
                  ${formatarData(pedido.data_pedido)}
                </small>

              </div>


              <span
                class="badge ${obterClasseStatus(
                  pedido.status_pedido
                )}"
              >

                ${obterTextoStatus(
                  pedido.status_pedido
                )}

              </span>

            </div>



            <div class="row g-3 mb-4">


              <div class="col-12 col-md-4">

                <div class="order-info-box">

                  <small>
                    Cliente
                  </small>

                  <strong>
                    ${
                      pedido.nome_cliente
                      ||
                      clientePedido.nome_cliente
                      ||
                      "Cliente"
                    }
                  </strong>

                </div>

              </div>


              <div class="col-12 col-md-4">

                <div class="order-info-box">

                  <small>
                    Pagamento
                  </small>

                  <strong>
                    ${
                      pedido.forma_pagamento
                      ||
                      "-"
                    }
                  </strong>

                </div>

              </div>


              <div class="col-12 col-md-4">

                <div class="order-info-box">

                  <small>
                    Total
                  </small>

                  <strong class="text-success">
                    ${formatarMoeda(
                      pedido.total_pedido
                    )}
                  </strong>

                </div>

              </div>


            </div>



            <div class="order-tracking mb-4">


              <div
                class="tracking-mini-step ${
                  ["pendente", "enviado", "entregue"]
                  .includes(
                    String(
                      pedido.status_pedido || ""
                    ).toLowerCase()
                  )
                  ? "active"
                  : ""
                }"
              >

                <span>
                  <i class="fa-solid fa-receipt"></i>
                </span>

                <small>
                  Recebido
                </small>

              </div>



              <div
                class="tracking-mini-line"
              ></div>



              <div
                class="tracking-mini-step ${
                  ["enviado", "entregue"]
                  .includes(
                    String(
                      pedido.status_pedido || ""
                    ).toLowerCase()
                  )
                  ? "active"
                  : ""
                }"
              >

                <span>
                  <i class="fa-solid fa-box"></i>
                </span>

                <small>
                  Preparação
                </small>

              </div>



              <div
                class="tracking-mini-line"
              ></div>



              <div
                class="tracking-mini-step ${
                  ["enviado", "entregue"]
                  .includes(
                    String(
                      pedido.status_pedido || ""
                    ).toLowerCase()
                  )
                  ? "active"
                  : ""
                }"
              >

                <span>
                  <i class="fa-solid fa-truck-fast"></i>
                </span>

                <small>
                  Enviado
                </small>

              </div>



              <div
                class="tracking-mini-line"
              ></div>



              <div
                class="tracking-mini-step ${
                  String(
                    pedido.status_pedido || ""
                  ).toLowerCase() ===
                  "entregue"
                  ? "active"
                  : ""
                }"
              >

                <span>
                  <i class="fa-solid fa-check"></i>
                </span>

                <small>
                  Entregue
                </small>

              </div>


            </div>



            <div class="table-responsive">

              <table class="table align-middle">

                <thead>

                  <tr>

                    <th>
                      Produto
                    </th>

                    <th>
                      Quantidade
                    </th>

                    <th>
                      Preço unitário
                    </th>

                    <th>
                      Subtotal
                    </th>

                  </tr>

                </thead>


                <tbody>

                  ${itensHtml}

                </tbody>

              </table>

            </div>


          </div>

        </div>
      `;

    }



    listaPedidos.innerHTML =
      html;



    atualizarResumoPedidos(
      meusPedidos
    );


    ativarFiltrosPedidos();

  }
  catch (error) {

    console.error(
      "Erro ao carregar pedidos:",
      error
    );


    listaPedidos.innerHTML = `
      <div class="alert alert-danger">

        <strong>
          Não foi possível carregar seus pedidos.
        </strong>

        <br>

        Verifique se o backend está ligado
        em http://localhost:3000.

      </div>
    `;

  }

}



/* =====================================================
   RESUMO
===================================================== */

function atualizarResumoPedidos(
  pedidos
) {

  const total =
    pedidos.length;


  const entregues =
    pedidos.filter(
      pedido =>
        String(
          pedido.status_pedido || ""
        )
        .toLowerCase()
        ===
        "entregue"
    )
    .length;


  const resumoPedidos =
    document.getElementById(
      "resumoPedidos"
    );


  const resumoEntregues =
    document.getElementById(
      "resumoEntregues"
    );


  if (resumoPedidos) {

    resumoPedidos.textContent =
      total;

  }


  if (resumoEntregues) {

    resumoEntregues.textContent =
      entregues;

  }

}



/* =====================================================
   FILTROS VISUAIS DA NOVA PÁGINA
===================================================== */

function ativarFiltrosPedidos() {

  const busca =
    document.getElementById(
      "buscaPedidoVisual"
    );


  const filtro =
    document.getElementById(
      "filtroPedidoVisual"
    );


  function filtrar() {

    const termo =
      String(
        busca?.value || ""
      )
      .toLowerCase()
      .trim();


    const status =
      String(
        filtro?.value || ""
      )
      .toLowerCase()
      .trim();


    const cards =
      document.querySelectorAll(
        "#listaPedidos .order-card"
      );


    cards.forEach(
      card => {

        const id =
          String(
            card.dataset.orderId || ""
          )
          .toLowerCase();


        const statusPedido =
          String(
            card.dataset.orderStatus || ""
          )
          .toLowerCase();


        const correspondeBusca =
          !termo
          ||
          id.includes(
            termo.replace("#", "")
          );


        const correspondeStatus =
          !status
          ||
          statusPedido === status;


        card.style.display =
          correspondeBusca
          &&
          correspondeStatus

          ? ""

          : "none";

      }
    );

  }


  busca?.addEventListener(
    "input",
    filtrar
  );


  filtro?.addEventListener(
    "change",
    filtrar
  );

}



/* =====================================================
   INICIAR
===================================================== */

carregarPedidos();
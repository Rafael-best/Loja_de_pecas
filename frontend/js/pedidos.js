const clientePedido = JSON.parse(localStorage.getItem("clienteLogado"));

if (!clientePedido) {
  window.location.href = "index.html";
}

const API = "http://localhost:3000/api";

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

async function carregarPedidos() {
  const listaPedidos = document.getElementById("listaPedidos");

  try {
    const resposta = await fetch(`${API}/pedidos`);
    const pedidos = await resposta.json();

    if (!resposta.ok) {
      throw new Error("Erro ao buscar pedidos");
    }

    const meusPedidos = pedidos.filter(p => Number(p.id_cliente) === Number(clientePedido.id_cliente));

    if (meusPedidos.length === 0) {
      listaPedidos.innerHTML = `
        <div class="alert alert-info">
          Nenhum pedido realizado ainda.
        </div>
      `;
      return;
    }

    let html = "";

    for (const pedido of meusPedidos) {
      const respostaDetalhe = await fetch(`${API}/pedidos/${pedido.id_pedido}`);
      const detalhe = await respostaDetalhe.json();

      if (!respostaDetalhe.ok) {
        continue;
      }

      html += `
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body">
            <h4 class="mb-3">Pedido #${pedido.id_pedido}</h4>
            <p class="mb-1"><strong>Cliente:</strong> ${pedido.nome_cliente || clientePedido.nome_cliente || "Cliente"}</p>
            <p class="mb-1"><strong>Data:</strong> ${pedido.data_pedido || "-"}</p>
            <p class="mb-1"><strong>Forma de pagamento:</strong> ${pedido.forma_pagamento || "-"}</p>
            <p class="mb-1"><strong>Status:</strong> ${pedido.status_pedido || "-"}</p>
            <p class="mb-3"><strong>Total:</strong> ${formatarMoeda(pedido.total_pedido)}</p>

            <div class="table-responsive">
              <table class="table table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Preço unitário</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${detalhe.itens.map(item => `
                    <tr>
                      <td>${item.nome_produto}</td>
                      <td>${item.quantidade}</td>
                      <td>${formatarMoeda(item.preco_unitario)}</td>
                      <td>${formatarMoeda(Number(item.preco_unitario) * Number(item.quantidade))}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    listaPedidos.innerHTML = html;

  } catch (error) {
    console.error(error);
    listaPedidos.innerHTML = `
      <div class="alert alert-danger">
        Erro ao carregar pedidos.
      </div>
    `;
  }
}

carregarPedidos();
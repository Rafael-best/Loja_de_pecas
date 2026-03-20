const clientePedido = JSON.parse(localStorage.getItem("clienteLogado"));

if (!clientePedido) {
  window.location.href = "index.html";
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function obterPedidos() {
  return JSON.parse(localStorage.getItem("pedidos")) || [];
}

function renderizarPedidos() {
  const pedidos = obterPedidos();
  const listaPedidos = document.getElementById("listaPedidos");

  if (pedidos.length === 0) {
    listaPedidos.innerHTML = `
      <div class="alert alert-info">
        Nenhum pedido realizado ainda.
      </div>
    `;
    return;
  }

  listaPedidos.innerHTML = pedidos.map(pedido => `
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body">
        <h4 class="mb-3">Pedido #${pedido.id_pedido}</h4>
        <p class="mb-1"><strong>Cliente:</strong> ${pedido.cliente}</p>
        <p class="mb-1"><strong>Data:</strong> ${pedido.data}</p>
        <p class="mb-1"><strong>Forma de pagamento:</strong> ${pedido.forma_pagamento}</p>
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
              ${pedido.itens.map(item => `
                <tr>
                  <td>${item.nome_produto}</td>
                  <td>${item.quantidade}</td>
                  <td>${formatarMoeda(item.preco_produto)}</td>
                  <td>${formatarMoeda(item.preco_produto * item.quantidade)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `).join("");
}

renderizarPedidos();
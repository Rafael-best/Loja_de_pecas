const clienteLogado = JSON.parse(localStorage.getItem("clienteLogado"));

if (!clienteLogado) {
  window.location.href = "index.html";
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function obterCarrinho() {
  return JSON.parse(localStorage.getItem("carrinho")) || [];
}

function salvarCarrinho(carrinho) {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function obterPedidos() {
  return JSON.parse(localStorage.getItem("pedidos")) || [];
}

function salvarPedidos(pedidos) {
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

function obterProdutos() {
  return JSON.parse(localStorage.getItem("produtosMock")) || [];
}

function removerItem(idProduto) {
  let carrinho = obterCarrinho();
  carrinho = carrinho.filter(item => item.id_produto !== idProduto);
  salvarCarrinho(carrinho);
  renderizarCarrinho();
}

function alterarQuantidade(idProduto, delta) {
  const carrinho = obterCarrinho();
  const produtos = obterProdutos();

  const item = carrinho.find(i => i.id_produto === idProduto);
  const produto = produtos.find(p => p.id_produto === idProduto);

  if (!item || !produto) return;

  const novaQuantidade = item.quantidade + delta;

  if (novaQuantidade <= 0) {
    removerItem(idProduto);
    return;
  }

  if (novaQuantidade > produto.quantidade_estoque) {
    alert("Quantidade maior que o estoque disponível.");
    return;
  }

  item.quantidade = novaQuantidade;
  salvarCarrinho(carrinho);
  renderizarCarrinho();
}

function renderizarCarrinho() {
  const carrinho = obterCarrinho();
  const lista = document.getElementById("listaCarrinho");
  const totalCarrinho = document.getElementById("totalCarrinho");

  if (carrinho.length === 0) {
    lista.innerHTML = `<div class="alert alert-info">Seu carrinho está vazio.</div>`;
    totalCarrinho.textContent = "Total: R$ 0,00";
    return;
  }

  let total = 0;

  const tabelaDesktop = `
    <div class="table-responsive d-none d-md-block">
      <table class="table table-bordered align-middle">
        <thead class="table-dark">
          <tr>
            <th>Produto</th>
            <th>Preço</th>
            <th>Quantidade</th>
            <th>Subtotal</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${carrinho.map(item => {
            const subtotal = item.preco_produto * item.quantidade;
            total += subtotal;

            return `
              <tr>
                <td>${item.nome_produto}</td>
                <td>${formatarMoeda(item.preco_produto)}</td>
                <td>${item.quantidade}</td>
                <td>${formatarMoeda(subtotal)}</td>
                <td>
                  <button class="btn btn-sm btn-secondary me-1" onclick="alterarQuantidade(${item.id_produto}, -1)">-</button>
                  <button class="btn btn-sm btn-secondary me-1" onclick="alterarQuantidade(${item.id_produto}, 1)">+</button>
                  <button class="btn btn-sm btn-danger" onclick="removerItem(${item.id_produto})">Remover</button>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;

  const cardsMobile = `
    <div class="d-block d-md-none">
      ${carrinho.map(item => {
        const subtotal = item.preco_produto * item.quantidade;

        return `
          <div class="item-mobile">
            <h6>${item.nome_produto}</h6>
            <p class="mb-1"><strong>Preço:</strong> ${formatarMoeda(item.preco_produto)}</p>
            <p class="mb-1"><strong>Quantidade:</strong> ${item.quantidade}</p>
            <p class="mb-3"><strong>Subtotal:</strong> ${formatarMoeda(subtotal)}</p>
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-sm btn-secondary" onclick="alterarQuantidade(${item.id_produto}, -1)">-</button>
              <button class="btn btn-sm btn-secondary" onclick="alterarQuantidade(${item.id_produto}, 1)">+</button>
              <button class="btn btn-sm btn-danger" onclick="removerItem(${item.id_produto})">Remover</button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;

  lista.innerHTML = tabelaDesktop + cardsMobile;
  totalCarrinho.textContent = `Total: ${formatarMoeda(total)}`;
}

document.getElementById("btnFinalizar").addEventListener("click", function () {
  const carrinho = obterCarrinho();
  const formaPagamento = document.getElementById("formaPagamento").value;
  const mensagem = document.getElementById("mensagem");

  mensagem.innerHTML = "";

  if (carrinho.length === 0) {
    mensagem.innerHTML = `<div class="alert alert-warning">O carrinho está vazio.</div>`;
    return;
  }

  if (!formaPagamento) {
    mensagem.innerHTML = `<div class="alert alert-warning">Selecione a forma de pagamento.</div>`;
    return;
  }

  const total = carrinho.reduce((acumulador, item) => {
    return acumulador + (item.preco_produto * item.quantidade);
  }, 0);

  const novoPedido = {
    id_pedido: Date.now(),
    cliente: clienteLogado.nome,
    data: new Date().toLocaleString("pt-BR"),
    forma_pagamento: formaPagamento,
    total_pedido: total,
    itens: carrinho
  };

  const pedidos = obterPedidos();
  pedidos.push(novoPedido);
  salvarPedidos(pedidos);

  salvarCarrinho([]);

  mensagem.innerHTML = `
    <div class="alert alert-success">
      Compra finalizada com sucesso.
    </div>
  `;

  renderizarCarrinho();

  setTimeout(() => {
    window.location.href = "pedidos.html";
  }, 1000);
});

renderizarCarrinho();
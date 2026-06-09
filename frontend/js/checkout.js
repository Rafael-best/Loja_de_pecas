const clienteLogado = JSON.parse(localStorage.getItem("clienteLogado"));

if (!clienteLogado) {
  window.location.href = "index.html";
}

const API = "http://localhost:3000/api";

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

function obterProdutos() {
  return JSON.parse(localStorage.getItem("produtosMock")) || [];
}

function removerItem(idProduto) {
  let carrinho = obterCarrinho();
  carrinho = carrinho.filter(item => Number(item.id_produto) !== Number(idProduto));
  salvarCarrinho(carrinho);
  renderizarCarrinho();
}

function alterarQuantidade(idProduto, delta) {
  const carrinho = obterCarrinho();
  const produtos = obterProdutos();

  const item = carrinho.find(i => Number(i.id_produto) === Number(idProduto));
  const produto = produtos.find(p => Number(p.id_produto) === Number(idProduto));

  if (!item || !produto) return;

  const novaQuantidade = Number(item.quantidade) + Number(delta);

  if (novaQuantidade <= 0) {
    removerItem(idProduto);
    return;
  }

  if (novaQuantidade > Number(produto.quantidade_estoque)) {
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

  if (!lista || !totalCarrinho) return;

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
            const subtotal = Number(item.preco_produto) * Number(item.quantidade);
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
        const subtotal = Number(item.preco_produto) * Number(item.quantidade);

        return `
          <div class="item-mobile mb-3 p-3 border rounded">
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

async function finalizarPedido() {
  const carrinho = obterCarrinho();
  const formaPagamentoEl = document.getElementById("formaPagamento") || document.getElementById("pagamento");
  const formaPagamento = formaPagamentoEl ? formaPagamentoEl.value : "";
  const mensagem = document.getElementById("mensagem");

  if (mensagem) {
    mensagem.innerHTML = "";
  }

  if (!clienteLogado || !clienteLogado.id_cliente) {
    if (mensagem) {
      mensagem.innerHTML = `<div class="alert alert-danger">Cliente não identificado.</div>`;
    } else {
      alert("Cliente não identificado.");
    }
    return;
  }

  if (carrinho.length === 0) {
    if (mensagem) {
      mensagem.innerHTML = `<div class="alert alert-warning">O carrinho está vazio.</div>`;
    } else {
      alert("O carrinho está vazio.");
    }
    return;
  }

  if (!formaPagamento) {
    if (mensagem) {
      mensagem.innerHTML = `<div class="alert alert-warning">Selecione a forma de pagamento.</div>`;
    } else {
      alert("Selecione a forma de pagamento.");
    }
    return;
  }

  try {
    const respostaPedido = await fetch(`${API}/pedidos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id_cliente: clienteLogado.id_cliente,
        forma_pagamento: formaPagamento,
        status_pedido: "Pendente",
        total_pedido: 0
      })
    });

    const pedidoCriado = await respostaPedido.json();

    if (!respostaPedido.ok) {
      console.error("Erro ao criar pedido:", pedidoCriado);
      throw new Error(pedidoCriado.erro || "Erro ao criar pedido");
    }

    const idPedido = pedidoCriado.id_pedido;

    for (const item of carrinho) {
      const respostaItem = await fetch(`${API}/pedidos/${idPedido}/itens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id_produto: item.id_produto,
          quantidade: item.quantidade
        })
      });

      const itemCriado = await respostaItem.json();

      if (!respostaItem.ok) {
        console.error("Erro ao adicionar item:", itemCriado);
        throw new Error(itemCriado.erro || "Erro ao adicionar item no pedido");
      }
    }

    salvarCarrinho([]);

    if (mensagem) {
      mensagem.innerHTML = `<div class="alert alert-success">Compra finalizada com sucesso.</div>`;
    } else {
      alert("Compra finalizada com sucesso.");
    }

    setTimeout(() => {
      window.location.href = "pedidos.html";
    }, 1000);

  } catch (error) {
    console.error(error);

    if (mensagem) {
      mensagem.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    } else {
      alert(error.message);
    }
  }
}

const btnFinalizar = document.getElementById("btnFinalizar");
if (btnFinalizar) {
  btnFinalizar.addEventListener("click", finalizarPedido);
}

renderizarCarrinho();
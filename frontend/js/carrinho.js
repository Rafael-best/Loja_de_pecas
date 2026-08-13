const API = "/api";

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
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

function renderizarCarrinho() {
  const container = document.getElementById("listaCarrinho");
  const totalEl = document.getElementById("totalCarrinho");
  const carrinho = obterCarrinho();

  if (!carrinho.length) {
    container.innerHTML = `<div class="alert alert-info">Seu carrinho está vazio.</div>`;
    totalEl.textContent = "Total: R$ 0,00";
    return;
  }

  let totalGeral = 0;

  container.innerHTML = carrinho.map((item, index) => {
    const subtotal = Number(item.preco) * Number(item.quantidade);
    totalGeral += subtotal;

    return `
      <div class="item-mobile d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h6>${item.nome}</h6>
          <small class="text-muted">Preço: ${formatarMoeda(item.preco)}</small>
        </div>

        <div class="d-flex align-items-center gap-2">
          <input 
            type="number" 
            class="form-control form-control-sm" 
            style="width: 70px;" 
            value="${item.quantidade}" 
            min="1" 
            onchange="alterarQuantidade(${index}, this.value)"
          >
          <span class="fw-bold ms-2">${formatarMoeda(subtotal)}</span>
          <button class="btn btn-outline-danger btn-sm" onclick="removerItem(${index})">✕</button>
        </div>
      </div>
    `;
  }).join("");

  totalEl.textContent = `Total: ${formatarMoeda(totalGeral)}`;
}

function alterarQuantidade(index, novaQtd) {
  const carrinho = obterCarrinho();
  const qtd = Number(novaQtd);

  if (qtd <= 0) {
    removerItem(index);
    return;
  }

  carrinho[index].quantidade = qtd;
  salvarCarrinho(carrinho);
  renderizarCarrinho();
}

function removerItem(index) {
  const carrinho = obterCarrinho();
  carrinho.splice(index, 1);
  salvarCarrinho(carrinho);
  renderizarCarrinho();
}

async function finalizarCompra() {
  const mensagemEl = document.getElementById("mensagem");
  const formaPagamento = document.getElementById("formaPagamento").value;
  const carrinho = obterCarrinho();

  mensagemEl.className = "mt-3";
  mensagemEl.textContent = "";

  if (!carrinho.length) {
    mensagemEl.className = "mt-3 alert alert-warning";
    mensagemEl.textContent = "Adicione pelo menos um produto ao carrinho.";
    return;
  }

  if (!formaPagamento) {
    mensagemEl.className = "mt-3 alert alert-warning";
    mensagemEl.textContent = "Selecione uma forma de pagamento.";
    return;
  }

  // Recupera o usuário logado do localStorage (se houver)
  const usuarioLogado = JSON.parse(localStorage.getItem("usuario")) || {};

  const payload = {
    id_usuario: usuarioLogado.id_usuario || null,
    forma_pagamento: formaPagamento,
    itens: carrinho.map(item => ({
      id_produto: item.id_produto,
      quantidade: item.quantidade,
      preco_unitario: item.preco
    }))
  };

  try {
    const res = await fetch(`${API}/pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      mensagemEl.className = "mt-3 alert alert-danger";
      mensagemEl.textContent = data.erro || "Erro ao processar o pedido.";
      return;
    }

    // Limpa o carrinho após finalizar com sucesso
    localStorage.removeItem("carrinho");
    renderizarCarrinho();

    mensagemEl.className = "mt-3 alert alert-success";
    mensagemEl.textContent = "Pedido realizado com sucesso! Redirecionando...";

    setTimeout(() => {
      window.location.href = "pedidos.html";
    }, 2000);

  } catch (error) {
    console.error("Erro ao finalizar compra:", error);
    mensagemEl.className = "mt-3 alert alert-danger";
    mensagemEl.textContent = "Falha de conexão com o servidor.";
  }
}

document.getElementById("btnFinalizar").addEventListener("click", finalizarCompra);
document.addEventListener("DOMContentLoaded", renderizarListaOuIniciar);

function renderizarListaOuIniciar() {
  renderizarCarrinho();
}
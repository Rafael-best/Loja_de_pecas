const API = "http://localhost:3000/api";

let pedidos = [];
let produtos = [];
let pedidoSelecionado = null;

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarData(data) {
  if (!data) return "-";
  return new Date(data).toLocaleString("pt-BR");
}

function normalizar(texto) {
  return String(texto ?? "").toLowerCase().trim();
}

function statusClass(status) {
  const s = normalizar(status);
  if (s === "pendente") return "status pendente";
  if (s === "enviado") return "status enviado";
  if (s === "entregue") return "status entregue";
  if (s === "cancelado") return "status cancelado";
  return "status outro";
}

function mostrarMensagem(texto, tipo = "success") {
  const box = document.getElementById("mensagemAcao");
  if (!box) return;
  box.className = `message ${tipo}`;
  box.textContent = texto;
  box.style.display = "block";
}

async function carregarProdutos() {
  try {
    const res = await fetch(`${API}/produtos`);
    produtos = await res.json();
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

function atualizarCards() {
  document.getElementById("statTotalPedidos").textContent = pedidos.length;

  document.getElementById("statPendentes").textContent =
    pedidos.filter(p => normalizar(p.status_pedido) === "pendente").length;

  document.getElementById("statEntregues").textContent =
    pedidos.filter(p => normalizar(p.status_pedido) === "entregue").length;

  const faturamento = pedidos
    .filter(p => normalizar(p.status_pedido) === "entregue")
    .reduce((total, pedido) => total + Number(pedido.total_pedido || 0), 0);

  document.getElementById("statFaturamento").textContent = formatarMoeda(faturamento);
}

async function carregarPedidos() {
  try {
    const res = await fetch(`${API}/pedidos`);
    pedidos = await res.json();

    atualizarCards();
    renderizarListaPedidos();
  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
    document.getElementById("listaPedidos").innerHTML = `
      <div class="empty-state">Erro ao carregar pedidos.</div>
    `;
  }
}

function renderizarListaPedidos() {
  const lista = document.getElementById("listaPedidos");
  const filtro = document.getElementById("filtroStatus").value;
  const busca = normalizar(document.getElementById("buscaPedido").value);

  let filtrados = [...pedidos];

  if (filtro) {
    filtrados = filtrados.filter(p => p.status_pedido === filtro);
  }

  if (busca) {
    filtrados = filtrados.filter(p =>
      normalizar(p.id_pedido).includes(busca) ||
      normalizar(p.nome_cliente).includes(busca) ||
      normalizar(p.forma_pagamento).includes(busca)
    );
  }

  if (!filtrados.length) {
    lista.innerHTML = `<div class="empty-state">Nenhum pedido encontrado.</div>`;
    return;
  }

  lista.innerHTML = filtrados.map(pedido => `
    <div class="pedido-card ${pedidoSelecionado && Number(pedidoSelecionado.id_pedido) === Number(pedido.id_pedido) ? "active" : ""}" onclick="selecionarPedido(${pedido.id_pedido})">
      <div class="pedido-row">
        <div class="pedido-id">Pedido #${pedido.id_pedido}</div>
        <span class="${statusClass(pedido.status_pedido)}">${pedido.status_pedido || "-"}</span>
      </div>

      <div class="pedido-row">
        <div class="pedido-meta"><strong>Cliente:</strong> ${pedido.nome_cliente || "-"}</div>
      </div>

      <div class="pedido-row">
        <div class="pedido-meta"><strong>Pagamento:</strong> ${pedido.forma_pagamento || "-"}</div>
        <div class="pedido-meta"><strong>Total:</strong> ${formatarMoeda(pedido.total_pedido)}</div>
      </div>
    </div>
  `).join("");
}

async function selecionarPedido(id) {
  try {
    const res = await fetch(`${API}/pedidos/${id}`);
    const data = await res.json();

    pedidoSelecionado = data.pedido;
    pedidoSelecionado.itens = data.itens || [];

    renderizarListaPedidos();
    renderizarDetalhes();
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
  }
}

function montarOptionsProdutos() {
  if (!produtos.length) return `<option value="">Nenhum produto disponível</option>`;

  return produtos.map(produto => `
    <option value="${produto.id_produto}">
      ${produto.nome_produto} | Estoque: ${produto.quantidade_estoque} | ${formatarMoeda(produto.preco_produto)}
    </option>
  `).join("");
}

function renderizarDetalhes() {
  const container = document.getElementById("detalhesPedido");

  if (!pedidoSelecionado) {
    container.innerHTML = `
      <div class="empty-state">
        Selecione um pedido para ver os detalhes.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="details-top">
      <div>
        <h2>Pedido #${pedidoSelecionado.id_pedido}</h2>
      </div>
      <div class="${statusClass(pedidoSelecionado.status_pedido)}">${pedidoSelecionado.status_pedido || "-"}</div>
    </div>

    <div class="details-grid">
      <div class="info-box">
        <strong>Cliente</strong>
        <span>${pedidoSelecionado.nome_cliente || "-"}</span>
      </div>

      <div class="info-box">
        <strong>Data</strong>
        <span>${formatarData(pedidoSelecionado.data_pedido)}</span>
      </div>

      <div class="info-box">
        <strong>Pagamento</strong>
        <span>${pedidoSelecionado.forma_pagamento || "-"}</span>
      </div>

      <div class="info-box">
        <strong>Total</strong>
        <span>${formatarMoeda(pedidoSelecionado.total_pedido)}</span>
      </div>
    </div>

    <h3 class="section-title">Itens do pedido</h3>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Quantidade</th>
            <th>Preço unitário</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${
            pedidoSelecionado.itens.length
              ? pedidoSelecionado.itens.map(item => `
                <tr>
                  <td>${item.nome_produto}</td>
                  <td>${item.quantidade}</td>
                  <td>${formatarMoeda(item.preco_unitario)}</td>
                  <td>${formatarMoeda(Number(item.preco_unitario) * Number(item.quantidade))}</td>
                </tr>
              `).join("")
              : `<tr><td colspan="4">Esse pedido ainda não tem itens.</td></tr>`
          }
        </tbody>
      </table>
    </div>

    <div class="actions-grid">
      <div class="action-card">
        <h3>Atualizar status</h3>

        <div class="field">
          <label for="novoStatus">Novo status</label>
          <select id="novoStatus">
            <option value="Pendente" ${pedidoSelecionado.status_pedido === "Pendente" ? "selected" : ""}>Pendente</option>
            <option value="Enviado" ${pedidoSelecionado.status_pedido === "Enviado" ? "selected" : ""}>Enviado</option>
            <option value="Entregue" ${pedidoSelecionado.status_pedido === "Entregue" ? "selected" : ""}>Entregue</option>
            <option value="Cancelado" ${pedidoSelecionado.status_pedido === "Cancelado" ? "selected" : ""}>Cancelado</option>
          </select>
        </div>

        <button class="btn-warning" onclick="alterarStatus()">Salvar status</button>
      </div>

      <div class="action-card">
        <h3>Adicionar item</h3>

        <div class="field">
          <label for="produtoSelect">Produto</label>
          <select id="produtoSelect">
            ${montarOptionsProdutos()}
          </select>
        </div>

        <div class="field">
          <label for="quantidadeItem">Quantidade</label>
          <input id="quantidadeItem" type="number" min="1" value="1" />
        </div>

        <button class="btn-primary" onclick="adicionarItem()">Adicionar ao pedido</button>
      </div>
    </div>

    <div style="margin-top: 18px;">
      <button class="btn-danger" onclick="cancelarPedido()">Cancelar pedido</button>
    </div>

    <div id="mensagemAcao" class="message"></div>
  `;
}

async function alterarStatus() {
  if (!pedidoSelecionado) return;

  const status = document.getElementById("novoStatus").value;

  try {
    const res = await fetch(`${API}/pedidos/${pedidoSelecionado.id_pedido}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarMensagem(data.erro || "Erro ao atualizar status", "error");
      return;
    }

    mostrarMensagem(data.message || "Status atualizado com sucesso", "success");
    await carregarPedidos();
    await selecionarPedido(pedidoSelecionado.id_pedido);
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao atualizar status", "error");
  }
}

async function adicionarItem() {
  if (!pedidoSelecionado) return;

  const id_produto = document.getElementById("produtoSelect").value;
  const quantidade = Number(document.getElementById("quantidadeItem").value);

  if (!quantidade || quantidade <= 0) {
    mostrarMensagem("Quantidade inválida", "error");
    return;
  }

  try {
    const res = await fetch(`${API}/pedidos/${pedidoSelecionado.id_pedido}/itens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_produto, quantidade })
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarMensagem(data.erro || "Erro ao adicionar item", "error");
      return;
    }

    mostrarMensagem(data.message || "Item adicionado com sucesso", "success");
    await carregarProdutos();
    await carregarPedidos();
    await selecionarPedido(pedidoSelecionado.id_pedido);
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao adicionar item", "error");
  }
}

async function cancelarPedido() {
  if (!pedidoSelecionado) return;

  const confirmar = confirm(`Deseja realmente cancelar o pedido #${pedidoSelecionado.id_pedido}?`);
  if (!confirmar) return;

  try {
    const res = await fetch(`${API}/pedidos/${pedidoSelecionado.id_pedido}/cancelar`, {
      method: "PATCH"
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarMensagem(data.erro || "Erro ao cancelar pedido", "error");
      return;
    }

    mostrarMensagem(data.message || "Pedido cancelado com sucesso", "success");
    await carregarProdutos();
    await carregarPedidos();
    await selecionarPedido(pedidoSelecionado.id_pedido);
  } catch (error) {
    console.error(error);
    mostrarMensagem("Erro ao cancelar pedido", "error");
  }
}

document.getElementById("filtroStatus").addEventListener("change", renderizarListaPedidos);
document.getElementById("buscaPedido").addEventListener("input", renderizarListaPedidos);

carregarProdutos();
carregarPedidos();
const cliente = JSON.parse(localStorage.getItem("clienteLogado"));

if (!cliente) {
  window.location.href = "index.html";
}

const produtosMock = [
  { id_produto: 1, nome_produto: "Rolamento 6204", descricao_produto: "Rolamento industrial 20x47x14mm", preco_produto: 18.90, quantidade_estoque: 80 },
  { id_produto: 2, nome_produto: "Bucha Nylon", descricao_produto: "Bucha de nylon 12mm", preco_produto: 1.20, quantidade_estoque: 200 },
  { id_produto: 3, nome_produto: "Engrenagem 32D", descricao_produto: "Engrenagem de aço 32 dentes", preco_produto: 45.00, quantidade_estoque: 25 },
  { id_produto: 4, nome_produto: "Filtro de Óleo", descricao_produto: "Filtro automotivo padrão", preco_produto: 22.50, quantidade_estoque: 60 },
  { id_produto: 5, nome_produto: "Disco de Corte", descricao_produto: "Disco de corte 7 polegadas", preco_produto: 9.80, quantidade_estoque: 150 },
  { id_produto: 6, nome_produto: "Chave Allen 8mm", descricao_produto: "Chave allen reforçada 8mm", preco_produto: 14.90, quantidade_estoque: 40 },
  { id_produto: 7, nome_produto: "Correia Dentada", descricao_produto: "Correia dentada industrial 150cm", preco_produto: 38.70, quantidade_estoque: 35 },
  { id_produto: 8, nome_produto: "Parafuso Sextavado", descricao_produto: "Parafuso sextavado 12mm aço zincado", preco_produto: 0.80, quantidade_estoque: 300 },
  { id_produto: 9, nome_produto: "Porca 10mm", descricao_produto: "Porca aço carbono 10mm", preco_produto: 0.35, quantidade_estoque: 400 },
  { id_produto: 10, nome_produto: "Arruela Lisa", descricao_produto: "Arruela lisa 10mm zincada", preco_produto: 0.20, quantidade_estoque: 500 },
  { id_produto: 11, nome_produto: "Retentor 35x52x7", descricao_produto: "Retentor industrial 35x52x7mm", preco_produto: 16.40, quantidade_estoque: 45 },
  { id_produto: 12, nome_produto: "Graxa 500g", descricao_produto: "Graxa industrial alta temperatura", preco_produto: 25.00, quantidade_estoque: 70 },
  { id_produto: 13, nome_produto: "Cadeado 40mm", descricao_produto: "Cadeado de aço reforçado 40mm", preco_produto: 32.00, quantidade_estoque: 30 },
  { id_produto: 14, nome_produto: "Mangueira 1/2", descricao_produto: "Mangueira industrial 1/2 polegada", preco_produto: 6.50, quantidade_estoque: 120 },
  { id_produto: 15, nome_produto: "Motor Elétrico 1CV", descricao_produto: "Motor elétrico trifásico 1CV", preco_produto: 780.00, quantidade_estoque: 10 }
];

if (!localStorage.getItem("produtosMock")) {
  localStorage.setItem("produtosMock", JSON.stringify(produtosMock));
}

const btnSair = document.getElementById("btnSair");
const campoBusca = document.getElementById("campoBusca");

if (btnSair) {
  btnSair.addEventListener("click", function () {
    localStorage.removeItem("clienteLogado");
    window.location.href = "index.html";
  });
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function obterProdutos() {
  return JSON.parse(localStorage.getItem("produtosMock")) || [];
}

function obterCarrinho() {
  return JSON.parse(localStorage.getItem("carrinho")) || [];
}

function salvarCarrinho(carrinho) {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function atualizarBotaoCarrinho() {
  const carrinho = obterCarrinho();
  const btnCarrinho = document.getElementById("btnCarrinho");

  if (!btnCarrinho) return;

  const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
  btnCarrinho.textContent = `Carrinho (${totalItens})`;
}

function mostrarToast(mensagem) {
  const toast = document.getElementById("toastMensagem");

  if (!toast) {
    console.log("Toast não encontrado no HTML");
    return;
  }

  toast.textContent = mensagem;
  toast.classList.add("mostrar");

  clearTimeout(toast._timeout);

  toast._timeout = setTimeout(() => {
    toast.classList.remove("mostrar");
  }, 2200);
}

function adicionarAoCarrinho(idProduto) {
  const produtos = obterProdutos();
  const carrinho = obterCarrinho();

  const produto = produtos.find(p => p.id_produto === idProduto);
  if (!produto) return;

  const itemExistente = carrinho.find(item => item.id_produto === idProduto);

  if (itemExistente) {
    if (itemExistente.quantidade < produto.quantidade_estoque) {
      itemExistente.quantidade += 1;
    } else {
      mostrarToast("Quantidade máxima em estoque atingida.");
      return;
    }
  } else {
    carrinho.push({
      id_produto: produto.id_produto,
      nome_produto: produto.nome_produto,
      preco_produto: Number(produto.preco_produto),
      quantidade: 1
    });
  }

  salvarCarrinho(carrinho);
  atualizarBotaoCarrinho();
  mostrarToast("Produto adicionado ao carrinho.");
}

function renderizarProdutos(listaDeProdutos) {
  const lista = document.getElementById("listaProdutos");
  lista.innerHTML = "";

  if (listaDeProdutos.length === 0) {
    lista.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning mb-0">
          Nenhum produto encontrado.
        </div>
      </div>
    `;
    return;
  }

  listaDeProdutos.forEach(produto => {
    const coluna = document.createElement("div");
    coluna.className = "col-12 col-sm-6 col-lg-4 col-xl-3";

    coluna.innerHTML = `
      <div class="card card-produto shadow-sm">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${produto.nome_produto}</h5>
          <p class="card-text text-muted descricao-produto">${produto.descricao_produto}</p>
          <p class="mb-1"><strong>Estoque:</strong> ${produto.quantidade_estoque}</p>
          <p class="preco">${formatarMoeda(produto.preco_produto)}</p>
          <button class="btn btn-primary mt-auto">Adicionar ao carrinho</button>
        </div>
      </div>
    `;

    const botao = coluna.querySelector("button");
    botao.addEventListener("click", function () {
      adicionarAoCarrinho(produto.id_produto);
    });

    lista.appendChild(coluna);
  });
}

function filtrarProdutos() {
  const produtos = obterProdutos();

  if (!campoBusca) {
    renderizarProdutos(produtos);
    return;
  }

  const termo = campoBusca.value.toLowerCase().trim();

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome_produto.toLowerCase().includes(termo) ||
    produto.descricao_produto.toLowerCase().includes(termo)
  );

  renderizarProdutos(produtosFiltrados);
}

if (campoBusca) {
  campoBusca.addEventListener("input", filtrarProdutos);
}
function atualizarCarrinhoTopo() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  let total = 0;

  carrinho.forEach(item => {
    total += item.quantidade || 1;
  });

  document.getElementById("btnCarrinho").innerText = `Carrinho (${total})`;
}
let timeoutToast;

function mostrarToast(mensagem) {
  const toast = document.getElementById("toastMensagem");
  if (!toast) return;

  toast.textContent = mensagem;
  toast.classList.add("mostrar");

  clearTimeout(timeoutToast);

  timeoutToast = setTimeout(() => {
    toast.classList.remove("mostrar");
  }, 2000);
}

// roda quando abrir a página
atualizarCarrinhoTopo();

renderizarProdutos(obterProdutos());
atualizarBotaoCarrinho();
mostrarMensagem("Produto adicionado ao carrinho");

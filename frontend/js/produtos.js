const cliente = JSON.parse(localStorage.getItem("clienteLogado"));
const API = "http://localhost:3000/api";
const CAMINHO_IMAGENS_PRODUTOS = "assets/images/produtos";
const PLACEHOLDER_PRODUTO = `${CAMINHO_IMAGENS_PRODUTOS}/placeholder.webp`;
const ITENS_POR_PAGINA = 8;

let produtos = [];
let paginaAtual = 1;

if (!cliente) {
  window.location.href = "index.html";
}

const btnSair = document.getElementById("btnSair");
const campoBusca = document.getElementById("campoBusca");
const filtroCategoria = document.getElementById("filtroCategoria");
const ordenacaoProdutos = document.getElementById("ordenacaoProdutos");
const listaProdutos = document.getElementById("listaProdutos");
const paginacaoCatalogo = document.getElementById("paginacaoCatalogo");
const resultadoCatalogo = document.getElementById("resultadoCatalogo");

if (btnSair) {
  btnSair.addEventListener("click", function () {
    localStorage.removeItem("clienteLogado");
    window.location.href = "index.html";
  });
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function obterCampoProduto(produto, campos, padrao) {
  const valor = campos.map((campo) => produto[campo]).find((item) => item !== null && item !== undefined && String(item).trim() !== "");
  return valor ?? padrao;
}

function obterCategoriaProduto(produto) {
  return obterCampoProduto(produto, ["categoria_produto", "categoria"], "Autopeças");
}

function obterCarrinho() {
  return JSON.parse(localStorage.getItem("carrinho")) || [];
}

function salvarCarrinho(carrinho) {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function atualizarBotaoCarrinho() {
  const btnCarrinho = document.getElementById("btnCarrinho");
  if (!btnCarrinho) return;

  const totalItens = obterCarrinho().reduce((total, item) => total + Number(item.quantidade || 0), 0);
  btnCarrinho.textContent = `Carrinho (${totalItens})`;
}

function mostrarToast(mensagem) {
  const toast = document.getElementById("toastMensagem");
  if (!toast) return;

  toast.textContent = mensagem;
  toast.classList.add("mostrar");
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove("mostrar"), 2200);
}

function obterCaminhoImagem(imagem) {
  const nomeArquivo = String(imagem || "").trim().split(/[\\/]/).pop();
  return nomeArquivo ? `${CAMINHO_IMAGENS_PRODUTOS}/${encodeURIComponent(nomeArquivo)}` : PLACEHOLDER_PRODUTO;
}

function criarImagemProduto(produto) {
  const imagem = document.createElement("img");
  imagem.className = "ds-product-card__image";
  imagem.src = obterCaminhoImagem(produto.imagem);
  imagem.alt = produto.imagem ? `Imagem do produto ${produto.nome_produto}` : "Imagem não disponível";
  imagem.loading = "lazy";
  imagem.addEventListener("error", function () {
    if (!imagem.src.endsWith(PLACEHOLDER_PRODUTO)) {
      imagem.src = PLACEHOLDER_PRODUTO;
      imagem.alt = "Imagem não disponível";
    }
  });
  return imagem;
}

function adicionarAoCarrinho(idProduto) {
  const carrinho = obterCarrinho();
  const produto = produtos.find((item) => Number(item.id_produto) === Number(idProduto));
  if (!produto) return;

  const itemExistente = carrinho.find((item) => Number(item.id_produto) === Number(idProduto));
  if (itemExistente) {
    if (Number(itemExistente.quantidade) >= Number(produto.quantidade_estoque)) {
      mostrarToast("Quantidade máxima em estoque atingida.");
      return;
    }
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      id_produto: produto.id_produto,
      nome_produto: produto.nome_produto,
      preco_produto: Number(produto.preco_produto),
      quantidade_estoque: Number(produto.quantidade_estoque),
      imagem: produto.imagem || null,
      quantidade: 1
    });
  }

  salvarCarrinho(carrinho);
  atualizarBotaoCarrinho();
  mostrarToast("Produto adicionado ao carrinho.");
}

function criarDetalheProduto(rotulo, valor) {
  const detalhe = document.createElement("div");
  const titulo = document.createElement("strong");
  titulo.textContent = `${rotulo}: `;
  detalhe.append(titulo, document.createTextNode(String(valor)));
  return detalhe;
}

function criarCardProduto(produto) {
  const codigo = obterCampoProduto(produto, ["codigo_produto", "codigo", "sku"], `#${produto.id_produto}`);
  const marca = obterCampoProduto(produto, ["marca_produto", "marca"], "Não informada");
  const categoria = obterCategoriaProduto(produto);
  const estoqueDisponivel = Number(produto.quantidade_estoque || 0);

  const card = document.createElement("article");
  card.className = "ds-product-card";

  const corpo = document.createElement("div");
  corpo.className = "ds-product-card__body";

  const meta = document.createElement("div");
  meta.className = "ds-product-card__meta";
  const badgeCategoria = document.createElement("span");
  badgeCategoria.className = "ds-badge ds-badge--neutral";
  badgeCategoria.textContent = categoria;
  const badgeEstoque = document.createElement("span");
  badgeEstoque.className = estoqueDisponivel > 0 ? "ds-badge ds-badge--success" : "ds-badge ds-badge--danger";
  badgeEstoque.textContent = estoqueDisponivel > 0 ? "Em estoque" : "Indisponível";
  meta.append(badgeCategoria, badgeEstoque);

  const titulo = document.createElement("h3");
  titulo.className = "ds-product-card__title";
  titulo.textContent = produto.nome_produto;

  const detalhes = document.createElement("div");
  detalhes.className = "ds-product-card__details";
  detalhes.append(
    criarDetalheProduto("Código", codigo),
    criarDetalheProduto("Marca", marca),
    criarDetalheProduto("Estoque", estoqueDisponivel)
  );

  const rodape = document.createElement("div");
  rodape.className = "ds-product-card__footer";
  const preco = document.createElement("p");
  preco.className = "ds-product-card__price";
  preco.textContent = formatarMoeda(produto.preco_produto);
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "ds-button ds-button--primary";
  botao.textContent = estoqueDisponivel > 0 ? "Comprar" : "Indisponível";
  botao.disabled = estoqueDisponivel <= 0;
  botao.addEventListener("click", () => adicionarAoCarrinho(produto.id_produto));
  rodape.append(preco, botao);

  corpo.append(meta, titulo, detalhes, rodape);
  card.append(criarImagemProduto(produto), corpo);
  return card;
}

function filtrarProdutos() {
  const termo = String(campoBusca?.value || "").toLowerCase().trim();
  const categoriaSelecionada = filtroCategoria?.value || "";

  return produtos.filter((produto) => {
    const textoPesquisavel = [
      produto.nome_produto,
      produto.descricao_produto,
      obterCampoProduto(produto, ["codigo_produto", "codigo", "sku"], ""),
      obterCampoProduto(produto, ["marca_produto", "marca"], "")
    ].join(" ").toLowerCase();

    return (!termo || textoPesquisavel.includes(termo)) &&
      (!categoriaSelecionada || obterCategoriaProduto(produto) === categoriaSelecionada);
  });
}

function ordenarProdutos(lista) {
  const ordenacao = ordenacaoProdutos?.value || "nome-asc";
  const produtosOrdenados = [...lista];

  return produtosOrdenados.sort((primeiro, segundo) => {
    if (ordenacao === "preco-asc") return Number(primeiro.preco_produto || 0) - Number(segundo.preco_produto || 0);
    if (ordenacao === "preco-desc") return Number(segundo.preco_produto || 0) - Number(primeiro.preco_produto || 0);
    if (ordenacao === "estoque-desc") return Number(segundo.quantidade_estoque || 0) - Number(primeiro.quantidade_estoque || 0);
    return String(primeiro.nome_produto || "").localeCompare(String(segundo.nome_produto || ""), "pt-BR");
  });
}

function renderizarPaginacao(totalPaginas) {
  if (!paginacaoCatalogo) return;
  paginacaoCatalogo.innerHTML = "";
  if (totalPaginas <= 1) return;

  const criarBotaoPagina = (rotulo, pagina, desabilitado = false, atual = false) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "ds-pagination__button";
    botao.textContent = rotulo;
    botao.disabled = desabilitado;
    if (atual) botao.setAttribute("aria-current", "page");
    botao.addEventListener("click", () => {
      paginaAtual = pagina;
      renderizarCatalogo();
      document.getElementById("tituloCatalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return botao;
  };

  paginacaoCatalogo.appendChild(criarBotaoPagina("Anterior", paginaAtual - 1, paginaAtual === 1));
  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    paginacaoCatalogo.appendChild(criarBotaoPagina(String(pagina), pagina, false, pagina === paginaAtual));
  }
  paginacaoCatalogo.appendChild(criarBotaoPagina("Próxima", paginaAtual + 1, paginaAtual === totalPaginas));
}

function renderizarCatalogo() {
  if (!listaProdutos) return;
  const produtosFiltrados = ordenarProdutos(filtrarProdutos());
  const totalPaginas = Math.max(1, Math.ceil(produtosFiltrados.length / ITENS_POR_PAGINA));
  paginaAtual = Math.min(paginaAtual, totalPaginas);
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const produtosDaPagina = produtosFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);

  listaProdutos.innerHTML = "";
  listaProdutos.setAttribute("aria-busy", "false");
  if (resultadoCatalogo) {
    resultadoCatalogo.textContent = `${produtosFiltrados.length} produto${produtosFiltrados.length === 1 ? "" : "s"} encontrado${produtosFiltrados.length === 1 ? "" : "s"}.`;
  }

  if (produtosDaPagina.length === 0) {
    const vazio = document.createElement("div");
    vazio.className = "catalog-empty ds-message ds-message--warning";
    vazio.textContent = "Nenhum produto encontrado com os filtros selecionados.";
    listaProdutos.appendChild(vazio);
  } else {
    produtosDaPagina.forEach((produto) => listaProdutos.appendChild(criarCardProduto(produto)));
  }

  renderizarPaginacao(totalPaginas);
}

function preencherCategorias() {
  if (!filtroCategoria) return;
  const categorias = [...new Set(produtos.map(obterCategoriaProduto))].sort((primeira, segunda) => primeira.localeCompare(segunda, "pt-BR"));
  categorias.forEach((categoria) => {
    const opcao = document.createElement("option");
    opcao.value = categoria;
    opcao.textContent = categoria;
    filtroCategoria.appendChild(opcao);
  });
}

function mostrarEstado(mensagem, tipo = "info") {
  if (!listaProdutos) return;
  listaProdutos.innerHTML = "";
  listaProdutos.setAttribute("aria-busy", "false");
  const alerta = document.createElement("div");
  alerta.className = `catalog-empty ds-message ds-message--${tipo === "danger" ? "error" : tipo}`;
  alerta.textContent = mensagem;
  listaProdutos.appendChild(alerta);
}

async function carregarProdutos() {
  listaProdutos?.setAttribute("aria-busy", "true");
  mostrarEstado("Carregando produtos...");

  try {
    const resposta = await fetch(`${API}/produtos`);
    if (!resposta.ok) throw new Error("Não foi possível carregar os produtos.");

    produtos = await resposta.json();
    /* Compatibilidade temporária com checkout.js, que não é alterado nesta sprint. */
    localStorage.setItem("produtosMock", JSON.stringify(produtos));
    preencherCategorias();
    renderizarCatalogo();
  } catch (erro) {
    console.error(erro);
    mostrarEstado("Não foi possível carregar o catálogo. Tente novamente mais tarde.", "danger");
  }
}

function atualizarFiltros() {
  paginaAtual = 1;
  renderizarCatalogo();
}

campoBusca?.addEventListener("input", atualizarFiltros);
filtroCategoria?.addEventListener("change", atualizarFiltros);
ordenacaoProdutos?.addEventListener("change", atualizarFiltros);

atualizarBotaoCarrinho();
carregarProdutos();

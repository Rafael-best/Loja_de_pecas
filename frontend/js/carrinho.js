/* =========================================================
   CARRINHO.JS
   HYPER SMART CART
   Loja de Peças

   Recursos:
   - Renderização futurista dos produtos
   - Animações ligadas às ações reais
   - Alteração de quantidade
   - Validação de estoque
   - Remoção animada
   - Limpar carrinho com modal
   - Total animado
   - Resumo inteligente
   - Health do carrinho
   - CEP
   - Cupom frontend temporário
   - Recomendações inteligentes
   - Carrinho vazio
   - Integração com SiteUI
   - Preparação para checkout/backend
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const API =
  "http://localhost:3000/api";

const CAMINHO_IMAGENS =
  "assets/images/produtos";

const PLACEHOLDER_PRODUTO =
  `${CAMINHO_IMAGENS}/placeholder.webp`;


/*
  IMPORTANTE:

  Estes cupons existem apenas na camada FRONTEND
  enquanto o backend de promoções ainda não foi feito.

  Quando fizermos o backend, esta validação deverá
  sair daqui e ser feita exclusivamente pelo servidor.
*/

const CUPONS_FRONTEND = {

  SMART10: {
    tipo: "percentual",
    valor: 10,
    descricao: "10% de desconto"
  },

  AUTO5: {
    tipo: "percentual",
    valor: 5,
    descricao: "5% de desconto"
  }

};


/* =========================================================
   ESTADO
========================================================= */

let produtosCatalogo = [];

let descontoAtual = 0;

let cupomAplicado = null;

let cepAtual = "";

let carrinhoPossuiErroEstoque = false;


/* =========================================================
   ELEMENTOS
========================================================= */

const listaCarrinho =
  document.getElementById(
    "listaCarrinho"
  );

const cartMainLayout =
  document.getElementById(
    "cartMainLayout"
  );

const cartToolsArea =
  document.getElementById(
    "cartToolsArea"
  );

const cartEmptyState =
  document.getElementById(
    "cartEmptyState"
  );

const recommendationsSection =
  document.getElementById(
    "recommendationsSection"
  );

const cartRecommendations =
  document.getElementById(
    "cartRecommendations"
  );

const btnEsvaziarCarrinho =
  document.getElementById(
    "btnEsvaziarCarrinho"
  );

const btnFinalizar =
  document.getElementById(
    "btnFinalizar"
  );

const resumoSubtotal =
  document.getElementById(
    "resumoSubtotal"
  );

const resumoQuantidadeItens =
  document.getElementById(
    "resumoQuantidadeItens"
  );

const resumoDesconto =
  document.getElementById(
    "resumoDesconto"
  );

const resumoFrete =
  document.getElementById(
    "resumoFrete"
  );

const totalCarrinho =
  document.getElementById(
    "totalCarrinho"
  );

const heroItemCount =
  document.getElementById(
    "heroItemCount"
  );

const cartItemsDescription =
  document.getElementById(
    "cartItemsDescription"
  );

const cartHealthBar =
  document.getElementById(
    "cartHealthBar"
  );

const cartHealth =
  document.getElementById(
    "cartHealth"
  );

const inputCep =
  document.getElementById(
    "inputCep"
  );

const btnCalcularFrete =
  document.getElementById(
    "btnCalcularFrete"
  );

const resultadoFrete =
  document.getElementById(
    "resultadoFrete"
  );

const inputCupom =
  document.getElementById(
    "inputCupom"
  );

const btnAplicarCupom =
  document.getElementById(
    "btnAplicarCupom"
  );

const resultadoCupom =
  document.getElementById(
    "resultadoCupom"
  );

const toastCarrinho =
  document.getElementById(
    "toastCarrinho"
  );

const modalEsvaziarCarrinho =
  document.getElementById(
    "modalEsvaziarCarrinho"
  );

const cartModalBackdrop =
  document.getElementById(
    "cartModalBackdrop"
  );

const btnCancelarEsvaziar =
  document.getElementById(
    "btnCancelarEsvaziar"
  );

const btnConfirmarEsvaziar =
  document.getElementById(
    "btnConfirmarEsvaziar"
  );


/* =========================================================
   UTILITÁRIOS
========================================================= */

function formatarMoeda(valor) {

  return Number(
    valor || 0
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

}


function numeroSeguro(valor) {

  const numero =
    Number(valor);

  return Number.isFinite(numero)
    ? numero
    : 0;

}


function normalizarTexto(valor) {

  return String(
    valor || ""
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();

}


function obterCampo(
  objeto,
  campos,
  padrao = ""
) {

  if (!objeto) {
    return padrao;
  }


  for (
    const campo of campos
  ) {

    const valor =
      objeto[campo];


    if (
      valor !== null &&
      valor !== undefined &&
      String(valor).trim() !== ""
    ) {

      return valor;

    }

  }


  return padrao;

}


/* =========================================================
   CARRINHO STORAGE
========================================================= */

function obterCarrinho() {

  try {

    const dados =
      localStorage.getItem(
        "carrinho"
      );


    if (!dados) {
      return [];
    }


    const carrinho =
      JSON.parse(dados);


    return Array.isArray(carrinho)
      ? carrinho
      : [];

  } catch (erro) {

    console.warn(
      "Erro ao recuperar carrinho:",
      erro
    );


    return [];

  }

}


function salvarCarrinho(
  carrinho
) {

  localStorage.setItem(
    "carrinho",
    JSON.stringify(
      carrinho
    )
  );


  /*
    Atualiza o site.js na mesma página.
  */

  window.dispatchEvent(
    new CustomEvent(
      "carrinhoAtualizado"
    )
  );


  if (
    window.SiteUI &&
    typeof window.SiteUI
      .atualizarCarrinho ===
      "function"
  ) {

    window.SiteUI
      .atualizarCarrinho();

  }

}


/* =========================================================
   CATÁLOGO LOCAL
========================================================= */

function obterProdutosCache() {

  try {

    const dados =
      localStorage.getItem(
        "produtosMock"
      );


    if (!dados) {
      return [];
    }


    const lista =
      JSON.parse(dados);


    return Array.isArray(lista)
      ? lista
      : [];

  } catch {

    return [];

  }

}


/* =========================================================
   PRODUTO DO CATÁLOGO
========================================================= */

function encontrarProdutoCatalogo(
  idProduto
) {

  return produtosCatalogo.find(
    produto =>
      Number(
        produto.id_produto
      ) ===
      Number(
        idProduto
      )
  );

}


/* =========================================================
   DADOS UNIFICADOS DO ITEM
========================================================= */

function obterDadosItem(
  item
) {

  const produto =
    encontrarProdutoCatalogo(
      item.id_produto
    );


  const estoque =
    numeroSeguro(
      produto?.quantidade_estoque ??
      item.quantidade_estoque
    );


  const preco =
    numeroSeguro(
      produto?.preco_produto ??
      item.preco_produto
    );


  const nome =
    produto?.nome_produto ||
    item.nome_produto ||
    "Produto";


  const imagem =
    produto?.imagem ||
    item.imagem ||
    "";


  const codigo =
    obterCampo(
      produto || item,
      [
        "codigo_produto",
        "codigo",
        "sku"
      ],
      `#${item.id_produto}`
    );


  const marca =
    obterCampo(
      produto || item,
      [
        "marca_produto",
        "marca"
      ],
      "Não informada"
    );


  const categoria =
    obterCampo(
      produto || item,
      [
        "categoria_produto",
        "categoria"
      ],
      "Autopeças"
    );


  return {

    produto,

    estoque,

    preco,

    nome,

    imagem,

    codigo,

    marca,

    categoria

  };

}


/* =========================================================
   IMAGEM
========================================================= */

function obterImagem(
  imagem
) {

  const texto =
    String(
      imagem || ""
    ).trim();


  if (!texto) {
    return PLACEHOLDER_PRODUTO;
  }


  if (
    texto.startsWith(
      "http://"
    ) ||
    texto.startsWith(
      "https://"
    ) ||
    texto.startsWith(
      "data:"
    )
  ) {

    return texto;

  }


  const nome =
    texto
      .split(/[\\/]/)
      .pop();


  return nome
    ? `${CAMINHO_IMAGENS}/${encodeURIComponent(nome)}`
    : PLACEHOLDER_PRODUTO;

}


/* =========================================================
   TOAST
========================================================= */

let timerToast = null;


function mostrarToast(
  mensagem,
  tipo = "success"
) {

  if (!toastCarrinho) {
    return;
  }


  clearTimeout(
    timerToast
  );


  toastCarrinho.classList.remove(
    "show",
    "warning",
    "error"
  );


  toastCarrinho.textContent =
    mensagem;


  if (
    tipo === "warning"
  ) {

    toastCarrinho.classList.add(
      "warning"
    );

  }


  if (
    tipo === "error"
  ) {

    toastCarrinho.classList.add(
      "error"
    );

  }


  /*
    Força novo frame para reiniciar
    a animação do toast.
  */

  void toastCarrinho.offsetWidth;


  toastCarrinho.classList.add(
    "show"
  );


  timerToast =
    setTimeout(
      () => {

        toastCarrinho.classList.remove(
          "show"
        );

      },
      2600
    );

}


/* =========================================================
   WEB ANIMATION SAFE
========================================================= */

function animar(
  elemento,
  keyframes,
  options
) {

  if (
    !elemento ||
    typeof elemento.animate !==
      "function"
  ) {

    return null;

  }


  return elemento.animate(
    keyframes,
    options
  );

}


/* =========================================================
   ANIMAÇÃO DE NÚMERO
========================================================= */

function animarMoeda(
  elemento,
  valorFinal
) {

  if (!elemento) {
    return;
  }


  const valorAnterior =
    numeroSeguro(
      elemento.dataset.valorNumerico
    );


  const destino =
    numeroSeguro(
      valorFinal
    );


  const inicio =
    performance.now();


  const duracao =
    520;


  function atualizar(
    tempo
  ) {

    const progresso =
      Math.min(
        (
          tempo - inicio
        ) / duracao,
        1
      );


    /*
      easeOutCubic
    */

    const easing =
      1 -
      Math.pow(
        1 - progresso,
        3
      );


    const atual =
      valorAnterior +
      (
        destino -
        valorAnterior
      ) *
      easing;


    elemento.textContent =
      formatarMoeda(
        atual
      );


    if (
      progresso < 1
    ) {

      requestAnimationFrame(
        atualizar
      );

    } else {

      elemento.dataset.valorNumerico =
        String(destino);

    }

  }


  requestAnimationFrame(
    atualizar
  );


  animar(
    elemento,
    [
      {
        transform:
          "scale(1)"
      },
      {
        transform:
          "scale(1.08)",
        color:
          "#5caeff"
      },
      {
        transform:
          "scale(1)"
      }
    ],
    {
      duration: 430,
      easing:
        "cubic-bezier(.2,.8,.2,1)"
    }
  );

}


/* =========================================================
   ANIMAR CONTADOR
========================================================= */

function animarContador(
  elemento,
  valorFinal,
  formato = null
) {

  if (!elemento) {
    return;
  }


  const inicial =
    numeroSeguro(
      elemento.dataset.numero
    );


  const final =
    numeroSeguro(
      valorFinal
    );


  const inicio =
    performance.now();


  const duracao =
    380;


  function frame(
    tempo
  ) {

    const percentual =
      Math.min(
        (
          tempo -
          inicio
        ) /
        duracao,
        1
      );


    const easing =
      1 -
      Math.pow(
        1 - percentual,
        3
      );


    const valor =
      Math.round(
        inicial +
        (
          final -
          inicial
        ) *
        easing
      );


    elemento.textContent =
      formato
        ? formato(valor)
        : String(valor);


    if (
      percentual < 1
    ) {

      requestAnimationFrame(
        frame
      );

    } else {

      elemento.dataset.numero =
        String(final);

    }

  }


  requestAnimationFrame(
    frame
  );

}


/* =========================================================
   ANIMAÇÃO DO TOTAL
========================================================= */

function dispararPulsoTotal() {

  const circulo =
    totalCarrinho
      ?.closest(
        ".total-circle"
      );


  animar(
    circulo,
    [
      {
        transform:
          "scale(1)",
        boxShadow:
          "inset 0 0 35px rgba(29,127,226,.08)"
      },
      {
        transform:
          "scale(1.035)",
        boxShadow:
          "inset 0 0 55px rgba(55,159,255,.23), 0 0 32px rgba(39,139,255,.12)"
      },
      {
        transform:
          "scale(1)"
      }
    ],
    {
      duration: 520,
      easing:
        "cubic-bezier(.2,.8,.2,1)"
    }
  );

}


/* =========================================================
   SOMATÓRIO
========================================================= */

function calcularTotais() {

  const carrinho =
    obterCarrinho();


  let quantidade =
    0;

  let subtotal =
    0;


  carrinho.forEach(
    item => {

      const dados =
        obterDadosItem(
          item
        );


      const qtd =
        numeroSeguro(
          item.quantidade
        );


      quantidade +=
        qtd;


      subtotal +=
        dados.preco *
        qtd;

    }
  );


  /*
    Garante que desconto não ultrapasse
    o valor da compra.
  */

  descontoAtual =
    Math.min(
      Math.max(
        descontoAtual,
        0
      ),
      subtotal
    );


  const total =
    Math.max(
      subtotal -
      descontoAtual,
      0
    );


  return {

    quantidade,

    subtotal,

    desconto:
      descontoAtual,

    total

  };

}


/* =========================================================
   RESUMO
========================================================= */

function atualizarResumo(
  animado = true
) {

  const totais =
    calcularTotais();


  const textoItens =
    `${totais.quantidade} ` +
    (
      totais.quantidade === 1
        ? "item"
        : "itens"
    );


  if (animado) {

    animarMoeda(
      resumoSubtotal,
      totais.subtotal
    );


    animarMoeda(
      resumoDesconto,
      totais.desconto
    );


    animarMoeda(
      totalCarrinho,
      totais.total
    );


    dispararPulsoTotal();

  } else {

    if (resumoSubtotal) {

      resumoSubtotal.textContent =
        formatarMoeda(
          totais.subtotal
        );


      resumoSubtotal.dataset.valorNumerico =
        String(
          totais.subtotal
        );

    }


    if (resumoDesconto) {

      resumoDesconto.textContent =
        formatarMoeda(
          totais.desconto
        );


      resumoDesconto.dataset.valorNumerico =
        String(
          totais.desconto
        );

    }


    if (totalCarrinho) {

      totalCarrinho.textContent =
        formatarMoeda(
          totais.total
        );


      totalCarrinho.dataset.valorNumerico =
        String(
          totais.total
        );

    }

  }


  if (
    resumoQuantidadeItens
  ) {

    resumoQuantidadeItens.textContent =
      textoItens;

  }


  if (
    heroItemCount
  ) {

    animarContador(
      heroItemCount,
      totais.quantidade,
      valor =>
        String(valor)
          .padStart(
            2,
            "0"
          )
    );

  }


  if (
    cartItemsDescription
  ) {

    cartItemsDescription.textContent =
      totais.quantidade === 0
        ? "Nenhum componente carregado."
        : `${textoItens} carregado${totais.quantidade === 1 ? "" : "s"} no Smart Cart.`;

  }


  if (
    btnFinalizar
  ) {

    btnFinalizar.disabled =
      totais.quantidade === 0 ||
      carrinhoPossuiErroEstoque;

  }


  atualizarHealth();

}


/* =========================================================
   HEALTH DO CARRINHO
========================================================= */

function atualizarHealth() {

  if (
    !cartHealth ||
    !cartHealthBar
  ) {

    return;
  }


  const carrinho =
    obterCarrinho();


  if (
    carrinho.length === 0
  ) {

    cartHealth.textContent =
      "EMPTY";


    cartHealth.style.color =
      "#8796a7";


    cartHealthBar.style.width =
      "20%";


    return;

  }


  if (
    carrinhoPossuiErroEstoque
  ) {

    cartHealth.textContent =
      "ALERTA";


    cartHealth.style.color =
      "#d99a2b";


    cartHealthBar.style.width =
      "58%";


    cartHealthBar.style.background =
      "linear-gradient(90deg,#d99a2b,#ffc960)";


    return;

  }


  cartHealth.textContent =
    "OK";


  cartHealth.style.color =
    "#279966";


  cartHealthBar.style.width =
    "100%";


  cartHealthBar.style.background =
    "linear-gradient(90deg,#1268f3,#58c5ff)";

}


/* =========================================================
   CRIAÇÃO DOS CARDS
========================================================= */

function criarCardItem(
  item,
  indice
) {

  const dados =
    obterDadosItem(
      item
    );


  const quantidade =
    Math.max(
      1,
      numeroSeguro(
        item.quantidade
      )
    );


  const subtotal =
    dados.preco *
    quantidade;


  const possuiEstoque =
    dados.estoque > 0;


  const ultrapassouEstoque =
    quantidade >
    dados.estoque;


  const estoqueBaixo =
    dados.estoque > 0 &&
    dados.estoque <= 5;


  if (
    !possuiEstoque ||
    ultrapassouEstoque
  ) {

    carrinhoPossuiErroEstoque =
      true;

  }


  const card =
    document.createElement(
      "article"
    );


  card.className =
    "hyper-item";


  card.dataset.idProduto =
    String(
      item.id_produto
    );


  /* =====================================================
     MEDIA
  ===================================================== */

  const media =
    document.createElement(
      "div"
    );


  media.className =
    "hyper-item-media";


  const img =
    document.createElement(
      "img"
    );


  img.src =
    obterImagem(
      dados.imagem
    );


  img.alt =
    dados.nome;


  img.loading =
    "lazy";


  img.addEventListener(
    "error",
    () => {

      if (
        img.src.includes(
          "placeholder.webp"
        )
      ) {

        img.remove();


        const fallback =
          document.createElement(
            "span"
          );


        fallback.className =
          "hyper-image-fallback";


        fallback.innerHTML =
          '<i class="fa-solid fa-gears"></i>';


        media.appendChild(
          fallback
        );


        return;

      }


      img.src =
        PLACEHOLDER_PRODUTO;

    }
  );


  media.appendChild(
    img
  );


  /* =====================================================
     INFO
  ===================================================== */

  const content =
    document.createElement(
      "div"
    );


  content.className =
    "hyper-item-content";


  const status =
    document.createElement(
      "div"
    );


  status.className =
    "hyper-item-status";


  const codigoChip =
    document.createElement(
      "span"
    );


  codigoChip.className =
    "hyper-chip";


  codigoChip.textContent =
    `COD ${dados.codigo}`;


  const estoqueChip =
    document.createElement(
      "span"
    );


  estoqueChip.className =
    "hyper-chip stock";


  if (
    !possuiEstoque
  ) {

    estoqueChip.classList.add(
      "danger"
    );


    estoqueChip.innerHTML =
      '<i class="fa-solid fa-circle-xmark"></i> SEM ESTOQUE';

  } else if (
    ultrapassouEstoque
  ) {

    estoqueChip.classList.add(
      "danger"
    );


    estoqueChip.innerHTML =
      '<i class="fa-solid fa-triangle-exclamation"></i> QUANTIDADE INVÁLIDA';

  } else if (
    estoqueBaixo
  ) {

    estoqueChip.classList.add(
      "warning"
    );


    estoqueChip.innerHTML =
      `<i class="fa-solid fa-bolt"></i> ${dados.estoque} RESTANTES`;

  } else {

    estoqueChip.innerHTML =
      '<i class="fa-solid fa-circle-check"></i> EM ESTOQUE';

  }


  status.append(
    codigoChip,
    estoqueChip
  );


  const titulo =
    document.createElement(
      "h3"
    );


  titulo.textContent =
    dados.nome;


  const specs =
    document.createElement(
      "div"
    );


  specs.className =
    "hyper-item-specs";


  specs.innerHTML = `
    <span>
      <strong>Marca:</strong>
      ${dados.marca}
    </span>

    <span>
      <strong>Categoria:</strong>
      ${dados.categoria}
    </span>

    <span>
      <strong>Estoque:</strong>
      ${dados.estoque}
    </span>
  `;


  const precoUnitario =
    document.createElement(
      "div"
    );


  precoUnitario.className =
    "hyper-item-price";


  precoUnitario.innerHTML = `
    <strong>
      ${formatarMoeda(
        dados.preco
      )}
    </strong>

    <span>
      / unidade
    </span>
  `;


  content.append(
    status,
    titulo,
    specs,
    precoUnitario
  );


  /* =====================================================
     ACTION
  ===================================================== */

  const action =
    document.createElement(
      "div"
    );


  action.className =
    "hyper-item-control";


  const total =
    document.createElement(
      "div"
    );


  total.className =
    "hyper-item-total";


  total.innerHTML = `
    <span>
      SUBTOTAL
    </span>

    <strong data-item-total>
      ${formatarMoeda(
        subtotal
      )}
    </strong>
  `;


  const controls =
    document.createElement(
      "div"
    );


  controls.className =
    "hyper-controls";


  const quantidadeControl =
    document.createElement(
      "div"
    );


  quantidadeControl.className =
    "hyper-quantity";


  const btnMenos =
    document.createElement(
      "button"
    );


  btnMenos.type =
    "button";


  btnMenos.innerHTML =
    '<i class="fa-solid fa-minus"></i>';


  btnMenos.disabled =
    quantidade <= 1;


  const quantidadeSpan =
    document.createElement(
      "span"
    );


  quantidadeSpan.textContent =
    String(
      quantidade
    );


  const btnMais =
    document.createElement(
      "button"
    );


  btnMais.type =
    "button";


  btnMais.innerHTML =
    '<i class="fa-solid fa-plus"></i>';


  btnMais.disabled =
    !possuiEstoque ||
    quantidade >=
      dados.estoque;


  quantidadeControl.append(
    btnMenos,
    quantidadeSpan,
    btnMais
  );


  const btnRemover =
    document.createElement(
      "button"
    );


  btnRemover.type =
    "button";


  btnRemover.className =
    "hyper-remove";


  btnRemover.title =
    "Remover produto";


  btnRemover.innerHTML =
    '<i class="fa-regular fa-trash-can"></i>';


  controls.append(
    quantidadeControl,
    btnRemover
  );


  action.append(
    total,
    controls
  );


  card.append(
    media,
    content,
    action
  );


  /* =====================================================
     ALERTA
  ===================================================== */

  if (
    !possuiEstoque ||
    ultrapassouEstoque
  ) {

    const alerta =
      document.createElement(
        "div"
      );


    alerta.className =
      "hyper-stock-alert";


    alerta.innerHTML =
      !possuiEstoque
        ? `
          <i class="fa-solid fa-triangle-exclamation"></i>

          <span>
            Este produto está sem estoque.
            Remova-o do carrinho para continuar.
          </span>
        `
        : `
          <i class="fa-solid fa-triangle-exclamation"></i>

          <span>
            Seu carrinho possui
            ${quantidade} unidades,
            mas o estoque atual é
            ${dados.estoque}.
            Ajuste a quantidade para continuar.
          </span>
        `;


    card.appendChild(
      alerta
    );

  }


  /* =====================================================
     EVENTO MENOS
  ===================================================== */

  btnMenos.addEventListener(
    "click",
    () => {

      alterarQuantidade(
        item.id_produto,
        -1,
        card,
        quantidadeSpan
      );

    }
  );


  /* =====================================================
     EVENTO MAIS
  ===================================================== */

  btnMais.addEventListener(
    "click",
    () => {

      alterarQuantidade(
        item.id_produto,
        1,
        card,
        quantidadeSpan
      );

    }
  );


  /* =====================================================
     REMOVER
  ===================================================== */

  btnRemover.addEventListener(
    "click",
    () => {

      removerProdutoAnimado(
        item.id_produto,
        card
      );

    }
  );


  /* =====================================================
     ENTRADA DO ITEM
  ===================================================== */

  animar(
    card,
    [
      {
        opacity: 0,
        transform:
          "translateY(22px) scale(.985)"
      },
      {
        opacity: 1,
        transform:
          "translateY(0) scale(1)"
      }
    ],
    {
      duration: 560,
      delay:
        indice * 80,
      easing:
        "cubic-bezier(.16,1,.3,1)",
      fill:
        "both"
    }
  );


  return card;

}


/* =========================================================
   RENDERIZAR CARRINHO
========================================================= */

function renderizarCarrinho(
  animarResumo = true
) {

  const carrinho =
    obterCarrinho();


  carrinhoPossuiErroEstoque =
    false;


  if (
    listaCarrinho
  ) {

    listaCarrinho.innerHTML =
      "";

  }


  /* =====================================================
     VAZIO
  ===================================================== */

  if (
    carrinho.length === 0
  ) {

    if (
      cartMainLayout
    ) {

      cartMainLayout.style.display =
        "none";

    }


    if (
      cartToolsArea
    ) {

      cartToolsArea.style.display =
        "none";

    }


    if (
      cartEmptyState
    ) {

      cartEmptyState.hidden =
        false;


      animar(
        cartEmptyState,
        [
          {
            opacity: 0,
            transform:
              "translateY(20px)"
          },
          {
            opacity: 1,
            transform:
              "translateY(0)"
          }
        ],
        {
          duration: 600,
          easing:
            "cubic-bezier(.16,1,.3,1)"
        }
      );

    }


    if (
      recommendationsSection
    ) {

      recommendationsSection
        .style.display =
          "none";

    }


    atualizarResumo(
      animarResumo
    );


    return;

  }


  /* =====================================================
     COM ITENS
  ===================================================== */

  if (
    cartMainLayout
  ) {

    cartMainLayout.style.display =
      "grid";

  }


  if (
    cartToolsArea
  ) {

    cartToolsArea.style.display =
      "grid";

  }


  if (
    cartEmptyState
  ) {

    cartEmptyState.hidden =
      true;

  }


  if (
    recommendationsSection
  ) {

    recommendationsSection
      .style.display =
        "block";

  }


  carrinho.forEach(
    (
      item,
      indice
    ) => {

      listaCarrinho?.appendChild(
        criarCardItem(
          item,
          indice
        )
      );

    }
  );


  atualizarResumo(
    animarResumo
  );


  renderizarRecomendacoes();

}


/* =========================================================
   ALTERAR QUANTIDADE
========================================================= */

function alterarQuantidade(
  idProduto,
  delta,
  card = null,
  numeroElemento = null
) {

  const carrinho =
    obterCarrinho();


  const item =
    carrinho.find(
      produto =>
        Number(
          produto.id_produto
        ) ===
        Number(
          idProduto
        )
    );


  if (!item) {
    return;
  }


  const dados =
    obterDadosItem(
      item
    );


  const atual =
    Math.max(
      1,
      numeroSeguro(
        item.quantidade
      )
    );


  const nova =
    atual +
    delta;


  if (
    nova < 1
  ) {

    return;

  }


  if (
    nova >
    dados.estoque
  ) {

    mostrarToast(
      `Máximo disponível: ${dados.estoque} unidade${dados.estoque === 1 ? "" : "s"}.`,
      "warning"
    );


    animar(
      card,
      [
        {
          transform:
            "translateX(0)"
        },
        {
          transform:
            "translateX(-5px)"
        },
        {
          transform:
            "translateX(5px)"
        },
        {
          transform:
            "translateX(-3px)"
        },
        {
          transform:
            "translateX(0)"
        }
      ],
      {
        duration: 300
      }
    );


    return;

  }


  item.quantidade =
    nova;


  /*
    Atualiza preço conforme catálogo.
  */

  item.preco_produto =
    dados.preco;


  item.quantidade_estoque =
    dados.estoque;


  salvarCarrinho(
    carrinho
  );


  /* =====================================================
     ANIMAÇÃO DO CONTADOR ANTES DO RENDER
  ===================================================== */

  animar(
    numeroElemento,
    delta > 0
      ? [
          {
            transform:
              "translateY(0) scale(1)"
          },
          {
            transform:
              "translateY(-7px) scale(1.25)",
            color:
              "#1268f3"
          },
          {
            transform:
              "translateY(0) scale(1)"
          }
        ]
      : [
          {
            transform:
              "translateY(0) scale(1)"
          },
          {
            transform:
              "translateY(7px) scale(.85)"
          },
          {
            transform:
              "translateY(0) scale(1)"
          }
        ],
    {
      duration: 330,
      easing:
        "cubic-bezier(.2,.8,.2,1)"
    }
  );


  /* =====================================================
     PULSO NA IMAGEM
  ===================================================== */

  const media =
    card?.querySelector(
      ".hyper-item-media"
    );


  animar(
    media,
    [
      {
        transform:
          "scale(1)"
      },
      {
        transform:
          "scale(1.025)",
        boxShadow:
          "0 12px 28px rgba(18,104,243,.12)"
      },
      {
        transform:
          "scale(1)"
      }
    ],
    {
      duration: 400,
      easing:
        "ease-out"
    }
  );


  /*
    Pequeno atraso para a animação do botão
    ser percebida antes da reconstrução.
  */

  setTimeout(
    () => {

      renderizarCarrinho(
        true
      );

    },
    130
  );

}


/* =========================================================
   REMOVER PRODUTO ANIMADO
========================================================= */

async function removerProdutoAnimado(
  idProduto,
  card
) {

  const animacao =
    animar(
      card,
      [
        {
          opacity: 1,
          transform:
            "translateX(0) scale(1)",
          maxHeight:
            `${card.offsetHeight}px`
        },
        {
          opacity: .35,
          transform:
            "translateX(30px) scale(.985)"
        },
        {
          opacity: 0,
          transform:
            "translateX(110px) scale(.96)",
          maxHeight:
            "0px",
          paddingTop:
            "0px",
          paddingBottom:
            "0px"
        }
      ],
      {
        duration: 480,
        easing:
          "cubic-bezier(.4,0,.2,1)",
        fill:
          "forwards"
      }
    );


  if (animacao) {

    try {

      await animacao.finished;

    } catch {
      /* ignorado */
    }

  }


  const carrinho =
    obterCarrinho()
      .filter(
        item =>
          Number(
            item.id_produto
          ) !==
          Number(
            idProduto
          )
      );


  salvarCarrinho(
    carrinho
  );


  recalcularCupom();


  renderizarCarrinho(
    true
  );


  mostrarToast(
    "Produto removido do Smart Cart."
  );

}


/* =========================================================
   MODAL LIMPAR CARRINHO
========================================================= */

function abrirModalLimpar() {

  if (
    obterCarrinho()
      .length === 0
  ) {

    return;

  }


  modalEsvaziarCarrinho
    ?.classList.add(
      "open"
    );


  document.body.style.overflow =
    "hidden";

}


function fecharModalLimpar() {

  modalEsvaziarCarrinho
    ?.classList.remove(
      "open"
    );


  document.body.style.overflow =
    "";

}


/* =========================================================
   LIMPAR TODOS
========================================================= */

async function limparCarrinho() {

  const itens =
    Array.from(
      document.querySelectorAll(
        ".hyper-item"
      )
    );


  /*
    Saída em cascata.
  */

  itens.forEach(
    (
      item,
      indice
    ) => {

      animar(
        item,
        [
          {
            opacity: 1,
            transform:
              "translateX(0)"
          },
          {
            opacity: 0,
            transform:
              "translateX(120px)"
          }
        ],
        {
          duration: 390,
          delay:
            indice * 55,
          easing:
            "cubic-bezier(.4,0,.2,1)",
          fill:
            "forwards"
        }
      );

    }
  );


  fecharModalLimpar();


  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        Math.min(
          650,
          390 +
          itens.length * 55
        )
      )
  );


  salvarCarrinho(
    []
  );


  descontoAtual = 0;

  cupomAplicado = null;


  localStorage.removeItem(
    "cupomCarrinho"
  );


  renderizarCarrinho(
    true
  );


  mostrarToast(
    "Smart Cart limpo."
  );

}


/* =========================================================
   CEP
========================================================= */

function formatarCep(
  valor
) {

  const numeros =
    String(valor || "")
      .replace(
        /\D/g,
        ""
      )
      .slice(
        0,
        8
      );


  if (
    numeros.length <= 5
  ) {

    return numeros;

  }


  return (
    numeros.slice(
      0,
      5
    ) +
    "-" +
    numeros.slice(
      5
    )
  );

}


function cepValido(
  valor
) {

  return /^\d{5}-?\d{3}$/
    .test(
      String(
        valor || ""
      )
    );

}


function calcularFreteFrontend() {

  const cep =
    inputCep?.value
      .trim();


  if (
    !cepValido(
      cep
    )
  ) {

    mostrarResultadoFrete(
      "Informe um CEP válido com 8 dígitos.",
      "error"
    );


    animar(
      inputCep?.closest(
        ".hyper-field"
      ),
      [
        {
          transform:
            "translateX(0)"
        },
        {
          transform:
            "translateX(-4px)"
        },
        {
          transform:
            "translateX(4px)"
        },
        {
          transform:
            "translateX(0)"
        }
      ],
      {
        duration: 260
      }
    );


    return;

  }


  cepAtual =
    formatarCep(
      cep
    );


  localStorage.setItem(
    "cepCarrinho",
    cepAtual
  );


  if (
    btnCalcularFrete
  ) {

    btnCalcularFrete.disabled =
      true;


    btnCalcularFrete.innerHTML =
      `
        <i class="fa-solid fa-circle-notch fa-spin"></i>
        ANALISANDO
      `;

  }


  /*
    Animação do módulo.

    Não inventamos preço de frete:
    o backend/checkout calculará depois.
  */

  const ferramenta =
    inputCep?.closest(
      ".hyper-tool"
    );


  animar(
    ferramenta,
    [
      {
        boxShadow:
          "0 8px 24px rgba(18,42,67,.045)"
      },
      {
        boxShadow:
          "0 15px 36px rgba(18,104,243,.14)"
      },
      {
        boxShadow:
          "0 8px 24px rgba(18,42,67,.045)"
      }
    ],
    {
      duration: 850
    }
  );


  setTimeout(
    () => {

      mostrarResultadoFrete(
        `
          <strong>CEP ${cepAtual} registrado.</strong><br>
          As opções e o valor real da entrega serão
          calculados na etapa de checkout.
        `,
        "success",
        true
      );


      if (
        resumoFrete
      ) {

        resumoFrete.textContent =
          "No checkout";


        animar(
          resumoFrete,
          [
            {
              transform:
                "translateX(-5px)",
              opacity: .4
            },
            {
              transform:
                "translateX(0)",
              opacity: 1,
              color:
                "#5caeff"
            }
          ],
          {
            duration: 420
          }
        );

      }


      if (
        btnCalcularFrete
      ) {

        btnCalcularFrete.disabled =
          false;


        btnCalcularFrete.innerHTML =
          `
            SALVO
            <i class="fa-solid fa-check"></i>
          `;

      }


      mostrarToast(
        "CEP salvo para o checkout."
      );

    },
    750
  );

}


function mostrarResultadoFrete(
  mensagem,
  tipo = "",
  html = false
) {

  if (!resultadoFrete) {
    return;
  }


  resultadoFrete.hidden =
    false;


  resultadoFrete.className =
    "system-response";


  if (tipo) {

    resultadoFrete.classList.add(
      tipo
    );

  }


  if (html) {

    resultadoFrete.innerHTML =
      mensagem;

  } else {

    resultadoFrete.textContent =
      mensagem;

  }


  animar(
    resultadoFrete,
    [
      {
        opacity: 0,
        transform:
          "translateY(-5px)"
      },
      {
        opacity: 1,
        transform:
          "translateY(0)"
      }
    ],
    {
      duration: 340,
      easing:
        "ease-out"
    }
  );

}


/* =========================================================
   CUPOM
========================================================= */

function recalcularCupom() {

  if (
    !cupomAplicado
  ) {

    descontoAtual = 0;

    return;

  }


  const carrinho =
    obterCarrinho();


  let subtotal = 0;


  carrinho.forEach(
    item => {

      const dados =
        obterDadosItem(
          item
        );


      subtotal +=
        dados.preco *
        numeroSeguro(
          item.quantidade
        );

    }
  );


  if (
    cupomAplicado.tipo ===
    "percentual"
  ) {

    descontoAtual =
      subtotal *
      (
        cupomAplicado.valor /
        100
      );

  }

}


function aplicarCupom() {

  const codigo =
    String(
      inputCupom?.value ||
      ""
    )
      .trim()
      .toUpperCase();


  if (!codigo) {

    mostrarResultadoCupom(
      "Digite um código promocional.",
      "error"
    );


    return;

  }


  const cupom =
    CUPONS_FRONTEND[
      codigo
    ];


  if (!cupom) {

    cupomAplicado =
      null;


    descontoAtual =
      0;


    localStorage.removeItem(
      "cupomCarrinho"
    );


    mostrarResultadoCupom(
      "Código não encontrado ou indisponível.",
      "error"
    );


    atualizarResumo(
      true
    );


    return;

  }


  cupomAplicado = {
    codigo,
    ...cupom
  };


  recalcularCupom();


  localStorage.setItem(
    "cupomCarrinho",
    JSON.stringify(
      cupomAplicado
    )
  );


  mostrarResultadoCupom(
    `${cupom.descricao} aplicado ao resumo.`,
    "success"
  );


  atualizarResumo(
    true
  );


  /*
    Efeito visual:
    módulo → resumo
  */

  const ferramenta =
    inputCupom?.closest(
      ".hyper-tool"
    );


  animar(
    ferramenta,
    [
      {
        transform:
          "translateY(0)"
      },
      {
        transform:
          "translateY(-5px)",
        boxShadow:
          "0 18px 38px rgba(38,184,121,.14)"
      },
      {
        transform:
          "translateY(0)"
      }
    ],
    {
      duration: 600,
      easing:
        "cubic-bezier(.2,.8,.2,1)"
    }
  );


  animar(
    resumoDesconto,
    [
      {
        transform:
          "scale(1)",
        color:
          "#5cd39c"
      },
      {
        transform:
          "scale(1.18)",
        color:
          "#26b879"
      },
      {
        transform:
          "scale(1)"
      }
    ],
    {
      duration: 650,
      easing:
        "cubic-bezier(.2,.8,.2,1)"
    }
  );


  mostrarToast(
    `Cupom ${codigo} aplicado.`
  );

}


function mostrarResultadoCupom(
  mensagem,
  tipo = ""
) {

  if (!resultadoCupom) {
    return;
  }


  resultadoCupom.hidden =
    false;


  resultadoCupom.className =
    "system-response";


  if (tipo) {

    resultadoCupom.classList.add(
      tipo
    );

  }


  resultadoCupom.textContent =
    mensagem;


  animar(
    resultadoCupom,
    [
      {
        opacity: 0,
        transform:
          "translateY(-5px)"
      },
      {
        opacity: 1,
        transform:
          "translateY(0)"
      }
    ],
    {
      duration: 340
    }
  );

}


/* =========================================================
   RECUPERAR CUPOM
========================================================= */

function recuperarCupom() {

  try {

    const salvo =
      localStorage.getItem(
        "cupomCarrinho"
      );


    if (!salvo) {
      return;
    }


    const cupom =
      JSON.parse(
        salvo
      );


    if (
      !cupom ||
      !cupom.codigo
    ) {

      return;

    }


    const config =
      CUPONS_FRONTEND[
        cupom.codigo
      ];


    if (!config) {
      return;
    }


    cupomAplicado = {
      codigo:
        cupom.codigo,
      ...config
    };


    recalcularCupom();


    if (
      inputCupom
    ) {

      inputCupom.value =
        cupom.codigo;

    }


    mostrarResultadoCupom(
      `${config.descricao} ativo.`,
      "success"
    );

  } catch {

    localStorage.removeItem(
      "cupomCarrinho"
    );

  }

}


/* =========================================================
   RECUPERAR CEP
========================================================= */

function recuperarCep() {

  const salvo =
    localStorage.getItem(
      "cepCarrinho"
    );


  if (!salvo) {
    return;
  }


  cepAtual =
    formatarCep(
      salvo
    );


  if (
    inputCep
  ) {

    inputCep.value =
      cepAtual;

  }


  if (
    resumoFrete
  ) {

    resumoFrete.textContent =
      "No checkout";

  }

}


/* =========================================================
   RECOMENDAÇÕES
========================================================= */

function obterIdsCarrinho() {

  return new Set(
    obterCarrinho()
      .map(
        item =>
          Number(
            item.id_produto
          )
      )
  );

}


function obterRecomendacoes() {

  const idsCarrinho =
    obterIdsCarrinho();


  const carrinho =
    obterCarrinho();


  const categoriasCarrinho =
    new Set();


  carrinho.forEach(
    item => {

      const dados =
        obterDadosItem(
          item
        );


      categoriasCarrinho.add(
        normalizarTexto(
          dados.categoria
        )
      );

    }
  );


  /*
    Primeiro prioriza produtos de outras categorias
    para complementar a compra.
  */

  const disponiveis =
    produtosCatalogo
      .filter(
        produto =>
          !idsCarrinho.has(
            Number(
              produto.id_produto
            )
          )
      )
      .filter(
        produto =>
          numeroSeguro(
            produto.quantidade_estoque
          ) > 0
      );


  const ordenados =
    [...disponiveis]
      .sort(
        (
          a,
          b
        ) => {

          const categoriaA =
            normalizarTexto(
              obterCampo(
                a,
                [
                  "categoria_produto",
                  "categoria"
                ]
              )
            );


          const categoriaB =
            normalizarTexto(
              obterCampo(
                b,
                [
                  "categoria_produto",
                  "categoria"
                ]
              )
            );


          const aComplementar =
            categoriasCarrinho.has(
              categoriaA
            )
              ? 0
              : 1;


          const bComplementar =
            categoriasCarrinho.has(
              categoriaB
            )
              ? 0
              : 1;


          return (
            bComplementar -
            aComplementar
          );

        }
      );


  return ordenados.slice(
    0,
    4
  );

}


/* =========================================================
   CARD RECOMENDAÇÃO
========================================================= */

function criarCardRecomendacao(
  produto,
  indice
) {

  const categoria =
    obterCampo(
      produto,
      [
        "categoria_produto",
        "categoria"
      ],
      "Autopeças"
    );


  const card =
    document.createElement(
      "article"
    );


  card.className =
    "hyper-recommendation";


  const imagemWrap =
    document.createElement(
      "div"
    );


  imagemWrap.className =
    "hyper-recommendation-image";


  const imagem =
    document.createElement(
      "img"
    );


  imagem.src =
    obterImagem(
      produto.imagem
    );


  imagem.alt =
    produto.nome_produto ||
    "Produto";


  imagem.loading =
    "lazy";


  imagem.addEventListener(
    "error",
    () => {

      imagem.src =
        PLACEHOLDER_PRODUTO;

    },
    {
      once: true
    }
  );


  imagemWrap.appendChild(
    imagem
  );


  const content =
    document.createElement(
      "div"
    );


  content.className =
    "hyper-recommendation-content";


  const categoriaEl =
    document.createElement(
      "span"
    );


  categoriaEl.textContent =
    String(
      categoria
    ).toUpperCase();


  const titulo =
    document.createElement(
      "h3"
    );


  titulo.textContent =
    produto.nome_produto ||
    "Produto";


  const footer =
    document.createElement(
      "div"
    );


  footer.className =
    "hyper-recommendation-footer";


  const preco =
    document.createElement(
      "strong"
    );


  preco.textContent =
    formatarMoeda(
      produto.preco_produto
    );


  const botao =
    document.createElement(
      "button"
    );


  botao.type =
    "button";


  botao.innerHTML =
    `
      <i class="fa-solid fa-plus"></i>
      ADICIONAR
    `;


  botao.addEventListener(
    "click",
    () => {

      adicionarRecomendacao(
        produto,
        card
      );

    }
  );


  footer.append(
    preco,
    botao
  );


  content.append(
    categoriaEl,
    titulo,
    footer
  );


  card.append(
    imagemWrap,
    content
  );


  animar(
    card,
    [
      {
        opacity: 0,
        transform:
          "translateY(18px)"
      },
      {
        opacity: 1,
        transform:
          "translateY(0)"
      }
    ],
    {
      duration: 500,
      delay:
        indice * 90,
      easing:
        "cubic-bezier(.16,1,.3,1)",
      fill:
        "both"
    }
  );


  return card;

}


/* =========================================================
   RENDER RECOMENDAÇÕES
========================================================= */

function renderizarRecomendacoes() {

  if (
    !cartRecommendations
  ) {

    return;

  }


  cartRecommendations.innerHTML =
    "";


  const recomendacoes =
    obterRecomendacoes();


  if (
    recomendacoes.length === 0
  ) {

    if (
      recommendationsSection
    ) {

      recommendationsSection
        .style.display =
          "none";

    }


    return;

  }


  if (
    recommendationsSection
  ) {

    recommendationsSection
      .style.display =
        "block";

  }


  recomendacoes.forEach(
    (
      produto,
      indice
    ) => {

      cartRecommendations.appendChild(
        criarCardRecomendacao(
          produto,
          indice
        )
      );

    }
  );

}


/* =========================================================
   ADICIONAR RECOMENDAÇÃO
========================================================= */

async function adicionarRecomendacao(
  produto,
  card
) {

  const carrinho =
    obterCarrinho();


  const existente =
    carrinho.find(
      item =>
        Number(
          item.id_produto
        ) ===
        Number(
          produto.id_produto
        )
    );


  const estoque =
    numeroSeguro(
      produto.quantidade_estoque
    );


  if (
    estoque <= 0
  ) {

    mostrarToast(
      "Produto indisponível.",
      "warning"
    );


    return;

  }


  if (existente) {

    if (
      numeroSeguro(
        existente.quantidade
      ) >=
      estoque
    ) {

      mostrarToast(
        "Limite de estoque atingido.",
        "warning"
      );


      return;

    }


    existente.quantidade =
      numeroSeguro(
        existente.quantidade
      ) + 1;

  } else {

    carrinho.push({

      id_produto:
        produto.id_produto,

      nome_produto:
        produto.nome_produto,

      preco_produto:
        numeroSeguro(
          produto.preco_produto
        ),

      quantidade_estoque:
        estoque,

      imagem:
        produto.imagem ||
        null,

      quantidade: 1

    });

  }


  /*
    Animação do card sendo enviado
    para o carrinho.
  */

  const animacao =
    animar(
      card,
      [
        {
          transform:
            "translateY(0) scale(1)",
          opacity: 1
        },
        {
          transform:
            "translateY(-12px) scale(1.03)",
          opacity: .8
        },
        {
          transform:
            "translateY(-25px) scale(.86)",
          opacity: 0
        }
      ],
      {
        duration: 450,
        easing:
          "cubic-bezier(.4,0,.2,1)"
      }
    );


  if (animacao) {

    try {

      await animacao.finished;

    } catch {
      /* vazio */
    }

  }


  salvarCarrinho(
    carrinho
  );


  recalcularCupom();


  renderizarCarrinho(
    true
  );


  /*
    Destaca o módulo principal.
  */

  animar(
    document.querySelector(
      ".cart-module"
    ),
    [
      {
        boxShadow:
          "0 15px 40px rgba(18,42,67,.07)"
      },
      {
        boxShadow:
          "0 20px 48px rgba(18,104,243,.16)"
      },
      {
        boxShadow:
          "0 15px 40px rgba(18,42,67,.07)"
      }
    ],
    {
      duration: 700
    }
  );


  mostrarToast(
    "Produto adicionado ao Smart Cart."
  );

}


/* =========================================================
   CHECKOUT
========================================================= */

function irParaCheckout() {

  const carrinho =
    obterCarrinho();


  if (
    carrinho.length === 0
  ) {

    mostrarToast(
      "Seu carrinho está vazio.",
      "warning"
    );


    return;

  }


  if (
    carrinhoPossuiErroEstoque
  ) {

    mostrarToast(
      "Corrija os alertas de estoque antes de continuar.",
      "warning"
    );


    document
      .querySelector(
        ".hyper-stock-alert"
      )
      ?.scrollIntoView({
        behavior:
          "smooth",
        block:
          "center"
      });


    return;

  }


  /*
    Guarda uma fotografia do resumo
    para o checkout consumir depois.

    O backend será responsável pela
    validação definitiva posteriormente.
  */

  const totais =
    calcularTotais();


  const checkoutPreview = {

    subtotal:
      totais.subtotal,

    desconto:
      totais.desconto,

    total:
      totais.total,

    cupom:
      cupomAplicado
        ?.codigo ||
      null,

    cep:
      cepAtual ||
      null

  };


  sessionStorage.setItem(
    "checkoutPreview",
    JSON.stringify(
      checkoutPreview
    )
  );


  /*
    Animação de saída do botão.
  */

  btnFinalizar.disabled =
    true;


  const textoOriginal =
    btnFinalizar.innerHTML;


  btnFinalizar.innerHTML = `
    <span class="checkout-light"></span>

    <span class="hyper-checkout-copy">

      <small>
        SISTEMA
      </small>

      <strong>
        Preparando checkout...
      </strong>

    </span>

    <span class="hyper-checkout-icon">

      <i class="fa-solid fa-circle-notch fa-spin"></i>

    </span>
  `;


  animar(
    btnFinalizar,
    [
      {
        transform:
          "scale(1)"
      },
      {
        transform:
          "scale(.985)"
      },
      {
        transform:
          "scale(1.01)",
        boxShadow:
          "0 18px 42px rgba(17,106,243,.38)"
      },
      {
        transform:
          "scale(1)"
      }
    ],
    {
      duration: 650
    }
  );


  /*
    Pequena transição de interface.
  */

  setTimeout(
    () => {

      window.location.href =
        "checkout.html";

    },
    650
  );


  /*
    Segurança se a navegação for
    interrompida pelo navegador.
  */

  setTimeout(
    () => {

      btnFinalizar.disabled =
        false;


      btnFinalizar.innerHTML =
        textoOriginal;

    },
    1800
  );

}


/* =========================================================
   CARREGAR CATÁLOGO
========================================================= */

async function carregarCatalogo() {

  try {

    const resposta =
      await fetch(
        `${API}/produtos`
      );


    if (
      !resposta.ok
    ) {

      throw new Error(
        "API de produtos indisponível"
      );

    }


    const dados =
      await resposta.json();


    if (
      !Array.isArray(
        dados
      )
    ) {

      throw new Error(
        "Formato inválido"
      );

    }


    produtosCatalogo =
      dados;


    localStorage.setItem(
      "produtosMock",
      JSON.stringify(
        dados
      )
    );

  } catch (erro) {

    console.warn(
      "Usando cache local de produtos:",
      erro
    );


    produtosCatalogo =
      obterProdutosCache();

  }


  /*
    Sincroniza o carrinho com o estoque
    e preço atualmente conhecidos.
  */

  sincronizarCarrinhoCatalogo();

}


/* =========================================================
   SINCRONIZAR CARRINHO
========================================================= */

function sincronizarCarrinhoCatalogo() {

  const carrinho =
    obterCarrinho();


  if (
    carrinho.length === 0 ||
    produtosCatalogo.length === 0
  ) {

    return;

  }


  let mudou =
    false;


  carrinho.forEach(
    item => {

      const produto =
        encontrarProdutoCatalogo(
          item.id_produto
        );


      if (!produto) {
        return;
      }


      const preco =
        numeroSeguro(
          produto.preco_produto
        );


      const estoque =
        numeroSeguro(
          produto.quantidade_estoque
        );


      if (
        numeroSeguro(
          item.preco_produto
        ) !==
        preco
      ) {

        item.preco_produto =
          preco;


        mudou =
          true;

      }


      if (
        numeroSeguro(
          item.quantidade_estoque
        ) !==
        estoque
      ) {

        item.quantidade_estoque =
          estoque;


        mudou =
          true;

      }


      if (
        produto.imagem &&
        produto.imagem !==
          item.imagem
      ) {

        item.imagem =
          produto.imagem;


        mudou =
          true;

      }

    }
  );


  if (mudou) {

    salvarCarrinho(
      carrinho
    );

  }

}


/* =========================================================
   INTERSECTION ANIMATIONS
========================================================= */

function configurarAnimacoesScroll() {

  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {

    return;

  }


  const elementos =
    document.querySelectorAll(
      [
        ".cart-module",
        ".command-summary",
        ".system-status-card",
        ".hyper-tool",
        ".recommendation-title",
        ".trust-terminal"
      ].join(",")
    );


  const observer =
    new IntersectionObserver(
      entradas => {

        entradas.forEach(
          entrada => {

            if (
              !entrada.isIntersecting
            ) {

              return;

            }


            animar(
              entrada.target,
              [
                {
                  opacity: 0,
                  transform:
                    "translateY(28px)"
                },
                {
                  opacity: 1,
                  transform:
                    "translateY(0)"
                }
              ],
              {
                duration: 650,
                easing:
                  "cubic-bezier(.16,1,.3,1)",
                fill:
                  "both"
              }
            );


            observer.unobserve(
              entrada.target
            );

          }
        );

      },
      {
        threshold: .12
      }
    );


  elementos.forEach(
    elemento => {

      observer.observe(
        elemento
      );

    }
  );

}


/* =========================================================
   CURSOR / DASHBOARD PARALLAX
========================================================= */

function configurarDashboardInterativo() {

  const dashboard =
    document.querySelector(
      ".hyper-dashboard"
    );


  if (
    !dashboard ||
    window.matchMedia(
      "(pointer: coarse)"
    ).matches
  ) {

    return;

  }


  dashboard.addEventListener(
    "mousemove",
    event => {

      const rect =
        dashboard.getBoundingClientRect();


      const x =
        (
          event.clientX -
          rect.left
        ) /
        rect.width;


      const y =
        (
          event.clientY -
          rect.top
        ) /
        rect.height;


      const rotacaoY =
        (
          x -
          .5
        ) *
        5;


      const rotacaoX =
        (
          .5 -
          y
        ) *
        4;


      dashboard.style.transform =
        `
          perspective(900px)
          rotateX(${rotacaoX}deg)
          rotateY(${rotacaoY}deg)
          translateY(-3px)
        `;

    }
  );


  dashboard.addEventListener(
    "mouseleave",
    () => {

      dashboard.style.transform =
        "";

    }
  );

}


/* =========================================================
   EVENTOS
========================================================= */

btnEsvaziarCarrinho
  ?.addEventListener(
    "click",
    abrirModalLimpar
  );


btnCancelarEsvaziar
  ?.addEventListener(
    "click",
    fecharModalLimpar
  );


cartModalBackdrop
  ?.addEventListener(
    "click",
    fecharModalLimpar
  );


btnConfirmarEsvaziar
  ?.addEventListener(
    "click",
    limparCarrinho
  );


btnFinalizar
  ?.addEventListener(
    "click",
    irParaCheckout
  );


btnCalcularFrete
  ?.addEventListener(
    "click",
    calcularFreteFrontend
  );


btnAplicarCupom
  ?.addEventListener(
    "click",
    aplicarCupom
  );


inputCep
  ?.addEventListener(
    "input",
    event => {

      event.target.value =
        formatarCep(
          event.target.value
        );

    }
  );


inputCep
  ?.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        event.preventDefault();


        calcularFreteFrontend();

      }

    }
  );


inputCupom
  ?.addEventListener(
    "input",
    event => {

      event.target.value =
        event.target.value
          .toUpperCase();

    }
  );


inputCupom
  ?.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        event.preventDefault();


        aplicarCupom();

      }

    }
  );


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      fecharModalLimpar();

    }

  }
);


/* =========================================================
   STORAGE ENTRE ABAS
========================================================= */

window.addEventListener(
  "storage",
  event => {

    if (
      event.key === "carrinho"
    ) {

      recalcularCupom();


      renderizarCarrinho(
        true
      );

    }

  }
);


/* =========================================================
   PAGE VISIBILITY
========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      !document.hidden
    ) {

      /*
        Caso o carrinho tenha sido
        alterado em outra aba.
      */

      renderizarCarrinho(
        false
      );

    }

  }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function iniciarSmartCart() {

  /*
    Recupera estados auxiliares.
  */

  recuperarCupom();

  recuperarCep();


  /*
    Carrega preços e estoque.
  */

  await carregarCatalogo();


  /*
    Render inicial sem animação
    numérica exagerada.
  */

  recalcularCupom();


  renderizarCarrinho(
    false
  );


  /*
    Motion do restante da interface.
  */

  configurarAnimacoesScroll();

  configurarDashboardInterativo();


  /*
    Atualiza contador global.
  */

  if (
    window.SiteUI &&
    typeof window.SiteUI
      .atualizarCarrinho ===
      "function"
  ) {

    window.SiteUI
      .atualizarCarrinho();

  }

}


/* =========================================================
   START
========================================================= */

iniciarSmartCart();
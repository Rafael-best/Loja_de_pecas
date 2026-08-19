/* =========================================================
   INDEX.JS
   VELOCITY AUTOMOTIVE HOME
   Loja de Peças
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const API =
  "http://localhost:3000/api";

const CAMINHO_IMAGENS =
  "assets/images/produtos";

const PLACEHOLDER_PRODUTO =
  `${CAMINHO_IMAGENS}/placeholder.webp`;


/* =========================================================
   ESTADO
========================================================= */

let produtosHome = [];

let produtosDestaque = [];

let slideAtual = 0;

let quantidadePorTela = 4;

let animacoesIniciadas = false;


/* =========================================================
   ELEMENTOS
========================================================= */

const featuredProducts =
  document.getElementById(
    "featuredProducts"
  );

const featuredPrev =
  document.getElementById(
    "featuredPrev"
  );

const featuredNext =
  document.getElementById(
    "featuredNext"
  );

const openHeroSearch =
  document.getElementById(
    "openHeroSearch"
  );

const closeHeroSearch =
  document.getElementById(
    "closeHeroSearch"
  );

const heroSearchPanel =
  document.getElementById(
    "heroSearchPanel"
  );

const heroSmartSearchForm =
  document.getElementById(
    "heroSmartSearchForm"
  );

const heroSmartSearchInput =
  document.getElementById(
    "heroSmartSearchInput"
  );

const homeToast =
  document.getElementById(
    "homeToast"
  );

const heroMachine =
  document.querySelector(
    ".hero-machine"
  );

const rotorDisc =
  document.querySelector(
    ".rotor-disc"
  );

const velocityHero =
  document.querySelector(
    ".velocity-hero"
  );


/* =========================================================
   UTILITÁRIOS
========================================================= */

function numeroSeguro(valor) {

  const numero =
    Number(valor);

  return Number.isFinite(numero)
    ? numero
    : 0;

}


function formatarMoeda(valor) {

  return numeroSeguro(
    valor
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

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
      valor !== undefined &&
      valor !== null &&
      String(valor).trim() !== ""
    ) {

      return valor;

    }

  }


  return padrao;

}


/* =========================================================
   IMAGENS
========================================================= */

function obterImagem(
  imagem
) {

  const valor =
    String(
      imagem || ""
    ).trim();


  if (!valor) {
    return PLACEHOLDER_PRODUTO;
  }


  if (
    valor.startsWith("http://") ||
    valor.startsWith("https://") ||
    valor.startsWith("data:")
  ) {

    return valor;

  }


  const nome =
    valor
      .split(/[\\/]/)
      .pop();


  if (!nome) {
    return PLACEHOLDER_PRODUTO;
  }


  return (
    `${CAMINHO_IMAGENS}/` +
    encodeURIComponent(nome)
  );

}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function obterCarrinho() {

  try {

    const salvo =
      localStorage.getItem(
        "carrinho"
      );


    if (!salvo) {
      return [];
    }


    const carrinho =
      JSON.parse(
        salvo
      );


    return Array.isArray(carrinho)
      ? carrinho
      : [];

  } catch {

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
   TOAST
========================================================= */

let toastTimer = null;


function mostrarToast(
  mensagem,
  tipo = "success"
) {

  if (!homeToast) {
    return;
  }


  clearTimeout(
    toastTimer
  );


  homeToast.classList.remove(
    "show",
    "error"
  );


  if (
    tipo === "error"
  ) {

    homeToast.classList.add(
      "error"
    );

  }


  homeToast.textContent =
    mensagem;


  void homeToast.offsetWidth;


  homeToast.classList.add(
    "show"
  );


  toastTimer =
    setTimeout(
      () => {

        homeToast.classList.remove(
          "show"
        );

      },
      2500
    );

}


/* =========================================================
   ANIMAÇÃO SEGURA
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
   CONTADORES
========================================================= */

function animarContador(
  elemento
) {

  if (!elemento) {
    return;
  }


  const alvo =
    numeroSeguro(
      elemento.dataset.countTarget
    );


  const sufixo =
    elemento.dataset.countSuffix ||
    "";


  const inicio =
    performance.now();


  const duracao =
    1300;


  function frame(
    tempo
  ) {

    const progresso =
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
        1 - progresso,
        4
      );


    const atual =
      Math.round(
        alvo *
        easing
      );


    elemento.textContent =
      `${atual}${sufixo}`;


    if (
      progresso < 1
    ) {

      requestAnimationFrame(
        frame
      );

    }

  }


  requestAnimationFrame(
    frame
  );

}


/* =========================================================
   OBSERVADOR DOS CONTADORES
========================================================= */

function configurarContadores() {

  const contadores =
    document.querySelectorAll(
      "[data-count-target]"
    );


  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {

    contadores.forEach(
      animarContador
    );

    return;

  }


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


            animarContador(
              entrada.target
            );


            observer.unobserve(
              entrada.target
            );

          }
        );

      },
      {
        threshold: .6
      }
    );


  contadores.forEach(
    contador =>
      observer.observe(
        contador
      )
  );

}


/* =========================================================
   CATEGORIAS
========================================================= */

function configurarAnimacaoCategorias() {

  const categorias =
    document.querySelectorAll(
      ".velocity-category"
    );


  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {

    categorias.forEach(
      categoria =>
        categoria.classList.add(
          "category-visible"
        )
    );

    return;

  }


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


            const elemento =
              entrada.target;


            const indice =
              Number(
                elemento.dataset.index ||
                0
              );


            setTimeout(
              () => {

                elemento.classList.add(
                  "category-visible"
                );

              },
              indice * 100
            );


            observer.unobserve(
              elemento
            );

          }
        );

      },
      {
        threshold: .12
      }
    );


  categorias.forEach(
    (
      categoria,
      indice
    ) => {

      categoria.dataset.index =
        indice;


      observer.observe(
        categoria
      );

    }
  );

}


/* =========================================================
   BENEFÍCIOS
========================================================= */

function configurarAnimacaoBeneficios() {

  const cards =
    document.querySelectorAll(
      ".benefits-grid article"
    );


  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {

    cards.forEach(
      card =>
        card.classList.add(
          "benefit-visible"
        )
    );

    return;

  }


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


            const indice =
              Number(
                entrada.target.dataset.index ||
                0
              );


            setTimeout(
              () => {

                entrada.target
                  .classList.add(
                    "benefit-visible"
                  );

              },
              indice * 120
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


  cards.forEach(
    (
      card,
      indice
    ) => {

      card.dataset.index =
        indice;


      observer.observe(
        card
      );

    }
  );

}


/* =========================================================
   EXPERIENCE SECTION
========================================================= */

function configurarExperience() {

  const visual =
    document.querySelector(
      ".experience-visual"
    );

  const content =
    document.querySelector(
      ".experience-content"
    );


  if (
    !visual ||
    !content
  ) {
    return;
  }


  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {

    visual.classList.add(
      "experience-visible"
    );

    content.classList.add(
      "experience-content-visible"
    );

    return;

  }


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


            visual.classList.add(
              "experience-visible"
            );


            setTimeout(
              () => {

                content.classList.add(
                  "experience-content-visible"
                );

              },
              220
            );


            observer.disconnect();

          }
        );

      },
      {
        threshold: .18
      }
    );


  observer.observe(
    visual
  );

}


/* =========================================================
   PARALLAX DO HERO
========================================================= */

function configurarParallaxHero() {

  if (
    !velocityHero ||
    window.matchMedia(
      "(pointer: coarse)"
    ).matches
  ) {

    return;

  }


  velocityHero.addEventListener(
    "mousemove",
    evento => {

      const rect =
        velocityHero
          .getBoundingClientRect();


      const x =
        (
          evento.clientX -
          rect.left
        ) /
        rect.width;


      const y =
        (
          evento.clientY -
          rect.top
        ) /
        rect.height;


      const deslocamentoX =
        (
          x -
          .5
        ) *
        18;


      const deslocamentoY =
        (
          y -
          .5
        ) *
        12;


      const lightA =
        document.querySelector(
          ".hero-light-a"
        );


      const lightB =
        document.querySelector(
          ".hero-light-b"
        );


      const machine =
        document.querySelector(
          ".hero-machine"
        );


      if (lightA) {

        lightA.style.transform =
          `
            translate(
              ${-deslocamentoX}px,
              ${-deslocamentoY}px
            )
          `;

      }


      if (lightB) {

        lightB.style.transform =
          `
            translate(
              ${deslocamentoX}px,
              ${deslocamentoY}px
            )
          `;

      }


      if (machine) {

        machine.style.transform =
          `
            translate(
              ${deslocamentoX * .35}px,
              ${deslocamentoY * .35}px
            )
            rotateX(${deslocamentoY * -.08}deg)
            rotateY(${deslocamentoX * .08}deg)
          `;

      }

    }
  );


  velocityHero.addEventListener(
    "mouseleave",
    () => {

      const lightA =
        document.querySelector(
          ".hero-light-a"
        );


      const lightB =
        document.querySelector(
          ".hero-light-b"
        );


      if (lightA) {
        lightA.style.transform = "";
      }


      if (lightB) {
        lightB.style.transform = "";
      }


      if (heroMachine) {
        heroMachine.style.transform = "";
      }

    }
  );

}


/* =========================================================
   ROTOR RESPONSIVO AO MOUSE
========================================================= */

function configurarRotorInterativo() {

  if (
    !heroMachine ||
    !rotorDisc ||
    window.matchMedia(
      "(pointer: coarse)"
    ).matches
  ) {

    return;

  }


  let rotacaoAtual = 720;


  heroMachine.addEventListener(
    "mouseenter",
    () => {

      rotacaoAtual +=
        90;


      rotorDisc.style.transition =
        "transform .7s cubic-bezier(.16,1,.3,1)";


      rotorDisc.style.transform =
        `rotate(${rotacaoAtual}deg)`;

    }
  );


  heroMachine.addEventListener(
    "mousemove",
    evento => {

      const rect =
        heroMachine
          .getBoundingClientRect();


      const x =
        (
          evento.clientX -
          rect.left
        ) /
        rect.width;


      const rotacaoExtra =
        (
          x -
          .5
        ) *
        12;


      rotorDisc.style.transform =
        `
          rotate(
            ${rotacaoAtual + rotacaoExtra}deg
          )
        `;

    }
  );


  heroMachine.addEventListener(
    "mouseleave",
    () => {

      rotorDisc.style.transform =
        `rotate(${rotacaoAtual}deg)`;

    }
  );

}


/* =========================================================
   HERO SEARCH
========================================================= */

function abrirBuscaHero() {

  if (!heroSearchPanel) {
    return;
  }


  heroSearchPanel.hidden =
    false;


  animar(
    heroSearchPanel,
    [
      {
        opacity: 0,
        transform:
          "translateY(-20px)"
      },
      {
        opacity: 1,
        transform:
          "translateY(0)"
      }
    ],
    {
      duration: 380,
      easing:
        "cubic-bezier(.16,1,.3,1)"
    }
  );


  setTimeout(
    () => {

      heroSmartSearchInput
        ?.focus();

    },
    250
  );

}


function fecharBuscaHero() {

  if (!heroSearchPanel) {
    return;
  }


  const animacao =
    animar(
      heroSearchPanel,
      [
        {
          opacity: 1,
          transform:
            "translateY(0)"
        },
        {
          opacity: 0,
          transform:
            "translateY(-15px)"
        }
      ],
      {
        duration: 260,
        easing:
          "ease"
      }
    );


  if (
    animacao
  ) {

    animacao.finished
      .then(
        () => {

          heroSearchPanel.hidden =
            true;

        }
      )
      .catch(
        () => {

          heroSearchPanel.hidden =
            true;

        }
      );

  } else {

    heroSearchPanel.hidden =
      true;

  }

}


/* =========================================================
   SUBMIT SEARCH
========================================================= */

function executarBuscaHero(
  evento
) {

  evento.preventDefault();


  const termo =
    heroSmartSearchInput
      ?.value
      .trim();


  if (!termo) {

    mostrarToast(
      "Digite o nome de uma peça.",
      "error"
    );

    return;

  }


  window.location.href =
    `produtos.html?busca=${encodeURIComponent(termo)}`;

}


/* =========================================================
   CARREGAR PRODUTOS
========================================================= */

async function carregarProdutosHome() {

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


    produtosHome =
      dados;


    localStorage.setItem(
      "produtosMock",
      JSON.stringify(
        dados
      )
    );


  } catch (erro) {

    console.warn(
      "Home usando cache local:",
      erro
    );


    try {

      produtosHome =
        JSON.parse(
          localStorage.getItem(
            "produtosMock"
          )
        ) || [];

    } catch {

      produtosHome = [];

    }

  }


  prepararProdutosDestaque();

}


/* =========================================================
   PREPARAR DESTAQUES
========================================================= */

function prepararProdutosDestaque() {

  produtosDestaque =
    produtosHome
      .filter(
        produto =>
          numeroSeguro(
            produto.quantidade_estoque
          ) > 0
      )
      .slice(
        0,
        12
      );


  slideAtual = 0;


  atualizarQuantidadePorTela();


  renderizarProdutosDestaque();

}


/* =========================================================
   QUANTIDADE POR TELA
========================================================= */

function atualizarQuantidadePorTela() {

  const largura =
    window.innerWidth;


  if (
    largura <= 700
  ) {

    quantidadePorTela = 1;

  } else if (
    largura <= 950
  ) {

    quantidadePorTela = 2;

  } else if (
    largura <= 1180
  ) {

    quantidadePorTela = 3;

  } else {

    quantidadePorTela = 4;

  }

}


/* =========================================================
   CARD DO PRODUTO
========================================================= */

function criarCardProduto(
  produto,
  indice
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "velocity-product";


  card.dataset.idProduto =
    produto.id_produto;


  const categoria =
    obterCampo(
      produto,
      [
        "categoria_produto",
        "categoria"
      ],
      "Autopeças"
    );


  const imageWrapper =
    document.createElement(
      "div"
    );


  imageWrapper.className =
    "velocity-product-image";


  const img =
    document.createElement(
      "img"
    );


  img.src =
    obterImagem(
      produto.imagem
    );


  img.alt =
    produto.nome_produto ||
    "Produto";


  img.loading =
    "lazy";


  img.addEventListener(
    "error",
    () => {

      img.src =
        PLACEHOLDER_PRODUTO;

    },
    {
      once: true
    }
  );


  imageWrapper.appendChild(
    img
  );


  const content =
    document.createElement(
      "div"
    );


  content.className =
    "velocity-product-content";


  const categoriaEl =
    document.createElement(
      "span"
    );


  categoriaEl.className =
    "velocity-product-category";


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
    "velocity-product-footer";


  const price =
    document.createElement(
      "div"
    );


  price.className =
    "velocity-product-price";


  price.innerHTML = `
    <small>
      A PARTIR DE
    </small>

    <strong>
      ${formatarMoeda(
        produto.preco_produto
      )}
    </strong>
  `;


  const btn =
    document.createElement(
      "button"
    );


  btn.type =
    "button";


  btn.className =
    "velocity-product-add";


  btn.title =
    "Adicionar ao carrinho";


  btn.innerHTML =
    '<i class="fa-solid fa-plus"></i>';


  btn.addEventListener(
    "click",
    evento => {

      evento.preventDefault();

      evento.stopPropagation();


      adicionarProdutoAoCarrinho(
        produto,
        card,
        img
      );

    }
  );


  footer.append(
    price,
    btn
  );


  content.append(
    categoriaEl,
    titulo,
    footer
  );


  card.append(
    imageWrapper,
    content
  );


  card.addEventListener(
    "click",
    () => {

      window.location.href =
        `produto.html?id=${produto.id_produto}`;

    }
  );


  setTimeout(
    () => {

      card.classList.add(
        "product-visible"
      );

    },
    indice * 90
  );


  return card;

}


/* =========================================================
   RENDER DESTAQUES
========================================================= */

function renderizarProdutosDestaque() {

  if (!featuredProducts) {
    return;
  }


  featuredProducts.innerHTML =
    "";


  if (
    produtosDestaque.length === 0
  ) {

    featuredProducts.innerHTML = `
      <div style="
        grid-column:1/-1;
        padding:30px;
        text-align:center;
        color:#7890a7;
      ">
        Nenhum produto disponível no momento.
      </div>
    `;


    return;

  }


  const inicio =
    slideAtual;


  const fim =
    inicio +
    quantidadePorTela;


  let visiveis =
    produtosDestaque.slice(
      inicio,
      fim
    );


  if (
    visiveis.length <
      quantidadePorTela &&
    produtosDestaque.length >
      quantidadePorTela
  ) {

    const faltam =
      quantidadePorTela -
      visiveis.length;


    visiveis =
      visiveis.concat(
        produtosDestaque.slice(
          0,
          faltam
        )
      );

  }


  visiveis.forEach(
    (
      produto,
      indice
    ) => {

      featuredProducts.appendChild(
        criarCardProduto(
          produto,
          indice
        )
      );

    }
  );

}


/* =========================================================
   PRÓXIMO / ANTERIOR
========================================================= */

function avancarProdutos() {

  if (
    produtosDestaque.length <=
    quantidadePorTela
  ) {

    return;

  }


  animar(
    featuredProducts,
    [
      {
        opacity: 1,
        transform:
          "translateX(0)"
      },
      {
        opacity: .25,
        transform:
          "translateX(-35px)"
      }
    ],
    {
      duration: 180,
      easing: "ease"
    }
  );


  setTimeout(
    () => {

      slideAtual =
        (
          slideAtual + 1
        ) %
        produtosDestaque.length;


      renderizarProdutosDestaque();


      animar(
        featuredProducts,
        [
          {
            opacity: .2,
            transform:
              "translateX(35px)"
          },
          {
            opacity: 1,
            transform:
              "translateX(0)"
          }
        ],
        {
          duration: 300,
          easing:
            "cubic-bezier(.16,1,.3,1)"
        }
      );

    },
    160
  );

}


function voltarProdutos() {

  if (
    produtosDestaque.length <=
    quantidadePorTela
  ) {

    return;

  }


  animar(
    featuredProducts,
    [
      {
        opacity: 1,
        transform:
          "translateX(0)"
      },
      {
        opacity: .25,
        transform:
          "translateX(35px)"
      }
    ],
    {
      duration: 180
    }
  );


  setTimeout(
    () => {

      slideAtual =
        (
          slideAtual -
          1 +
          produtosDestaque.length
        ) %
        produtosDestaque.length;


      renderizarProdutosDestaque();


      animar(
        featuredProducts,
        [
          {
            opacity: .2,
            transform:
              "translateX(-35px)"
          },
          {
            opacity: 1,
            transform:
              "translateX(0)"
          }
        ],
        {
          duration: 300,
          easing:
            "cubic-bezier(.16,1,.3,1)"
        }
      );

    },
    160
  );

}


/* =========================================================
   ANIMAÇÃO PRODUTO → CARRINHO
========================================================= */

function animarProdutoAteCarrinho(
  imagemOrigem
) {

  const cartButton =
    document.querySelector(
      ".cart-button"
    );


  if (
    !imagemOrigem ||
    !cartButton
  ) {

    return;

  }


  const origem =
    imagemOrigem
      .getBoundingClientRect();


  const destino =
    cartButton
      .getBoundingClientRect();


  const clone =
    imagemOrigem
      .cloneNode(
        true
      );


  clone.style.position =
    "fixed";


  clone.style.left =
    `${origem.left}px`;


  clone.style.top =
    `${origem.top}px`;


  clone.style.width =
    `${origem.width}px`;


  clone.style.height =
    `${origem.height}px`;


  clone.style.objectFit =
    "contain";


  clone.style.zIndex =
    "99999";


  clone.style.pointerEvents =
    "none";


  clone.style.filter =
    "drop-shadow(0 15px 20px rgba(18,42,67,.25))";


  document.body.appendChild(
    clone
  );


  const deltaX =
    destino.left +
    destino.width / 2 -
    (
      origem.left +
      origem.width / 2
    );


  const deltaY =
    destino.top +
    destino.height / 2 -
    (
      origem.top +
      origem.height / 2
    );


  const animacao =
    clone.animate(
      [
        {
          transform:
            "translate(0,0) scale(1)",
          opacity: 1
        },
        {
          transform:
            `translate(${deltaX * .45}px, ${deltaY * .35 - 70}px) scale(.75)`,
          opacity: .85
        },
        {
          transform:
            `translate(${deltaX}px, ${deltaY}px) scale(.12)`,
          opacity: 0
        }
      ],
      {
        duration: 760,
        easing:
          "cubic-bezier(.4,0,.2,1)"
      }
    );


  animacao.finished
    .then(
      () => {

        clone.remove();


        animar(
          cartButton,
          [
            {
              transform:
                "scale(1)"
            },
            {
              transform:
                "scale(1.14)"
            },
            {
              transform:
                "scale(.96)"
            },
            {
              transform:
                "scale(1)"
            }
          ],
          {
            duration: 420,
            easing:
              "cubic-bezier(.2,.8,.2,1)"
          }
        );

      }
    )
    .catch(
      () => {

        clone.remove();

      }
    );

}


/* =========================================================
   ADICIONAR AO CARRINHO
========================================================= */

function adicionarProdutoAoCarrinho(
  produto,
  card,
  imagem
) {

  const estoque =
    numeroSeguro(
      produto.quantidade_estoque
    );


  if (
    estoque <= 0
  ) {

    mostrarToast(
      "Produto sem estoque.",
      "error"
    );

    return;

  }


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


  if (existente) {

    if (
      numeroSeguro(
        existente.quantidade
      ) >=
      estoque
    ) {

      mostrarToast(
        "Limite de estoque atingido.",
        "error"
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


  salvarCarrinho(
    carrinho
  );


  animar(
    card,
    [
      {
        transform:
          "translateY(0) scale(1)"
      },
      {
        transform:
          "translateY(-5px) scale(1.025)",
        boxShadow:
          "0 24px 50px rgba(18,104,243,.20)"
      },
      {
        transform:
          "translateY(0) scale(1)"
      }
    ],
    {
      duration: 420,
      easing:
        "cubic-bezier(.2,.8,.2,1)"
    }
  );


  animarProdutoAteCarrinho(
    imagem
  );


  mostrarToast(
    "Produto adicionado ao carrinho."
  );

}


/* =========================================================
   MOVIMENTO BASEADO NO SCROLL
========================================================= */

function configurarScrollMotion() {

  let ticking = false;


  window.addEventListener(
    "scroll",
    () => {

      if (ticking) {
        return;
      }


      ticking = true;


      requestAnimationFrame(
        () => {

          const scrollY =
            window.scrollY;


          const word =
            document.querySelector(
              ".showcase-background-word"
            );


          if (word) {

            word.style.transform =
              `translateX(${scrollY * .025}px)`;

          }


          const ctaBg =
            document.querySelector(
              ".cta-speed-background"
            );


          if (ctaBg) {

            ctaBg.style.backgroundPosition =
              `${scrollY * .12}px 0`;

          }


          ticking = false;

        }
      );

    },
    {
      passive: true
    }
  );

}


/* =========================================================
   AUTO SLIDE SUAVE
========================================================= */

let autoSlideTimer = null;


function iniciarAutoSlide() {

  clearInterval(
    autoSlideTimer
  );


  autoSlideTimer =
    setInterval(
      () => {

        if (
          document.hidden
        ) {
          return;
        }


        avancarProdutos();

      },
      6500
    );

}


/* =========================================================
   EVENTOS
========================================================= */

openHeroSearch
  ?.addEventListener(
    "click",
    abrirBuscaHero
  );


closeHeroSearch
  ?.addEventListener(
    "click",
    fecharBuscaHero
  );


heroSmartSearchForm
  ?.addEventListener(
    "submit",
    executarBuscaHero
  );


featuredNext
  ?.addEventListener(
    "click",
    () => {

      avancarProdutos();

      iniciarAutoSlide();

    }
  );


featuredPrev
  ?.addEventListener(
    "click",
    () => {

      voltarProdutos();

      iniciarAutoSlide();

    }
  );


document.addEventListener(
  "keydown",
  evento => {

    if (
      evento.key === "Escape" &&
      heroSearchPanel &&
      !heroSearchPanel.hidden
    ) {

      fecharBuscaHero();

    }

  }
);


window.addEventListener(
  "resize",
  () => {

    const anterior =
      quantidadePorTela;


    atualizarQuantidadePorTela();


    if (
      anterior !==
      quantidadePorTela
    ) {

      slideAtual = 0;

      renderizarProdutosDestaque();

    }

  }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function iniciarHome() {

  if (
    animacoesIniciadas
  ) {
    return;
  }


  animacoesIniciadas =
    true;


  configurarContadores();

  configurarAnimacaoCategorias();

  configurarAnimacaoBeneficios();

  configurarExperience();

  configurarParallaxHero();

  configurarRotorInterativo();

  configurarScrollMotion();


  await carregarProdutosHome();


  iniciarAutoSlide();


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

iniciarHome();
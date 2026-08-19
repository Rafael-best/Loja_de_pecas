/* =========================================================
   CHECKOUT.JS
   SECURE CHECKOUT SYSTEM
   Loja de Peças

   Recursos:
   - Cliente logado / visitante
   - Carrinho e catálogo sincronizados
   - CEP recuperado do Smart Cart
   - Cupom recuperado
   - Formulário de endereço
   - Validação em tempo real
   - Pix / Cartão / Boleto
   - Campos de cartão dinâmicos
   - Checkout Readiness animado
   - Revisão dos produtos
   - Validação de estoque
   - Total animado
   - Processamento visual
   - Criação REAL do pedido
   - Inserção REAL dos itens
   - Confirmação com ID real do pedido
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const API = "http://localhost:3000/api";

const CAMINHO_IMAGENS =
  "assets/images/produtos";

const PLACEHOLDER_PRODUTO =
  `${CAMINHO_IMAGENS}/placeholder.webp`;


/* =========================================================
   ESTADO
========================================================= */

let produtosCatalogo = [];

let clienteLogado = null;

let checkoutPreview = null;

let cupomAtual = null;

let checkoutBloqueado = false;

let pedidoEmProcessamento = false;


/* =========================================================
   ELEMENTOS — CLIENTE
========================================================= */

const checkoutLoggedUser =
  document.getElementById(
    "checkoutLoggedUser"
  );

const checkoutGuestRequired =
  document.getElementById(
    "checkoutGuestRequired"
  );

const checkoutUserAvatar =
  document.getElementById(
    "checkoutUserAvatar"
  );

const checkoutUserName =
  document.getElementById(
    "checkoutUserName"
  );

const checkoutUserEmail =
  document.getElementById(
    "checkoutUserEmail"
  );

const deviceCustomerName =
  document.getElementById(
    "deviceCustomerName"
  );


/* =========================================================
   ELEMENTOS — ENDEREÇO
========================================================= */

const cep =
  document.getElementById(
    "cep"
  );

const cidade =
  document.getElementById(
    "cidade"
  );

const estado =
  document.getElementById(
    "estado"
  );

const bairro =
  document.getElementById(
    "bairro"
  );

const endereco =
  document.getElementById(
    "endereco"
  );

const numero =
  document.getElementById(
    "numero"
  );

const complemento =
  document.getElementById(
    "complemento"
  );

const addressStatus =
  document.getElementById(
    "addressStatus"
  );


/* =========================================================
   ELEMENTOS — PAGAMENTO
========================================================= */

const paymentStatus =
  document.getElementById(
    "paymentStatus"
  );

const paymentOptions =
  document.querySelectorAll(
    'input[name="formaPagamento"]'
  );

const cardPaymentFields =
  document.getElementById(
    "cardPaymentFields"
  );

const cardNumber =
  document.getElementById(
    "cardNumber"
  );

const cardName =
  document.getElementById(
    "cardName"
  );

const cardExpiry =
  document.getElementById(
    "cardExpiry"
  );

const cardCvv =
  document.getElementById(
    "cardCvv"
  );


/* =========================================================
   ELEMENTOS — ITENS
========================================================= */

const checkoutItems =
  document.getElementById(
    "checkoutItems"
  );


/* =========================================================
   ELEMENTOS — RESUMO
========================================================= */

const checkoutTotal =
  document.getElementById(
    "checkoutTotal"
  );

const checkoutSubtotal =
  document.getElementById(
    "checkoutSubtotal"
  );

const checkoutDiscount =
  document.getElementById(
    "checkoutDiscount"
  );

const checkoutShipping =
  document.getElementById(
    "checkoutShipping"
  );

const checkoutItemCount =
  document.getElementById(
    "checkoutItemCount"
  );


/* =========================================================
   READINESS
========================================================= */

const checkoutReadinessPercent =
  document.getElementById(
    "checkoutReadinessPercent"
  );

const checkoutReadinessBar =
  document.getElementById(
    "checkoutReadinessBar"
  );

const readyIdentity =
  document.getElementById(
    "readyIdentity"
  );

const readyAddress =
  document.getElementById(
    "readyAddress"
  );

const readyPayment =
  document.getElementById(
    "readyPayment"
  );


/* =========================================================
   INFO CARDS
========================================================= */

const checkoutCouponCard =
  document.getElementById(
    "checkoutCouponCard"
  );

const checkoutCouponCode =
  document.getElementById(
    "checkoutCouponCode"
  );

const checkoutCouponDescription =
  document.getElementById(
    "checkoutCouponDescription"
  );

const checkoutCepCard =
  document.getElementById(
    "checkoutCepCard"
  );

const checkoutSavedCep =
  document.getElementById(
    "checkoutSavedCep"
  );


/* =========================================================
   FINALIZAÇÃO
========================================================= */

const btnFinalizarPedido =
  document.getElementById(
    "btnFinalizarPedido"
  );

const checkoutProcessing =
  document.getElementById(
    "checkoutProcessing"
  );

const processingTitle =
  document.getElementById(
    "processingTitle"
  );

const processingDescription =
  document.getElementById(
    "processingDescription"
  );

const processingProgressBar =
  document.getElementById(
    "processingProgressBar"
  );

const processingStatus =
  document.getElementById(
    "processingStatus"
  );


/* =========================================================
   SUCCESS
========================================================= */

const checkoutSuccess =
  document.getElementById(
    "checkoutSuccess"
  );

const successOrderNumber =
  document.getElementById(
    "successOrderNumber"
  );


/* =========================================================
   TOAST
========================================================= */

const checkoutToast =
  document.getElementById(
    "checkoutToast"
  );


/* =========================================================
   UTILITÁRIOS
========================================================= */

function numeroSeguro(valor) {

  const numeroConvertido =
    Number(valor);

  return Number.isFinite(
    numeroConvertido
  )
    ? numeroConvertido
    : 0;

}


function formatarMoeda(valor) {

  return numeroSeguro(valor)
    .toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );

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


function primeiraLetra(nome) {

  return String(
    nome || "U"
  )
    .trim()
    .charAt(0)
    .toUpperCase() || "U";

}


function esperar(ms) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );

}


/* =========================================================
   ANIMATION SAFE
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
   LOCAL STORAGE
========================================================= */

function lerJSON(
  chave,
  padrao = null
) {

  try {

    const conteudo =
      localStorage.getItem(
        chave
      );


    if (!conteudo) {
      return padrao;
    }


    return JSON.parse(
      conteudo
    );

  } catch {

    return padrao;

  }

}


function obterCarrinho() {

  const carrinho =
    lerJSON(
      "carrinho",
      []
    );


  return Array.isArray(
    carrinho
  )
    ? carrinho
    : [];

}


function obterProdutosCache() {

  const produtos =
    lerJSON(
      "produtosMock",
      []
    );


  return Array.isArray(
    produtos
  )
    ? produtos
    : [];

}


/* =========================================================
   SESSION STORAGE
========================================================= */

function carregarCheckoutPreview() {

  try {

    const salvo =
      sessionStorage.getItem(
        "checkoutPreview"
      );


    if (!salvo) {
      return null;
    }


    return JSON.parse(
      salvo
    );

  } catch {

    return null;

  }

}


/* =========================================================
   IMAGEM
========================================================= */

function obterImagemProduto(imagem) {

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
   CATÁLOGO
========================================================= */

function encontrarProduto(
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


function obterDadosItem(item) {

  const produto =
    encontrarProduto(
      item.id_produto
    );


  return {

    produto,

    nome:
      produto?.nome_produto ||
      item.nome_produto ||
      "Produto",

    preco:
      numeroSeguro(
        produto?.preco_produto ??
        item.preco_produto
      ),

    estoque:
      numeroSeguro(
        produto?.quantidade_estoque ??
        item.quantidade_estoque
      ),

    imagem:
      produto?.imagem ||
      item.imagem ||
      "",

    codigo:
      obterCampo(
        produto || item,
        [
          "codigo_produto",
          "codigo",
          "sku"
        ],
        `#${item.id_produto}`
      )

  };

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function mostrarToast(
  mensagem,
  tipo = "success"
) {

  if (!checkoutToast) {
    return;
  }


  clearTimeout(
    toastTimer
  );


  checkoutToast.classList.remove(
    "show",
    "error",
    "warning"
  );


  if (
    tipo === "error"
  ) {

    checkoutToast.classList.add(
      "error"
    );

  }


  if (
    tipo === "warning"
  ) {

    checkoutToast.classList.add(
      "warning"
    );

  }


  checkoutToast.textContent =
    mensagem;


  void checkoutToast.offsetWidth;


  checkoutToast.classList.add(
    "show"
  );


  toastTimer =
    setTimeout(
      () => {

        checkoutToast.classList.remove(
          "show"
        );

      },
      2800
    );

}


/* =========================================================
   CLIENTE
========================================================= */

function carregarCliente() {

  clienteLogado =
    lerJSON(
      "clienteLogado",
      null
    );


  if (
    !clienteLogado ||
    !clienteLogado.id_cliente
  ) {

    clienteLogado =
      null;


    if (
      checkoutLoggedUser
    ) {

      checkoutLoggedUser.hidden =
        true;

    }


    if (
      checkoutGuestRequired
    ) {

      checkoutGuestRequired.hidden =
        false;

    }


    if (
      deviceCustomerName
    ) {

      deviceCustomerName.textContent =
        "VISITANTE";

    }


    return;

  }


  if (
    checkoutLoggedUser
  ) {

    checkoutLoggedUser.hidden =
      false;

  }


  if (
    checkoutGuestRequired
  ) {

    checkoutGuestRequired.hidden =
      true;

  }


  const nome =
    clienteLogado.nome ||
    clienteLogado.nome_cliente ||
    "Cliente";


  const email =
    clienteLogado.email ||
    clienteLogado.email_cliente ||
    "";


  if (
    checkoutUserAvatar
  ) {

    checkoutUserAvatar.textContent =
      primeiraLetra(nome);

  }


  if (
    checkoutUserName
  ) {

    checkoutUserName.textContent =
      nome;

  }


  if (
    checkoutUserEmail
  ) {

    checkoutUserEmail.textContent =
      email || "E-mail não informado";

  }


  if (
    deviceCustomerName
  ) {

    deviceCustomerName.textContent =
      nome
        .split(" ")[0]
        .toUpperCase();

  }

}


/* =========================================================
   CUPOM E CEP DO SMART CART
========================================================= */

function recuperarDadosSmartCart() {

  checkoutPreview =
    carregarCheckoutPreview();


  cupomAtual =
    lerJSON(
      "cupomCarrinho",
      null
    );


  const cepSalvo =
    localStorage.getItem(
      "cepCarrinho"
    ) ||
    checkoutPreview?.cep ||
    "";


  if (cepSalvo) {

    const formatado =
      formatarCep(
        cepSalvo
      );


    if (cep) {

      cep.value =
        formatado;

    }


    if (
      checkoutCepCard
    ) {

      checkoutCepCard.hidden =
        false;

    }


    if (
      checkoutSavedCep
    ) {

      checkoutSavedCep.textContent =
        formatado;

    }

  }


  if (
    cupomAtual &&
    cupomAtual.codigo
  ) {

    if (
      checkoutCouponCard
    ) {

      checkoutCouponCard.hidden =
        false;

    }


    if (
      checkoutCouponCode
    ) {

      checkoutCouponCode.textContent =
        cupomAtual.codigo;

    }


    if (
      checkoutCouponDescription
    ) {

      checkoutCouponDescription.textContent =
        cupomAtual.descricao ||
        "Cupom aplicado";

    }

  }

}


/* =========================================================
   MÁSCARA CEP
========================================================= */

function formatarCep(valor) {

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
    numeros.slice(5)
  );

}


function cepValido(valor) {

  return /^\d{5}-\d{3}$/
    .test(
      String(
        valor || ""
      )
    );

}


/* =========================================================
   CAMPOS
========================================================= */

const camposEndereco = [
  cep,
  cidade,
  estado,
  bairro,
  endereco,
  numero
].filter(Boolean);


/* =========================================================
   VALIDAÇÃO VISUAL
========================================================= */

function marcarCampo(
  input,
  valido
) {

  if (!input) {
    return;
  }


  const wrapper =
    input.closest(
      ".checkout-input"
    );


  if (!wrapper) {
    return;
  }


  wrapper.classList.remove(
    "valid",
    "error"
  );


  if (
    input.value.trim() === ""
  ) {

    return;

  }


  wrapper.classList.add(
    valido
      ? "valid"
      : "error"
  );

}


/* =========================================================
   VALIDAR ENDEREÇO
========================================================= */

function validarEndereco(
  mostrarErros = false
) {

  const validacoes = {

    cep:
      cepValido(
        cep?.value
      ),

    cidade:
      String(
        cidade?.value || ""
      ).trim().length >= 2,

    estado:
      /^[A-Za-z]{2}$/
        .test(
          String(
            estado?.value || ""
          ).trim()
        ),

    bairro:
      String(
        bairro?.value || ""
      ).trim().length >= 2,

    endereco:
      String(
        endereco?.value || ""
      ).trim().length >= 3,

    numero:
      String(
        numero?.value || ""
      ).trim().length >= 1

  };


  if (
    mostrarErros
  ) {

    marcarCampo(
      cep,
      validacoes.cep
    );

    marcarCampo(
      cidade,
      validacoes.cidade
    );

    marcarCampo(
      estado,
      validacoes.estado
    );

    marcarCampo(
      bairro,
      validacoes.bairro
    );

    marcarCampo(
      endereco,
      validacoes.endereco
    );

    marcarCampo(
      numero,
      validacoes.numero
    );

  }


  return Object.values(
    validacoes
  ).every(Boolean);

}


/* =========================================================
   PAGAMENTO SELECIONADO
========================================================= */

function obterFormaPagamento() {

  const selecionado =
    document.querySelector(
      'input[name="formaPagamento"]:checked'
    );


  return selecionado
    ? selecionado.value
    : "";

}


/* =========================================================
   CARTÃO
========================================================= */

function somenteNumeros(valor) {

  return String(valor || "")
    .replace(
      /\D/g,
      ""
    );

}


function formatarNumeroCartao(
  valor
) {

  return somenteNumeros(
    valor
  )
    .slice(
      0,
      16
    )
    .replace(
      /(\d{4})(?=\d)/g,
      "$1 "
    );

}


function formatarValidadeCartao(
  valor
) {

  const numeros =
    somenteNumeros(
      valor
    )
      .slice(
        0,
        4
      );


  if (
    numeros.length <= 2
  ) {

    return numeros;

  }


  return (
    numeros.slice(0,2) +
    "/" +
    numeros.slice(2)
  );

}


/* =========================================================
   VALIDAÇÃO DE CARTÃO

   Validação simples de interface.
   Processamento real deve ser feito por gateway.
========================================================= */

function validarCartao(
  mostrarErros = false
) {

  const numeroCartao =
    somenteNumeros(
      cardNumber?.value
    );


  const nomeTitular =
    String(
      cardName?.value || ""
    ).trim();


  const validade =
    String(
      cardExpiry?.value || ""
    ).trim();


  const cvv =
    somenteNumeros(
      cardCvv?.value
    );


  const validoNumero =
    numeroCartao.length === 16;


  const validoNome =
    nomeTitular.length >= 3;


  const matchValidade =
    validade.match(
      /^(\d{2})\/(\d{2})$/
    );


  let validoValidade =
    false;


  if (matchValidade) {

    const mes =
      Number(
        matchValidade[1]
      );


    validoValidade =
      mes >= 1 &&
      mes <= 12;

  }


  const validoCvv =
    cvv.length >= 3 &&
    cvv.length <= 4;


  if (
    mostrarErros
  ) {

    marcarCampo(
      cardNumber,
      validoNumero
    );

    marcarCampo(
      cardName,
      validoNome
    );

    marcarCampo(
      cardExpiry,
      validoValidade
    );

    marcarCampo(
      cardCvv,
      validoCvv
    );

  }


  return (
    validoNumero &&
    validoNome &&
    validoValidade &&
    validoCvv
  );

}


/* =========================================================
   VALIDAR PAGAMENTO
========================================================= */

function validarPagamento(
  mostrarErros = false
) {

  const forma =
    obterFormaPagamento();


  if (!forma) {
    return false;
  }


  if (
    forma === "Cartão"
  ) {

    return validarCartao(
      mostrarErros
    );

  }


  return true;

}


/* =========================================================
   MOSTRAR / ESCONDER CARTÃO
========================================================= */

function atualizarCamposPagamento() {

  const forma =
    obterFormaPagamento();


  const mostrarCartao =
    forma === "Cartão";


  if (
    cardPaymentFields
  ) {

    if (
      mostrarCartao
    ) {

      cardPaymentFields.hidden =
        false;


      animar(
        cardPaymentFields,
        [
          {
            opacity: 0,
            transform:
              "translateY(-10px) scale(.985)"
          },
          {
            opacity: 1,
            transform:
              "translateY(0) scale(1)"
          }
        ],
        {
          duration: 430,
          easing:
            "cubic-bezier(.16,1,.3,1)"
        }
      );

    } else {

      cardPaymentFields.hidden =
        true;

    }

  }


  if (
    paymentStatus
  ) {

    paymentStatus.textContent =
      forma ||
      "Selecione";


    paymentStatus.classList.toggle(
      "ready",
      Boolean(forma)
    );

  }


  atualizarReadiness();

}


/* =========================================================
   ESTOQUE
========================================================= */

function validarEstoqueCarrinho() {

  const carrinho =
    obterCarrinho();


  for (
    const item of carrinho
  ) {

    const dados =
      obterDadosItem(
        item
      );


    const quantidade =
      numeroSeguro(
        item.quantidade
      );


    if (
      dados.estoque <= 0 ||
      quantidade >
        dados.estoque
    ) {

      return {
        valido: false,
        item,
        dados
      };

    }

  }


  return {
    valido: true
  };

}


/* =========================================================
   CALCULAR TOTAL
========================================================= */

function calcularTotais() {

  const carrinho =
    obterCarrinho();


  let subtotal = 0;

  let quantidade = 0;


  carrinho.forEach(
    item => {

      const dados =
        obterDadosItem(
          item
        );


      const qtd =
        Math.max(
          1,
          numeroSeguro(
            item.quantidade
          )
        );


      subtotal +=
        dados.preco *
        qtd;


      quantidade +=
        qtd;

    }
  );


  let desconto = 0;


  if (
    checkoutPreview &&
    numeroSeguro(
      checkoutPreview.desconto
    ) > 0
  ) {

    /*
      Mantemos o desconto calculado pelo Smart Cart
      somente para demonstração frontend.

      Quando existir backend de cupons,
      o servidor deve recalcular tudo.
    */

    desconto =
      Math.min(
        numeroSeguro(
          checkoutPreview.desconto
        ),
        subtotal
      );

  }


  const total =
    Math.max(
      subtotal -
      desconto,
      0
    );


  return {

    subtotal,
    desconto,
    total,
    quantidade

  };

}


/* =========================================================
   ANIMAÇÃO DE MOEDA
========================================================= */

function animarMoeda(
  elemento,
  valorFinal
) {

  if (!elemento) {
    return;
  }


  const inicial =
    numeroSeguro(
      elemento.dataset.valor
    );


  const final =
    numeroSeguro(
      valorFinal
    );


  const inicio =
    performance.now();


  const duracao = 520;


  function frame(tempo) {

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
        3
      );


    const atual =
      inicial +
      (
        final -
        inicial
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
        frame
      );

    } else {

      elemento.dataset.valor =
        String(final);

    }

  }


  requestAnimationFrame(
    frame
  );

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
    `${totais.quantidade} ${
      totais.quantidade === 1
        ? "item"
        : "itens"
    }`;


  if (
    animado
  ) {

    animarMoeda(
      checkoutSubtotal,
      totais.subtotal
    );

    animarMoeda(
      checkoutDiscount,
      totais.desconto
    );

    animarMoeda(
      checkoutTotal,
      totais.total
    );

  } else {

    if (
      checkoutSubtotal
    ) {

      checkoutSubtotal.textContent =
        formatarMoeda(
          totais.subtotal
        );

      checkoutSubtotal.dataset.valor =
        String(
          totais.subtotal
        );

    }


    if (
      checkoutDiscount
    ) {

      checkoutDiscount.textContent =
        formatarMoeda(
          totais.desconto
        );

      checkoutDiscount.dataset.valor =
        String(
          totais.desconto
        );

    }


    if (
      checkoutTotal
    ) {

      checkoutTotal.textContent =
        formatarMoeda(
          totais.total
        );

      checkoutTotal.dataset.valor =
        String(
          totais.total
        );

    }

  }


  if (
    checkoutItemCount
  ) {

    checkoutItemCount.textContent =
      textoItens;

  }


  /*
    Frete real ainda não está implementado
    no backend.
  */

  if (
    checkoutShipping
  ) {

    checkoutShipping.textContent =
      cepValido(
        cep?.value
      )
        ? "A definir"
        : "A definir";

  }

}


/* =========================================================
   RENDERIZAR ITENS
========================================================= */

function renderizarItens() {

  if (!checkoutItems) {
    return;
  }


  checkoutItems.innerHTML =
    "";


  const carrinho =
    obterCarrinho();


  carrinho.forEach(
    (
      item,
      indice
    ) => {

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


      const article =
        document.createElement(
          "article"
        );


      article.className =
        "checkout-review-item";


      /* ===================================================
         IMAGE
      =================================================== */

      const imageWrapper =
        document.createElement(
          "div"
        );


      imageWrapper.className =
        "checkout-review-image";


      const img =
        document.createElement(
          "img"
        );


      img.src =
        obterImagemProduto(
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

            imageWrapper.innerHTML =
              '<i class="fa-solid fa-gears"></i>';


            return;

          }


          img.src =
            PLACEHOLDER_PRODUTO;

        }
      );


      imageWrapper.appendChild(
        img
      );


      /* ===================================================
         INFO
      =================================================== */

      const info =
        document.createElement(
          "div"
        );


      info.className =
        "checkout-review-info";


      info.innerHTML = `
        <span>
          COD ${dados.codigo}
        </span>

        <h3>
          ${dados.nome}
        </h3>

        <small>
          ${quantidade}
          ${
            quantidade === 1
              ? "unidade"
              : "unidades"
          }
          ×
          ${formatarMoeda(
            dados.preco
          )}
        </small>
      `;


      /* ===================================================
         PRICE
      =================================================== */

      const price =
        document.createElement(
          "div"
        );


      price.className =
        "checkout-review-price";


      price.innerHTML = `
        <span>
          SUBTOTAL
        </span>

        <strong>
          ${formatarMoeda(
            subtotal
          )}
        </strong>
      `;


      article.append(
        imageWrapper,
        info,
        price
      );


      checkoutItems.appendChild(
        article
      );


      animar(
        article,
        [
          {
            opacity: 0,
            transform:
              "translateY(15px)"
          },
          {
            opacity: 1,
            transform:
              "translateY(0)"
          }
        ],
        {
          duration: 460,
          delay:
            indice * 70,
          easing:
            "cubic-bezier(.16,1,.3,1)",
          fill:
            "both"
        }
      );

    }
  );

}


/* =========================================================
   READINESS
========================================================= */

function atualizarItemReadiness(
  elemento,
  pronto
) {

  if (!elemento) {
    return;
  }


  elemento.classList.toggle(
    "ready",
    pronto
  );


  elemento.innerHTML =
    pronto
      ? `
          <i class="fa-solid fa-circle-check"></i>
          ${elemento.dataset.label || obterTextoReadiness(elemento)}
        `
      : `
          <i class="fa-regular fa-circle"></i>
          ${elemento.dataset.label || obterTextoReadiness(elemento)}
        `;

}


function obterTextoReadiness(
  elemento
) {

  if (
    elemento === readyIdentity
  ) {
    return "Identificação";
  }


  if (
    elemento === readyAddress
  ) {
    return "Entrega";
  }


  if (
    elemento === readyPayment
  ) {
    return "Pagamento";
  }


  return "";
}


/* =========================================================
   STEPS
========================================================= */

function atualizarFlowSteps(
  identidade,
  enderecoPronto,
  pagamentoPronto
) {

  const identification =
    document.querySelector(
      '[data-step="identification"]'
    );

  const payment =
    document.querySelector(
      '[data-step="payment"]'
    );

  const confirmation =
    document.querySelector(
      '[data-step="confirmation"]'
    );


  identification?.classList.toggle(
    "completed",
    identidade &&
    enderecoPronto
  );


  identification?.classList.toggle(
    "active",
    identidade &&
    !enderecoPronto
  );


  payment?.classList.toggle(
    "active",
    enderecoPronto &&
    !pagamentoPronto
  );


  payment?.classList.toggle(
    "completed",
    pagamentoPronto
  );


  confirmation?.classList.toggle(
    "active",
    identidade &&
    enderecoPronto &&
    pagamentoPronto
  );

}


/* =========================================================
   READINESS PRINCIPAL
========================================================= */

function atualizarReadiness() {

  const identidade =
    Boolean(
      clienteLogado &&
      clienteLogado.id_cliente
    );


  const enderecoPronto =
    validarEndereco(
      false
    );


  const pagamentoPronto =
    validarPagamento(
      false
    );


  atualizarItemReadiness(
    readyIdentity,
    identidade
  );


  atualizarItemReadiness(
    readyAddress,
    enderecoPronto
  );


  atualizarItemReadiness(
    readyPayment,
    pagamentoPronto
  );


  let percentual = 0;


  /*
    25% carrinho já concluído.
  */

  percentual += 25;


  if (
    identidade
  ) {

    percentual += 20;

  }


  if (
    enderecoPronto
  ) {

    percentual += 30;

  }


  if (
    pagamentoPronto
  ) {

    percentual += 25;

  }


  if (
    checkoutReadinessBar
  ) {

    checkoutReadinessBar.style.width =
      `${percentual}%`;

  }


  if (
    checkoutReadinessPercent
  ) {

    checkoutReadinessPercent.textContent =
      `${percentual}%`;

  }


  /* =====================================================
     ADDRESS STATUS
  ===================================================== */

  if (
    addressStatus
  ) {

    addressStatus.textContent =
      enderecoPronto
        ? "Completo"
        : "Pendente";


    addressStatus.classList.toggle(
      "ready",
      enderecoPronto
    );

  }


  /* =====================================================
     PAYMENT STATUS
  ===================================================== */

  if (
    paymentStatus
  ) {

    const forma =
      obterFormaPagamento();


    paymentStatus.textContent =
      pagamentoPronto
        ? forma
        : forma
          ? "Incompleto"
          : "Selecione";


    paymentStatus.classList.toggle(
      "ready",
      pagamentoPronto
    );

  }


  atualizarFlowSteps(
    identidade,
    enderecoPronto,
    pagamentoPronto
  );


  const estoque =
    validarEstoqueCarrinho();


  if (
    btnFinalizarPedido
  ) {

    btnFinalizarPedido.disabled =
      !identidade ||
      !enderecoPronto ||
      !pagamentoPronto ||
      !estoque.valido ||
      obterCarrinho().length === 0 ||
      pedidoEmProcessamento;

  }

}


/* =========================================================
   SALVAR ENDEREÇO TEMPORÁRIO
========================================================= */

function salvarEnderecoTemporario() {

  const dados = {

    cep:
      cep?.value.trim() || "",

    cidade:
      cidade?.value.trim() || "",

    estado:
      estado?.value.trim().toUpperCase() || "",

    bairro:
      bairro?.value.trim() || "",

    endereco:
      endereco?.value.trim() || "",

    numero:
      numero?.value.trim() || "",

    complemento:
      complemento?.value.trim() || ""

  };


  sessionStorage.setItem(
    "checkoutEndereco",
    JSON.stringify(
      dados
    )
  );

}


/* =========================================================
   RECUPERAR ENDEREÇO
========================================================= */

function recuperarEnderecoTemporario() {

  try {

    const salvo =
      sessionStorage.getItem(
        "checkoutEndereco"
      );


    if (!salvo) {
      return;
    }


    const dados =
      JSON.parse(
        salvo
      );


    if (
      cep &&
      dados.cep
    ) {

      cep.value =
        formatarCep(
          dados.cep
        );

    }


    if (cidade) {

      cidade.value =
        dados.cidade || "";

    }


    if (estado) {

      estado.value =
        dados.estado || "";

    }


    if (bairro) {

      bairro.value =
        dados.bairro || "";

    }


    if (endereco) {

      endereco.value =
        dados.endereco || "";

    }


    if (numero) {

      numero.value =
        dados.numero || "";

    }


    if (complemento) {

      complemento.value =
        dados.complemento || "";

    }

  } catch {

    sessionStorage.removeItem(
      "checkoutEndereco"
    );

  }

}


/* =========================================================
   PROCESSAMENTO VISUAL
========================================================= */

function abrirProcessamento() {

  if (
    !checkoutProcessing
  ) {
    return;
  }


  checkoutProcessing.hidden =
    false;


  document.body.style.overflow =
    "hidden";


  if (
    processingProgressBar
  ) {

    processingProgressBar.style.width =
      "4%";

  }

}


function fecharProcessamento() {

  if (
    checkoutProcessing
  ) {

    checkoutProcessing.hidden =
      true;

  }


  document.body.style.overflow =
    "";

}


/* =========================================================
   ATUALIZAR PROCESSAMENTO
========================================================= */

async function atualizarProcessamento(
  percentual,
  status,
  titulo = null,
  descricao = null,
  pausa = 280
) {

  if (
    processingProgressBar
  ) {

    processingProgressBar.style.width =
      `${percentual}%`;

  }


  if (
    processingStatus
  ) {

    processingStatus.textContent =
      status;

  }


  if (
    titulo &&
    processingTitle
  ) {

    processingTitle.textContent =
      titulo;

  }


  if (
    descricao &&
    processingDescription
  ) {

    processingDescription.textContent =
      descricao;

  }


  await esperar(
    pausa
  );

}


/* =========================================================
   SUCESSO
========================================================= */

function mostrarSucesso(
  idPedido
) {

  fecharProcessamento();


  if (
    successOrderNumber
  ) {

    successOrderNumber.textContent =
      `#${idPedido}`;

  }


  if (
    checkoutSuccess
  ) {

    checkoutSuccess.hidden =
      false;

  }


  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   ERRO DA API
========================================================= */

async function extrairErroResposta(
  resposta
) {

  try {

    const dados =
      await resposta.json();


    return (
      dados.erro ||
      dados.error ||
      dados.message ||
      `Erro HTTP ${resposta.status}`
    );

  } catch {

    return (
      `Erro HTTP ${resposta.status}`
    );

  }

}


/* =========================================================
   CRIAR PEDIDO NO BACKEND
========================================================= */

async function criarPedidoBackend(
  formaPagamento
) {

  const resposta =
    await fetch(
      `${API}/pedidos`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            id_cliente:
              clienteLogado.id_cliente,

            forma_pagamento:
              formaPagamento,

            status_pedido:
              "Pendente",

            /*
              Mantemos 0 porque seu backend
              já calcula os itens/pedido.
            */
            total_pedido: 0
          })
      }
    );


  if (
    !resposta.ok
  ) {

    throw new Error(
      await extrairErroResposta(
        resposta
      )
    );

  }


  const dados =
    await resposta.json();


  const idPedido =
    dados.id_pedido ??
    dados.pedido?.id_pedido;


  if (
    !idPedido
  ) {

    throw new Error(
      "O servidor criou o pedido, mas não retornou o ID."
    );

  }


  return {
    ...dados,
    id_pedido:
      idPedido
  };

}


/* =========================================================
   ADICIONAR ITEM AO PEDIDO
========================================================= */

async function adicionarItemPedido(
  idPedido,
  item
) {

  const resposta =
    await fetch(
      `${API}/pedidos/${idPedido}/itens`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            id_produto:
              item.id_produto,

            quantidade:
              numeroSeguro(
                item.quantidade
              )
          })
      }
    );


  if (
    !resposta.ok
  ) {

    throw new Error(
      await extrairErroResposta(
        resposta
      )
    );

  }


  return resposta.json();

}


/* =========================================================
   VALIDAR ANTES DE FINALIZAR
========================================================= */

function validarCheckoutCompleto() {

  const carrinho =
    obterCarrinho();


  if (
    carrinho.length === 0
  ) {

    mostrarToast(
      "Seu carrinho está vazio.",
      "warning"
    );


    return false;

  }


  if (
    !clienteLogado ||
    !clienteLogado.id_cliente
  ) {

    mostrarToast(
      "Entre na sua conta para finalizar a compra.",
      "warning"
    );


    checkoutGuestRequired
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });


    return false;

  }


  if (
    !validarEndereco(
      true
    )
  ) {

    mostrarToast(
      "Confira os dados de entrega.",
      "warning"
    );


    document
      .getElementById(
        "checkoutSectionAddress"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });


    return false;

  }


  if (
    !obterFormaPagamento()
  ) {

    mostrarToast(
      "Escolha uma forma de pagamento.",
      "warning"
    );


    document
      .getElementById(
        "checkoutSectionPayment"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });


    return false;

  }


  if (
    !validarPagamento(
      true
    )
  ) {

    mostrarToast(
      "Confira os dados de pagamento.",
      "warning"
    );


    return false;

  }


  const estoque =
    validarEstoqueCarrinho();


  if (
    !estoque.valido
  ) {

    mostrarToast(
      `O estoque de "${estoque.dados.nome}" mudou. Volte ao carrinho e ajuste a quantidade.`,
      "error"
    );


    return false;

  }


  return true;

}


/* =========================================================
   FINALIZAR PEDIDO
========================================================= */

async function finalizarPedido() {

  if (
    pedidoEmProcessamento
  ) {

    return;

  }


  if (
    !validarCheckoutCompleto()
  ) {

    atualizarReadiness();

    return;

  }


  const carrinho =
    obterCarrinho();


  const formaPagamento =
    obterFormaPagamento();


  pedidoEmProcessamento =
    true;


  atualizarReadiness();


  salvarEnderecoTemporario();


  abrirProcessamento();


  try {

    /* =====================================================
       ETAPA 1
    ===================================================== */

    await atualizarProcessamento(
      12,
      "Validando sessão...",
      "Validando sua compra",
      "Estamos conferindo sua sessão e os dados básicos do pedido.",
      350
    );


    /* =====================================================
       ETAPA 2
    ===================================================== */

    const estoque =
      validarEstoqueCarrinho();


    if (
      !estoque.valido
    ) {

      throw new Error(
        `Estoque insuficiente para ${estoque.dados.nome}.`
      );

    }


    await atualizarProcessamento(
      26,
      "Estoque verificado",
      "Conferindo produtos",
      "Os itens selecionados estão sendo validados.",
      350
    );


    /* =====================================================
       ETAPA 3
    ===================================================== */

    await atualizarProcessamento(
      40,
      "Criando pedido...",
      "Registrando pedido",
      "Criando sua compra no sistema.",
      250
    );


    const pedido =
      await criarPedidoBackend(
        formaPagamento
      );


    const idPedido =
      pedido.id_pedido;


    /* =====================================================
       ETAPA 4 — ITENS
    ===================================================== */

    const totalItens =
      carrinho.length;


    for (
      let i = 0;
      i < totalItens;
      i++
    ) {

      const item =
        carrinho[i];


      const porcentagem =
        48 +
        Math.round(
          (
            (i + 1) /
            totalItens
          ) *
          35
        );


      await atualizarProcessamento(
        porcentagem,
        `Adicionando item ${i + 1} de ${totalItens}...`,
        "Montando seu pedido",
        "Registrando os produtos selecionados.",
        100
      );


      await adicionarItemPedido(
        idPedido,
        item
      );

    }


    /* =====================================================
       ETAPA 5
    ===================================================== */

    await atualizarProcessamento(
      90,
      "Produtos registrados",
      "Finalizando operação",
      "Estamos concluindo os últimos detalhes.",
      400
    );


    await atualizarProcessamento(
      100,
      "Pedido confirmado",
      "Tudo pronto",
      "Sua compra foi registrada com sucesso.",
      550
    );


    /* =====================================================
       LIMPEZA
    ===================================================== */

    localStorage.setItem(
      "carrinho",
      JSON.stringify([])
    );


    localStorage.removeItem(
      "cupomCarrinho"
    );


    localStorage.removeItem(
      "cepCarrinho"
    );


    sessionStorage.removeItem(
      "checkoutPreview"
    );


    sessionStorage.removeItem(
      "checkoutEndereco"
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


    /* =====================================================
       SUCCESS
    ===================================================== */

    mostrarSucesso(
      idPedido
    );


  } catch (erro) {

    console.error(
      "Erro no checkout:",
      erro
    );


    fecharProcessamento();


    mostrarToast(
      erro.message ||
      "Não foi possível finalizar o pedido.",
      "error"
    );


  } finally {

    pedidoEmProcessamento =
      false;


    atualizarReadiness();

  }

}


/* =========================================================
   CATÁLOGO DA API
========================================================= */

async function carregarProdutos() {

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
        "Resposta inválida da API de produtos."
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
      "Checkout usando cache local de produtos:",
      erro
    );


    produtosCatalogo =
      obterProdutosCache();

  }

}


/* =========================================================
   SINCRONIZAR CARRINHO COM CATÁLOGO
========================================================= */

function sincronizarCarrinho() {

  const carrinho =
    obterCarrinho();


  if (
    carrinho.length === 0 ||
    produtosCatalogo.length === 0
  ) {

    return;

  }


  let alterado = false;


  carrinho.forEach(
    item => {

      const produto =
        encontrarProduto(
          item.id_produto
        );


      if (!produto) {
        return;
      }


      const novoPreco =
        numeroSeguro(
          produto.preco_produto
        );


      const novoEstoque =
        numeroSeguro(
          produto.quantidade_estoque
        );


      if (
        numeroSeguro(
          item.preco_produto
        ) !==
        novoPreco
      ) {

        item.preco_produto =
          novoPreco;

        alterado = true;

      }


      if (
        numeroSeguro(
          item.quantidade_estoque
        ) !==
        novoEstoque
      ) {

        item.quantidade_estoque =
          novoEstoque;

        alterado = true;

      }


      if (
        produto.imagem &&
        produto.imagem !==
          item.imagem
      ) {

        item.imagem =
          produto.imagem;

        alterado = true;

      }

    }
  );


  if (
    alterado
  ) {

    localStorage.setItem(
      "carrinho",
      JSON.stringify(
        carrinho
      )
    );

  }

}


/* =========================================================
   ANIMAÇÕES NO SCROLL
========================================================= */

function configurarAnimacoesScroll() {

  if (
    !(
      "IntersectionObserver"
      in window
    )
  ) {

    document
      .querySelectorAll(
        ".checkout-module"
      )
      .forEach(
        elemento =>
          elemento.classList.add(
            "checkout-visible"
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


            entrada.target.classList.add(
              "checkout-visible"
            );


            observer.unobserve(
              entrada.target
            );

          }
        );

      },
      {
        threshold: 0.10
      }
    );


  document
    .querySelectorAll(
      ".checkout-module"
    )
    .forEach(
      elemento =>
        observer.observe(
          elemento
        )
    );

}


/* =========================================================
   DEVICE PARALLAX
========================================================= */

function configurarDeviceInterativo() {

  const device =
    document.querySelector(
      ".checkout-device"
    );


  if (
    !device ||
    window.matchMedia(
      "(pointer: coarse)"
    ).matches
  ) {

    return;

  }


  device.addEventListener(
    "mousemove",
    evento => {

      const rect =
        device
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


      const rotacaoY =
        (
          x -
          0.5
        ) *
        5;


      const rotacaoX =
        (
          0.5 -
          y
        ) *
        4;


      device.style.transform =
        `
          perspective(900px)
          rotateX(${rotacaoX}deg)
          rotateY(${rotacaoY}deg)
          translateY(-3px)
        `;

    }
  );


  device.addEventListener(
    "mouseleave",
    () => {

      device.style.transform =
        "";

    }
  );

}


/* =========================================================
   EVENTOS ENDEREÇO
========================================================= */

if (cep) {

  cep.addEventListener(
    "input",
    () => {

      cep.value =
        formatarCep(
          cep.value
        );


      marcarCampo(
        cep,
        cepValido(
          cep.value
        )
      );


      salvarEnderecoTemporario();

      atualizarReadiness();

    }
  );

}


if (estado) {

  estado.addEventListener(
    "input",
    () => {

      estado.value =
        estado.value
          .replace(
            /[^a-zA-Z]/g,
            ""
          )
          .slice(
            0,
            2
          )
          .toUpperCase();


      marcarCampo(
        estado,
        /^[A-Z]{2}$/
          .test(
            estado.value
          )
      );


      salvarEnderecoTemporario();

      atualizarReadiness();

    }
  );

}


[
  cidade,
  bairro,
  endereco,
  numero,
  complemento
]
  .filter(Boolean)
  .forEach(
    campo => {

      campo.addEventListener(
        "input",
        () => {

          if (
            campo !== complemento
          ) {

            marcarCampo(
              campo,
              campo.value
                .trim()
                .length >= 1
            );

          }


          salvarEnderecoTemporario();

          atualizarReadiness();

        }
      );

    }
  );


/* =========================================================
   EVENTOS PAGAMENTO
========================================================= */

paymentOptions.forEach(
  input => {

    input.addEventListener(
      "change",
      () => {

        atualizarCamposPagamento();


        const option =
          input.closest(
            ".payment-option"
          );


        animar(
          option,
          [
            {
              transform:
                "scale(1)"
            },
            {
              transform:
                "scale(1.025)"
            },
            {
              transform:
                "scale(1)"
            }
          ],
          {
            duration: 300,
            easing:
              "cubic-bezier(.2,.8,.2,1)"
          }
        );

      }
    );

  }
);


/* =========================================================
   CARTÃO — FORMATADORES
========================================================= */

if (cardNumber) {

  cardNumber.addEventListener(
    "input",
    () => {

      cardNumber.value =
        formatarNumeroCartao(
          cardNumber.value
        );


      marcarCampo(
        cardNumber,
        somenteNumeros(
          cardNumber.value
        ).length === 16
      );


      atualizarReadiness();

    }
  );

}


if (cardName) {

  cardName.addEventListener(
    "input",
    () => {

      cardName.value =
        cardName.value
          .toUpperCase();


      marcarCampo(
        cardName,
        cardName.value
          .trim()
          .length >= 3
      );


      atualizarReadiness();

    }
  );

}


if (cardExpiry) {

  cardExpiry.addEventListener(
    "input",
    () => {

      cardExpiry.value =
        formatarValidadeCartao(
          cardExpiry.value
        );


      atualizarReadiness();

    }
  );

}


if (cardCvv) {

  cardCvv.addEventListener(
    "input",
    () => {

      cardCvv.value =
        somenteNumeros(
          cardCvv.value
        )
          .slice(
            0,
            4
          );


      marcarCampo(
        cardCvv,
        cardCvv.value.length >= 3
      );


      atualizarReadiness();

    }
  );

}


/* =========================================================
   FINALIZAR
========================================================= */

btnFinalizarPedido
  ?.addEventListener(
    "click",
    finalizarPedido
  );


/* =========================================================
   STORAGE ENTRE ABAS
========================================================= */

window.addEventListener(
  "storage",
  evento => {

    if (
      evento.key ===
      "carrinho"
    ) {

      renderizarItens();

      atualizarResumo(
        true
      );

      atualizarReadiness();

    }


    if (
      evento.key ===
      "clienteLogado"
    ) {

      carregarCliente();

      atualizarReadiness();

    }

  }
);


/* =========================================================
   VOLTAR PARA A ABA
========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden
    ) {
      return;
    }


    carregarCliente();

    renderizarItens();

    atualizarResumo(
      false
    );

    atualizarReadiness();

  }
);


/* =========================================================
   CARRINHO VAZIO AO ACESSAR CHECKOUT
========================================================= */

function verificarCarrinhoInicial() {

  if (
    obterCarrinho().length > 0
  ) {

    return true;

  }


  if (
    btnFinalizarPedido
  ) {

    btnFinalizarPedido.disabled =
      true;

  }


  mostrarToast(
    "Seu carrinho está vazio. Adicione produtos antes de finalizar uma compra.",
    "warning"
  );


  setTimeout(
    () => {

      window.location.href =
        "carrinho.html";

    },
    900
  );


  return false;

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function iniciarCheckout() {

  checkoutBloqueado =
    true;


  /* =====================================================
     CLIENTE
  ===================================================== */

  carregarCliente();


  /* =====================================================
     SMART CART
  ===================================================== */

  checkoutPreview =
    carregarCheckoutPreview();


  recuperarDadosSmartCart();


  /* =====================================================
     ENDEREÇO SALVO NA SESSÃO
  ===================================================== */

  recuperarEnderecoTemporario();


  /*
    Se o endereço temporário não tinha CEP,
    mas Smart Cart tinha, mantém o CEP recuperado.
  */

  const cepSmartCart =
    localStorage.getItem(
      "cepCarrinho"
    ) ||
    checkoutPreview?.cep;


  if (
    cep &&
    !cep.value &&
    cepSmartCart
  ) {

    cep.value =
      formatarCep(
        cepSmartCart
      );

  }


  /* =====================================================
     PRODUTOS
  ===================================================== */

  await carregarProdutos();


  sincronizarCarrinho();


  /* =====================================================
     VERIFICA CARRINHO
  ===================================================== */

  if (
    !verificarCarrinhoInicial()
  ) {

    return;

  }


  /* =====================================================
     ITENS
  ===================================================== */

  renderizarItens();


  /* =====================================================
     RESUMO
  ===================================================== */

  atualizarResumo(
    false
  );


  /* =====================================================
     PAGAMENTO
  ===================================================== */

  atualizarCamposPagamento();


  /* =====================================================
     READINESS
  ===================================================== */

  checkoutBloqueado =
    false;


  atualizarReadiness();


  /* =====================================================
     ANIMAÇÕES
  ===================================================== */

  configurarAnimacoesScroll();

  configurarDeviceInterativo();


  /* =====================================================
     SITE UI
  ===================================================== */

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

iniciarCheckout();
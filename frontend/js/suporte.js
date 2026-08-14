/* =========================================================
   SUPORTE.JS
========================================================= */


/* =========================================================
   CLIENTE
========================================================= */

let clienteSuporte = null;

try {

  clienteSuporte = JSON.parse(
    localStorage.getItem("clienteLogado")
  );

} catch (error) {

  console.warn(
    "Não foi possível ler clienteLogado.",
    error
  );

}


/* =========================================================
   MENU MOBILE
========================================================= */

const menuButton =
  document.getElementById("menuButton");

const mobileMenu =
  document.getElementById("mobileMenu");


if (
  menuButton &&
  mobileMenu
) {

  menuButton.addEventListener(
    "click",
    () => {

      mobileMenu.classList.toggle(
        "open"
      );


      const icone =
        menuButton.querySelector("i");


      if (icone) {

        if (
          mobileMenu.classList.contains(
            "open"
          )
        ) {

          icone.className =
            "fa-solid fa-xmark";

        } else {

          icone.className =
            "fa-solid fa-bars";

        }

      }

    }
  );

}


/* =========================================================
   CARRINHO
========================================================= */

function atualizarCarrinhoSuporte() {

  const contador =
    document.getElementById(
      "contadorCarrinho"
    );


  if (!contador) {

    return;

  }


  try {

    const carrinho =
      JSON.parse(
        localStorage.getItem(
          "carrinho"
        )
      ) || [];


    const quantidade =
      Array.isArray(carrinho)

        ? carrinho.reduce(
            (total, item) => {

              return (
                total +
                Number(
                  item.quantidade || 0
                )
              );

            },
            0
          )

        : 0;


    contador.textContent =
      quantidade;

  } catch {

    contador.textContent =
      "0";

  }

}


/* =========================================================
   FAQ
========================================================= */

const faqItems =
  document.querySelectorAll(
    ".faq-item"
  );


faqItems.forEach(
  item => {

    const pergunta =
      item.querySelector(
        ".faq-question"
      );


    pergunta?.addEventListener(
      "click",
      () => {

        const estavaAberto =
          item.classList.contains(
            "open"
          );


        /*
          Fecha os outros.
        */

        faqItems.forEach(
          outro => {

            outro.classList.remove(
              "open"
            );

          }
        );


        if (!estavaAberto) {

          item.classList.add(
            "open"
          );

        }

      }
    );

  }
);


/* =========================================================
   BUSCA
========================================================= */

const busca =
  document.getElementById(
    "buscaSuporte"
  );

const btnBuscar =
  document.getElementById(
    "btnBuscarAjuda"
  );

const nenhumResultado =
  document.getElementById(
    "nenhumResultado"
  );


function normalizarTexto(texto) {

  return String(
    texto || ""
  )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();

}


function pesquisarAjuda(
  termoRecebido = null
) {

  const termo =
    normalizarTexto(
      termoRecebido
      ??
      busca?.value
      ??
      ""
    );


  if (busca && termoRecebido) {

    busca.value =
      termoRecebido;

  }


  let encontrados = 0;


  faqItems.forEach(
    item => {

      const palavras =
        normalizarTexto(
          item.dataset.keywords
        );


      const conteudo =
        normalizarTexto(
          item.textContent
        );


      const encontrou =
        !termo
        ||
        palavras.includes(termo)
        ||
        conteudo.includes(termo);


      item.style.display =
        encontrou
        ? ""
        : "none";


      item.classList.remove(
        "highlight"
      );


      if (
        encontrou &&
        termo
      ) {

        item.classList.add(
          "highlight"
        );

        encontrados++;

      } else if (
        encontrou
      ) {

        encontrados++;

      }

    }
  );


  if (nenhumResultado) {

    nenhumResultado.classList.toggle(
      "show",
      encontrados === 0
    );

  }


  document
    .getElementById("faq")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

}


btnBuscar?.addEventListener(
  "click",
  () => pesquisarAjuda()
);


busca?.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      pesquisarAjuda();

    }

  }
);


/* =========================================================
   BOTÕES DE BUSCA RÁPIDA
========================================================= */

document
  .querySelectorAll(
    "[data-search]"
  )
  .forEach(
    botao => {

      botao.addEventListener(
        "click",
        () => {

          pesquisarAjuda(
            botao.dataset.search
          );

        }
      );

    }
  );


/* =========================================================
   PREENCHER DADOS DO CLIENTE
========================================================= */

function preencherCliente() {

  if (!clienteSuporte) {

    return;

  }


  const nome =
    document.getElementById(
      "nomeSuporte"
    );


  const email =
    document.getElementById(
      "emailSuporte"
    );


  if (
    nome &&
    clienteSuporte.nome_cliente
  ) {

    nome.value =
      clienteSuporte.nome_cliente;

  }


  if (
    email &&
    clienteSuporte.email_cliente
  ) {

    email.value =
      clienteSuporte.email_cliente;

  } else if (
    email &&
    clienteSuporte.email
  ) {

    email.value =
      clienteSuporte.email;

  }

}


/* =========================================================
   CONTADOR DE TEXTO
========================================================= */

const mensagemSuporte =
  document.getElementById(
    "mensagemSuporte"
  );

const contadorMensagem =
  document.getElementById(
    "contadorMensagem"
  );


mensagemSuporte?.addEventListener(
  "input",
  () => {

    if (contadorMensagem) {

      contadorMensagem.textContent =
        mensagemSuporte.value.length;

    }

  }
);


/* =========================================================
   GERAR PROTOCOLO
========================================================= */

function gerarProtocolo() {

  const agora =
    new Date();


  const ano =
    agora.getFullYear();


  const numero =
    Math.floor(
      100000 +
      Math.random() * 900000
    );


  return `SUP-${ano}-${numero}`;

}


/* =========================================================
   MENSAGEM FORMULÁRIO
========================================================= */

function mostrarMensagemFormulario(
  texto,
  tipo
) {

  const elemento =
    document.getElementById(
      "mensagemFormulario"
    );


  if (!elemento) {

    return;

  }


  elemento.innerHTML = `
    <div
      class="support-message ${tipo}"
    >
      ${texto}
    </div>
  `;

}


/* =========================================================
   SALVAR SOLICITAÇÃO LOCAL
========================================================= */

function salvarSolicitacaoLocal(
  solicitacao
) {

  try {

    const anteriores =
      JSON.parse(
        localStorage.getItem(
          "solicitacoesSuporte"
        )
      ) || [];


    const lista =
      Array.isArray(anteriores)
      ? anteriores
      : [];


    lista.unshift(
      solicitacao
    );


    localStorage.setItem(
      "solicitacoesSuporte",
      JSON.stringify(lista)
    );


    return true;

  } catch (error) {

    console.error(
      "Erro ao salvar solicitação:",
      error
    );


    return false;

  }

}


/* =========================================================
   FORMULÁRIO
========================================================= */

const formSuporte =
  document.getElementById(
    "formSuporte"
  );


formSuporte?.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const nome =
      document
        .getElementById(
          "nomeSuporte"
        )
        ?.value
        .trim();


    const email =
      document
        .getElementById(
          "emailSuporte"
        )
        ?.value
        .trim();


    const assunto =
      document
        .getElementById(
          "assuntoSuporte"
        )
        ?.value;


    const numeroPedido =
      document
        .getElementById(
          "numeroPedido"
        )
        ?.value
        .trim();


    const mensagem =
      document
        .getElementById(
          "mensagemSuporte"
        )
        ?.value
        .trim();


    if (
      !nome ||
      !email ||
      !assunto ||
      !mensagem
    ) {

      mostrarMensagemFormulario(
        "Preencha todos os campos obrigatórios.",
        "error"
      );

      return;

    }


    const protocolo =
      gerarProtocolo();


    const solicitacao = {

      protocolo,

      id_cliente:
        clienteSuporte?.id_cliente
        || null,

      nome,

      email,

      assunto,

      numero_pedido:
        numeroPedido || null,

      mensagem,

      status:
        "Aberto",

      data:
        new Date().toISOString()

    };


    const salvou =
      salvarSolicitacaoLocal(
        solicitacao
      );


    if (!salvou) {

      mostrarMensagemFormulario(
        "Não foi possível registrar a solicitação.",
        "error"
      );

      return;

    }


    mostrarMensagemFormulario(
      `
        Solicitação enviada com sucesso.
        Seu protocolo é
        <strong>${protocolo}</strong>.
      `,
      "success"
    );


    formSuporte.reset();


    /*
      Volta a preencher dados do usuário
      depois do reset.
    */

    preencherCliente();


    if (contadorMensagem) {

      contadorMensagem.textContent =
        "0";

    }

  }
);


/* =========================================================
   WHATSAPP
========================================================= */

const whatsappLink =
  document.getElementById(
    "whatsappLink"
  );


whatsappLink?.addEventListener(
  "click",
  event => {

    event.preventDefault();


    /*
      IMPORTANTE:

      Depois coloque aqui o número
      real da empresa.

      Formato:
      5541999999999
    */

    const numero =
      "5500000000000";


    const mensagem =
      encodeURIComponent(
        "Olá! Preciso de ajuda com a Loja de Peças."
      );


    window.open(
      `https://wa.me/${numero}?text=${mensagem}`,
      "_blank",
      "noopener,noreferrer"
    );

  }
);


/* =========================================================
   INICIAR
========================================================= */

atualizarCarrinhoSuporte();

preencherCliente();
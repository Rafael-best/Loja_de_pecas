/* =========================================================
   SITE.JS
   Comportamentos globais da Loja de Peças
========================================================= */


/* =========================================================
   CLIENTE LOGADO
========================================================= */

function obterClienteLogado() {
  try {
    const dados = localStorage.getItem("clienteLogado");

    if (!dados) {
      return null;
    }

    const cliente = JSON.parse(dados);

    if (!cliente || typeof cliente !== "object") {
      return null;
    }

    return cliente;

  } catch (erro) {
    console.warn("Erro ao recuperar cliente logado:", erro);

    return null;
  }
}


/* =========================================================
   DADOS DO CLIENTE
========================================================= */

function obterNomeCliente(cliente) {
  if (!cliente) {
    return "Cliente";
  }

  return (
    cliente.nome_cliente ||
    cliente.nome ||
    "Cliente"
  );
}


function obterEmailCliente(cliente) {
  if (!cliente) {
    return "";
  }

  return (
    cliente.email_cliente ||
    cliente.email ||
    ""
  );
}


function obterPrimeiroNome(nome) {
  const texto = String(nome || "Cliente").trim();

  if (!texto) {
    return "Cliente";
  }

  return texto.split(/\s+/)[0];
}


function obterInicialCliente(nome) {
  const texto = String(nome || "").trim();

  if (!texto) {
    return "U";
  }

  return texto.charAt(0).toUpperCase();
}


/* =========================================================
   FOTO DO PERFIL
========================================================= */

function obterFotoPerfilCliente() {
  try {
    return localStorage.getItem("fotoPerfilCliente") || "";
  } catch {
    return "";
  }
}


function aplicarAvatar(elemento, nome, foto) {
  if (!elemento) {
    return;
  }

  if (foto) {
    elemento.textContent = "";

    elemento.style.backgroundImage =
      'url("' + foto + '")';

    elemento.style.backgroundSize =
      "cover";

    elemento.style.backgroundPosition =
      "center";

    elemento.style.backgroundRepeat =
      "no-repeat";

    return;
  }

  elemento.style.backgroundImage = "";

  elemento.textContent =
    obterInicialCliente(nome);
}


/* =========================================================
   CARRINHO
========================================================= */

function obterCarrinhoGlobal() {
  try {
    const dados = localStorage.getItem("carrinho");

    if (!dados) {
      return [];
    }

    const carrinho = JSON.parse(dados);

    return Array.isArray(carrinho)
      ? carrinho
      : [];

  } catch {
    return [];
  }
}


function obterQuantidadeCarrinho() {
  const carrinho = obterCarrinhoGlobal();

  return carrinho.reduce(
    function (total, item) {
      return (
        total +
        Number(item.quantidade || 0)
      );
    },
    0
  );
}


function atualizarCarrinhoGlobal() {
  const quantidade =
    obterQuantidadeCarrinho();

  const ids = [
    "headerCartCount",
    "mobileCartCount",
    "cartCount",
    "contadorCarrinho"
  ];

  ids.forEach(
    function (id) {
      const elemento =
        document.getElementById(id);

      if (elemento) {
        elemento.textContent =
          String(quantidade);
      }
    }
  );


  /*
    Compatibilidade com versões antigas
    que usam #btnCarrinho
  */

  const btnCarrinho =
    document.getElementById(
      "btnCarrinho"
    );

  if (!btnCarrinho) {
    return;
  }

  const contadorDentro =
    btnCarrinho.querySelector(
      "[data-cart-count]"
    );

  if (contadorDentro) {
    contadorDentro.textContent =
      String(quantidade);

    return;
  }

  btnCarrinho.textContent =
    "Carrinho (" +
    quantidade +
    ")";
}


/* =========================================================
   DEFINIR TEXTO
========================================================= */

function definirTextoGlobal(id, valor) {
  const elemento =
    document.getElementById(id);

  if (elemento) {
    elemento.textContent = valor;
  }
}


/* =========================================================
   LINKS PROTEGIDOS
========================================================= */

function interceptarLinkVisitante(event) {
  const cliente =
    obterClienteLogado();

  if (cliente) {
    return;
  }

  event.preventDefault();

  const link =
    event.currentTarget;

  const destino =
    link.getAttribute("href") ||
    "perfil.html";

  try {
    sessionStorage.setItem(
      "destinoAposLogin",
      destino
    );
  } catch {
    /* vazio */
  }

  window.location.href =
    "login.html";
}


function configurarLinksProtegidos(cliente) {
  const linksProtegidos =
    document.querySelectorAll(
      "[data-auth-link]"
    );

  linksProtegidos.forEach(
    function (link) {
      link.removeEventListener(
        "click",
        interceptarLinkVisitante
      );

      if (!cliente) {
        link.addEventListener(
          "click",
          interceptarLinkVisitante
        );
      }
    }
  );
}


/* =========================================================
   INTERFACE VISITANTE / LOGADO
========================================================= */

function atualizarInterfaceCliente() {
  const cliente =
    obterClienteLogado();

  const guestActions =
    document.getElementById(
      "guestActions"
    );

  const userMenuWrapper =
    document.getElementById(
      "userMenuWrapper"
    );

  const mobileGuestActions =
    document.getElementById(
      "mobileGuestActions"
    );

  const mobileLogoutButton =
    document.getElementById(
      "mobileLogoutButton"
    );

  const mobileUserSummary =
    document.getElementById(
      "mobileUserSummary"
    );


  /* =====================================================
     VISITANTE
  ===================================================== */

  if (!cliente) {
    if (guestActions) {
      guestActions.hidden = false;
    }

    if (userMenuWrapper) {
      userMenuWrapper.hidden = true;
    }

    if (mobileGuestActions) {
      mobileGuestActions.hidden = false;
    }

    if (mobileLogoutButton) {
      mobileLogoutButton.hidden = true;
    }

    if (mobileUserSummary) {
      mobileUserSummary.hidden = true;
    }

    configurarLinksProtegidos(null);

    atualizarCarrinhoGlobal();

    return;
  }


  /* =====================================================
     USUÁRIO LOGADO
  ===================================================== */

  if (guestActions) {
    guestActions.hidden = true;
  }

  if (userMenuWrapper) {
    userMenuWrapper.hidden = false;
  }

  if (mobileGuestActions) {
    mobileGuestActions.hidden = true;
  }

  if (mobileLogoutButton) {
    mobileLogoutButton.hidden = false;
  }

  if (mobileUserSummary) {
    mobileUserSummary.hidden = false;
  }


  const nome =
    obterNomeCliente(cliente);

  const email =
    obterEmailCliente(cliente);

  const primeiroNome =
    obterPrimeiroNome(nome);

  const foto =
    obterFotoPerfilCliente();


  definirTextoGlobal(
    "headerUserName",
    primeiroNome
  );

  definirTextoGlobal(
    "dropdownUserName",
    nome
  );

  definirTextoGlobal(
    "dropdownUserEmail",
    email || "Cliente"
  );


  /* =====================================================
     AVATARES COM ID
  ===================================================== */

  aplicarAvatar(
    document.getElementById(
      "headerUserAvatar"
    ),
    nome,
    foto
  );

  aplicarAvatar(
    document.getElementById(
      "dropdownAvatar"
    ),
    nome,
    foto
  );


  /* =====================================================
     ELEMENTOS POR DATA ATTRIBUTE
  ===================================================== */

  const nomes =
    document.querySelectorAll(
      "[data-user-name]"
    );

  nomes.forEach(
    function (elemento) {
      /*
        No header mostramos primeiro nome.
        Nos outros lugares pode usar nome completo.
      */

      if (
        elemento.id ===
        "headerUserName"
      ) {
        elemento.textContent =
          primeiroNome;
      } else {
        elemento.textContent =
          nome;
      }
    }
  );


  const emails =
    document.querySelectorAll(
      "[data-user-email]"
    );

  emails.forEach(
    function (elemento) {
      elemento.textContent =
        email || "E-mail não informado";
    }
  );


  const avatares =
    document.querySelectorAll(
      "[data-user-avatar]"
    );

  avatares.forEach(
    function (elemento) {
      aplicarAvatar(
        elemento,
        nome,
        foto
      );
    }
  );


  configurarLinksProtegidos(cliente);

  atualizarCarrinhoGlobal();
}


/* =========================================================
   LOGOUT
========================================================= */

function logoutCliente() {
  try {
    localStorage.removeItem(
      "clienteLogado"
    );

    sessionStorage.removeItem(
      "destinoAposLogin"
    );
  } catch {
    /* vazio */
  }

  window.location.href =
    "index.html";
}


/* =========================================================
   DROPDOWN DO USUÁRIO
========================================================= */

function configurarDropdownUsuario() {
  const userMenuButton =
    document.getElementById(
      "userMenuButton"
    );

  const userDropdown =
    document.getElementById(
      "userDropdown"
    );

  const userMenuWrapper =
    document.getElementById(
      "userMenuWrapper"
    );

  if (
    !userMenuButton ||
    !userDropdown
  ) {
    return;
  }


  function fecharDropdown() {
    userDropdown.classList.remove(
      "open"
    );

    userMenuWrapper?.classList.remove(
      "dropdown-open"
    );

    userMenuButton.setAttribute(
      "aria-expanded",
      "false"
    );
  }


  function abrirDropdown() {
    userDropdown.classList.add(
      "open"
    );

    userMenuWrapper?.classList.add(
      "dropdown-open"
    );

    userMenuButton.setAttribute(
      "aria-expanded",
      "true"
    );
  }


  userMenuButton.addEventListener(
    "click",
    function (event) {
      event.preventDefault();

      event.stopPropagation();

      const aberto =
        userDropdown.classList.contains(
          "open"
        );

      if (aberto) {
        fecharDropdown();
      } else {
        abrirDropdown();
      }
    }
  );


  userDropdown.addEventListener(
    "click",
    function (event) {
      event.stopPropagation();
    }
  );


  document.addEventListener(
    "click",
    function () {
      fecharDropdown();
    }
  );


  document.addEventListener(
    "keydown",
    function (event) {
      if (event.key === "Escape") {
        fecharDropdown();
      }
    }
  );
}


/* =========================================================
   MENU HAMBÚRGUER / MOBILE
========================================================= */

function configurarMenuMobile() {
  const botao =
    document.getElementById(
      "menuToggle"
    );

  const menu =
    document.getElementById(
      "mobileMenu"
    );

  const botaoFechar =
    document.getElementById(
      "menuClose"
    );

  const backdrop =
    document.getElementById(
      "mobileMenuBackdrop"
    );

  if (!botao || !menu) {
    return;
  }


  function abrirMenu() {
    menu.classList.add(
      "active"
    );

    backdrop?.classList.add(
      "active"
    );

    botao.classList.add(
      "active"
    );

    document.body.classList.add(
      "menu-open"
    );

    botao.setAttribute(
      "aria-expanded",
      "true"
    );

    menu.setAttribute(
      "aria-hidden",
      "false"
    );
  }


  function fecharMenu() {
    menu.classList.remove(
      "active"
    );

    menu.classList.remove(
      "open"
    );

    backdrop?.classList.remove(
      "active"
    );

    botao.classList.remove(
      "active"
    );

    document.body.classList.remove(
      "menu-open"
    );

    botao.setAttribute(
      "aria-expanded",
      "false"
    );

    menu.setAttribute(
      "aria-hidden",
      "true"
    );
  }


  function alternarMenu() {
    const aberto =
      menu.classList.contains(
        "active"
      );

    if (aberto) {
      fecharMenu();
    } else {
      abrirMenu();
    }
  }


  botao.addEventListener(
    "click",
    function (event) {
      event.preventDefault();

      event.stopPropagation();

      alternarMenu();
    }
  );


  if (botaoFechar) {
    botaoFechar.addEventListener(
      "click",
      fecharMenu
    );
  }


  if (backdrop) {
    backdrop.addEventListener(
      "click",
      fecharMenu
    );
  }


  const links =
    menu.querySelectorAll("a");

  links.forEach(
    function (link) {
      link.addEventListener(
        "click",
        function () {
          fecharMenu();
        }
      );
    }
  );


  document.addEventListener(
    "keydown",
    function (event) {
      if (event.key === "Escape") {
        fecharMenu();
      }
    }
  );


  window.addEventListener(
    "resize",
    function () {
      if (
        window.innerWidth > 850
      ) {
        fecharMenu();
      }
    }
  );
}


/* =========================================================
   BUSCA GLOBAL
========================================================= */

function configurarBuscaGlobal() {
  const formulario =
    document.getElementById(
      "headerSearchForm"
    );

  const inputDesktop =
    document.getElementById(
      "headerSearchInput"
    );

  const inputMobile =
    document.getElementById(
      "mobileSearchInput"
    );


  function executarBusca(valor) {
    const busca =
      String(valor || "").trim();

    if (!busca) {
      return;
    }

    /*
      Guarda a busca para a página
      produtos.html recuperar.
    */

    try {
      sessionStorage.setItem(
        "buscaProdutos",
        busca
      );
    } catch {
      /* vazio */
    }


    const paginaAtual =
      window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();


    /*
      Se já estiver em produtos.html,
      tenta usar o campo da página.
    */

    if (
      paginaAtual === "produtos.html"
    ) {
      const campoBusca =
        document.getElementById(
          "campoBusca"
        );

      if (campoBusca) {
        campoBusca.value =
          busca;

        campoBusca.dispatchEvent(
          new Event(
            "input",
            {
              bubbles: true
            }
          )
        );

        campoBusca.scrollIntoView(
          {
            behavior: "smooth",
            block: "center"
          }
        );

        return;
      }
    }


    window.location.href =
      "produtos.html";
  }


  if (formulario) {
    formulario.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();

        executarBusca(
          inputDesktop?.value
        );
      }
    );
  }


  if (inputMobile) {
    inputMobile.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Enter") {
          event.preventDefault();

          executarBusca(
            inputMobile.value
          );
        }
      }
    );
  }
}


/* =========================================================
   RECUPERAR BUSCA EM PRODUTOS
========================================================= */

function recuperarBuscaProdutos() {
  const campoBusca =
    document.getElementById(
      "campoBusca"
    );

  if (!campoBusca) {
    return;
  }

  let busca = "";

  try {
    busca =
      sessionStorage.getItem(
        "buscaProdutos"
      ) || "";

    sessionStorage.removeItem(
      "buscaProdutos"
    );
  } catch {
    /* vazio */
  }

  if (!busca) {
    return;
  }

  campoBusca.value =
    busca;

  setTimeout(
    function () {
      campoBusca.dispatchEvent(
        new Event(
          "input",
          {
            bubbles: true
          }
        )
      );
    },
    100
  );
}


/* =========================================================
   BOTÕES DE LOGOUT
========================================================= */

function configurarLogout() {
  const logoutDesktop =
    document.getElementById(
      "btnLogoutGlobal"
    );

  const logoutMobile =
    document.getElementById(
      "mobileLogoutButton"
    );

  const logoutAntigo =
    document.getElementById(
      "btnSair"
    );


  if (logoutDesktop) {
    logoutDesktop.addEventListener(
      "click",
      logoutCliente
    );
  }


  if (logoutMobile) {
    logoutMobile.addEventListener(
      "click",
      logoutCliente
    );
  }


  if (logoutAntigo) {
    logoutAntigo.addEventListener(
      "click",
      logoutCliente
    );
  }
}


/* =========================================================
   ANO DO RODAPÉ
========================================================= */

function atualizarAnoRodape() {
  const elemento =
    document.getElementById(
      "currentYear"
    );

  if (!elemento) {
    return;
  }

  elemento.textContent =
    String(
      new Date().getFullYear()
    );
}


/* =========================================================
   EVENTOS DE STORAGE
========================================================= */

window.addEventListener(
  "storage",
  function (event) {
    if (
      event.key === "carrinho" ||
      event.key === "clienteLogado" ||
      event.key === "fotoPerfilCliente"
    ) {
      atualizarInterfaceCliente();
    }
  }
);


/* =========================================================
   EVENTO PERSONALIZADO DO CARRINHO
========================================================= */

window.addEventListener(
  "carrinhoAtualizado",
  function () {
    atualizarCarrinhoGlobal();
  }
);


/* =========================================================
   API GLOBAL
========================================================= */

window.SiteUI = {
  atualizarCliente:
    atualizarInterfaceCliente,

  atualizarCarrinho:
    atualizarCarrinhoGlobal,

  obterCliente:
    obterClienteLogado,

  obterFoto:
    obterFotoPerfilCliente,

  logout:
    logoutCliente
};


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {
    configurarDropdownUsuario();

    configurarMenuMobile();

    configurarLogout();

    configurarBuscaGlobal();

    atualizarInterfaceCliente();

    atualizarCarrinhoGlobal();

    recuperarBuscaProdutos();

    atualizarAnoRodape();
  }
);
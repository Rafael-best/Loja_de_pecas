/* =========================================================
   SITE.JS
   Comportamentos globais da Loja de Peças
========================================================= */


/* =========================================================
   CLIENTE LOGADO
========================================================= */

function obterClienteLogado() {

    try {
  
      const dados =
        localStorage.getItem(
          "clienteLogado"
        );
  
  
      if (!dados) {
  
        return null;
  
      }
  
  
      const cliente =
        JSON.parse(dados);
  
  
      if (
        !cliente
        ||
        typeof cliente !== "object"
      ) {
  
        return null;
  
      }
  
  
      return cliente;
  
    } catch (erro) {
  
      console.warn(
        "Erro ao recuperar cliente logado:",
        erro
      );
  
  
      return null;
  
    }
  
  }
  
  
  
  /* =========================================================
     NOME / EMAIL
  ========================================================= */
  
  function obterNomeCliente(cliente) {
  
    if (!cliente) {
  
      return "Cliente";
  
    }
  
  
    return (
      cliente.nome_cliente
      ||
      cliente.nome
      ||
      "Cliente"
    );
  
  }
  
  
  
  function obterEmailCliente(cliente) {
  
    if (!cliente) {
  
      return "";
  
    }
  
  
    return (
      cliente.email_cliente
      ||
      cliente.email
      ||
      ""
    );
  
  }
  
  
  
  function obterPrimeiroNome(nome) {
  
    const texto =
      String(
        nome || "Cliente"
      )
        .trim();
  
  
    if (!texto) {
  
      return "Cliente";
  
    }
  
  
    return texto
      .split(/\s+/)[0];
  
  }
  
  
  
  function obterInicialCliente(nome) {
  
    const texto =
      String(
        nome || ""
      )
        .trim();
  
  
    if (!texto) {
  
      return "U";
  
    }
  
  
    return texto
      .charAt(0)
      .toUpperCase();
  
  }
  
  
  
  /* =========================================================
     FOTO
  ========================================================= */
  
  function obterFotoPerfilCliente() {
  
    try {
  
      return (
        localStorage.getItem(
          "fotoPerfilCliente"
        )
        ||
        ""
      );
  
    } catch {
  
      return "";
  
    }
  
  }
  
  
  
  function aplicarAvatar(
    elemento,
    nome,
    foto
  ) {
  
    if (!elemento) {
  
      return;
  
    }
  
  
    if (foto) {
  
      elemento.textContent =
        "";
  
  
      elemento.style.backgroundImage =
        'url("' + foto + '")';
  
  
      elemento.style.backgroundSize =
        "cover";
  
  
      elemento.style.backgroundPosition =
        "center";
  
  
      elemento.style.backgroundRepeat =
        "no-repeat";
  
    } else {
  
      elemento.style.backgroundImage =
        "";
  
  
      elemento.textContent =
        obterInicialCliente(
          nome
        );
  
    }
  
  }
  
  
  
  /* =========================================================
     CARRINHO
  ========================================================= */
  
  function obterCarrinhoGlobal() {
  
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
  
  
      return Array.isArray(
        carrinho
      )
        ? carrinho
        : [];
  
    } catch {
  
      return [];
  
    }
  
  }
  
  
  
  function obterQuantidadeCarrinho() {
  
    const carrinho =
      obterCarrinhoGlobal();
  
  
    return carrinho.reduce(
      function (
        total,
        item
      ) {
  
        return (
          total
          +
          Number(
            item.quantidade || 0
          )
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
          document.getElementById(
            id
          );
  
  
        if (elemento) {
  
          elemento.textContent =
            String(quantidade);
  
        }
  
      }
    );
  
  
    const btnCarrinho =
      document.getElementById(
        "btnCarrinho"
      );
  
  
    if (btnCarrinho) {
  
      const contadorDentro =
        btnCarrinho.querySelector(
          "[data-cart-count]"
        );
  
  
      if (contadorDentro) {
  
        contadorDentro.textContent =
          String(quantidade);
  
      } else {
  
        const textoOriginal =
          btnCarrinho.dataset
            .textoOriginal;
  
  
        if (!textoOriginal) {
  
          btnCarrinho.dataset
            .textoOriginal =
              "Carrinho";
  
        }
  
  
        btnCarrinho.textContent =
          "Carrinho (" +
          quantidade +
          ")";
  
      }
  
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
      link.getAttribute(
        "href"
      )
      ||
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
  
  
  
  /* =========================================================
     INTERFACE VISITANTE / CLIENTE
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
  
  
    const linksProtegidos =
      document.querySelectorAll(
        "[data-auth-link]"
      );
  
  
  
    /* =====================================================
       VISITANTE
    ===================================================== */
  
    if (!cliente) {
  
      if (guestActions) {
  
        guestActions.hidden =
          false;
  
      }
  
  
      if (userMenuWrapper) {
  
        userMenuWrapper.hidden =
          true;
  
      }
  
  
      if (mobileGuestActions) {
  
        mobileGuestActions.hidden =
          false;
  
      }
  
  
      if (mobileLogoutButton) {
  
        mobileLogoutButton.hidden =
          true;
  
      }
  
  
      linksProtegidos.forEach(
        function (link) {
  
          link.removeEventListener(
            "click",
            interceptarLinkVisitante
          );
  
  
          link.addEventListener(
            "click",
            interceptarLinkVisitante
          );
  
        }
      );
  
  
      atualizarCarrinhoGlobal();
  
  
      return;
  
    }
  
  
  
    /* =====================================================
       LOGADO
    ===================================================== */
  
    if (guestActions) {
  
      guestActions.hidden =
        true;
  
    }
  
  
    if (userMenuWrapper) {
  
      userMenuWrapper.hidden =
        false;
  
    }
  
  
    if (mobileGuestActions) {
  
      mobileGuestActions.hidden =
        true;
  
    }
  
  
    if (mobileLogoutButton) {
  
      mobileLogoutButton.hidden =
        false;
  
    }
  
  
  
    const nome =
      obterNomeCliente(
        cliente
      );
  
  
    const email =
      obterEmailCliente(
        cliente
      );
  
  
    const primeiroNome =
      obterPrimeiroNome(
        nome
      );
  
  
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
  
  
  
    linksProtegidos.forEach(
      function (link) {
  
        link.removeEventListener(
          "click",
          interceptarLinkVisitante
        );
  
      }
    );
  
  
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
      "produtos.html";
  
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
  
  
    if (
      !userMenuButton
      ||
      !userDropdown
    ) {
  
      return;
  
    }
  
  
    userMenuButton.addEventListener(
      "click",
      function (event) {
  
        event.preventDefault();
  
        event.stopPropagation();
  
  
        userDropdown.classList.toggle(
          "open"
        );
  
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
  
        userDropdown.classList.remove(
          "open"
        );
  
      }
    );
  
  }
  
  
  
  /* =========================================================
     MENU MOBILE
  ========================================================= */
  
  function configurarMenuMobile() {
  
    const botao =
      document.getElementById(
        "mobileMenuButton"
      );
  
  
    const menu =
      document.getElementById(
        "mobileMenu"
      );
  
  
    if (
      !botao
      ||
      !menu
    ) {
  
      return;
  
    }
  
  
    botao.addEventListener(
      "click",
      function () {
  
        menu.classList.toggle(
          "open"
        );
  
  
        const icone =
          botao.querySelector(
            "i"
          );
  
  
        if (!icone) {
  
          return;
  
        }
  
  
        if (
          menu.classList.contains(
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
  
  }
  
  
  
  /* =========================================================
     TEXTO
  ========================================================= */
  
  function definirTextoGlobal(
    id,
    valor
  ) {
  
    const elemento =
      document.getElementById(
        id
      );
  
  
    if (elemento) {
  
      elemento.textContent =
        valor;
  
    }
  
  }
  
  
  
  /* =========================================================
     EVENTOS DE STORAGE
  ========================================================= */
  
  window.addEventListener(
    "storage",
    function (event) {
  
      if (
        event.key === "carrinho"
        ||
        event.key === "clienteLogado"
        ||
        event.key === "fotoPerfilCliente"
      ) {
  
        atualizarInterfaceCliente();
  
      }
  
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
     INICIAR
  ========================================================= */
  
  document.addEventListener(
    "DOMContentLoaded",
    function () {
  
      configurarDropdownUsuario();
  
      configurarMenuMobile();
  
      configurarLogout();
  
      atualizarInterfaceCliente();
  
    }
  );
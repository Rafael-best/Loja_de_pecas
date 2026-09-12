/* =========================================================
   PERFIL.JS
   CUSTOMER PERSONAL HUB
   Loja de Peças
========================================================= */


/* =========================================================
   CONFIG / STORAGE KEYS
========================================================= */

const STORAGE_CLIENTE =
  "clienteLogado";

const STORAGE_ENDERECOS =
  "enderecosCliente";

const STORAGE_VEICULOS =
  "veiculosCliente";

const STORAGE_PEDIDOS =
  "pedidos";

const STORAGE_AVATAR =
  "avatarCliente";


/* =========================================================
   STATE
========================================================= */

let clienteAtual =
  null;

let enderecos =
  [];

let veiculos =
  [];

let secaoAtual =
  "overview";

let toastTimer =
  null;


/* =========================================================
   ELEMENTS
========================================================= */


/* =========================================================
   LOADING
========================================================= */

const profileLoading =
  document.getElementById(
    "profileLoading"
  );


/* =========================================================
   HERO
========================================================= */

const profileHeroName =
  document.getElementById(
    "profileHeroName"
  );

const profileAvatarButton =
  document.getElementById(
    "profileAvatarButton"
  );

const profileAvatarImage =
  document.getElementById(
    "profileAvatarImage"
  );

const profileAvatarInitial =
  document.getElementById(
    "profileAvatarInitial"
  );

const profileAvatarInput =
  document.getElementById(
    "profileAvatarInput"
  );


/* =========================================================
   HERO STATS
========================================================= */

const profileOrdersCount =
  document.getElementById(
    "profileOrdersCount"
  );

const profileVehiclesCount =
  document.getElementById(
    "profileVehiclesCount"
  );

const profileAddressesCount =
  document.getElementById(
    "profileAddressesCount"
  );


/* =========================================================
   SIDEBAR / NAV
========================================================= */

const profileNavItems =
  Array.from(
    document.querySelectorAll(
      "[data-profile-section]"
    )
  );

const profilePanels =
  Array.from(
    document.querySelectorAll(
      "[data-profile-panel]"
    )
  );

const profileQuickLinks =
  Array.from(
    document.querySelectorAll(
      "[data-go-profile]"
    )
  );


/* =========================================================
   OVERVIEW
========================================================= */

const overviewAvatar =
  document.getElementById(
    "overviewAvatar"
  );

const overviewName =
  document.getElementById(
    "overviewName"
  );

const overviewEmail =
  document.getElementById(
    "overviewEmail"
  );

const overviewCustomerId =
  document.getElementById(
    "overviewCustomerId"
  );

const profileCompletionText =
  document.getElementById(
    "profileCompletionText"
  );

const profileCompletionBar =
  document.getElementById(
    "profileCompletionBar"
  );


/* =========================================================
   PERSONAL FORM
========================================================= */

const profileForm =
  document.getElementById(
    "profileForm"
  );

const profileName =
  document.getElementById(
    "profileName"
  );

const profileEmail =
  document.getElementById(
    "profileEmail"
  );

const profilePhone =
  document.getElementById(
    "profilePhone"
  );

const profileCpf =
  document.getElementById(
    "profileCpf"
  );

const profileFormStatus =
  document.getElementById(
    "profileFormStatus"
  );

const profileSaveButton =
  document.getElementById(
    "profileSaveButton"
  );


/* =========================================================
   SECURITY
========================================================= */

const passwordForm =
  document.getElementById(
    "passwordForm"
  );

const currentPassword =
  document.getElementById(
    "currentPassword"
  );

const newPassword =
  document.getElementById(
    "newPassword"
  );

const confirmPassword =
  document.getElementById(
    "confirmPassword"
  );

const passwordStrengthText =
  document.getElementById(
    "passwordStrengthText"
  );

const passwordStrengthBar =
  document.getElementById(
    "passwordStrengthBar"
  );


/* =========================================================
   ADDRESS
========================================================= */

const addAddressButton =
  document.getElementById(
    "addAddressButton"
  );

const addressesGrid =
  document.getElementById(
    "addressesGrid"
  );

const addressesEmpty =
  document.getElementById(
    "addressesEmpty"
  );

const addressModal =
  document.getElementById(
    "addressModal"
  );

const addressModalTitle =
  document.getElementById(
    "addressModalTitle"
  );

const addressForm =
  document.getElementById(
    "addressForm"
  );

const addressEditId =
  document.getElementById(
    "addressEditId"
  );

const addressName =
  document.getElementById(
    "addressName"
  );

const addressCep =
  document.getElementById(
    "addressCep"
  );

const addressNumber =
  document.getElementById(
    "addressNumber"
  );

const addressStreet =
  document.getElementById(
    "addressStreet"
  );

const addressComplement =
  document.getElementById(
    "addressComplement"
  );

const addressDistrict =
  document.getElementById(
    "addressDistrict"
  );

const addressCity =
  document.getElementById(
    "addressCity"
  );

const addressState =
  document.getElementById(
    "addressState"
  );


/* =========================================================
   VEHICLE
========================================================= */

const addVehicleButton =
  document.getElementById(
    "addVehicleButton"
  );

const vehiclesGrid =
  document.getElementById(
    "vehiclesGrid"
  );

const vehiclesEmpty =
  document.getElementById(
    "vehiclesEmpty"
  );

const vehicleModal =
  document.getElementById(
    "vehicleModal"
  );

const vehicleModalTitle =
  document.getElementById(
    "vehicleModalTitle"
  );

const vehicleForm =
  document.getElementById(
    "vehicleForm"
  );

const vehicleEditId =
  document.getElementById(
    "vehicleEditId"
  );

const vehicleBrand =
  document.getElementById(
    "vehicleBrand"
  );

const vehicleModel =
  document.getElementById(
    "vehicleModel"
  );

const vehicleYear =
  document.getElementById(
    "vehicleYear"
  );

const vehiclePlate =
  document.getElementById(
    "vehiclePlate"
  );

const vehicleEngine =
  document.getElementById(
    "vehicleEngine"
  );


/* =========================================================
   TOAST
========================================================= */

const profileToast =
  document.getElementById(
    "profileToast"
  );


/* =========================================================
   HELPERS
========================================================= */

function normalizarTexto(valor) {

  return String(
    valor || ""
  ).trim();

}


function gerarId() {

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );

}


function lerJSON(
  chave,
  fallback
) {

  try {

    const valor =
      localStorage.getItem(
        chave
      );


    if (!valor) {
      return fallback;
    }


    return JSON.parse(
      valor
    );

  } catch {

    return fallback;

  }

}


function salvarJSON(
  chave,
  valor
) {

  localStorage.setItem(
    chave,
    JSON.stringify(
      valor
    )
  );

}


function animar(
  elemento,
  frames,
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
    frames,
    options
  );

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
   CLIENTE
========================================================= */

function carregarCliente() {

  clienteAtual =
    lerJSON(
      STORAGE_CLIENTE,
      null
    );


  if (!clienteAtual) {

    mostrarToast(
      "Você precisa entrar para acessar seu perfil.",
      "warning"
    );


    setTimeout(
      () => {

        window.location.href =
          "login.html";

      },
      700
    );


    return false;

  }


  return true;

}


/* =========================================================
   NORMALIZAR CAMPOS DO CLIENTE
========================================================= */

function obterNomeCliente() {

  return normalizarTexto(
    clienteAtual?.nome_cliente ||
    clienteAtual?.nome ||
    clienteAtual?.nomeCompleto ||
    "Cliente"
  );

}


function obterEmailCliente() {

  return normalizarTexto(
    clienteAtual?.email_cliente ||
    clienteAtual?.email ||
    ""
  );

}


function obterTelefoneCliente() {

  return normalizarTexto(
    clienteAtual?.telefone_cliente ||
    clienteAtual?.telefone ||
    ""
  );

}


function obterCpfCliente() {

  return normalizarTexto(
    clienteAtual?.cpf_cliente ||
    clienteAtual?.cpf ||
    ""
  );

}


function obterIdCliente() {

  return (
    clienteAtual?.id_cliente ||
    clienteAtual?.id ||
    clienteAtual?.cliente_id ||
    "0000"
  );

}


/* =========================================================
   SALVAR CLIENTE
========================================================= */

function salvarClienteAtual() {

  salvarJSON(
    STORAGE_CLIENTE,
    clienteAtual
  );


  window.dispatchEvent(
    new CustomEvent(
      "clienteAtualizado",
      {
        detail:
          clienteAtual
      }
    )
  );

}


/* =========================================================
   TOAST
========================================================= */

function mostrarToast(
  mensagem,
  tipo = "success"
) {

  if (!profileToast) {
    return;
  }


  clearTimeout(
    toastTimer
  );


  profileToast.classList.remove(
    "show",
    "error",
    "warning"
  );


  if (
    tipo === "error"
  ) {

    profileToast.classList.add(
      "error"
    );

  }


  if (
    tipo === "warning"
  ) {

    profileToast.classList.add(
      "warning"
    );

  }


  profileToast.textContent =
    mensagem;


  void profileToast.offsetWidth;


  profileToast.classList.add(
    "show"
  );


  toastTimer =
    setTimeout(
      () => {

        profileToast.classList.remove(
          "show"
        );

      },
      2600
    );

}


/* =========================================================
   LOADING
========================================================= */

function esconderLoading() {

  if (!profileLoading) {
    return;
  }


  profileLoading.classList.add(
    "hidden"
  );


  setTimeout(
    () => {

      profileLoading.style.display =
        "none";

    },
    450
  );

}


/* =========================================================
   AVATAR
========================================================= */

function obterAvatar() {

  return (
    clienteAtual?.foto ||
    clienteAtual?.avatar ||
    localStorage.getItem(
      STORAGE_AVATAR
    ) ||
    ""
  );

}


function obterInicial() {

  const nome =
    obterNomeCliente();


  return (
    nome
      .charAt(0)
      .toUpperCase() ||
    "U"
  );

}


function aplicarAvatar(
  avatar
) {

  const inicial =
    obterInicial();


  /* HERO */

  if (
    avatar &&
    profileAvatarImage
  ) {

    profileAvatarImage.src =
      avatar;


    profileAvatarImage.hidden =
      false;


    if (
      profileAvatarInitial
    ) {

      profileAvatarInitial.style.display =
        "none";

    }

  } else {

    if (
      profileAvatarImage
    ) {

      profileAvatarImage.hidden =
        true;

    }


    if (
      profileAvatarInitial
    ) {

      profileAvatarInitial.style.display =
        "";


      profileAvatarInitial.textContent =
        inicial;

    }

  }


  /* OVERVIEW */

  if (
    overviewAvatar
  ) {

    if (avatar) {

      overviewAvatar.innerHTML =
        "";


      const img =
        document.createElement(
          "img"
        );


      img.src =
        avatar;


      img.alt =
        "Foto do cliente";


      overviewAvatar.appendChild(
        img
      );

    } else {

      overviewAvatar.textContent =
        inicial;

    }

  }


  /* HEADER AVATARS */

  document
    .querySelectorAll(
      "[data-user-avatar]"
    )
    .forEach(
      elemento => {

        if (avatar) {

          elemento.innerHTML =
            "";


          const img =
            document.createElement(
              "img"
            );


          img.src =
            avatar;


          img.alt =
            "Avatar";


          img.style.width =
            "100%";


          img.style.height =
            "100%";


          img.style.objectFit =
            "cover";


          img.style.borderRadius =
            "inherit";


          elemento.appendChild(
            img
          );

        } else {

          elemento.textContent =
            inicial;

        }

      }
    );

}


/* =========================================================
   AVATAR INPUT
========================================================= */

function abrirSeletorAvatar() {

  profileAvatarInput
    ?.click();

}


function alterarAvatar(
  arquivo
) {

  if (!arquivo) {
    return;
  }


  if (
    !arquivo.type.startsWith(
      "image/"
    )
  ) {

    mostrarToast(
      "Selecione uma imagem válida.",
      "warning"
    );


    return;

  }


  const limite =
    2.5 *
    1024 *
    1024;


  if (
    arquivo.size >
    limite
  ) {

    mostrarToast(
      "A imagem deve ter no máximo 2,5 MB.",
      "warning"
    );


    return;

  }


  const reader =
    new FileReader();


  reader.onload =
    () => {

      const avatar =
        reader.result;


      localStorage.setItem(
        STORAGE_AVATAR,
        avatar
      );


      clienteAtual.avatar =
        avatar;


      clienteAtual.foto =
        avatar;


      salvarClienteAtual();


      aplicarAvatar(
        avatar
      );


      mostrarToast(
        "Foto de perfil atualizada."
      );


      animar(
        profileAvatarButton,
        [
          {
            transform:
              "scale(1)"
          },
          {
            transform:
              "scale(.94)"
          },
          {
            transform:
              "scale(1.06)"
          },
          {
            transform:
              "scale(1)"
          }
        ],
        {
          duration: 420
        }
      );

    };


  reader.readAsDataURL(
    arquivo
  );

}


/* =========================================================
   PREENCHER PERFIL
========================================================= */

function preencherDadosCliente() {

  const nome =
    obterNomeCliente();

  const email =
    obterEmailCliente();

  const telefone =
    obterTelefoneCliente();

  const cpf =
    obterCpfCliente();

  const id =
    obterIdCliente();


  if (
    profileHeroName
  ) {

    profileHeroName.textContent =
      nome;

  }


  if (
    overviewName
  ) {

    overviewName.textContent =
      nome;

  }


  if (
    overviewEmail
  ) {

    overviewEmail.textContent =
      email ||
      "E-mail não informado";

  }


  if (
    overviewCustomerId
  ) {

    overviewCustomerId.textContent =
      `#${String(id)
        .padStart(
          4,
          "0"
        )}`;

  }


  if (
    profileName
  ) {

    profileName.value =
      nome;

  }


  if (
    profileEmail
  ) {

    profileEmail.value =
      email;

  }


  if (
    profilePhone
  ) {

    profilePhone.value =
      telefone;

  }


  if (
    profileCpf
  ) {

    profileCpf.value =
      cpf;

  }


  /* HEADER */

  document
    .querySelectorAll(
      "[data-user-name]"
    )
    .forEach(
      elemento => {

        elemento.textContent =
          nome;

      }
    );


  document
    .querySelectorAll(
      "[data-user-email]"
    )
    .forEach(
      elemento => {

        elemento.textContent =
          email ||
          "-";

      }
    );


  aplicarAvatar(
    obterAvatar()
  );

}


/* =========================================================
   SALVAR DADOS PESSOAIS
========================================================= */

async function salvarDadosPessoais(
  evento
) {

  evento.preventDefault();


  const nome =
    normalizarTexto(
      profileName?.value
    );

  const email =
    normalizarTexto(
      profileEmail?.value
    );

  const telefone =
    normalizarTexto(
      profilePhone?.value
    );

  const cpf =
    normalizarTexto(
      profileCpf?.value
    );


  if (!nome) {

    mostrarToast(
      "Informe seu nome.",
      "warning"
    );


    profileName?.focus();

    return;

  }


  if (!email) {

    mostrarToast(
      "Informe seu e-mail.",
      "warning"
    );


    profileEmail?.focus();

    return;

  }


  /* =====================================================
     UPDATE BUTTON
  ===================================================== */

  const original =
    profileSaveButton?.innerHTML;


  if (
    profileSaveButton
  ) {

    profileSaveButton.disabled =
      true;


    profileSaveButton.innerHTML =
      `
        <span>
          <small>
            SAVING
          </small>

          <strong>
            Salvando...
          </strong>
        </span>

        <i class="fa-solid fa-spinner fa-spin"></i>
      `;

  }


  await esperar(
    500
  );


  /* =====================================================
     MANTÉM FORMATOS DIFERENTES COMPATÍVEIS
  ===================================================== */

  clienteAtual.nome_cliente =
    nome;

  clienteAtual.nome =
    nome;

  clienteAtual.email_cliente =
    email;

  clienteAtual.email =
    email;

  clienteAtual.telefone_cliente =
    telefone;

  clienteAtual.telefone =
    telefone;

  clienteAtual.cpf_cliente =
    cpf;

  clienteAtual.cpf =
    cpf;


  salvarClienteAtual();


  preencherDadosCliente();


  atualizarCompletude();


  if (
    profileFormStatus
  ) {

    profileFormStatus.textContent =
      "Alterações salvas.";

  }


  if (
    profileSaveButton
  ) {

    profileSaveButton.innerHTML =
      `
        <span>
          <small>
            UPDATED
          </small>

          <strong>
            Alterações salvas
          </strong>
        </span>

        <i class="fa-solid fa-check"></i>
      `;

  }


  mostrarToast(
    "Seus dados foram atualizados."
  );


  setTimeout(
    () => {

      if (
        profileSaveButton
      ) {

        profileSaveButton.disabled =
          false;


        profileSaveButton.innerHTML =
          original;

      }


      if (
        profileFormStatus
      ) {

        profileFormStatus.textContent =
          "Nenhuma alteração pendente.";

      }

    },
    1100
  );

}


/* =========================================================
   FORM DIRTY
========================================================= */

function marcarFormularioAlterado() {

  if (
    profileFormStatus
  ) {

    profileFormStatus.textContent =
      "Existem alterações não salvas.";

  }

}


/* =========================================================
   SECTION NAVIGATION
========================================================= */

async function trocarSecao(
  secao,
  atualizarHash = true
) {

  const novoPainel =
    profilePanels.find(
      painel =>
        painel.dataset.profilePanel ===
        secao
    );


  if (!novoPainel) {
    return;
  }


  if (
    secao ===
    secaoAtual &&
    novoPainel.classList.contains(
      "active"
    )
  ) {

    return;

  }


  const painelAtual =
    profilePanels.find(
      painel =>
        painel.classList.contains(
          "active"
        )
    );


  profileNavItems.forEach(
    item => {

      item.classList.toggle(
        "active",
        item.dataset.profileSection ===
        secao
      );

    }
  );


  if (
    painelAtual &&
    painelAtual !==
    novoPainel
  ) {

    const animacao =
      animar(
        painelAtual,
        [
          {
            opacity: 1,
            transform:
              "translateX(0)"
          },
          {
            opacity: 0,
            transform:
              "translateX(-22px)"
          }
        ],
        {
          duration: 220,
          easing:
            "ease",
          fill:
            "forwards"
        }
      );


    if (animacao) {

      try {

        await animacao.finished;

      } catch {}

    }


    painelAtual.classList.remove(
      "active",
      "profile-section-enter"
    );

  }


  novoPainel.classList.add(
    "active",
    "profile-section-enter"
  );


  secaoAtual =
    secao;


  if (
    atualizarHash
  ) {

    const hashMap = {

      overview:
        "",

      personal:
        "dados",

      security:
        "seguranca",

      addresses:
        "enderecos",

      vehicles:
        "veiculos"

    };


    const novoHash =
      hashMap[secao];


    if (novoHash) {

      history.replaceState(
        {},
        "",
        `#${novoHash}`
      );

    } else {

      history.replaceState(
        {},
        "",
        window.location.pathname
      );

    }

  }


  animarConteudoSecao(
    novoPainel
  );

}


/* =========================================================
   SECTION CONTENT ANIMATION
========================================================= */

function animarConteudoSecao(
  painel
) {

  if (!painel) {
    return;
  }


  const elementos =
    Array.from(
      painel.querySelectorAll(
        [
          ".profile-section-heading",
          ".profile-overview-card",
          ".profile-quick-card",
          ".profile-health-card",
          ".profile-form-card",
          ".security-status-card",
          ".password-card",
          ".address-card",
          ".vehicle-card",
          ".profile-empty-state"
        ].join(",")
      )
    );


  elementos.forEach(
    (
      elemento,
      indice
    ) => {

      animar(
        elemento,
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
          duration: 480,
          delay:
            indice * 55,
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
   HASH
========================================================= */

function secaoPeloHash() {

  const hash =
    window.location.hash
      .replace(
        "#",
        ""
      )
      .toLowerCase();


  const mapa = {

    dados:
      "personal",

    pessoal:
      "personal",

    seguranca:
      "security",

    security:
      "security",

    enderecos:
      "addresses",

    endereco:
      "addresses",

    veiculos:
      "vehicles",

    veiculo:
      "vehicles"

  };


  return (
    mapa[hash] ||
    "overview"
  );

}


/* =========================================================
   COUNTERS
========================================================= */

function obterPedidos() {

  const pedidos =
    lerJSON(
      STORAGE_PEDIDOS,
      []
    );


  return Array.isArray(
    pedidos
  )
    ? pedidos
    : [];

}


function atualizarContadores() {

  const pedidos =
    obterPedidos();


  animarContador(
    profileOrdersCount,
    pedidos.length
  );


  animarContador(
    profileVehiclesCount,
    veiculos.length
  );


  animarContador(
    profileAddressesCount,
    enderecos.length
  );

}


/* =========================================================
   COUNTER ANIMATION
========================================================= */

function animarContador(
  elemento,
  alvo
) {

  if (!elemento) {
    return;
  }


  const inicio =
    performance.now();

  const duracao =
    600;


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


    elemento.textContent =
      Math.round(
        alvo *
        easing
      );


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
   PROFILE COMPLETION
========================================================= */

function calcularCompletude() {

  const campos = [

    obterNomeCliente(),

    obterEmailCliente(),

    obterTelefoneCliente(),

    obterCpfCliente(),

    obterAvatar(),

    enderecos.length > 0
      ? "ok"
      : "",

    veiculos.length > 0
      ? "ok"
      : ""

  ];


  const preenchidos =
    campos.filter(
      Boolean
    ).length;


  return Math.round(
    (
      preenchidos /
      campos.length
    ) *
    100
  );

}


function atualizarCompletude() {

  const percentual =
    calcularCompletude();


  if (
    profileCompletionText
  ) {

    profileCompletionText.textContent =
      `${percentual}%`;

  }


  if (
    profileCompletionBar
  ) {

    setTimeout(
      () => {

        profileCompletionBar.style.width =
          `${percentual}%`;

      },
      180
    );

  }

}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

function alternarVisibilidadeSenha(
  botao
) {

  const id =
    botao.dataset.passwordToggle;


  const input =
    document.getElementById(
      id
    );


  if (!input) {
    return;
  }


  const mostrando =
    input.type ===
    "text";


  input.type =
    mostrando
      ? "password"
      : "text";


  const icon =
    botao.querySelector(
      "i"
    );


  if (icon) {

    icon.className =
      mostrando
        ? "fa-regular fa-eye"
        : "fa-regular fa-eye-slash";

  }

}


/* =========================================================
   PASSWORD STRENGTH
========================================================= */

function avaliarForcaSenha(
  senha
) {

  let pontos =
    0;


  if (
    senha.length >= 8
  ) {
    pontos++;
  }


  if (
    senha.length >= 12
  ) {
    pontos++;
  }


  if (
    /[A-Z]/.test(
      senha
    )
  ) {
    pontos++;
  }


  if (
    /[a-z]/.test(
      senha
    )
  ) {
    pontos++;
  }


  if (
    /\d/.test(
      senha
    )
  ) {
    pontos++;
  }


  if (
    /[^A-Za-z0-9]/.test(
      senha
    )
  ) {
    pontos++;
  }


  return pontos;

}


function atualizarForcaSenha() {

  const senha =
    newPassword?.value ||
    "";


  const pontos =
    avaliarForcaSenha(
      senha
    );


  let texto =
    "-";

  let percentual =
    0;

  let cor =
    "#d6535d";


  if (!senha) {

    texto =
      "-";

    percentual =
      0;

  } else if (
    pontos <= 2
  ) {

    texto =
      "Fraca";

    percentual =
      30;

    cor =
      "#d6535d";

  } else if (
    pontos <= 4
  ) {

    texto =
      "Média";

    percentual =
      65;

    cor =
      "#da9b2e";

  } else {

    texto =
      "Forte";

    percentual =
      100;

    cor =
      "#2aba7a";

  }


  if (
    passwordStrengthText
  ) {

    passwordStrengthText.textContent =
      texto;

  }


  if (
    passwordStrengthBar
  ) {

    passwordStrengthBar.style.width =
      `${percentual}%`;


    passwordStrengthBar.style.background =
      cor;

  }

}


/* =========================================================
   ALTERAR SENHA
========================================================= */

async function alterarSenha(
  evento
) {

  evento.preventDefault();


  const atual =
    currentPassword?.value ||
    "";

  const nova =
    newPassword?.value ||
    "";

  const confirmar =
    confirmPassword?.value ||
    "";


  if (
    !atual ||
    !nova ||
    !confirmar
  ) {

    mostrarToast(
      "Preencha todos os campos da senha.",
      "warning"
    );


    return;

  }


  const senhaSalva =
    String(
      clienteAtual?.senha_cliente ||
      clienteAtual?.senha ||
      ""
    );


  if (
    senhaSalva &&
    atual !==
    senhaSalva
  ) {

    mostrarToast(
      "A senha atual está incorreta.",
      "error"
    );


    executarShake(
      currentPassword
    );


    return;

  }


  if (
    nova.length < 8
  ) {

    mostrarToast(
      "A nova senha deve ter pelo menos 8 caracteres.",
      "warning"
    );


    return;

  }


  if (
    nova !==
    confirmar
  ) {

    mostrarToast(
      "A confirmação da senha não corresponde.",
      "warning"
    );


    executarShake(
      confirmPassword
    );


    return;

  }


  await esperar(
    400
  );


  clienteAtual.senha =
    nova;

  clienteAtual.senha_cliente =
    nova;


  salvarClienteAtual();


  passwordForm.reset();


  atualizarForcaSenha();


  mostrarToast(
    "Senha atualizada com sucesso."
  );

}


/* =========================================================
   ADDRESS STORAGE
========================================================= */

function carregarEnderecos() {

  const todos =
    lerJSON(
      STORAGE_ENDERECOS,
      []
    );


  enderecos =
    Array.isArray(todos)
      ? todos
      : [];

}


/* =========================================================
   ADDRESS MODAL
========================================================= */

function abrirModalEndereco(
  endereco = null
) {

  if (
    !addressModal
  ) {
    return;
  }


  addressForm?.reset();


  if (
    endereco
  ) {

    addressModalTitle.textContent =
      "Editar endereço";


    addressEditId.value =
      endereco.id;


    addressName.value =
      endereco.nome ||
      "";


    addressCep.value =
      endereco.cep ||
      "";


    addressNumber.value =
      endereco.numero ||
      "";


    addressStreet.value =
      endereco.rua ||
      "";


    addressComplement.value =
      endereco.complemento ||
      "";


    addressDistrict.value =
      endereco.bairro ||
      "";


    addressCity.value =
      endereco.cidade ||
      "";


    addressState.value =
      endereco.estado ||
      "";

  } else {

    addressModalTitle.textContent =
      "Novo endereço";


    addressEditId.value =
      "";

  }


  addressModal.hidden =
    false;


  document.body.style.overflow =
    "hidden";


  animarModalEntrada(
    addressModal
  );

}


/* =========================================================
   CLOSE ADDRESS
========================================================= */

async function fecharModalEndereco() {

  if (
    !addressModal ||
    addressModal.hidden
  ) {

    return;

  }


  await animarModalSaida(
    addressModal
  );


  addressModal.hidden =
    true;


  document.body.style.overflow =
    "";

}


/* =========================================================
   SAVE ADDRESS
========================================================= */

function salvarEndereco(
  evento
) {

  evento.preventDefault();


  const dados = {

    id:
      addressEditId.value ||
      gerarId(),

    nome:
      normalizarTexto(
        addressName.value
      ),

    cep:
      normalizarTexto(
        addressCep.value
      ),

    numero:
      normalizarTexto(
        addressNumber.value
      ),

    rua:
      normalizarTexto(
        addressStreet.value
      ),

    complemento:
      normalizarTexto(
        addressComplement.value
      ),

    bairro:
      normalizarTexto(
        addressDistrict.value
      ),

    cidade:
      normalizarTexto(
        addressCity.value
      ),

    estado:
      normalizarTexto(
        addressState.value
      ).toUpperCase()

  };


  if (
    !dados.nome ||
    !dados.cep ||
    !dados.numero ||
    !dados.rua ||
    !dados.bairro ||
    !dados.cidade ||
    !dados.estado
  ) {

    mostrarToast(
      "Preencha os campos obrigatórios do endereço.",
      "warning"
    );


    return;

  }


  const indice =
    enderecos.findIndex(
      item =>
        item.id ===
        dados.id
    );


  if (
    indice >= 0
  ) {

    enderecos[indice] =
      dados;

  } else {

    enderecos.push(
      dados
    );

  }


  salvarJSON(
    STORAGE_ENDERECOS,
    enderecos
  );


  renderizarEnderecos();


  atualizarContadores();


  atualizarCompletude();


  fecharModalEndereco();


  mostrarToast(
    indice >= 0
      ? "Endereço atualizado."
      : "Novo endereço cadastrado."
  );

}


/* =========================================================
   DELETE ADDRESS
========================================================= */

function excluirEndereco(
  id
) {

  const endereco =
    enderecos.find(
      item =>
        item.id === id
    );


  if (!endereco) {
    return;
  }


  const confirmado =
    window.confirm(
      `Excluir o endereço "${endereco.nome}"?`
    );


  if (!confirmado) {
    return;
  }


  enderecos =
    enderecos.filter(
      item =>
        item.id !== id
    );


  salvarJSON(
    STORAGE_ENDERECOS,
    enderecos
  );


  renderizarEnderecos();


  atualizarContadores();


  atualizarCompletude();


  mostrarToast(
    "Endereço removido."
  );

}


/* =========================================================
   RENDER ADDRESSES
========================================================= */

function renderizarEnderecos() {

  if (
    !addressesGrid ||
    !addressesEmpty
  ) {

    return;

  }


  addressesGrid.innerHTML =
    "";


  if (
    enderecos.length === 0
  ) {

    addressesGrid.style.display =
      "none";


    addressesEmpty.hidden =
      false;


    return;

  }


  addressesGrid.style.display =
    "grid";


  addressesEmpty.hidden =
    true;


  enderecos.forEach(
    (
      endereco,
      indice
    ) => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "address-card";


      const head =
        document.createElement(
          "div"
        );


      head.className =
        "address-card-head";


      const icon =
        document.createElement(
          "span"
        );


      icon.innerHTML =
        '<i class="fa-solid fa-location-dot"></i>';


      const actions =
        document.createElement(
          "div"
        );


      actions.className =
        "profile-card-actions";


      const edit =
        document.createElement(
          "button"
        );


      edit.type =
        "button";


      edit.title =
        "Editar endereço";


      edit.innerHTML =
        '<i class="fa-solid fa-pen"></i>';


      edit.addEventListener(
        "click",
        () => {

          abrirModalEndereco(
            endereco
          );

        }
      );


      const remove =
        document.createElement(
          "button"
        );


      remove.type =
        "button";


      remove.title =
        "Excluir endereço";


      remove.className =
        "delete";


      remove.innerHTML =
        '<i class="fa-solid fa-trash"></i>';


      remove.addEventListener(
        "click",
        () => {

          excluirEndereco(
            endereco.id
          );

        }
      );


      actions.append(
        edit,
        remove
      );


      head.append(
        icon,
        actions
      );


      const title =
        document.createElement(
          "h3"
        );


      title.textContent =
        endereco.nome;


      const descricao =
        document.createElement(
          "p"
        );


      descricao.innerHTML =
        `
          ${endereco.rua}, ${endereco.numero}
          ${
            endereco.complemento
              ? ` · ${endereco.complemento}`
              : ""
          }
          <br>
          ${endereco.bairro}
          <br>
          ${endereco.cidade} - ${endereco.estado}
        `;


      const meta =
        document.createElement(
          "div"
        );


      meta.className =
        "address-card-meta";


      meta.innerHTML =
        `
          <span>
            <i class="fa-solid fa-location-crosshairs"></i>
            ${endereco.cep}
          </span>

          <span>
            <i class="fa-solid fa-map"></i>
            ${endereco.cidade}
          </span>
        `;


      card.append(
        head,
        title,
        descricao,
        meta
      );


      addressesGrid.appendChild(
        card
      );


      animar(
        card,
        [
          {
            opacity: 0,
            transform:
              "translateY(20px) scale(.97)"
          },
          {
            opacity: 1,
            transform:
              "translateY(0) scale(1)"
          }
        ],
        {
          duration: 470,
          delay:
            indice * 65,
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
   VEHICLES STORAGE
========================================================= */

function carregarVeiculos() {

  const todos =
    lerJSON(
      STORAGE_VEICULOS,
      []
    );


  veiculos =
    Array.isArray(todos)
      ? todos
      : [];

}


/* =========================================================
   VEHICLE MODAL
========================================================= */

function abrirModalVeiculo(
  veiculo = null
) {

  if (
    !vehicleModal
  ) {
    return;
  }


  vehicleForm?.reset();


  if (
    veiculo
  ) {

    vehicleModalTitle.textContent =
      "Editar veículo";


    vehicleEditId.value =
      veiculo.id;


    vehicleBrand.value =
      veiculo.marca ||
      "";


    vehicleModel.value =
      veiculo.modelo ||
      "";


    vehicleYear.value =
      veiculo.ano ||
      "";


    vehiclePlate.value =
      veiculo.placa ||
      "";


    vehicleEngine.value =
      veiculo.motor ||
      "";

  } else {

    vehicleModalTitle.textContent =
      "Novo veículo";


    vehicleEditId.value =
      "";

  }


  vehicleModal.hidden =
    false;


  document.body.style.overflow =
    "hidden";


  animarModalEntrada(
    vehicleModal
  );

}


/* =========================================================
   CLOSE VEHICLE
========================================================= */

async function fecharModalVeiculo() {

  if (
    !vehicleModal ||
    vehicleModal.hidden
  ) {

    return;

  }


  await animarModalSaida(
    vehicleModal
  );


  vehicleModal.hidden =
    true;


  document.body.style.overflow =
    "";

}


/* =========================================================
   SAVE VEHICLE
========================================================= */

function salvarVeiculo(
  evento
) {

  evento.preventDefault();


  const ano =
    Number(
      vehicleYear.value
    );


  const dados = {

    id:
      vehicleEditId.value ||
      gerarId(),

    marca:
      normalizarTexto(
        vehicleBrand.value
      ),

    modelo:
      normalizarTexto(
        vehicleModel.value
      ),

    ano:
      Number.isFinite(
        ano
      )
        ? ano
        : "",

    placa:
      normalizarTexto(
        vehiclePlate.value
      ).toUpperCase(),

    motor:
      normalizarTexto(
        vehicleEngine.value
      )

  };


  if (
    !dados.marca ||
    !dados.modelo ||
    !dados.ano
  ) {

    mostrarToast(
      "Informe marca, modelo e ano do veículo.",
      "warning"
    );


    return;

  }


  const indice =
    veiculos.findIndex(
      item =>
        item.id ===
        dados.id
    );


  if (
    indice >= 0
  ) {

    veiculos[indice] =
      dados;

  } else {

    veiculos.push(
      dados
    );

  }


  salvarJSON(
    STORAGE_VEICULOS,
    veiculos
  );


  renderizarVeiculos();


  atualizarContadores();


  atualizarCompletude();


  fecharModalVeiculo();


  mostrarToast(
    indice >= 0
      ? "Veículo atualizado."
      : "Veículo adicionado à garagem."
  );

}


/* =========================================================
   DELETE VEHICLE
========================================================= */

function excluirVeiculo(
  id
) {

  const veiculo =
    veiculos.find(
      item =>
        item.id === id
    );


  if (!veiculo) {
    return;
  }


  const confirmado =
    window.confirm(
      `Excluir ${veiculo.marca} ${veiculo.modelo} da garagem?`
    );


  if (!confirmado) {
    return;
  }


  veiculos =
    veiculos.filter(
      item =>
        item.id !== id
    );


  salvarJSON(
    STORAGE_VEICULOS,
    veiculos
  );


  renderizarVeiculos();


  atualizarContadores();


  atualizarCompletude();


  mostrarToast(
    "Veículo removido da garagem."
  );

}


/* =========================================================
   RENDER VEHICLES
========================================================= */

function renderizarVeiculos() {

  if (
    !vehiclesGrid ||
    !vehiclesEmpty
  ) {

    return;

  }


  vehiclesGrid.innerHTML =
    "";


  if (
    veiculos.length === 0
  ) {

    vehiclesGrid.style.display =
      "none";


    vehiclesEmpty.hidden =
      false;


    return;

  }


  vehiclesGrid.style.display =
    "grid";


  vehiclesEmpty.hidden =
    true;


  veiculos.forEach(
    (
      veiculo,
      indice
    ) => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "vehicle-card";


      const head =
        document.createElement(
          "div"
        );


      head.className =
        "vehicle-card-head";


      const icon =
        document.createElement(
          "span"
        );


      icon.innerHTML =
        '<i class="fa-solid fa-car-side"></i>';


      const actions =
        document.createElement(
          "div"
        );


      actions.className =
        "profile-card-actions";


      const edit =
        document.createElement(
          "button"
        );


      edit.type =
        "button";


      edit.title =
        "Editar veículo";


      edit.innerHTML =
        '<i class="fa-solid fa-pen"></i>';


      edit.addEventListener(
        "click",
        () => {

          abrirModalVeiculo(
            veiculo
          );

        }
      );


      const remove =
        document.createElement(
          "button"
        );


      remove.type =
        "button";


      remove.title =
        "Excluir veículo";


      remove.className =
        "delete";


      remove.innerHTML =
        '<i class="fa-solid fa-trash"></i>';


      remove.addEventListener(
        "click",
        () => {

          excluirVeiculo(
            veiculo.id
          );

        }
      );


      actions.append(
        edit,
        remove
      );


      head.append(
        icon,
        actions
      );


      const main =
        document.createElement(
          "div"
        );


      main.className =
        "vehicle-main-line";


      const name =
        document.createElement(
          "strong"
        );


      name.textContent =
        `${veiculo.marca} ${veiculo.modelo}`;


      const year =
        document.createElement(
          "span"
        );


      year.textContent =
        String(
          veiculo.ano
        );


      main.append(
        name,
        year
      );


      const descricao =
        document.createElement(
          "p"
        );


      descricao.textContent =
        veiculo.motor
          ? `Motorização ${veiculo.motor}`
          : "Motorização não informada";


      const meta =
        document.createElement(
          "div"
        );


      meta.className =
        "vehicle-card-meta";


      if (
        veiculo.placa
      ) {

        meta.innerHTML +=
          `
            <span>
              <i class="fa-regular fa-id-card"></i>
              ${veiculo.placa}
            </span>
          `;

      }


      meta.innerHTML +=
        `
          <span>
            <i class="fa-solid fa-calendar"></i>
            ${veiculo.ano}
          </span>
        `;


      card.append(
        head,
        main,
        descricao,
        meta
      );


      vehiclesGrid.appendChild(
        card
      );


      animar(
        card,
        [
          {
            opacity: 0,
            transform:
              "translateX(25px) scale(.97)"
          },
          {
            opacity: 1,
            transform:
              "translateX(0) scale(1)"
          }
        ],
        {
          duration: 480,
          delay:
            indice * 65,
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
   MODAL ANIMATIONS
========================================================= */

function animarModalEntrada(
  modal
) {

  const backdrop =
    modal.querySelector(
      ".profile-modal-backdrop"
    );


  const janela =
    modal.querySelector(
      ".profile-modal-window"
    );


  animar(
    backdrop,
    [
      {
        opacity: 0
      },
      {
        opacity: 1
      }
    ],
    {
      duration: 250
    }
  );


  animar(
    janela,
    [
      {
        opacity: 0,
        transform:
          "translateY(28px) scale(.96)"
      },
      {
        opacity: 1,
        transform:
          "translateY(0) scale(1)"
      }
    ],
    {
      duration: 420,
      easing:
        "cubic-bezier(.16,1,.3,1)"
    }
  );

}


async function animarModalSaida(
  modal
) {

  const backdrop =
    modal.querySelector(
      ".profile-modal-backdrop"
    );


  const janela =
    modal.querySelector(
      ".profile-modal-window"
    );


  animar(
    backdrop,
    [
      {
        opacity: 1
      },
      {
        opacity: 0
      }
    ],
    {
      duration: 200,
      fill: "forwards"
    }
  );


  const animacao =
    animar(
      janela,
      [
        {
          opacity: 1,
          transform:
            "translateY(0) scale(1)"
        },
        {
          opacity: 0,
          transform:
            "translateY(20px) scale(.97)"
        }
      ],
      {
        duration: 220,
        easing: "ease",
        fill: "forwards"
      }
    );


  if (animacao) {

    try {

      await animacao.finished;

    } catch {}

  } else {

    await esperar(
      220
    );

  }

}


/* =========================================================
   HERO ENTRY
========================================================= */

function animarEntradaPerfil() {

  const avatar =
    document.querySelector(
      ".profile-avatar-stage"
    );


  const copy =
    document.querySelector(
      ".profile-identity-copy"
    );


  const stats =
    Array.from(
      document.querySelectorAll(
        ".profile-stats article"
      )
    );


  animar(
    avatar,
    [
      {
        opacity: 0,
        transform:
          "translateX(-35px) scale(.92)"
      },
      {
        opacity: 1,
        transform:
          "translateX(0) scale(1)"
      }
    ],
    {
      duration: 700,
      easing:
        "cubic-bezier(.16,1,.3,1)",
      fill: "both"
    }
  );


  animar(
    copy,
    [
      {
        opacity: 0,
        transform:
          "translateY(25px)"
      },
      {
        opacity: 1,
        transform:
          "translateY(0)"
      }
    ],
    {
      duration: 650,
      delay: 120,
      easing:
        "cubic-bezier(.16,1,.3,1)",
      fill: "both"
    }
  );


  stats.forEach(
    (
      stat,
      indice
    ) => {

      animar(
        stat,
        [
          {
            opacity: 0,
            transform:
              "translateX(25px) scale(.95)"
          },
          {
            opacity: 1,
            transform:
              "translateX(0) scale(1)"
          }
        ],
        {
          duration: 520,
          delay:
            260 +
            indice * 95,
          easing:
            "cubic-bezier(.16,1,.3,1)",
          fill: "both"
        }
      );

    }
  );

}


/* =========================================================
   SHAKE
========================================================= */

function executarShake(
  elemento
) {

  animar(
    elemento,
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

}


/* =========================================================
   MASK PHONE
========================================================= */

function formatarTelefone(
  valor
) {

  let numeros =
    valor.replace(
      /\D/g,
      ""
    );


  numeros =
    numeros.slice(
      0,
      11
    );


  if (
    numeros.length <= 10
  ) {

    return numeros
      .replace(
        /^(\d{2})(\d)/,
        "($1) $2"
      )
      .replace(
        /(\d{4})(\d)/,
        "$1-$2"
      );

  }


  return numeros
    .replace(
      /^(\d{2})(\d)/,
      "($1) $2"
    )
    .replace(
      /(\d{5})(\d)/,
      "$1-$2"
    );

}


/* =========================================================
   CPF
========================================================= */

function formatarCpf(
  valor
) {

  return valor
    .replace(
      /\D/g,
      ""
    )
    .slice(
      0,
      11
    )
    .replace(
      /(\d{3})(\d)/,
      "$1.$2"
    )
    .replace(
      /(\d{3})(\d)/,
      "$1.$2"
    )
    .replace(
      /(\d{3})(\d{1,2})$/,
      "$1-$2"
    );

}


/* =========================================================
   CEP
========================================================= */

function formatarCep(
  valor
) {

  return valor
    .replace(
      /\D/g,
      ""
    )
    .slice(
      0,
      8
    )
    .replace(
      /(\d{5})(\d)/,
      "$1-$2"
    );

}


/* =========================================================
   PLACA
========================================================= */

function formatarPlaca(
  valor
) {

  return valor
    .replace(
      /[^A-Za-z0-9]/g,
      ""
    )
    .toUpperCase()
    .slice(
      0,
      7
    );

}


/* =========================================================
   EVENTS
========================================================= */


/* AVATAR */

profileAvatarButton
  ?.addEventListener(
    "click",
    abrirSeletorAvatar
  );


profileAvatarInput
  ?.addEventListener(
    "change",
    evento => {

      alterarAvatar(
        evento.target.files?.[0]
      );


      evento.target.value =
        "";

    }
  );


/* NAV */

profileNavItems.forEach(
  item => {

    item.addEventListener(
      "click",
      () => {

        trocarSecao(
          item.dataset.profileSection
        );

      }
    );

  }
);


profileQuickLinks.forEach(
  item => {

    item.addEventListener(
      "click",
      () => {

        trocarSecao(
          item.dataset.goProfile
        );

      }
    );

  }
);


/* PROFILE FORM */

profileForm
  ?.addEventListener(
    "submit",
    salvarDadosPessoais
  );


[
  profileName,
  profileEmail,
  profilePhone,
  profileCpf
]
  .forEach(
    campo => {

      campo?.addEventListener(
        "input",
        marcarFormularioAlterado
      );

    }
  );


profilePhone
  ?.addEventListener(
    "input",
    () => {

      profilePhone.value =
        formatarTelefone(
          profilePhone.value
        );

    }
  );


profileCpf
  ?.addEventListener(
    "input",
    () => {

      profileCpf.value =
        formatarCpf(
          profileCpf.value
        );

    }
  );


/* PASSWORD */

document
  .querySelectorAll(
    "[data-password-toggle]"
  )
  .forEach(
    botao => {

      botao.addEventListener(
        "click",
        () => {

          alternarVisibilidadeSenha(
            botao
          );

        }
      );

    }
  );


newPassword
  ?.addEventListener(
    "input",
    atualizarForcaSenha
  );


passwordForm
  ?.addEventListener(
    "submit",
    alterarSenha
  );


/* ADDRESS */

addAddressButton
  ?.addEventListener(
    "click",
    () => {

      abrirModalEndereco();

    }
  );


document
  .querySelectorAll(
    "[data-open-address]"
  )
  .forEach(
    botao => {

      botao.addEventListener(
        "click",
        () => {

          abrirModalEndereco();

        }
      );

    }
  );


document
  .querySelectorAll(
    "[data-close-address]"
  )
  .forEach(
    elemento => {

      elemento.addEventListener(
        "click",
        fecharModalEndereco
      );

    }
  );


addressForm
  ?.addEventListener(
    "submit",
    salvarEndereco
  );


addressCep
  ?.addEventListener(
    "input",
    () => {

      addressCep.value =
        formatarCep(
          addressCep.value
        );

    }
  );


addressState
  ?.addEventListener(
    "input",
    () => {

      addressState.value =
        addressState.value
          .replace(
            /[^A-Za-z]/g,
            ""
          )
          .toUpperCase()
          .slice(
            0,
            2
          );

    }
  );


/* VEHICLE */

addVehicleButton
  ?.addEventListener(
    "click",
    () => {

      abrirModalVeiculo();

    }
  );


document
  .querySelectorAll(
    "[data-open-vehicle]"
  )
  .forEach(
    botao => {

      botao.addEventListener(
        "click",
        () => {

          abrirModalVeiculo();

        }
      );

    }
  );


document
  .querySelectorAll(
    "[data-close-vehicle]"
  )
  .forEach(
    elemento => {

      elemento.addEventListener(
        "click",
        fecharModalVeiculo
      );

    }
  );


vehicleForm
  ?.addEventListener(
    "submit",
    salvarVeiculo
  );


vehiclePlate
  ?.addEventListener(
    "input",
    () => {

      vehiclePlate.value =
        formatarPlaca(
          vehiclePlate.value
        );

    }
  );


/* ESC */

document.addEventListener(
  "keydown",
  evento => {

    if (
      evento.key !==
      "Escape"
    ) {

      return;

    }


    if (
      addressModal &&
      !addressModal.hidden
    ) {

      fecharModalEndereco();

      return;

    }


    if (
      vehicleModal &&
      !vehicleModal.hidden
    ) {

      fecharModalVeiculo();

    }

  }
);


/* HASH CHANGE */

window.addEventListener(
  "hashchange",
  () => {

    trocarSecao(
      secaoPeloHash(),
      false
    );

  }
);


/* STORAGE */

window.addEventListener(
  "storage",
  evento => {

    if (
      evento.key ===
      STORAGE_CLIENTE
    ) {

      clienteAtual =
        lerJSON(
          STORAGE_CLIENTE,
          clienteAtual
        );


      preencherDadosCliente();


      atualizarCompletude();

    }


    if (
      evento.key ===
      STORAGE_ENDERECOS
    ) {

      carregarEnderecos();

      renderizarEnderecos();

      atualizarContadores();

      atualizarCompletude();

    }


    if (
      evento.key ===
      STORAGE_VEICULOS
    ) {

      carregarVeiculos();

      renderizarVeiculos();

      atualizarContadores();

      atualizarCompletude();

    }

  }
);


/* =========================================================
   INIT
========================================================= */

async function iniciarPerfil() {

  const clienteOk =
    carregarCliente();


  if (
    !clienteOk
  ) {

    esconderLoading();

    return;

  }


  carregarEnderecos();

  carregarVeiculos();


  preencherDadosCliente();


  renderizarEnderecos();

  renderizarVeiculos();


  atualizarContadores();

  atualizarCompletude();

  atualizarForcaSenha();


  const secaoInicial =
    secaoPeloHash();


  secaoAtual =
    secaoInicial;


  profilePanels.forEach(
    painel => {

      painel.classList.toggle(
        "active",
        painel.dataset.profilePanel ===
        secaoInicial
      );

    }
  );


  profileNavItems.forEach(
    item => {

      item.classList.toggle(
        "active",
        item.dataset.profileSection ===
        secaoInicial
      );

    }
  );


  esconderLoading();


  await esperar(
    170
  );


  animarEntradaPerfil();


  const painel =
    profilePanels.find(
      item =>
        item.dataset.profilePanel ===
        secaoInicial
    );


  animarConteudoSecao(
    painel
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
   START
========================================================= */

iniciarPerfil();
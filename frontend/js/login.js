/* =========================================================
   LOGIN.JS
   Loja de Peças
========================================================= */

console.log("Login carregado.");

const API = "http://localhost:3000/api";


/* =========================================================
   ELEMENTOS
========================================================= */

const formLogin =
  document.getElementById(
    "formLogin"
  );

const btnEntrar =
  document.getElementById(
    "btnEntrar"
  );

const btnMostrarSenha =
  document.getElementById(
    "btnMostrarSenha"
  );

const campoEmail =
  document.getElementById(
    "email"
  );

const campoSenha =
  document.getElementById(
    "senha"
  );

const lembrarMe =
  document.getElementById(
    "lembrarMe"
  );

const mensagemLogin =
  document.getElementById(
    "mensagemLogin"
  );


let loginEmAndamento = false;



/* =========================================================
   MENSAGENS
========================================================= */

function mostrarMensagemLogin(
  texto,
  tipo = "error"
) {

  if (!mensagemLogin) {
    return;
  }


  mensagemLogin.innerHTML = `
    <div
      class="login-alert ${tipo}"
      role="alert"
    >
      ${texto}
    </div>
  `;

}


function limparMensagemLogin() {

  if (mensagemLogin) {
    mensagemLogin.innerHTML = "";
  }

}



/* =========================================================
   VALIDAÇÃO DE EMAIL
========================================================= */

function emailValido(email) {

  const regex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  return regex.test(
    String(email || "").trim()
  );

}



/* =========================================================
   ESTADO DO BOTÃO
========================================================= */

function definirCarregamentoLogin(
  carregando
) {

  loginEmAndamento =
    carregando;


  if (!btnEntrar) {
    return;
  }


  btnEntrar.disabled =
    carregando;


  if (carregando) {

    if (
      !btnEntrar.dataset.textoOriginal
    ) {

      btnEntrar.dataset.textoOriginal =
        btnEntrar.innerHTML;

    }


    btnEntrar.innerHTML = `
      <span
        class="spinner"
        aria-hidden="true"
      ></span>

      <span>
        Entrando...
      </span>
    `;

  } else {

    btnEntrar.innerHTML =
      btnEntrar.dataset.textoOriginal
      ||
      `
        <span>
          Entrar na minha conta
        </span>

        <i class="fa-solid fa-arrow-right"></i>
      `;

  }

}



/* =========================================================
   NORMALIZAR RESPOSTA DO CLIENTE
========================================================= */

function criarClienteLogado(
  usuario,
  emailDigitado
) {

  if (!usuario) {
    return null;
  }


  const idCliente =
    usuario.id_cliente
    ??
    usuario.id;


  if (!idCliente) {
    return null;
  }


  const nomeCliente =
    usuario.nome_cliente
    ??
    usuario.nome
    ??
    "Cliente";


  const emailCliente =
    usuario.email_cliente
    ??
    usuario.email
    ??
    emailDigitado
    ??
    "";


  /*
    Salvamos tanto os nomes padronizados
    quanto aliases para manter
    compatibilidade com partes antigas.
  */

  return {

    id_cliente:
      Number(idCliente),

    nome_cliente:
      nomeCliente,

    email_cliente:
      emailCliente,


    /*
      Compatibilidade temporária.
    */

    nome:
      nomeCliente,

    email:
      emailCliente

  };

}



/* =========================================================
   CARRINHO
========================================================= */

function garantirCarrinho() {

  try {

    const atual =
      JSON.parse(
        localStorage.getItem(
          "carrinho"
        )
      );


    if (!Array.isArray(atual)) {

      localStorage.setItem(
        "carrinho",
        JSON.stringify([])
      );

    }

  } catch {

    localStorage.setItem(
      "carrinho",
      JSON.stringify([])
    );

  }

}



/* =========================================================
   LEMBRAR EMAIL
========================================================= */

function carregarPreferenciasLogin() {

  try {

    const emailSalvo =
      localStorage.getItem(
        "emailLembrado"
      );


    if (
      emailSalvo &&
      campoEmail
    ) {

      campoEmail.value =
        emailSalvo;


      if (lembrarMe) {
        lembrarMe.checked = true;
      }

    }

  } catch (erro) {

    console.warn(
      "Não foi possível carregar preferências do login.",
      erro
    );

  }

}


function salvarPreferenciasLogin(
  email
) {

  try {

    if (lembrarMe?.checked) {

      localStorage.setItem(
        "emailLembrado",
        email
      );

    } else {

      localStorage.removeItem(
        "emailLembrado"
      );

    }

  } catch (erro) {

    console.warn(
      "Não foi possível salvar preferência de login.",
      erro
    );

  }

}



/* =========================================================
   LOGIN
========================================================= */

async function fazerLogin() {

  if (loginEmAndamento) {
    return;
  }


  limparMensagemLogin();


  const email =
    campoEmail
      ?.value
      .trim()
    ||
    "";


  const senha =
    campoSenha
      ?.value
    ||
    "";


  /* =====================================================
     VALIDAÇÕES
  ===================================================== */

  if (
    !email ||
    !senha
  ) {

    mostrarMensagemLogin(
      "Preencha seu e-mail e sua senha.",
      "error"
    );

    return;

  }


  if (!emailValido(email)) {

    mostrarMensagemLogin(
      "Informe um endereço de e-mail válido.",
      "error"
    );

    campoEmail?.focus();

    return;

  }



  definirCarregamentoLogin(
    true
  );


  try {

    /* ===================================================
       API
    =================================================== */

    const resposta =
      await fetch(
        `${API}/login`,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              email_cliente:
                email,

              senha_cliente:
                senha

            })

        }
      );



    /* ===================================================
       LER RESPOSTA
    =================================================== */

    let dados = null;


    try {

      dados =
        await resposta.json();

    } catch (erro) {

      console.error(
        "Resposta inválida da API:",
        erro
      );


      throw new Error(
        "O servidor retornou uma resposta inválida."
      );

    }



    /* ===================================================
       ERRO HTTP
    =================================================== */

    if (!resposta.ok) {

      const mensagemServidor =
        dados?.message
        ||
        dados?.erro
        ||
        dados?.error;


      throw new Error(
        mensagemServidor
        ||
        "Não foi possível realizar o login."
      );

    }



    /* ===================================================
       VALIDAR LOGIN
    =================================================== */

    /*
      Seu backend atual retorna:

      {
        success: true,
        user: {...}
      }

      Mantemos suporte a isso.
    */

    if (
      dados.success !== true
    ) {

      throw new Error(
        dados.message
        ||
        dados.erro
        ||
        "E-mail ou senha incorretos."
      );

    }



    if (!dados.user) {

      throw new Error(
        "O servidor não retornou os dados do cliente."
      );

    }



    /* ===================================================
       CRIAR OBJETO PADRONIZADO
    =================================================== */

    const clienteLogado =
      criarClienteLogado(
        dados.user,
        email
      );


    if (
      !clienteLogado
      ||
      !clienteLogado.id_cliente
    ) {

      throw new Error(
        "Não foi possível identificar o cliente retornado pelo servidor."
      );

    }



    /* ===================================================
       SALVAR CLIENTE
    =================================================== */

    localStorage.setItem(
      "clienteLogado",
      JSON.stringify(
        clienteLogado
      )
    );



    /* ===================================================
       LEMBRAR EMAIL
    =================================================== */

    salvarPreferenciasLogin(
      email
    );



    /* ===================================================
       CARRINHO
    =================================================== */

    garantirCarrinho();



    /* ===================================================
       SUCESSO
    =================================================== */

    mostrarMensagemLogin(
      `Bem-vindo, ${clienteLogado.nome_cliente}!`,
      "success"
    );



    /*
      Pequeno atraso visual.

      Depois podemos trocar isso
      por uma página/dashboard do cliente.
    */

    setTimeout(
      () => {

        window.location.href =
          "produtos.html";

      },
      600
    );

  } catch (erro) {

    console.error(
      "Erro no login:",
      erro
    );


    mostrarMensagemLogin(
      erro.message
      ||
      "Erro ao conectar ao servidor.",
      "error"
    );


    definirCarregamentoLogin(
      false
    );

  }

}



/* =========================================================
   FORM
========================================================= */

formLogin?.addEventListener(
  "submit",
  event => {

    event.preventDefault();

    fazerLogin();

  }
);



/* =========================================================
   LIMPAR ERRO AO DIGITAR
========================================================= */

campoEmail?.addEventListener(
  "input",
  limparMensagemLogin
);


campoSenha?.addEventListener(
  "input",
  limparMensagemLogin
);



/* =========================================================
   INICIAR
========================================================= */

carregarPreferenciasLogin();


/* =========================================================
   GLOBAL
========================================================= */

window.fazerLogin =
  fazerLogin;
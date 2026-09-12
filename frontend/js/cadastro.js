/* =========================================================
   CADASTRO.JS
========================================================= */

const formCadastro =
  document.getElementById(
    "formCadastro"
  );


const senhaCadastro =
  document.getElementById(
    "senhaCadastro"
  );


const confirmarSenhaCadastro =
  document.getElementById(
    "confirmarSenhaCadastro"
  );


const mensagemCadastro =
  document.getElementById(
    "mensagemCadastro"
  );


const btnCadastrar =
  document.getElementById(
    "btnCadastrar"
  );



/* =========================================================
   MOSTRAR SENHA
========================================================= */

document
  .querySelectorAll(
    ".password-toggle"
  )
  .forEach(
    botao => {

      botao.addEventListener(
        "click",
        () => {

          const alvo =
            document.getElementById(
              botao.dataset.target
            );


          if (!alvo) return;


          const mostrando =
            alvo.type === "text";


          alvo.type =
            mostrando
              ? "password"
              : "text";


          const icone =
            botao.querySelector("i");


          if (icone) {

            icone.className =
              mostrando
                ? "fa-regular fa-eye"
                : "fa-regular fa-eye-slash";

          }

        }
      );

    }
  );



/* =========================================================
   TELEFONE
========================================================= */

const telefoneCadastro =
  document.getElementById(
    "telefoneCadastro"
  );


telefoneCadastro?.addEventListener(
  "input",
  () => {

    let valor =
      telefoneCadastro.value
        .replace(/\D/g, "")
        .slice(0, 11);


    if (valor.length > 10) {

      valor =
        valor.replace(
          /^(\d{2})(\d{5})(\d{4})$/,
          "($1) $2-$3"
        );

    } else if (
      valor.length > 6
    ) {

      valor =
        valor.replace(
          /^(\d{2})(\d{4})(\d{0,4})$/,
          "($1) $2-$3"
        );

    } else if (
      valor.length > 2
    ) {

      valor =
        valor.replace(
          /^(\d{2})(\d+)/,
          "($1) $2"
        );

    }


    telefoneCadastro.value =
      valor;

  }
);



/* =========================================================
   CPF
========================================================= */

const cpfCadastro =
  document.getElementById(
    "cpfCadastro"
  );


cpfCadastro?.addEventListener(
  "input",
  () => {

    let valor =
      cpfCadastro.value
        .replace(/\D/g, "")
        .slice(0, 11);


    valor =
      valor.replace(
        /(\d{3})(\d)/,
        "$1.$2"
      );


    valor =
      valor.replace(
        /(\d{3})(\d)/,
        "$1.$2"
      );


    valor =
      valor.replace(
        /(\d{3})(\d{1,2})$/,
        "$1-$2"
      );


    cpfCadastro.value =
      valor;

  }
);



/* =========================================================
   FORÇA DA SENHA
========================================================= */

function avaliarSenha(
  senha
) {

  let nivel = 0;


  const tamanho =
    senha.length >= 8;


  const numero =
    /\d/.test(
      senha
    );


  const maiuscula =
    /[A-Z]/.test(
      senha
    );


  const especial =
    /[^A-Za-z0-9]/.test(
      senha
    );


  if (tamanho) nivel++;

  if (numero) nivel++;

  if (maiuscula) nivel++;

  if (especial) nivel++;


  return {
    nivel,
    tamanho,
    numero,
    maiuscula
  };

}



function atualizarForcaSenha() {

  const senha =
    senhaCadastro?.value
    ||
    "";


  const resultado =
    avaliarSenha(
      senha
    );


  const container =
    document.querySelector(
      ".password-strength"
    );


  const texto =
    document.getElementById(
      "textoForcaSenha"
    );


  container?.classList.remove(
    "level-1",
    "level-2",
    "level-3",
    "level-4"
  );


  if (
    resultado.nivel > 0
  ) {

    container?.classList.add(
      `level-${resultado.nivel}`
    );

  }


  const textos = [
    "-",
    "Fraca",
    "Regular",
    "Boa",
    "Forte"
  ];


  if (texto) {

    texto.textContent =
      textos[
        resultado.nivel
      ];

  }


  atualizarRegra(
    "regraTamanho",
    resultado.tamanho
  );


  atualizarRegra(
    "regraNumero",
    resultado.numero
  );


  atualizarRegra(
    "regraMaiuscula",
    resultado.maiuscula
  );

}



function atualizarRegra(
  id,
  valida
) {

  const elemento =
    document.getElementById(
      id
    );


  elemento?.classList.toggle(
    "valid",
    valida
  );


  const icone =
    elemento?.querySelector(
      "i"
    );


  if (icone) {

    icone.className =
      valida
        ? "fa-solid fa-circle-check"
        : "fa-solid fa-circle";

  }

}



senhaCadastro?.addEventListener(
  "input",
  atualizarForcaSenha
);



/* =========================================================
   MENSAGEM
========================================================= */

function mostrarMensagemCadastro(
  texto,
  tipo
) {

  if (!mensagemCadastro) {

    return;

  }


  mensagemCadastro.innerHTML = `
    <div class="register-alert ${tipo}">
      ${texto}
    </div>
  `;

}



/* =========================================================
   FORM
========================================================= */

formCadastro?.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const nome =
      document
        .getElementById(
          "nomeCadastro"
        )
        ?.value
        .trim();


    const email =
      document
        .getElementById(
          "emailCadastro"
        )
        ?.value
        .trim();


    const senha =
      senhaCadastro
        ?.value
        ||
        "";


    const confirmar =
      confirmarSenhaCadastro
        ?.value
        ||
        "";


    const aceitarTermos =
      document
        .getElementById(
          "aceitarTermos"
        )
        ?.checked;


    if (
      !nome ||
      !email ||
      !senha ||
      !confirmar
    ) {

      mostrarMensagemCadastro(
        "Preencha todos os campos obrigatórios.",
        "error"
      );

      return;

    }


    if (
      senha !== confirmar
    ) {

      mostrarMensagemCadastro(
        "As senhas informadas não são iguais.",
        "error"
      );

      return;

    }


    const avaliacao =
      avaliarSenha(
        senha
      );


    if (
      !avaliacao.tamanho
      ||
      !avaliacao.numero
      ||
      !avaliacao.maiuscula
    ) {

      mostrarMensagemCadastro(
        "Sua senha precisa ter pelo menos 8 caracteres, um número e uma letra maiúscula.",
        "error"
      );

      return;

    }


    if (!aceitarTermos) {

      mostrarMensagemCadastro(
        "Você precisa aceitar os Termos de Uso e a Política de Privacidade.",
        "error"
      );

      return;

    }


    /*
      Não fingimos cadastro no banco.

      Quando chegarmos ao backend,
      aqui entra:

      POST /api/clientes
      ou
      POST /api/auth/cadastro
    */

    mostrarMensagemCadastro(
      "Formulário validado. A criação da conta será conectada ao backend na etapa de integração.",
      "info"
    );

  }
);
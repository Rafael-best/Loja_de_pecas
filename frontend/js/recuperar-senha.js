/* =========================================================
   RECUPERAR SENHA
========================================================= */

const formRecuperacao =
  document.getElementById(
    "formRecuperacao"
  );


const emailRecuperacao =
  document.getElementById(
    "emailRecuperacao"
  );


const mensagemRecuperacao =
  document.getElementById(
    "mensagemRecuperacao"
  );



function mostrarMensagem(
  texto,
  tipo
) {

  if (!mensagemRecuperacao) {

    return;

  }


  mensagemRecuperacao.innerHTML = `
    <div class="recovery-alert ${tipo}">
      ${texto}
    </div>
  `;

}



formRecuperacao?.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const email =
      emailRecuperacao
        ?.value
        .trim();


    if (!email) {

      mostrarMensagem(
        "Informe seu e-mail para continuar.",
        "error"
      );

      return;

    }


    /*
      Não inventamos envio real.

      Depois conectaremos com algo como:

      POST /api/auth/recuperar-senha
    */

    mostrarMensagem(
      "E-mail validado. O envio do link de recuperação será conectado ao backend na etapa de autenticação.",
      "info"
    );

  }
);
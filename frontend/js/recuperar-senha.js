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


    fetch(
      "/api/recuperar-senha",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email_cliente: email
        })
      }
    )
      .then(async resposta => {

        const dados =
          await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
          throw new Error(
            dados.erro ||
            "Não foi possível processar sua solicitação."
          );
        }

        mostrarMensagem(
          dados.message ||
          "Se este e-mail estiver cadastrado, você vai receber um link de redefinição.",
          "success"
        );

        // Modo dev (sem SMTP configurado): o backend devolve o link
        // direto na resposta pra dar pra testar sem precisar de e-mail.
        if (dados.link_dev) {

          console.info(
            "[MODO DEV] Link de redefinição de senha:",
            dados.link_dev
          );

          mostrarMensagem(
            `${dados.message}<br><small>Modo de desenvolvimento (sem e-mail configurado): ` +
            `<a href="${dados.link_dev}">clique aqui para redefinir agora</a>.</small>`,
            "success"
          );

        }

      })
      .catch(erro => {

        mostrarMensagem(
          erro.message ||
          "Não foi possível processar sua solicitação.",
          "error"
        );

      });

  }
);
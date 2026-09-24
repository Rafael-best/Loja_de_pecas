/* =========================================================
   REDEFINIR SENHA
========================================================= */

const formRedefinicao =
  document.getElementById("formRedefinicao");

const senhaRedefinicao =
  document.getElementById("senhaRedefinicao");

const confirmarSenhaRedefinicao =
  document.getElementById("confirmarSenhaRedefinicao");

const mensagemRedefinicao =
  document.getElementById("mensagemRedefinicao");

const tituloRedefinicao =
  document.getElementById("tituloRedefinicao");

const descricaoRedefinicao =
  document.getElementById("descricaoRedefinicao");

const btnRedefinirSenha =
  document.getElementById("btnRedefinirSenha");


function mostrarMensagem(texto, tipo) {

  if (!mensagemRedefinicao) return;

  mensagemRedefinicao.innerHTML = `
    <div class="recovery-alert ${tipo}">
      ${texto}
    </div>
  `;

}


function obterTokenDaUrl() {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get("token") || "";
}


function bloquearFormulario(motivo) {

  if (formRedefinicao) {
    formRedefinicao.hidden = true;
  }

  if (tituloRedefinicao) {
    tituloRedefinicao.textContent = "Link inválido";
  }

  if (descricaoRedefinicao) {
    descricaoRedefinicao.textContent = motivo;
  }

}


const token = obterTokenDaUrl();


if (!token) {

  bloquearFormulario(
    "Este link está incompleto. Solicite a recuperação de senha novamente."
  );

} else {

  // Confere se o token ainda é válido antes de mostrar o formulário
  fetch(`/api/recuperar-senha/${encodeURIComponent(token)}`)
    .then(async resposta => {

      if (!resposta.ok) {

        const dados = await resposta.json().catch(() => ({}));

        bloquearFormulario(
          dados.erro ||
          "Este link expirou ou já foi usado. Solicite a recuperação novamente."
        );

      }

    })
    .catch(() => {

      bloquearFormulario(
        "Não foi possível validar o link agora. Tente novamente em instantes."
      );

    });

}


formRedefinicao?.addEventListener(
  "submit",
  event => {

    event.preventDefault();

    const senha = senhaRedefinicao?.value || "";
    const confirmar = confirmarSenhaRedefinicao?.value || "";

    if (senha.length < 8) {

      mostrarMensagem(
        "A senha precisa ter pelo menos 8 caracteres.",
        "error"
      );

      return;

    }

    if (senha !== confirmar) {

      mostrarMensagem(
        "As senhas informadas não são iguais.",
        "error"
      );

      return;

    }

    if (btnRedefinirSenha) {
      btnRedefinirSenha.disabled = true;
    }

    fetch(`/api/recuperar-senha/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ senha_nova: senha })
    })
      .then(async resposta => {

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
          throw new Error(
            dados.erro || "Não foi possível redefinir sua senha."
          );
        }

        mostrarMensagem(
          "Senha redefinida com sucesso! Redirecionando para o login...",
          "success"
        );

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);

      })
      .catch(erro => {

        mostrarMensagem(
          erro.message || "Não foi possível redefinir sua senha.",
          "error"
        );

      })
      .finally(() => {

        if (btnRedefinirSenha) {
          btnRedefinirSenha.disabled = false;
        }

      });

  }
);

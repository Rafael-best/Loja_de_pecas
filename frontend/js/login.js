console.log("login carregado");
const usuarioMock = {
  email: "compras@compras.com.br",
  senha: "1234",
  nome: "Compras",
  id_cliente: 1
};

const btnLogin = document.getElementById("btnLogin");
const btnMostrarSenha = document.getElementById("btnMostrarSenha");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const mensagem = document.getElementById("mensagem");

btnLogin.addEventListener("click", fazerLogin);

campoSenha.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    fazerLogin();
  }
});

btnMostrarSenha.addEventListener("click", function () {
  if (campoSenha.type === "password") {
    campoSenha.type = "text";
    btnMostrarSenha.textContent = "🙈";
  } else {
    campoSenha.type = "password";
    btnMostrarSenha.textContent = "👁";
  }
});

function fazerLogin() {

  let email = campoEmail.value.trim().toLowerCase();
  const senha = campoSenha.value.trim();

  mensagem.textContent = "";

  if (!email || !senha) {
    mensagem.textContent = "Preencha todos os campos.";
    return;
  }

  // remove .br se existir no final
  if (email.endsWith(".br")) {
    email = email.replace(".br", "");
  }

  if (
    email === "compras@compras.com" &&
    senha === "1234"
  ) {

    const usuario = {
      nome: "Compras",
      id_cliente: 1
    };

    localStorage.setItem("clienteLogado", JSON.stringify(usuario));

    if (!localStorage.getItem("carrinho")) {
      localStorage.setItem("carrinho", JSON.stringify([]));
    }

    window.location.href = "produtos.html";

  } else {
    mensagem.textContent = "E-mail ou senha inválidos.";
  }

}
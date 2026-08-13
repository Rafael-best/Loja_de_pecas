console.log("login carregado");

const API = "http://localhost:3000/api";

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

async function fazerLogin() {

  const email = campoEmail.value.trim();
  const senha = campoSenha.value.trim();

  mensagem.textContent = "";

  if (!email || !senha) {
    mensagem.textContent = "Preencha todos os campos.";
    return;
  }

  try {

    const resposta = await fetch(`${API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email_cliente: email,
        senha_cliente: senha
      })
    });

    const dados = await resposta.json();

    if (dados.success) {

      localStorage.setItem(
        "clienteLogado",
        JSON.stringify({
          id_cliente: dados.user.id_cliente,
          nome: dados.user.nome_cliente,
          email: dados.user.email_cliente
        })
      );

      if (!localStorage.getItem("carrinho")) {
        localStorage.setItem("carrinho", JSON.stringify([]));
      }

      window.location.href = "produtos.html";

    } else {

      mensagem.textContent = dados.message || "Login inválido.";

    }

  } catch (erro) {

    console.error(erro);
    mensagem.textContent = "Erro ao conectar ao servidor.";

  }
}
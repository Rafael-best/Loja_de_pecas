document.getElementById("formCadastro").addEventListener("submit", function(e){

e.preventDefault()

let cliente = {

nome: document.getElementById("nome").value,
email: document.getElementById("email").value,
telefone: document.getElementById("telefone").value,
endereco: document.getElementById("endereco").value,
senha: document.getElementById("senha").value

}

localStorage.setItem("cliente", JSON.stringify(cliente))

alert("Cadastro realizado com sucesso")

window.location.href="login.html"

})
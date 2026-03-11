document.getElementById("formLogin").addEventListener("submit", function(e){

e.preventDefault()

let email = document.getElementById("email").value
let senha = document.getElementById("senha").value

if(email === "compras@compras.com" && senha === "1234"){

window.location.href = "produtos.html"

}else{

alert("Login inválido")

}

})
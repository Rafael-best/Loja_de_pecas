function finalizar(){

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || []

let pedidos = JSON.parse(localStorage.getItem("pedidos")) || []

let pagamento = document.getElementById("pagamento").value

let pedido = {

produtos:carrinho,
pagamento:pagamento,
status:"Pendente"

}

pedidos.push(pedido)

localStorage.setItem("pedidos", JSON.stringify(pedidos))

localStorage.removeItem("carrinho")

alert("Pedido realizado")

window.location.href="pedidos.html"

}
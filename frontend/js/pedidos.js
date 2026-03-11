let pedidos = JSON.parse(localStorage.getItem("pedidos")) || []

let lista = document.getElementById("listaPedidos")

pedidos.forEach((p,i)=>{

lista.innerHTML +=

`
<tr>

<td>${i+1}</td>

<td>${p.status}</td>

<td>

<button class="btn btn-primary"
onclick="atender(${i})">

Atender

</button>

</td>

</tr>
`

})

function atender(i){

pedidos[i].status = "Atendido"

localStorage.setItem("pedidos", JSON.stringify(pedidos))

location.reload()

}
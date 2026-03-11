let produtos = [

{nome:"Rolamento", preco:20, estoque:10},
{nome:"Parafuso", preco:2, estoque:100},
{nome:"Bucha", preco:5, estoque:50}

]

let tabela = document.getElementById("listaProdutos")

produtos.forEach((produto, index)=>{

let linha = `
<tr>

<td>${produto.nome}</td>
<td>R$ ${produto.preco}</td>
<td>${produto.estoque}</td>

<td>
<button class="btn btn-success"
onclick="adicionar(${index})">
Adicionar
</button>
</td>

</tr>
`

tabela.innerHTML += linha

})

function adicionar(i){

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || []

carrinho.push(produtos[i])

localStorage.setItem("carrinho", JSON.stringify(carrinho))

alert("Produto adicionado")

}
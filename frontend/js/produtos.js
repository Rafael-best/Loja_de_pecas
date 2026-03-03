const API = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    fetch(`${API}/produtos`)
        .then(res => res.json())
        .then(produtos => {
            const lista = document.getElementById("lista-produtos");

            produtos.forEach(produto => {
                lista.innerHTML += `
                    <div class="col-md-3">
                        <div class="card p-3 mb-3">
                            <h5>${produto.nome_produto}</h5>
                            <p>${produto.descricao_produto}</p>
                            <p><strong>R$ ${produto.preco_produto}</strong></p>
                            <p>Estoque: ${produto.quantidade_estoque}</p>
                            <button class="btn btn-primary"
                                onclick="adicionarCarrinho(${produto.id_produto}, '${produto.nome_produto}', ${produto.preco_produto})">
                                Adicionar ao Carrinho
                            </button>
                        </div>
                    </div>
                `;
            });
        });
});

function adicionarCarrinho(id, nome, preco) {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    carrinho.push({
        id_produto: id,
        nome_produto: nome,
        preco: preco,
        quantidade: 1
    });

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    alert("Produto adicionado ao carrinho!");
}
const API = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    mostrarCarrinho();
});

function mostrarCarrinho() {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const div = document.getElementById("itens-carrinho");
    const totalGeral = document.getElementById("total-geral");

    div.innerHTML = "";
    let total = 0;

    carrinho.forEach(item => {
        total += item.preco * item.quantidade;

        div.innerHTML += `
            <div class="card p-2 mb-2">
                ${item.nome_produto} - R$ ${item.preco}
            </div>
        `;
    });

    totalGeral.innerHTML = "Total: R$ " + total.toFixed(2);
}

function finalizarCompra() {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    if (carrinho.length === 0) {
        alert("Carrinho vazio!");
        return;
    }

    carrinho.forEach(item => {
        fetch(`${API}/vendas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id_cliente: 1,
                id_produto: item.id_produto,
                quantidade: item.quantidade,
                total: item.preco * item.quantidade
            })
        });
    });

    alert("Compra finalizada com sucesso!");

    localStorage.removeItem("carrinho");
    window.location.href = "index.html";
}
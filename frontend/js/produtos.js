// =====================================================
// VERIFICAÇÃO DO CLIENTE LOGADO
// =====================================================

const cliente = JSON.parse(localStorage.getItem("clienteLogado"));
const API = "http://localhost:3000/api";
const CAMINHO_IMAGENS_PRODUTOS = "assets/images/produtos";
const PLACEHOLDER_PRODUTO = `${CAMINHO_IMAGENS_PRODUTOS}/placeholder.webp`;
const ITENS_POR_PAGINA = 8;

let produtos = [];
let paginaAtual = 1;

if (!cliente) {
    window.location.href = "index.html";
}


// =====================================================
// ELEMENTOS DO HTML
// =====================================================

const btnSair = document.getElementById("btnSair");
const campoBusca = document.getElementById("campoBusca");


// =====================================================
// BOTÃO SAIR
// =====================================================

if (btnSair) {
    btnSair.addEventListener("click", function () {
        localStorage.removeItem("clienteLogado");
        window.location.href = "index.html";
    });
}


// =====================================================
// FORMATAÇÃO DE MOEDA
// =====================================================

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


// =====================================================
// PRODUTOS
// =====================================================

// Mantemos o localStorage apenas como cache.
// A fonte principal agora é o PostgreSQL através da API.

function obterProdutos() {
    return JSON.parse(localStorage.getItem("produtosMock")) || [];
}


// =====================================================
// BUSCAR PRODUTOS NO BANCO
// =====================================================

async function carregarProdutos() {

    try {

        console.log("🔄 Carregando produtos do PostgreSQL...");

        const resposta = await fetch("http://localhost:3000/api/produtos");

        if (!resposta.ok) {
            throw new Error(
                `Erro HTTP ${resposta.status}`
            );
        }

        const produtos = await resposta.json();

        console.log("✅ Produtos recebidos:", produtos);

        // Salva os produtos recebidos como cache
        localStorage.setItem(
            "produtosMock",
            JSON.stringify(produtos)
        );

        // Mostra os produtos na tela
        renderizarProdutos(produtos);

    } catch (erro) {

        console.error(
            "❌ Erro ao carregar produtos:",
            erro
        );

        // Tenta usar produtos que já estejam no navegador
        const produtosSalvos = obterProdutos();

        if (produtosSalvos.length > 0) {

            console.warn(
                "⚠️ Usando produtos armazenados localmente."
            );

            renderizarProdutos(produtosSalvos);

        } else {

            const lista =
                document.getElementById("listaProdutos");

            if (lista) {

                lista.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-danger">
                            Não foi possível carregar os produtos.
                            Verifique se o servidor está funcionando.
                        </div>
                    </div>
                `;

            }
        }
    }
}


// =====================================================
// CARRINHO
// =====================================================

function obterCarrinho() {

    return JSON.parse(
        localStorage.getItem("carrinho")
    ) || [];

}


function salvarCarrinho(carrinho) {

    localStorage.setItem(
        "carrinho",
        JSON.stringify(carrinho)
    );

}


// =====================================================
// ATUALIZAR BOTÃO DO CARRINHO
// =====================================================

function atualizarBotaoCarrinho() {

    const carrinho = obterCarrinho();

    const btnCarrinho =
        document.getElementById("btnCarrinho");

    if (!btnCarrinho) {
        return;
    }

    const totalItens = carrinho.reduce(
        (total, item) =>
            total + Number(item.quantidade || 0),
        0
    );

    btnCarrinho.textContent =
        `Carrinho (${totalItens})`;
}


// =====================================================
// TOAST
// =====================================================

function mostrarToast(mensagem) {

    const toast =
        document.getElementById("toastMensagem");

    if (!toast) {
        console.log(mensagem);
        return;
    }

    toast.textContent = mensagem;

    toast.classList.add("mostrar");

    clearTimeout(toast._timeout);

    toast._timeout = setTimeout(() => {

        toast.classList.remove("mostrar");

    }, 2200);
}


// =====================================================
// ADICIONAR AO CARRINHO
// =====================================================

function adicionarAoCarrinho(idProduto) {

    const produtos = obterProdutos();

    const carrinho = obterCarrinho();

    const produto = produtos.find(
        p => Number(p.id_produto) === Number(idProduto)
    );

    if (!produto) {

        mostrarToast(
            "Produto não encontrado."
        );

        return;
    }


    const itemExistente = carrinho.find(
        item =>
            Number(item.id_produto) ===
            Number(idProduto)
    );


    if (itemExistente) {

        if (
            itemExistente.quantidade <
            Number(produto.quantidade_estoque)
        ) {

            itemExistente.quantidade += 1;

        } else {

            mostrarToast(
                "Quantidade máxima em estoque atingida."
            );

            return;
        }

    } else {

        carrinho.push({

            id_produto:
                produto.id_produto,

            nome_produto:
                produto.nome_produto,

            preco_produto:
                Number(produto.preco_produto),

            quantidade: 1,

            // Guardamos também a imagem
            // para o carrinho poder utilizá-la depois.
            imagem_produto:
                produto.imagem_produto || null

        });

    }


    salvarCarrinho(carrinho);

    atualizarBotaoCarrinho();

    mostrarToast(
        "Produto adicionado ao carrinho."
    );
}


// =====================================================
// RENDERIZAR PRODUTOS
// =====================================================

function renderizarProdutos(listaDeProdutos) {

    const lista =
        document.getElementById("listaProdutos");

    if (!lista) {
        console.error(
            "Elemento #listaProdutos não encontrado."
        );

        return;
    }


    lista.innerHTML = "";


    if (
        !listaDeProdutos ||
        listaDeProdutos.length === 0
    ) {

        lista.innerHTML = `
            <div class="col-12">

                <div class="alert alert-warning mb-0">

                    Nenhum produto encontrado.

                </div>

            </div>
        `;

        return;
    }


    listaDeProdutos.forEach(produto => {

        const coluna =
            document.createElement("div");

        coluna.className =
            "col-12 col-sm-6 col-lg-4 col-xl-3";


        // =================================================
        // IMAGEM DO SUPABASE
        // =================================================

        let imagemProduto =
            produto.imagem_produto;


        // Se não tiver imagem cadastrada
        if (!imagemProduto) {

            imagemProduto =
                "https://via.placeholder.com/400x250?text=Sem+imagem";

        }


        coluna.innerHTML = `

            <div class="card card-produto shadow-sm h-100">

                <img
                    src="${imagemProduto}"
                    class="card-img-top imagem-produto"
                    alt="${produto.nome_produto}"
                    style="
                        height: 220px;
                        object-fit: contain;
                        padding: 15px;
                    "
                    onerror="
                        this.onerror = null;
                        this.src = 'https://via.placeholder.com/400x250?text=Imagem+indisponivel';
                    "
                >

                <div class="card-body d-flex flex-column">

                    <h5 class="card-title">
                        ${produto.nome_produto}
                    </h5>

                    <p class="card-text text-muted descricao-produto">

                        ${produto.descricao_produto || ""}

                    </p>

                    <p class="mb-1">

                        <strong>Estoque:</strong>
                        ${produto.quantidade_estoque}

                    </p>

                    <p class="preco">

                        ${formatarMoeda(
                            produto.preco_produto
                        )}

                    </p>

                    <button
                        class="btn btn-primary mt-auto"
                    >
                        Adicionar ao carrinho
                    </button>

                </div>

            </div>

        `;


        const botao =
            coluna.querySelector("button");


        botao.addEventListener(
            "click",
            function () {

                adicionarAoCarrinho(
                    produto.id_produto
                );

            }
        );


        lista.appendChild(coluna);

    });

}


// =====================================================
// FILTRAR PRODUTOS
// =====================================================

function filtrarProdutos() {

    const produtos =
        obterProdutos();


    if (!campoBusca) {

        renderizarProdutos(produtos);

        return;
    }


    const termo =
        campoBusca.value
            .toLowerCase()
            .trim();


    const produtosFiltrados =
        produtos.filter(produto => {

            const nome =
                String(
                    produto.nome_produto || ""
                ).toLowerCase();


            const descricao =
                String(
                    produto.descricao_produto || ""
                ).toLowerCase();


            return (
                nome.includes(termo) ||
                descricao.includes(termo)
            );

        });


    renderizarProdutos(
        produtosFiltrados
    );

}


// =====================================================
// CAMPO DE BUSCA
// =====================================================

if (campoBusca) {

    campoBusca.addEventListener(
        "input",
        filtrarProdutos
    );

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

atualizarBotaoCarrinho();


// Busca os produtos diretamente
// do PostgreSQL através da API.
carregarProdutos();
/* =========================================================
   CHECKOUT.JS
   Loja de Peças
========================================================= */

const API = "http://localhost:3000/api";


/* =========================================================
   CLIENTE LOGADO
========================================================= */

let clienteLogado = null;

try {

  clienteLogado = JSON.parse(
    localStorage.getItem("clienteLogado")
  );

} catch (error) {

  console.error(
    "Erro ao ler clienteLogado:",
    error
  );

}


/*
  TEMPORÁRIO DURANTE O DESENVOLVIMENTO.

  Assim o checkout não quebra enquanto
  ainda não terminamos login/backend.

  Depois podemos remover esse fallback.
*/

if (!clienteLogado) {

  console.warn(
    "Cliente não encontrado. Usando cliente de teste."
  );

  clienteLogado = {
    id_cliente: 1,
    nome_cliente: "Cliente"
  };

}



/* =========================================================
   CONTROLE DO CHECKOUT
========================================================= */

let pedidoSendoFinalizado = false;



/* =========================================================
   MOEDA
========================================================= */

function formatarMoeda(valor) {

  const numero = Number(valor || 0);

  return numero.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

}



/* =========================================================
   LOCAL STORAGE SEGURO
========================================================= */

function obterCarrinho() {

  try {

    const dados =
      JSON.parse(
        localStorage.getItem("carrinho")
      );

    return Array.isArray(dados)
      ? dados
      : [];

  } catch (error) {

    console.error(
      "Erro ao carregar carrinho:",
      error
    );

    return [];

  }

}



function salvarCarrinho(carrinho) {

  try {

    localStorage.setItem(
      "carrinho",
      JSON.stringify(
        Array.isArray(carrinho)
          ? carrinho
          : []
      )
    );


    /*
      Atualiza contador do site.js,
      se existir.
    */

    if (
      window.SiteUI &&
      typeof window.SiteUI.atualizarCarrinho === "function"
    ) {

      window.SiteUI.atualizarCarrinho();

    }

  } catch (error) {

    console.error(
      "Erro ao salvar carrinho:",
      error
    );

  }

}



function obterProdutos() {

  try {

    const dados =
      JSON.parse(
        localStorage.getItem("produtosMock")
      );

    return Array.isArray(dados)
      ? dados
      : [];

  } catch (error) {

    console.error(
      "Erro ao carregar produtos:",
      error
    );

    return [];

  }

}



/* =========================================================
   MENSAGENS
========================================================= */

function mostrarMensagem(
  texto,
  tipo = "info"
) {

  const mensagem =
    document.getElementById(
      "mensagem"
    );


  const classes = {

    success:
      "alert alert-success",

    warning:
      "alert alert-warning",

    danger:
      "alert alert-danger",

    info:
      "alert alert-info"

  };


  if (mensagem) {

    mensagem.innerHTML = `
      <div
        class="${
          classes[tipo]
          ||
          classes.info
        }"
        role="alert"
      >
        ${texto}
      </div>
    `;

  } else {

    alert(texto);

  }

}



/* =========================================================
   LIMPAR MENSAGEM
========================================================= */

function limparMensagem() {

  const mensagem =
    document.getElementById(
      "mensagem"
    );


  if (mensagem) {

    mensagem.innerHTML = "";

  }

}



/* =========================================================
   CALCULAR TOTAL
========================================================= */

function calcularTotalCarrinho() {

  const carrinho =
    obterCarrinho();


  return carrinho.reduce(
    (
      total,
      item
    ) => {

      const preco =
        Number(
          item.preco_produto || 0
        );


      const quantidade =
        Number(
          item.quantidade || 0
        );


      return (
        total
        +
        (
          preco
          *
          quantidade
        )
      );

    },
    0
  );

}



/* =========================================================
   REMOVER ITEM
========================================================= */

function removerItem(
  idProduto
) {

  let carrinho =
    obterCarrinho();


  carrinho =
    carrinho.filter(
      item =>
        Number(
          item.id_produto
        )
        !==
        Number(
          idProduto
        )
    );


  salvarCarrinho(
    carrinho
  );


  renderizarCarrinho();

}



/* =========================================================
   ALTERAR QUANTIDADE
========================================================= */

function alterarQuantidade(
  idProduto,
  delta
) {

  const carrinho =
    obterCarrinho();


  const produtos =
    obterProdutos();


  const item =
    carrinho.find(
      i =>
        Number(
          i.id_produto
        )
        ===
        Number(
          idProduto
        )
    );


  if (!item) {

    console.warn(
      "Item não encontrado no carrinho."
    );

    return;

  }


  const novaQuantidade =
    Number(
      item.quantidade
    )
    +
    Number(
      delta
    );


  if (novaQuantidade <= 0) {

    removerItem(
      idProduto
    );

    return;

  }



  /*
    Procura estoque no produtosMock.

    Se produtosMock não existir,
    não bloqueamos a alteração.
  */

  const produto =
    produtos.find(
      p =>
        Number(
          p.id_produto
        )
        ===
        Number(
          idProduto
        )
    );


  if (
    produto &&
    novaQuantidade >
    Number(
      produto.quantidade_estoque
    )
  ) {

    mostrarMensagem(
      "A quantidade solicitada é maior que o estoque disponível.",
      "warning"
    );

    return;

  }


  item.quantidade =
    novaQuantidade;


  salvarCarrinho(
    carrinho
  );


  renderizarCarrinho();

}



/* =========================================================
   RENDERIZAR CARRINHO
========================================================= */

function renderizarCarrinho() {

  /*
    Essa função só roda se estivermos
    em uma página que tenha listaCarrinho
    e totalCarrinho.

    Portanto não dá erro no checkout novo.
  */

  const lista =
    document.getElementById(
      "listaCarrinho"
    );


  const totalCarrinho =
    document.getElementById(
      "totalCarrinho"
    );


  if (
    !lista ||
    !totalCarrinho
  ) {

    return;

  }


  const carrinho =
    obterCarrinho();


  if (
    carrinho.length === 0
  ) {

    lista.innerHTML = `
      <div class="cart-empty-state">

        <div
          class="text-center py-5"
        >

          <i
            class="fa-solid fa-cart-shopping
            text-primary mb-3"
            style="font-size: 40px;"
          ></i>

          <h5>
            Seu carrinho está vazio
          </h5>

          <p class="text-muted">
            Adicione produtos para continuar.
          </p>

          <a
            href="produtos.html"
            class="btn btn-primary mt-2"
          >
            Ver produtos
          </a>

        </div>

      </div>
    `;


    totalCarrinho.textContent =
      "Total: R$ 0,00";


    atualizarEstadoBotaoFinalizar();

    return;

  }



  let total = 0;



  /* =====================================================
     DESKTOP
  ===================================================== */

  const tabelaDesktop = `

    <div
      class="table-responsive
      d-none d-md-block"
    >

      <table
        class="table
        align-middle"
      >

        <thead>

          <tr>

            <th>
              Produto
            </th>

            <th>
              Preço
            </th>

            <th>
              Quantidade
            </th>

            <th>
              Subtotal
            </th>

            <th>
              Ações
            </th>

          </tr>

        </thead>


        <tbody>

          ${

            carrinho.map(
              item => {

                const preco =
                  Number(
                    item.preco_produto || 0
                  );


                const quantidade =
                  Number(
                    item.quantidade || 0
                  );


                const subtotal =
                  preco
                  *
                  quantidade;


                total +=
                  subtotal;


                return `

                  <tr>

                    <td>

                      <strong>
                        ${
                          item.nome_produto
                          ||
                          "Produto"
                        }
                      </strong>

                    </td>


                    <td>

                      ${formatarMoeda(
                        preco
                      )}

                    </td>


                    <td>

                      <div
                        class="d-flex
                        align-items-center
                        gap-2"
                      >

                        <button
                          type="button"
                          class="btn
                          btn-sm
                          btn-outline-secondary"
                          onclick="
                            alterarQuantidade(
                              ${item.id_produto},
                              -1
                            )
                          "
                        >
                          <i
                            class="fa-solid
                            fa-minus"
                          ></i>
                        </button>


                        <strong>
                          ${quantidade}
                        </strong>


                        <button
                          type="button"
                          class="btn
                          btn-sm
                          btn-outline-secondary"
                          onclick="
                            alterarQuantidade(
                              ${item.id_produto},
                              1
                            )
                          "
                        >
                          <i
                            class="fa-solid
                            fa-plus"
                          ></i>
                        </button>

                      </div>

                    </td>


                    <td>

                      <strong
                        class="text-success"
                      >
                        ${formatarMoeda(
                          subtotal
                        )}
                      </strong>

                    </td>


                    <td>

                      <button
                        type="button"
                        class="btn
                        btn-sm
                        btn-danger"
                        onclick="
                          removerItem(
                            ${item.id_produto}
                          )
                        "
                      >

                        <i
                          class="fa-solid
                          fa-trash"
                        ></i>

                        Remover

                      </button>

                    </td>

                  </tr>

                `;

              }
            ).join("")

          }

        </tbody>

      </table>

    </div>

  `;



  /* =====================================================
     MOBILE
  ===================================================== */

  const cardsMobile = `

    <div
      class="d-block
      d-md-none"
    >

      ${

        carrinho.map(
          item => {

            const preco =
              Number(
                item.preco_produto || 0
              );


            const quantidade =
              Number(
                item.quantidade || 0
              );


            const subtotal =
              preco
              *
              quantidade;


            return `

              <div
                class="item-mobile"
              >

                <h6>

                  ${
                    item.nome_produto
                    ||
                    "Produto"
                  }

                </h6>


                <p>

                  <strong>
                    Preço:
                  </strong>

                  ${formatarMoeda(
                    preco
                  )}

                </p>


                <p>

                  <strong>
                    Quantidade:
                  </strong>

                  ${quantidade}

                </p>


                <p>

                  <strong>
                    Subtotal:
                  </strong>

                  <span
                    class="text-success"
                  >

                    ${formatarMoeda(
                      subtotal
                    )}

                  </span>

                </p>


                <div
                  class="d-flex
                  flex-wrap
                  gap-2
                  mt-3"
                >

                  <button
                    type="button"
                    class="btn
                    btn-sm
                    btn-outline-secondary"
                    onclick="
                      alterarQuantidade(
                        ${item.id_produto},
                        -1
                      )
                    "
                  >

                    <i
                      class="fa-solid
                      fa-minus"
                    ></i>

                  </button>


                  <button
                    type="button"
                    class="btn
                    btn-sm
                    btn-outline-secondary"
                    onclick="
                      alterarQuantidade(
                        ${item.id_produto},
                        1
                      )
                    "
                  >

                    <i
                      class="fa-solid
                      fa-plus"
                    ></i>

                  </button>


                  <button
                    type="button"
                    class="btn
                    btn-sm
                    btn-danger"
                    onclick="
                      removerItem(
                        ${item.id_produto}
                      )
                    "
                  >

                    <i
                      class="fa-solid
                      fa-trash"
                    ></i>

                    Remover

                  </button>

                </div>

              </div>

            `;

          }
        ).join("")

      }

    </div>

  `;


  lista.innerHTML =
    tabelaDesktop
    +
    cardsMobile;


  totalCarrinho.textContent =
    `Total: ${formatarMoeda(total)}`;


  atualizarEstadoBotaoFinalizar();

}



/* =========================================================
   FORMA DE PAGAMENTO
========================================================= */

function obterFormaPagamento() {

  /*
    Compatível com:

    carrinho.html
    #formaPagamento

    checkout.html
    #pagamento
  */

  const elemento =
    document.getElementById(
      "pagamento"
    )
    ||
    document.getElementById(
      "formaPagamento"
    );


  if (!elemento) {

    return "";

  }


  return String(
    elemento.value || ""
  ).trim();

}



/* =========================================================
   VALIDAR CARRINHO
========================================================= */

function validarCarrinho(
  carrinho
) {

  if (
    !Array.isArray(carrinho)
    ||
    carrinho.length === 0
  ) {

    return {
      valido: false,
      mensagem:
        "O carrinho está vazio."
    };

  }


  for (
    const item
    of carrinho
  ) {

    if (
      !item.id_produto
    ) {

      return {
        valido: false,
        mensagem:
          "Existe um produto inválido no carrinho."
      };

    }


    if (
      !Number(item.quantidade)
      ||
      Number(item.quantidade) <= 0
    ) {

      return {
        valido: false,
        mensagem:
          `Quantidade inválida para ${
            item.nome_produto
            ||
            "um produto"
          }.`
      };

    }

  }


  return {
    valido: true
  };

}



/* =========================================================
   ESTADO BOTÃO
========================================================= */

function atualizarEstadoBotaoFinalizar() {

  const botao =
    document.getElementById(
      "btnFinalizar"
    );


  if (!botao) {

    return;

  }


  const carrinho =
    obterCarrinho();


  botao.disabled =
    carrinho.length === 0;

}



/* =========================================================
   BLOQUEAR BOTÃO DURANTE PROCESSAMENTO
========================================================= */

function alterarEstadoFinalizacao(
  carregando
) {

  pedidoSendoFinalizado =
    carregando;


  /*
    Funciona no carrinho,
    se existir #btnFinalizar.
  */

  const botaoCarrinho =
    document.getElementById(
      "btnFinalizar"
    );


  /*
    Funciona também no checkout novo,
    que chama finalizarPedido()
    por onclick.
  */

  const botaoCheckout =
    document.querySelector(
      ".finish-order-button"
    );


  const botoes = [
    botaoCarrinho,
    botaoCheckout
  ];


  botoes.forEach(
    botao => {

      if (!botao) {

        return;

      }


      botao.disabled =
        carregando;


      if (carregando) {

        botao.dataset.textoOriginal =
          botao.innerHTML;


        botao.innerHTML = `

          <span
            class="spinner-border
            spinner-border-sm"
            aria-hidden="true"
          ></span>

          Processando...

        `;

      } else if (
        botao.dataset.textoOriginal
      ) {

        botao.innerHTML =
          botao.dataset.textoOriginal;

      }

    }
  );

}



/* =========================================================
   TENTAR CANCELAR PEDIDO INCOMPLETO
========================================================= */

async function tentarCancelarPedido(
  idPedido
) {

  if (!idPedido) {

    return;

  }


  try {

    const resposta =
      await fetch(

        `${API}/pedidos/${idPedido}/cancelar`,

        {
          method: "PATCH"
        }

      );


    if (!resposta.ok) {

      console.warn(
        "Não foi possível cancelar automaticamente o pedido incompleto."
      );

    }

  } catch (error) {

    console.warn(
      "Falha ao tentar cancelar pedido incompleto:",
      error
    );

  }

}



/* =========================================================
   FINALIZAR PEDIDO
========================================================= */

async function finalizarPedido() {

  /*
    Evita clique duplo e
    criação duplicada.
  */

  if (
    pedidoSendoFinalizado
  ) {

    return;

  }


  limparMensagem();


  const carrinho =
    obterCarrinho();


  const formaPagamento =
    obterFormaPagamento();



  /* =====================================================
     CLIENTE
  ===================================================== */

  if (
    !clienteLogado
    ||
    !clienteLogado.id_cliente
  ) {

    mostrarMensagem(
      "Cliente não identificado. Faça login novamente.",
      "danger"
    );

    return;

  }



  /* =====================================================
     CARRINHO
  ===================================================== */

  const validacaoCarrinho =
    validarCarrinho(
      carrinho
    );


  if (
    !validacaoCarrinho.valido
  ) {

    mostrarMensagem(
      validacaoCarrinho.mensagem,
      "warning"
    );

    return;

  }



  /* =====================================================
     PAGAMENTO
  ===================================================== */

  if (
    !formaPagamento
  ) {

    mostrarMensagem(
      "Selecione uma forma de pagamento antes de continuar.",
      "warning"
    );

    return;

  }



  /*
    Segurança extra:
    só aceita formas conhecidas.
  */

  const formasPermitidas = [
    "Pix",
    "Cartão",
    "Boleto"
  ];


  if (
    !formasPermitidas.includes(
      formaPagamento
    )
  ) {

    mostrarMensagem(
      "Forma de pagamento inválida.",
      "danger"
    );

    return;

  }



  alterarEstadoFinalizacao(
    true
  );


  let idPedidoCriado = null;


  try {

    /* ===================================================
       CRIAR PEDIDO
    =================================================== */

    const respostaPedido =
      await fetch(

        `${API}/pedidos`,

        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              id_cliente:
                clienteLogado.id_cliente,

              forma_pagamento:
                formaPagamento,

              status_pedido:
                "Pendente",

              /*
                Mantido 0 porque seu backend
                aparentemente recalcula o total
                quando os itens são adicionados.
              */

              total_pedido:
                0

            })

        }

      );



    let pedidoCriado = {};


    try {

      pedidoCriado =
        await respostaPedido.json();

    } catch {

      throw new Error(
        "O servidor retornou uma resposta inválida ao criar o pedido."
      );

    }



    if (
      !respostaPedido.ok
    ) {

      console.error(
        "Erro da API ao criar pedido:",
        pedidoCriado
      );


      throw new Error(
        pedidoCriado.erro
        ||
        pedidoCriado.message
        ||
        "Não foi possível criar o pedido."
      );

    }



    idPedidoCriado =
      pedidoCriado.id_pedido;



    if (
      !idPedidoCriado
    ) {

      throw new Error(
        "O pedido foi criado, mas o servidor não retornou o número do pedido."
      );

    }



    /* ===================================================
       ADICIONAR ITENS
    =================================================== */

    for (
      const item
      of carrinho
    ) {

      const respostaItem =
        await fetch(

          `${API}/pedidos/${idPedidoCriado}/itens`,

          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify({

                id_produto:
                  Number(
                    item.id_produto
                  ),

                quantidade:
                  Number(
                    item.quantidade
                  )

              })

          }

        );



      let resultadoItem = {};


      try {

        resultadoItem =
          await respostaItem.json();

      } catch {

        resultadoItem = {};

      }



      if (
        !respostaItem.ok
      ) {

        console.error(
          `Erro ao adicionar produto ${item.id_produto}:`,
          resultadoItem
        );


        throw new Error(
          resultadoItem.erro
          ||
          resultadoItem.message
          ||
          `Não foi possível adicionar ${
            item.nome_produto
            ||
            "um produto"
          } ao pedido.`
        );

      }

    }



    /* ===================================================
       PEDIDO CONCLUÍDO
    =================================================== */

    salvarCarrinho([]);



    /*
      Guarda o último pedido.

      Pode ser útil posteriormente
      para uma página de confirmação.
    */

    localStorage.setItem(

      "ultimoPedido",

      JSON.stringify({

        id_pedido:
          idPedidoCriado,

        forma_pagamento:
          formaPagamento,

        data:
          new Date()
            .toISOString()

      })

    );



    mostrarMensagem(
      `Pedido #${idPedidoCriado} realizado com sucesso!`,
      "success"
    );



    /*
      Pequeno atraso apenas para
      o usuário visualizar o sucesso.
    */

    setTimeout(
      () => {

        window.location.href =
          "pedidos.html";

      },
      900
    );

  }
  catch (error) {

    console.error(
      "Erro ao finalizar pedido:",
      error
    );



    /*
      Se o pedido foi criado mas algum item
      deu erro, tentamos cancelar o pedido
      incompleto.

      Seu backend já possui a rota:
      PATCH /pedidos/:id/cancelar
    */

    if (
      idPedidoCriado
    ) {

      await tentarCancelarPedido(
        idPedidoCriado
      );

    }



    mostrarMensagem(
      error.message
      ||
      "Ocorreu um erro ao finalizar a compra.",
      "danger"
    );


    alterarEstadoFinalizacao(
      false
    );

  }

}



/* =========================================================
   BOTÃO DO CARRINHO
========================================================= */

const btnFinalizar =
  document.getElementById(
    "btnFinalizar"
  );


if (btnFinalizar) {

  /*
    Evita registrar duas vezes
    caso esse JS seja recarregado.
  */

  btnFinalizar.addEventListener(
    "click",
    finalizarPedido
  );

}



/* =========================================================
   ALTERAÇÃO DO PAGAMENTO
========================================================= */

const pagamentoEl =
  document.getElementById(
    "pagamento"
  )
  ||
  document.getElementById(
    "formaPagamento"
  );


pagamentoEl?.addEventListener(
  "change",
  limparMensagem
);



/* =========================================================
   INICIAR
========================================================= */

renderizarCarrinho();

atualizarEstadoBotaoFinalizar();



/* =========================================================
   DISPONIBILIZAR FUNÇÕES GLOBALMENTE

   Necessário porque alguns botões
   HTML usam onclick=""
========================================================= */

window.finalizarPedido =
  finalizarPedido;


window.removerItem =
  removerItem;


window.alterarQuantidade =
  alterarQuantidade;
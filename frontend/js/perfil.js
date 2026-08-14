/* =========================================================
   PERFIL.JS
========================================================= */

const API =
  "http://localhost:3000/api";


let clientePerfil =
  null;



/* =========================================================
   CLIENTE
========================================================= */

function carregarClientePerfil() {

  try {

    const dados =
      localStorage.getItem(
        "clienteLogado"
      );


    if (!dados) {

      return null;

    }


    const cliente =
      JSON.parse(dados);


    if (
      !cliente
      ||
      typeof cliente !== "object"
    ) {

      return null;

    }


    return cliente;

  } catch {

    return null;

  }

}



clientePerfil =
  carregarClientePerfil();



/* =========================================================
   PROTEGER PERFIL
========================================================= */

if (!clientePerfil) {

  try {

    sessionStorage.setItem(
      "destinoAposLogin",
      "perfil.html"
    );

  } catch {
    /* vazio */
  }


  window.location.href =
    "login.html";

}



/* =========================================================
   CLIENTE
========================================================= */

function obterNome() {

  if (!clientePerfil) {

    return "Cliente";

  }


  return (
    clientePerfil.nome_cliente
    ||
    clientePerfil.nome
    ||
    "Cliente"
  );

}



function obterEmail() {

  if (!clientePerfil) {

    return "";

  }


  return (
    clientePerfil.email_cliente
    ||
    clientePerfil.email
    ||
    ""
  );

}



function obterInicial() {

  const nome =
    obterNome()
      .trim();


  if (!nome) {

    return "U";

  }


  return nome
    .charAt(0)
    .toUpperCase();

}



/* =========================================================
   HELPERS
========================================================= */

function formatarMoeda(valor) {

  return Number(
    valor || 0
  )
    .toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );

}



function formatarData(valor) {

  if (!valor) {

    return "-";

  }


  const data =
    new Date(valor);


  if (
    Number.isNaN(
      data.getTime()
    )
  ) {

    return String(valor);

  }


  return data.toLocaleDateString(
    "pt-BR"
  );

}



function definirTexto(
  id,
  valor
) {

  const elemento =
    document.getElementById(
      id
    );


  if (elemento) {

    elemento.textContent =
      String(valor ?? "");

  }

}



function definirValor(
  id,
  valor
) {

  const elemento =
    document.getElementById(
      id
    );


  if (elemento) {

    elemento.value =
      valor ?? "";

  }

}



function valorCampo(id) {

  const elemento =
    document.getElementById(
      id
    );


  if (!elemento) {

    return "";

  }


  return String(
    elemento.value || ""
  )
    .trim();

}



function definirCheckbox(
  id,
  valor
) {

  const elemento =
    document.getElementById(
      id
    );


  if (elemento) {

    elemento.checked =
      Boolean(valor);

  }

}



function escaparHtml(valor) {

  return String(
    valor ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}



function mostrarMensagem(
  id,
  texto,
  tipo
) {

  const elemento =
    document.getElementById(
      id
    );


  if (!elemento) {

    return;

  }


  elemento.innerHTML =
    '<div class="profile-alert '
    +
    tipo
    +
    '">'
    +
    escaparHtml(texto)
    +
    "</div>";

}



/* =========================================================
   FOTO
========================================================= */

function obterFotoPerfil() {

  try {

    return (
      localStorage.getItem(
        "fotoPerfilCliente"
      )
      ||
      ""
    );

  } catch {

    return "";

  }

}



function renderizarFotoPerfil() {

  const avatar =
    document.getElementById(
      "profileMainAvatar"
    );


  if (!avatar) {

    return;

  }


  const foto =
    obterFotoPerfil();


  if (foto) {

    avatar.textContent =
      "";


    avatar.style.backgroundImage =
      'url("' + foto + '")';


    avatar.style.backgroundSize =
      "cover";


    avatar.style.backgroundPosition =
      "center";


    avatar.style.backgroundRepeat =
      "no-repeat";

  } else {

    avatar.style.backgroundImage =
      "";


    avatar.textContent =
      obterInicial();

  }


  if (
    window.SiteUI
    &&
    typeof window.SiteUI.atualizarCliente
      === "function"
  ) {

    window.SiteUI
      .atualizarCliente();

  }

}



/* =========================================================
   UPLOAD DA FOTO
========================================================= */

function configurarUploadFoto() {

  const input =
    document.getElementById(
      "inputFotoPerfil"
    );


  if (!input) {

    return;

  }


  input.addEventListener(
    "change",
    function (event) {

      const arquivo =
        event.target.files
        &&
        event.target.files[0];


      if (!arquivo) {

        return;

      }


      if (
        !arquivo.type
          .startsWith(
            "image/"
          )
      ) {

        alert(
          "Selecione uma imagem válida."
        );


        input.value =
          "";


        return;

      }


      if (
        arquivo.size >
        2 * 1024 * 1024
      ) {

        alert(
          "Escolha uma imagem de até 2 MB."
        );


        input.value =
          "";


        return;

      }


      const leitor =
        new FileReader();


      leitor.onload =
        function () {

          try {

            localStorage.setItem(
              "fotoPerfilCliente",
              leitor.result
            );

          } catch (erro) {

            console.error(
              "Não foi possível salvar a foto:",
              erro
            );


            alert(
              "Não foi possível salvar essa imagem no navegador."
            );


            return;

          }


          renderizarFotoPerfil();

        };


      leitor.readAsDataURL(
        arquivo
      );

    }
  );

}



/* =========================================================
   PREENCHER PERFIL
========================================================= */

function preencherPerfil() {

  if (!clientePerfil) {

    return;

  }


  definirTexto(
    "nomePerfil",
    obterNome()
  );


  definirTexto(
    "emailPerfil",
    obterEmail()
  );


  definirValor(
    "perfilNome",
    obterNome()
  );


  definirValor(
    "perfilEmail",
    obterEmail()
  );


  definirValor(
    "perfilTelefone",
    clientePerfil.telefone_cliente
    ||
    clientePerfil.telefone
    ||
    ""
  );


  definirValor(
    "perfilCpf",
    clientePerfil.cpf_cliente
    ||
    clientePerfil.cpf
    ||
    ""
  );


  definirValor(
    "perfilNascimento",
    clientePerfil.data_nascimento
    ||
    clientePerfil.nascimento
    ||
    ""
  );


  if (
    clientePerfil.data_cadastro
  ) {

    definirTexto(
      "clienteDesde",
      "Cliente desde "
      +
      formatarData(
        clientePerfil.data_cadastro
      )
    );

  }


  carregarEndereco();

  carregarPreferencias();

  renderizarFotoPerfil();

}



/* =========================================================
   ABAS
========================================================= */

function abrirAba(nome) {

  const tabs =
    document.querySelectorAll(
      ".profile-tab"
    );


  const panels =
    document.querySelectorAll(
      ".profile-panel"
    );


  tabs.forEach(
    function (tab) {

      tab.classList.toggle(
        "active",
        tab.dataset.tab === nome
      );

    }
  );


  panels.forEach(
    function (panel) {

      panel.classList.toggle(
        "active",
        panel.id ===
        "panel-" + nome
      );

    }
  );

}



function configurarAbas() {

  const tabs =
    document.querySelectorAll(
      ".profile-tab"
    );


  tabs.forEach(
    function (tab) {

      tab.addEventListener(
        "click",
        function () {

          const nome =
            tab.dataset.tab;


          abrirAba(
            nome
          );


          try {

            history.replaceState(
              null,
              "",
              "#" + nome
            );

          } catch {
            /* vazio */
          }

        }
      );

    }
  );

}



function abrirAbaPorHash() {

  const hash =
    window.location.hash
      .replace(
        "#",
        ""
      );


  const abasValidas = [

    "dados",
    "endereco",
    "veiculos",
    "seguranca",
    "preferencias"

  ];


  if (
    abasValidas.includes(
      hash
    )
  ) {

    abrirAba(
      hash
    );

  }

}



/* =========================================================
   DADOS PESSOAIS
========================================================= */

function configurarFormularioDados() {

  const formulario =
    document.getElementById(
      "formDadosPessoais"
    );


  if (!formulario) {

    return;

  }


  formulario.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();


      const nome =
        valorCampo(
          "perfilNome"
        );


      const email =
        valorCampo(
          "perfilEmail"
        );


      if (
        !nome
        ||
        !email
      ) {

        mostrarMensagem(
          "mensagemDadosPerfil",
          "Preencha nome e e-mail.",
          "error"
        );


        return;

      }


      clientePerfil = {

        ...clientePerfil,

        nome_cliente:
          nome,

        nome:
          nome,

        email_cliente:
          email,

        email:
          email,

        telefone_cliente:
          valorCampo(
            "perfilTelefone"
          ),

        telefone:
          valorCampo(
            "perfilTelefone"
          ),

        cpf_cliente:
          valorCampo(
            "perfilCpf"
          ),

        cpf:
          valorCampo(
            "perfilCpf"
          ),

        data_nascimento:
          valorCampo(
            "perfilNascimento"
          )

      };


      try {

        localStorage.setItem(
          "clienteLogado",
          JSON.stringify(
            clientePerfil
          )
        );

      } catch (erro) {

        console.error(
          erro
        );


        mostrarMensagem(
          "mensagemDadosPerfil",
          "Não foi possível salvar os dados.",
          "error"
        );


        return;

      }


      preencherPerfil();


      mostrarMensagem(
        "mensagemDadosPerfil",
        "Dados atualizados no navegador. Depois conectaremos essas alterações ao banco.",
        "success"
      );

    }
  );

}



/* =========================================================
   ENDEREÇO
========================================================= */

function obterEndereco() {

  try {

    const dados =
      localStorage.getItem(
        "enderecoCliente"
      );


    if (!dados) {

      return {};

    }


    const endereco =
      JSON.parse(dados);


    if (
      !endereco
      ||
      typeof endereco !== "object"
    ) {

      return {};

    }


    return endereco;

  } catch {

    return {};

  }

}



function carregarEndereco() {

  const endereco =
    obterEndereco();


  definirValor(
    "perfilCep",
    endereco.cep
  );


  definirValor(
    "perfilEstado",
    endereco.estado
  );


  definirValor(
    "perfilRua",
    endereco.rua
  );


  definirValor(
    "perfilNumero",
    endereco.numero
  );


  definirValor(
    "perfilComplemento",
    endereco.complemento
  );


  definirValor(
    "perfilBairro",
    endereco.bairro
  );


  definirValor(
    "perfilCidade",
    endereco.cidade
  );

}



function configurarFormularioEndereco() {

  const formulario =
    document.getElementById(
      "formEndereco"
    );


  if (!formulario) {

    return;

  }


  formulario.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();


      const endereco = {

        cep:
          valorCampo(
            "perfilCep"
          ),

        estado:
          valorCampo(
            "perfilEstado"
          )
            .toUpperCase(),

        rua:
          valorCampo(
            "perfilRua"
          ),

        numero:
          valorCampo(
            "perfilNumero"
          ),

        complemento:
          valorCampo(
            "perfilComplemento"
          ),

        bairro:
          valorCampo(
            "perfilBairro"
          ),

        cidade:
          valorCampo(
            "perfilCidade"
          )

      };


      try {

        localStorage.setItem(
          "enderecoCliente",
          JSON.stringify(
            endereco
          )
        );


        mostrarMensagem(
          "mensagemEndereco",
          "Endereço salvo no navegador. Depois conectaremos ao banco.",
          "success"
        );

      } catch {

        mostrarMensagem(
          "mensagemEndereco",
          "Não foi possível salvar o endereço.",
          "error"
        );

      }

    }
  );

}



/* =========================================================
   VEÍCULOS
========================================================= */

function obterVeiculos() {

  try {

    const dados =
      localStorage.getItem(
        "veiculosCliente"
      );


    if (!dados) {

      return [];

    }


    const veiculos =
      JSON.parse(dados);


    return Array.isArray(
      veiculos
    )
      ? veiculos
      : [];

  } catch {

    return [];

  }

}



function salvarVeiculos(veiculos) {

  try {

    localStorage.setItem(
      "veiculosCliente",
      JSON.stringify(
        veiculos
      )
    );

  } catch (erro) {

    console.error(
      "Erro ao salvar veículos:",
      erro
    );


    return false;

  }


  renderizarVeiculos();


  return true;

}



function renderizarVeiculos() {

  const lista =
    document.getElementById(
      "listaVeiculos"
    );


  if (!lista) {

    return;

  }


  const veiculos =
    obterVeiculos();


  definirTexto(
    "perfilTotalVeiculos",
    veiculos.length
  );


  if (
    veiculos.length === 0
  ) {

    lista.innerHTML = `
      <div class="vehicles-empty">

        <i class="fa-solid fa-car-side"></i>

        <strong>
          Nenhum veículo cadastrado
        </strong>

        <span>
          Adicione um veículo para facilitar a busca por peças.
        </span>

      </div>
    `;


    return;

  }


  lista.innerHTML =
    veiculos.map(
      function (veiculo) {

        const titulo =
          escaparHtml(
            String(
              veiculo.marca || ""
            )
            +
            " "
            +
            String(
              veiculo.modelo || ""
            )
          );


        let descricao =
          escaparHtml(
            veiculo.ano || ""
          );


        if (
          veiculo.motor
        ) {

          descricao +=
            " • "
            +
            escaparHtml(
              veiculo.motor
            );

        }


        let detalhes =
          veiculo.placa
            ? "Placa "
              +
              escaparHtml(
                veiculo.placa
              )
            : "Placa não informada";


        if (
          veiculo.cor
        ) {

          detalhes +=
            " • "
            +
            escaparHtml(
              veiculo.cor
            );

        }


        return `
          <article class="vehicle-card">

            <span class="vehicle-icon">

              <i class="fa-solid fa-car-side"></i>

            </span>

            <div>

              <h3>
                ${titulo}
              </h3>

              <p>
                ${descricao}
              </p>

              <small>
                ${detalhes}
              </small>

            </div>

            <button
              type="button"
              class="remove-vehicle-button"
              data-remove-veiculo="${Number(veiculo.id)}"
              title="Remover veículo"
            >

              <i class="fa-solid fa-trash"></i>

            </button>

          </article>
        `;

      }
    )
      .join("");


  configurarBotoesRemoverVeiculo();

}



function configurarBotoesRemoverVeiculo() {

  const botoes =
    document.querySelectorAll(
      "[data-remove-veiculo]"
    );


  botoes.forEach(
    function (botao) {

      botao.addEventListener(
        "click",
        function () {

          const id =
            Number(
              botao.getAttribute(
                "data-remove-veiculo"
              )
            );


          removerVeiculo(
            id
          );

        }
      );

    }
  );

}



function removerVeiculo(id) {

  const veiculos =
    obterVeiculos();


  const novos =
    veiculos.filter(
      function (veiculo) {

        return (
          Number(
            veiculo.id
          )
          !==
          Number(id)
        );

      }
    );


  salvarVeiculos(
    novos
  );

}



/* =========================================================
   MODAL VEÍCULO
========================================================= */

function abrirModalVeiculo() {

  const modal =
    document.getElementById(
      "modalVeiculo"
    );


  if (!modal) {

    return;

  }


  modal.classList.add(
    "open"
  );


  document.body.style.overflow =
    "hidden";

}



function fecharModalVeiculo() {

  const modal =
    document.getElementById(
      "modalVeiculo"
    );


  if (!modal) {

    return;

  }


  modal.classList.remove(
    "open"
  );


  document.body.style.overflow =
    "";

}



function configurarModalVeiculo() {

  const btnAdicionar =
    document.getElementById(
      "btnAdicionarVeiculo"
    );


  const btnFechar =
    document.getElementById(
      "btnFecharVeiculo"
    );


  const btnCancelar =
    document.getElementById(
      "btnCancelarVeiculo"
    );


  const modal =
    document.getElementById(
      "modalVeiculo"
    );


  if (btnAdicionar) {

    btnAdicionar.addEventListener(
      "click",
      abrirModalVeiculo
    );

  }


  if (btnFechar) {

    btnFechar.addEventListener(
      "click",
      fecharModalVeiculo
    );

  }


  if (btnCancelar) {

    btnCancelar.addEventListener(
      "click",
      fecharModalVeiculo
    );

  }


  const backdrop =
    modal
      ? modal.querySelector(
          ".profile-modal-backdrop"
        )
      : null;


  if (backdrop) {

    backdrop.addEventListener(
      "click",
      fecharModalVeiculo
    );

  }

}



/* =========================================================
   FORM VEÍCULO
========================================================= */

function configurarFormularioVeiculo() {

  const formulario =
    document.getElementById(
      "formVeiculo"
    );


  if (!formulario) {

    return;

  }


  formulario.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();


      const marca =
        valorCampo(
          "veiculoMarca"
        );


      const modelo =
        valorCampo(
          "veiculoModelo"
        );


      const ano =
        valorCampo(
          "veiculoAno"
        );


      if (
        !marca
        ||
        !modelo
        ||
        !ano
      ) {

        return;

      }


      const veiculos =
        obterVeiculos();


      const veiculo = {

        id:
          Date.now(),

        marca:
          marca,

        modelo:
          modelo,

        ano:
          ano,

        motor:
          valorCampo(
            "veiculoMotor"
          ),

        placa:
          valorCampo(
            "veiculoPlaca"
          )
            .toUpperCase(),

        cor:
          valorCampo(
            "veiculoCor"
          )

      };


      veiculos.push(
        veiculo
      );


      if (
        !salvarVeiculos(
          veiculos
        )
      ) {

        return;

      }


      formulario.reset();


      fecharModalVeiculo();

    }
  );

}



/* =========================================================
   PREFERÊNCIAS
========================================================= */

function carregarPreferencias() {

  let preferencias = {};


  try {

    const dados =
      localStorage.getItem(
        "preferenciasCliente"
      );


    if (dados) {

      const objeto =
        JSON.parse(dados);


      if (
        objeto
        &&
        typeof objeto === "object"
      ) {

        preferencias =
          objeto;

      }

    }

  } catch {
    /* vazio */
  }


  definirCheckbox(
    "prefPromocoes",
    preferencias.promocoes === true
  );


  definirCheckbox(
    "prefPedidos",
    preferencias.pedidos !== false
  );


  definirCheckbox(
    "prefRecomendacoes",
    preferencias.recomendacoes === true
  );

}



function configurarPreferencias() {

  const botao =
    document.getElementById(
      "btnSalvarPreferencias"
    );


  if (!botao) {

    return;

  }


  botao.addEventListener(
    "click",
    function () {

      const campoPromocoes =
        document.getElementById(
          "prefPromocoes"
        );


      const campoPedidos =
        document.getElementById(
          "prefPedidos"
        );


      const campoRecomendacoes =
        document.getElementById(
          "prefRecomendacoes"
        );


      const preferencias = {

        promocoes:
          campoPromocoes
            ? campoPromocoes.checked
            : false,

        pedidos:
          campoPedidos
            ? campoPedidos.checked
            : true,

        recomendacoes:
          campoRecomendacoes
            ? campoRecomendacoes.checked
            : false

      };


      try {

        localStorage.setItem(
          "preferenciasCliente",
          JSON.stringify(
            preferencias
          )
        );


        mostrarMensagem(
          "mensagemPreferencias",
          "Preferências salvas.",
          "success"
        );

      } catch {

        mostrarMensagem(
          "mensagemPreferencias",
          "Não foi possível salvar as preferências.",
          "error"
        );

      }

    }
  );

}



/* =========================================================
   ALTERAR SENHA
========================================================= */

function configurarFormularioSenha() {

  const formulario =
    document.getElementById(
      "formAlterarSenha"
    );


  if (!formulario) {

    return;

  }


  formulario.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();


      const senhaAtual =
        valorCampo(
          "senhaAtualPerfil"
        );


      const novaSenha =
        valorCampo(
          "novaSenhaPerfil"
        );


      const confirmacao =
        valorCampo(
          "confirmarNovaSenhaPerfil"
        );


      if (
        !senhaAtual
        ||
        !novaSenha
        ||
        !confirmacao
      ) {

        mostrarMensagem(
          "mensagemSenhaPerfil",
          "Preencha todos os campos.",
          "error"
        );


        return;

      }


      if (
        novaSenha.length < 8
      ) {

        mostrarMensagem(
          "mensagemSenhaPerfil",
          "A nova senha precisa ter pelo menos 8 caracteres.",
          "error"
        );


        return;

      }


      if (
        novaSenha !==
        confirmacao
      ) {

        mostrarMensagem(
          "mensagemSenhaPerfil",
          "As novas senhas não coincidem.",
          "error"
        );


        return;

      }


      mostrarMensagem(
        "mensagemSenhaPerfil",
        "Senha validada. A alteração real será conectada ao backend.",
        "info"
      );

    }
  );

}



/* =========================================================
   PEDIDOS
========================================================= */

async function carregarResumoPedidos() {

  if (
    !clientePerfil
    ||
    !clientePerfil.id_cliente
  ) {

    return;

  }


  try {

    const resposta =
      await fetch(
        API + "/pedidos"
      );


    const dados =
      await resposta.json();


    if (
      !resposta.ok
      ||
      !Array.isArray(
        dados
      )
    ) {

      return;

    }


    const meusPedidos =
      dados.filter(
        function (pedido) {

          return (
            Number(
              pedido.id_cliente
            )
            ===
            Number(
              clientePerfil.id_cliente
            )
          );

        }
      );


    const total =
      meusPedidos.reduce(
        function (
          soma,
          pedido
        ) {

          return (
            soma
            +
            Number(
              pedido.total_pedido || 0
            )
          );

        },
        0
      );


    const ordenados =
      meusPedidos.slice();


    ordenados.sort(
      function (a, b) {

        const dataA =
          new Date(
            a.data_pedido || 0
          );


        const dataB =
          new Date(
            b.data_pedido || 0
          );


        return (
          dataB.getTime()
          -
          dataA.getTime()
        );

      }
    );


    const ultimo =
      ordenados.length > 0
        ? ordenados[0]
        : null;


    definirTexto(
      "perfilTotalPedidos",
      meusPedidos.length
    );


    definirTexto(
      "perfilTotalGasto",
      formatarMoeda(
        total
      )
    );


    definirTexto(
      "perfilUltimoPedido",
      ultimo
        ? "#" + ultimo.id_pedido
        : "-"
    );

  } catch (erro) {

    console.warn(
      "Não foi possível carregar os pedidos:",
      erro
    );

  }

}



/* =========================================================
   MÁSCARA TELEFONE
========================================================= */

function configurarMascaraTelefone() {

  const campo =
    document.getElementById(
      "perfilTelefone"
    );


  if (!campo) {

    return;

  }


  campo.addEventListener(
    "input",
    function () {

      let valor =
        campo.value
          .replace(
            /\D/g,
            ""
          )
          .slice(
            0,
            11
          );


      if (
        valor.length > 10
      ) {

        valor =
          valor.replace(
            /^(\d{2})(\d{5})(\d{4})$/,
            "($1) $2-$3"
          );

      } else if (
        valor.length > 6
      ) {

        valor =
          valor.replace(
            /^(\d{2})(\d{4})(\d{0,4})$/,
            "($1) $2-$3"
          );

      } else if (
        valor.length > 2
      ) {

        valor =
          valor.replace(
            /^(\d{2})(\d+)/,
            "($1) $2"
          );

      }


      campo.value =
        valor;

    }
  );

}



/* =========================================================
   CPF
========================================================= */

function configurarMascaraCpf() {

  const campo =
    document.getElementById(
      "perfilCpf"
    );


  if (!campo) {

    return;

  }


  campo.addEventListener(
    "input",
    function () {

      let valor =
        campo.value
          .replace(
            /\D/g,
            ""
          )
          .slice(
            0,
            11
          );


      valor =
        valor.replace(
          /(\d{3})(\d)/,
          "$1.$2"
        );


      valor =
        valor.replace(
          /(\d{3})(\d)/,
          "$1.$2"
        );


      valor =
        valor.replace(
          /(\d{3})(\d{1,2})$/,
          "$1-$2"
        );


      campo.value =
        valor;

    }
  );

}



/* =========================================================
   CEP
========================================================= */

function configurarMascaraCep() {

  const campo =
    document.getElementById(
      "perfilCep"
    );


  if (!campo) {

    return;

  }


  campo.addEventListener(
    "input",
    function () {

      let valor =
        campo.value
          .replace(
            /\D/g,
            ""
          )
          .slice(
            0,
            8
          );


      if (
        valor.length > 5
      ) {

        valor =
          valor.replace(
            /^(\d{5})(\d+)/,
            "$1-$2"
          );

      }


      campo.value =
        valor;

    }
  );

}



/* =========================================================
   PLACA
========================================================= */

function configurarPlaca() {

  const campo =
    document.getElementById(
      "veiculoPlaca"
    );


  if (!campo) {

    return;

  }


  campo.addEventListener(
    "input",
    function () {

      campo.value =
        campo.value
          .replace(
            /[^a-zA-Z0-9]/g,
            ""
          )
          .toUpperCase()
          .slice(
            0,
            7
          );

    }
  );

}



/* =========================================================
   ESC
========================================================= */

function configurarEscape() {

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape"
      ) {

        fecharModalVeiculo();

      }

    }
  );

}



/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    if (!clientePerfil) {

      return;

    }


    preencherPerfil();

    configurarUploadFoto();

    configurarAbas();

    abrirAbaPorHash();

    configurarFormularioDados();

    configurarFormularioEndereco();

    configurarModalVeiculo();

    configurarFormularioVeiculo();

    configurarPreferencias();

    configurarFormularioSenha();

    configurarMascaraTelefone();

    configurarMascaraCpf();

    configurarMascaraCep();

    configurarPlaca();

    configurarEscape();

    renderizarVeiculos();

    carregarResumoPedidos();

  }
);
/* ============================================================
   AUTO PEÇA CERTA
   PEDIDOS.JS
   ============================================================ */

   "use strict";


   /* ============================================================
      01. CONFIGURAÇÃO
      ============================================================ */
   
   const ORDERS_CONFIG = {
   
       apiBaseUrl: "http://localhost:3000/api",
   
       endpoints: {
           pedidos: "/pedidos",
           cancelarPedido: "/pedidos",
           produtos: "/produtos"
       },
   
       storage: {
           clienteLogado: "clienteLogado",
           clientePedido: "clientePedido",
           carrinho: "carrinho",
           tema: "tema"
       },
   
       timeout: 12000,
   
       animationDelay: 70
   
   };
   
   
   /* ============================================================
      02. ESTADO DA PÁGINA
      ============================================================ */
   
   const OrdersState = {
   
       cliente: null,
   
       pedidos: [],
   
       pedidosFiltrados: [],
   
       filtroStatus: "todos",
   
       busca: "",
   
       ordenacao: "recentes",
   
       carregando: false,
   
       pedidoSelecionado: null,
   
       pedidoCancelamento: null,
   
       controller: null
   
   };
   
   
   /* ============================================================
      03. ELEMENTOS
      ============================================================ */
   
   const OrdersElements = {};
   
   
   /* ============================================================
      04. INICIALIZAÇÃO
      ============================================================ */
   
   document.addEventListener("DOMContentLoaded", async () => {
   
       cacheElements();
   
       configureCurrentYear();
   
       configureHeader();
   
       configureTheme();
   
       configureMobileMenu();
   
       configureHeaderSearch();
   
       configureOrderEvents();
   
       configureModalEvents();
   
       configureScrollEffects();
   
       configureRevealAnimations();
   
       updateCartCounter();
   
       await initializeOrdersPage();
   
   });
   
   
   /* ============================================================
      05. CACHE DE ELEMENTOS
      ============================================================ */
   
   function cacheElements() {
   
       OrdersElements.ordersList =
           document.getElementById("ordersList");
   
       OrdersElements.ordersLoading =
           document.getElementById("ordersLoading");
   
       OrdersElements.ordersEmptyState =
           document.getElementById("ordersEmptyState");
   
       OrdersElements.ordersNoResults =
           document.getElementById("ordersNoResults");
   
       OrdersElements.ordersErrorState =
           document.getElementById("ordersErrorState");
   
       OrdersElements.ordersLoginRequired =
           document.getElementById("ordersLoginRequired");
   
       OrdersElements.ordersErrorMessage =
           document.getElementById("ordersErrorMessage");
   
   
       OrdersElements.ordersTotalCount =
           document.getElementById("ordersTotalCount");
   
       OrdersElements.ordersProgressCount =
           document.getElementById("ordersProgressCount");
   
       OrdersElements.ordersDeliveredCount =
           document.getElementById("ordersDeliveredCount");
   
       OrdersElements.ordersCanceledCount =
           document.getElementById("ordersCanceledCount");
   
   
       OrdersElements.ordersSearchInput =
           document.getElementById("ordersSearchInput");
   
       OrdersElements.ordersSearchClear =
           document.getElementById("ordersSearchClear");
   
       OrdersElements.ordersStatusFilter =
           document.getElementById("ordersStatusFilter");
   
       OrdersElements.ordersSort =
           document.getElementById("ordersSort");
   
       OrdersElements.clearAllFiltersButton =
           document.getElementById("clearAllFiltersButton");
   
       OrdersElements.resetOrdersSearchButton =
           document.getElementById("resetOrdersSearchButton");
   
       OrdersElements.refreshOrdersButton =
           document.getElementById("refreshOrdersButton");
   
       OrdersElements.retryOrdersButton =
           document.getElementById("retryOrdersButton");
   
   
       OrdersElements.ordersResultsInfo =
           document.getElementById("ordersResultsInfo");
   
       OrdersElements.ordersVisibleCount =
           document.getElementById("ordersVisibleCount");
   
       OrdersElements.ordersResultsLabel =
           document.getElementById("ordersResultsLabel");
   
   
       OrdersElements.orderDetailsModal =
           document.getElementById("orderDetailsModal");
   
       OrdersElements.orderDetailsTitle =
           document.getElementById("orderDetailsTitle");
   
       OrdersElements.orderDetailsContent =
           document.getElementById("orderDetailsContent");
   
       OrdersElements.orderDetailsClose =
           document.getElementById("orderDetailsClose");
   
   
       OrdersElements.cancelOrderModal =
           document.getElementById("cancelOrderModal");
   
       OrdersElements.cancelOrderBackButton =
           document.getElementById("cancelOrderBackButton");
   
       OrdersElements.cancelOrderConfirmButton =
           document.getElementById("cancelOrderConfirmButton");
   
       OrdersElements.cancelOrderMessage =
           document.getElementById("cancelOrderMessage");
   
   
       OrdersElements.ordersToast =
           document.getElementById("ordersToast");
   
       OrdersElements.ordersToastText =
           document.getElementById("ordersToastText");
   
   
       OrdersElements.accountButton =
           document.getElementById("accountButton");
   
       OrdersElements.headerAccountLabel =
           document.getElementById("headerAccountLabel");
   
       OrdersElements.headerAvatar =
           document.getElementById("headerAvatar");
   
       OrdersElements.headerAvatarImage =
           document.getElementById("headerAvatarImage");
   
       OrdersElements.headerAvatarInitial =
           document.getElementById("headerAvatarInitial");
   
       OrdersElements.headerCartCount =
           document.getElementById("headerCartCount");
   
   
       OrdersElements.themeToggle =
           document.getElementById("themeToggle");
   
       OrdersElements.siteHeader =
           document.getElementById("siteHeader");
   
       OrdersElements.backToTop =
           document.getElementById("backToTop");
   
   
       OrdersElements.mobileMenuButton =
           document.getElementById("mobileMenuButton");
   
       OrdersElements.mobileMenu =
           document.getElementById("mobileMenu");
   
       OrdersElements.mobileMenuClose =
           document.getElementById("mobileMenuClose");
   
       OrdersElements.mobileMenuOverlay =
           document.getElementById("mobileMenuOverlay");
   
   
       OrdersElements.headerSearchForm =
           document.getElementById("headerSearchForm");
   
       OrdersElements.headerSearchInput =
           document.getElementById("headerSearchInput");
   
   
       OrdersElements.currentYear =
           document.getElementById("currentYear");
   
   }
   
   
   /* ============================================================
      06. INICIALIZAÇÃO DOS PEDIDOS
      ============================================================ */
   
   async function initializeOrdersPage() {
   
       const cliente = getLoggedClient();
   
       OrdersState.cliente = cliente;
   
       if (!cliente) {
   
           showLoginRequired();
   
           return;
   
       }
   
       configureLoggedClient(cliente);
   
       await loadOrders();
   
   }
   
   
   /* ============================================================
      07. CLIENTE LOGADO
      ============================================================ */
   
   function getLoggedClient() {
   
       const keys = [
           ORDERS_CONFIG.storage.clienteLogado,
           ORDERS_CONFIG.storage.clientePedido
       ];
   
       for (const key of keys) {
   
           try {
   
               const raw =
                   localStorage.getItem(key);
   
               if (!raw) {
                   continue;
               }
   
               const parsed =
                   JSON.parse(raw);
   
               if (
                   parsed &&
                   typeof parsed === "object"
               ) {
   
                   const id = getClientId(parsed);
   
                   if (id !== null) {
   
                       return {
                           ...parsed,
                           id_cliente: id
                       };
   
                   }
   
               }
   
           } catch (error) {
   
               console.warn(
                   `Não foi possível ler ${key}:`,
                   error
               );
   
           }
   
       }
   
       return null;
   
   }
   
   
   /* ============================================================
      08. PEGAR ID DO CLIENTE
      ============================================================ */
   
   function getClientId(cliente) {
   
       if (!cliente) {
           return null;
       }
   
       const possibleIds = [
   
           cliente.id_cliente,
           cliente.idCliente,
           cliente.cliente_id,
           cliente.clienteId,
           cliente.id
   
       ];
   
       for (const id of possibleIds) {
   
           if (
               id !== undefined &&
               id !== null &&
               String(id).trim() !== ""
           ) {
   
               return id;
   
           }
   
       }
   
       return null;
   
   }
   
   
   /* ============================================================
      09. CONFIGURAR CLIENTE NO HEADER
      ============================================================ */
   
   function configureLoggedClient(cliente) {
   
       const nome =
           cliente.nome ||
           cliente.nome_cliente ||
           cliente.name ||
           cliente.usuario ||
           "Minha conta";
   
       const primeiroNome =
           String(nome)
               .trim()
               .split(/\s+/)[0] ||
           "Conta";
   
       if (OrdersElements.headerAccountLabel) {
   
           OrdersElements.headerAccountLabel.textContent =
               primeiroNome;
   
       }
   
       if (OrdersElements.accountButton) {
   
           OrdersElements.accountButton.href =
               "perfil.html";
   
       }
   
       const foto =
           cliente.foto ||
           cliente.avatar ||
           cliente.imagem ||
           cliente.foto_perfil ||
           "";
   
       if (
           foto &&
           OrdersElements.headerAvatarImage
       ) {
   
           OrdersElements.headerAvatarImage.src =
               foto;
   
           OrdersElements.headerAvatarImage.alt =
               `Foto de ${primeiroNome}`;
   
           OrdersElements.headerAvatarImage.hidden =
               false;
   
           if (
               OrdersElements.headerAvatarInitial
           ) {
   
               OrdersElements.headerAvatarInitial.hidden =
                   true;
   
           }
   
       } else if (
           OrdersElements.headerAvatarInitial
       ) {
   
           OrdersElements.headerAvatarInitial.innerHTML =
               escapeHTML(
                   primeiroNome
                       .charAt(0)
                       .toUpperCase()
               );
   
       }
   
   }
   
   
   /* ============================================================
      10. CARREGAR PEDIDOS
      ============================================================ */
   
   async function loadOrders(options = {}) {
   
       const {
           silent = false
       } = options;
   
       const clienteId =
           getClientId(OrdersState.cliente);
   
       if (clienteId === null) {
   
           showLoginRequired();
   
           return;
   
       }
   
       if (OrdersState.carregando) {
           return;
       }
   
       OrdersState.carregando = true;
   
       if (!silent) {
           showLoadingState();
       } else {
   
           OrdersElements.ordersList
               ?.classList.add("is-refreshing");
   
       }
   
       OrdersElements.refreshOrdersButton
           ?.classList.add("is-loading");
   
   
       try {
   
           if (OrdersState.controller) {
   
               OrdersState.controller.abort();
   
           }
   
           OrdersState.controller =
               new AbortController();
   
           const timeoutId =
               setTimeout(
                   () => {
                       OrdersState.controller?.abort();
                   },
                   ORDERS_CONFIG.timeout
               );
   
   
           const pedidos =
               await fetchClientOrders(
                   clienteId,
                   OrdersState.controller.signal
               );
   
   
           clearTimeout(timeoutId);
   
   
           OrdersState.pedidos =
               normalizeOrders(pedidos)
                   .filter(
                       pedido =>
                           belongsToClient(
                               pedido,
                               clienteId
                           )
                   );
   
   
           updateOrderCounters();
   
           applyFiltersAndRender();
   
   
           if (silent) {
   
               showToast(
                   "Pedidos atualizados."
               );
   
           }
   
       } catch (error) {
   
           if (error.name === "AbortError") {
   
               showErrorState(
                   "A consulta demorou mais do que o esperado. Tente novamente."
               );
   
           } else {
   
               console.error(
                   "Erro ao carregar pedidos:",
                   error
               );
   
               showErrorState(
                   "Não foi possível carregar seus pedidos. Verifique se o servidor está ativo e tente novamente."
               );
   
           }
   
       } finally {
   
           OrdersState.carregando = false;
   
           OrdersElements.refreshOrdersButton
               ?.classList.remove("is-loading");
   
           OrdersElements.ordersList
               ?.classList.remove("is-refreshing");
   
       }
   
   }
   
   
   /* ============================================================
      11. BUSCAR PEDIDOS DA API
      ============================================================ */
   
   async function fetchClientOrders(
       clienteId,
       signal
   ) {
   
       /*
          Tentamos primeiro uma rota filtrada pelo cliente.
   
          Exemplo:
          GET /api/pedidos?cliente_id=15
   
          Se o backend ainda não aceitar o filtro,
          tentamos GET /api/pedidos e filtramos
          novamente no navegador.
       */
   
       const filteredUrl =
           `${ORDERS_CONFIG.apiBaseUrl}` +
           `${ORDERS_CONFIG.endpoints.pedidos}` +
           `?cliente_id=${encodeURIComponent(clienteId)}`;
   
   
       let response =
           await fetch(
               filteredUrl,
               {
                   method: "GET",
   
                   headers: {
                       "Accept": "application/json"
                   },
   
                   signal
               }
           );
   
   
       if (
           response.status === 404 ||
           response.status === 400
       ) {
   
           const fallbackUrl =
               `${ORDERS_CONFIG.apiBaseUrl}` +
               `${ORDERS_CONFIG.endpoints.pedidos}`;
   
           response =
               await fetch(
                   fallbackUrl,
                   {
                       method: "GET",
   
                       headers: {
                           "Accept": "application/json"
                       },
   
                       signal
                   }
               );
   
       }
   
   
       if (!response.ok) {
   
           throw new Error(
               `Erro HTTP ${response.status}`
           );
   
       }
   
   
       const data =
           await response.json();
   
   
       return extractOrdersArray(data);
   
   }
   
   
   /* ============================================================
      12. EXTRAIR ARRAY DE DIFERENTES FORMATOS DA API
      ============================================================ */
   
   function extractOrdersArray(data) {
   
       if (Array.isArray(data)) {
           return data;
       }
   
       if (!data || typeof data !== "object") {
           return [];
       }
   
       const possibleArrays = [
   
           data.pedidos,
           data.orders,
           data.data,
           data.resultados,
           data.results,
           data.items
   
       ];
   
       for (const possible of possibleArrays) {
   
           if (Array.isArray(possible)) {
   
               return possible;
   
           }
   
       }
   
   
       if (
           data.data &&
           typeof data.data === "object"
       ) {
   
           const nested = [
   
               data.data.pedidos,
               data.data.orders,
               data.data.items,
               data.data.results
   
           ];
   
           for (const possible of nested) {
   
               if (Array.isArray(possible)) {
   
                   return possible;
   
               }
   
           }
   
       }
   
   
       return [];
   
   }
   
   
   /* ============================================================
      13. NORMALIZAR PEDIDOS
      ============================================================ */
   
   function normalizeOrders(pedidos) {
   
       if (!Array.isArray(pedidos)) {
           return [];
       }
   
       return pedidos.map(
           (pedido, index) =>
               normalizeOrder(
                   pedido,
                   index
               )
       );
   
   }
   
   
   /* ============================================================
      14. NORMALIZAR UM PEDIDO
      ============================================================ */
   
   function normalizeOrder(
       raw,
       index = 0
   ) {
   
       const id =
           firstDefined(
               raw.id_pedido,
               raw.idPedido,
               raw.pedido_id,
               raw.order_id,
               raw.id,
               index + 1
           );
   
   
       const clienteId =
           firstDefined(
               raw.id_cliente,
               raw.idCliente,
               raw.cliente_id,
               raw.clienteId,
               raw.cliente?.id_cliente,
               raw.cliente?.id
           );
   
   
       const numero =
           firstDefined(
               raw.numero_pedido,
               raw.numeroPedido,
               raw.codigo,
               raw.numero,
               raw.order_number,
               id
           );
   
   
       const statusRaw =
           firstDefined(
               raw.status,
               raw.status_pedido,
               raw.situacao,
               raw.estado,
               "pendente"
           );
   
   
       const data =
           firstDefined(
               raw.data_pedido,
               raw.dataPedido,
               raw.created_at,
               raw.createdAt,
               raw.data,
               raw.date,
               null
           );
   
   
       const total =
           toNumber(
               firstDefined(
                   raw.valor_total,
                   raw.valorTotal,
                   raw.total,
                   raw.total_pedido,
                   raw.preco_total,
                   0
               )
           );
   
   
       const itensRaw =
           firstDefined(
               raw.itens,
               raw.items,
               raw.produtos,
               raw.order_items,
               raw.pedido_itens,
               []
           );
   
   
       const itens =
           normalizeOrderItems(
               Array.isArray(itensRaw)
                   ? itensRaw
                   : []
           );
   
   
       const endereco =
           normalizeAddress(
               firstDefined(
                   raw.endereco_entrega,
                   raw.enderecoEntrega,
                   raw.endereco,
                   raw.shipping_address,
                   null
               )
           );
   
   
       return {
   
           raw,
   
           id,
   
           id_cliente: clienteId,
   
           numero,
   
           statusOriginal:
               String(statusRaw || ""),
   
           status:
               normalizeStatus(statusRaw),
   
           data,
   
           total,
   
           itens,
   
           pagamento:
               firstDefined(
                   raw.forma_pagamento,
                   raw.formaPagamento,
                   raw.pagamento,
                   raw.payment_method,
                   ""
               ),
   
           entregaPrevista:
               firstDefined(
                   raw.previsao_entrega,
                   raw.previsaoEntrega,
                   raw.data_entrega_prevista,
                   raw.delivery_date,
                   ""
               ),
   
           codigoRastreio:
               firstDefined(
                   raw.codigo_rastreio,
                   raw.codigoRastreio,
                   raw.rastreio,
                   raw.tracking_code,
                   ""
               ),
   
           endereco,
   
           observacao:
               firstDefined(
                   raw.observacao,
                   raw.observacoes,
                   raw.notes,
                   ""
               )
   
       };
   
   }
   
   
   /* ============================================================
      15. NORMALIZAR ITENS
      ============================================================ */
   
   function normalizeOrderItems(itens) {
   
       return itens.map(
           (item, index) => {
   
               const produto =
                   item.produto &&
                   typeof item.produto === "object"
                       ? item.produto
                       : {};
   
   
               const quantidade =
                   Math.max(
                       1,
                       Number(
                           firstDefined(
                               item.quantidade,
                               item.qtd,
                               item.quantity,
                               1
                           )
                       ) || 1
                   );
   
   
               const preco =
                   toNumber(
                       firstDefined(
                           item.preco_unitario,
                           item.precoUnitario,
                           item.preco,
                           item.valor,
                           item.price,
                           produto.preco,
                           0
                       )
                   );
   
   
               return {
   
                   id:
                       firstDefined(
                           item.id_produto,
                           item.produto_id,
                           item.product_id,
                           produto.id_produto,
                           produto.id,
                           index
                       ),
   
                   nome:
                       firstDefined(
                           item.nome_produto,
                           item.nome,
                           item.name,
                           produto.nome,
                           produto.name,
                           "Produto"
                       ),
   
                   imagem:
                       firstDefined(
                           item.imagem,
                           item.foto,
                           item.image,
                           produto.imagem,
                           produto.foto,
                           produto.image,
                           ""
                       ),
   
                   quantidade,
   
                   preco,
   
                   subtotal:
                       toNumber(
                           firstDefined(
                               item.subtotal,
                               item.valor_total,
                               item.total,
                               preco * quantidade
                           )
                       ),
   
                   marca:
                       firstDefined(
                           item.marca,
                           produto.marca,
                           ""
                       ),
   
                   codigo:
                       firstDefined(
                           item.codigo,
                           item.sku,
                           produto.codigo,
                           produto.sku,
                           ""
                       )
   
               };
   
           }
       );
   
   }
   
   
   /* ============================================================
      16. NORMALIZAR ENDEREÇO
      ============================================================ */
   
   function normalizeAddress(endereco) {
   
       if (!endereco) {
           return null;
       }
   
       if (typeof endereco === "string") {
   
           return {
               texto: endereco
           };
   
       }
   
       return {
   
           rua:
               firstDefined(
                   endereco.rua,
                   endereco.logradouro,
                   endereco.street,
                   ""
               ),
   
           numero:
               firstDefined(
                   endereco.numero,
                   endereco.number,
                   ""
               ),
   
           complemento:
               firstDefined(
                   endereco.complemento,
                   endereco.complement,
                   ""
               ),
   
           bairro:
               firstDefined(
                   endereco.bairro,
                   endereco.neighborhood,
                   ""
               ),
   
           cidade:
               firstDefined(
                   endereco.cidade,
                   endereco.city,
                   ""
               ),
   
           estado:
               firstDefined(
                   endereco.estado,
                   endereco.uf,
                   endereco.state,
                   ""
               ),
   
           cep:
               firstDefined(
                   endereco.cep,
                   endereco.zip,
                   endereco.postal_code,
                   ""
               )
   
       };
   
   }
   
   
   /* ============================================================
      17. VERIFICAR DONO DO PEDIDO
      ============================================================ */
   
   function belongsToClient(
       pedido,
       clienteId
   ) {
   
       /*
          Segurança importante:
   
          Se a API retornar id_cliente,
          o pedido só aparece se o ID bater.
   
          Se a rota já retornou pedidos filtrados
          e o objeto não possuir id_cliente,
          mantemos o resultado.
   
          A proteção definitiva também precisa
          existir no BACKEND.
       */
   
       const pedidoClienteId =
           pedido.id_cliente;
   
   
       if (
           pedidoClienteId === undefined ||
           pedidoClienteId === null ||
           String(pedidoClienteId).trim() === ""
       ) {
   
           return true;
   
       }
   
   
       return (
           String(pedidoClienteId) ===
           String(clienteId)
       );
   
   }
   
   
   /* ============================================================
      18. NORMALIZAR STATUS
      ============================================================ */
   
   function normalizeStatus(status) {
   
       const value =
           removeAccents(
               String(status || "")
                   .toLowerCase()
                   .trim()
           );
   
   
       if (
           value.includes("cancel")
       ) {
           return "cancelado";
       }
   
   
       if (
           value.includes("entreg")
       ) {
           return "entregue";
       }
   
   
       if (
           value.includes("enviado") ||
           value.includes("transporte") ||
           value.includes("transportadora") ||
           value.includes("despachado")
       ) {
           return "enviado";
       }
   
   
       if (
           value.includes("prepar") ||
           value.includes("process") ||
           value.includes("separacao") ||
           value.includes("separando")
       ) {
           return "preparacao";
       }
   
   
       if (
           value.includes("pago") ||
           value.includes("aprovado") ||
           value.includes("confirmado")
       ) {
           return "pago";
       }
   
   
       return "pendente";
   
   }
   
   
   /* ============================================================
      19. GRUPO DO STATUS
      ============================================================ */
   
   function getStatusGroup(status) {
   
       if (status === "entregue") {
           return "entregue";
       }
   
       if (status === "cancelado") {
           return "cancelado";
       }
   
       return "andamento";
   
   }
   
   
   /* ============================================================
      20. LABEL STATUS
      ============================================================ */
   
   function getStatusLabel(status) {
   
       const labels = {
   
           pendente:
               "Pedido recebido",
   
           pago:
               "Pagamento aprovado",
   
           preparacao:
               "Em preparação",
   
           enviado:
               "Em transporte",
   
           entregue:
               "Entregue",
   
           cancelado:
               "Cancelado"
   
       };
   
       return (
           labels[status] ||
           "Em andamento"
       );
   
   }
   
   
   /* ============================================================
      21. ÍCONE STATUS
      ============================================================ */
   
   function getStatusIcon(status) {
   
       const icons = {
   
           pendente:
               "fa-clock",
   
           pago:
               "fa-credit-card",
   
           preparacao:
               "fa-box-open",
   
           enviado:
               "fa-truck-fast",
   
           entregue:
               "fa-circle-check",
   
           cancelado:
               "fa-ban"
   
       };
   
       return (
           icons[status] ||
           "fa-box"
       );
   
   }
   
   
   /* ============================================================
      22. CONTADORES
      ============================================================ */
   
   function updateOrderCounters() {
   
       const todos =
           OrdersState.pedidos.length;
   
       const andamento =
           OrdersState.pedidos.filter(
               pedido =>
                   getStatusGroup(
                       pedido.status
                   ) === "andamento"
           ).length;
   
       const entregues =
           OrdersState.pedidos.filter(
               pedido =>
                   pedido.status === "entregue"
           ).length;
   
       const cancelados =
           OrdersState.pedidos.filter(
               pedido =>
                   pedido.status === "cancelado"
           ).length;
   
   
       animateCounter(
           OrdersElements.ordersTotalCount,
           todos
       );
   
       animateCounter(
           OrdersElements.ordersProgressCount,
           andamento
       );
   
       animateCounter(
           OrdersElements.ordersDeliveredCount,
           entregues
       );
   
       animateCounter(
           OrdersElements.ordersCanceledCount,
           cancelados
       );
   
   }
   
   
   /* ============================================================
      23. ANIMAR CONTADOR
      ============================================================ */
   
   function animateCounter(
       element,
       finalValue
   ) {
   
       if (!element) {
           return;
       }
   
       const parent =
           element.closest(
               ".orders-stat-card"
           );
   
       element.textContent =
           String(finalValue);
   
       parent?.classList.add(
           "is-updating"
       );
   
       setTimeout(
           () => {
               parent?.classList.remove(
                   "is-updating"
               );
           },
           320
       );
   
   }
   
   
   /* ============================================================
      24. EVENTOS DOS PEDIDOS
      ============================================================ */
   
   function configureOrderEvents() {
   
       document
           .querySelectorAll(
               "[data-order-filter]"
           )
           .forEach(button => {
   
               button.addEventListener(
                   "click",
                   () => {
   
                       const filter =
                           button.dataset.orderFilter ||
                           "todos";
   
                       setStatusFilter(filter);
   
                   }
               );
   
           });
   
   
       OrdersElements.ordersStatusFilter
           ?.addEventListener(
               "change",
               event => {
   
                   setStatusFilter(
                       event.target.value
                   );
   
               }
           );
   
   
       OrdersElements.ordersSort
           ?.addEventListener(
               "change",
               event => {
   
                   OrdersState.ordenacao =
                       event.target.value;
   
                   applyFiltersAndRender();
   
               }
           );
   
   
       OrdersElements.ordersSearchInput
           ?.addEventListener(
               "input",
               debounce(
                   event => {
   
                       OrdersState.busca =
                           event.target.value
                               .trim();
   
                       updateSearchClearButton();
   
                       applyFiltersAndRender();
   
                   },
                   180
               )
           );
   
   
       OrdersElements.ordersSearchClear
           ?.addEventListener(
               "click",
               clearOrderSearch
           );
   
   
       OrdersElements.clearAllFiltersButton
           ?.addEventListener(
               "click",
               resetAllFilters
           );
   
   
       OrdersElements.resetOrdersSearchButton
           ?.addEventListener(
               "click",
               resetAllFilters
           );
   
   
       OrdersElements.refreshOrdersButton
           ?.addEventListener(
               "click",
               () => {
   
                   loadOrders({
                       silent: true
                   });
   
               }
           );
   
   
       OrdersElements.retryOrdersButton
           ?.addEventListener(
               "click",
               () => {
   
                   loadOrders();
   
               }
           );
   
   
       OrdersElements.ordersList
           ?.addEventListener(
               "click",
               handleOrderListClick
           );
   
   }
   
   
   /* ============================================================
      25. FILTRO DE STATUS
      ============================================================ */
   
   function setStatusFilter(filter) {
   
       const allowed = [
           "todos",
           "andamento",
           "entregue",
           "cancelado"
       ];
   
       if (!allowed.includes(filter)) {
           filter = "todos";
       }
   
       OrdersState.filtroStatus =
           filter;
   
   
       document
           .querySelectorAll(
               "[data-order-filter]"
           )
           .forEach(button => {
   
               button.classList.toggle(
                   "active",
                   button.dataset.orderFilter ===
                       filter
               );
   
           });
   
   
       if (
           OrdersElements.ordersStatusFilter
       ) {
   
           OrdersElements.ordersStatusFilter.value =
               filter;
   
       }
   
   
       applyFiltersAndRender();
   
   }
   
   
   /* ============================================================
      26. FILTRAR E RENDERIZAR
      ============================================================ */
   
   function applyFiltersAndRender() {
   
       let result =
           [...OrdersState.pedidos];
   
   
       /* STATUS */
   
       if (
           OrdersState.filtroStatus !==
           "todos"
       ) {
   
           result =
               result.filter(
                   pedido => {
   
                       if (
                           OrdersState.filtroStatus ===
                           "andamento"
                       ) {
   
                           return (
                               getStatusGroup(
                                   pedido.status
                               ) === "andamento"
                           );
   
                       }
   
                       return (
                           pedido.status ===
                           OrdersState.filtroStatus
                       );
   
                   }
               );
   
       }
   
   
       /* BUSCA */
   
       const search =
           removeAccents(
               OrdersState.busca
                   .toLowerCase()
           );
   
   
       if (search) {
   
           result =
               result.filter(
                   pedido =>
                       orderMatchesSearch(
                           pedido,
                           search
                       )
               );
   
       }
   
   
       /* ORDENAÇÃO */
   
       result =
           sortOrders(
               result,
               OrdersState.ordenacao
           );
   
   
       OrdersState.pedidosFiltrados =
           result;
   
   
       renderCurrentState();
   
   }
   
   
   /* ============================================================
      27. BUSCA NO PEDIDO
      ============================================================ */
   
   function orderMatchesSearch(
       pedido,
       search
   ) {
   
       const values = [
   
           pedido.numero,
           pedido.id,
           pedido.statusOriginal,
           getStatusLabel(
               pedido.status
           ),
   
           ...pedido.itens.map(
               item => item.nome
           ),
   
           ...pedido.itens.map(
               item => item.marca
           ),
   
           ...pedido.itens.map(
               item => item.codigo
           )
   
       ];
   
   
       const text =
           removeAccents(
               values
                   .filter(Boolean)
                   .join(" ")
                   .toLowerCase()
           );
   
   
       return text.includes(search);
   
   }
   
   
   /* ============================================================
      28. ORDENAÇÃO
      ============================================================ */
   
   function sortOrders(
       pedidos,
       sort
   ) {
   
       const result =
           [...pedidos];
   
   
       switch (sort) {
   
           case "antigos":
   
               return result.sort(
                   (a, b) =>
                       getTimestamp(a.data) -
                       getTimestamp(b.data)
               );
   
   
           case "maior-valor":
   
               return result.sort(
                   (a, b) =>
                       b.total - a.total
               );
   
   
           case "menor-valor":
   
               return result.sort(
                   (a, b) =>
                       a.total - b.total
               );
   
   
           case "recentes":
           default:
   
               return result.sort(
                   (a, b) =>
                       getTimestamp(b.data) -
                       getTimestamp(a.data)
               );
   
       }
   
   }
   
   
   /* ============================================================
      29. RENDERIZAR ESTADO ATUAL
      ============================================================ */
   
   function renderCurrentState() {
   
       hideAllMainStates();
   
   
       if (
           OrdersState.pedidos.length === 0
       ) {
   
           OrdersElements.ordersEmptyState.hidden =
               false;
   
           updateResultsInfo();
   
           return;
   
       }
   
   
       if (
           OrdersState.pedidosFiltrados.length === 0
       ) {
   
           OrdersElements.ordersNoResults.hidden =
               false;
   
           updateResultsInfo();
   
           return;
   
       }
   
   
       renderOrders(
           OrdersState.pedidosFiltrados
       );
   
       updateResultsInfo();
   
   }
   
   
   /* ============================================================
      30. RENDERIZAR PEDIDOS
      ============================================================ */
   
   function renderOrders(pedidos) {
   
       if (!OrdersElements.ordersList) {
           return;
       }
   
   
       OrdersElements.ordersList.innerHTML =
           pedidos
               .map(
                   (pedido, index) =>
                       createOrderCard(
                           pedido,
                           index
                       )
               )
               .join("");
   
   
       OrdersElements.ordersList.hidden =
           false;
   
   
       animateRenderedCards();
   
   }
   
   
   /* ============================================================
      31. CRIAR CARD
      ============================================================ */
   
   function createOrderCard(
       pedido,
       index
   ) {
   
       const group =
           getStatusGroup(
               pedido.status
           );
   
   
       const productsHTML =
           createOrderProductsHTML(
               pedido.itens
           );
   
   
       const timelineHTML =
           pedido.status !== "cancelado"
               ? createTimelineHTML(pedido)
               : "";
   
   
       const deliveryHTML =
           createDeliveryHTML(pedido);
   
   
       const paymentHTML =
           createPaymentHTML(pedido);
   
   
       const actionsHTML =
           createOrderActionsHTML(pedido);
   
   
       return `
           <article
               class="order-card"
               data-order-id="${escapeAttribute(pedido.id)}"
               data-status="${escapeAttribute(group)}"
               style="animation-delay:${index * ORDERS_CONFIG.animationDelay}ms"
           >
   
               <div class="order-card-header">
   
                   <div class="order-card-number">
   
                       <span class="order-card-number-icon">
   
                           <i class="fa-solid fa-box"></i>
   
                       </span>
   
                       <div>
   
                           <small>
                               Pedido
                           </small>
   
                           <strong>
                               #${escapeHTML(
                                   formatOrderNumber(
                                       pedido.numero
                                   )
                               )}
                           </strong>
   
                       </div>
   
                   </div>
   
   
                   <div class="order-card-header-right">
   
                       <span class="order-card-date">
   
                           ${escapeHTML(
                               formatDate(
                                   pedido.data
                               )
                           )}
   
                       </span>
   
                       <span
                           class="
                               order-status
                               status-${escapeAttribute(
                                   pedido.status
                               )}
                           "
                       >
   
                           ${escapeHTML(
                               getStatusLabel(
                                   pedido.status
                               )
                           )}
   
                       </span>
   
                   </div>
   
               </div>
   
   
               <div class="order-card-body">
   
                   <div class="order-products">
   
                       ${productsHTML}
   
                   </div>
   
   
                   ${paymentHTML}
   
                   ${deliveryHTML}
   
                   ${timelineHTML}
   
               </div>
   
   
               <div class="order-card-footer">
   
                   <div class="order-total">
   
                       <span>
                           Total
                       </span>
   
                       <strong>
                           ${formatCurrency(
                               pedido.total
                           )}
                       </strong>
   
                   </div>
   
   
                   <div class="order-actions">
   
                       ${actionsHTML}
   
                   </div>
   
               </div>
   
           </article>
       `;
   
   }
   
   
   /* ============================================================
      32. PRODUTOS DO PEDIDO
      ============================================================ */
   
   function createOrderProductsHTML(itens) {
   
       if (
           !Array.isArray(itens) ||
           itens.length === 0
       ) {
   
           return `
               <div class="order-product">
   
                   <div class="order-product-image">
   
                       <i class="fa-solid fa-box"></i>
   
                   </div>
   
                   <div class="order-product-info">
   
                       <strong>
                           Pedido registrado
                       </strong>
   
                       <small>
                           Os itens desta compra não foram
                           informados pela API.
                       </small>
   
                   </div>
   
               </div>
           `;
   
       }
   
   
       const visibleItems =
           itens.slice(0, 2);
   
   
       const html =
           visibleItems
               .map(
                   item =>
                       createOrderProductHTML(item)
               )
               .join("");
   
   
       const remaining =
           itens.length -
           visibleItems.length;
   
   
       if (remaining <= 0) {
           return html;
       }
   
   
       return `
           ${html}
   
           <div class="order-more-products">
   
               <i class="fa-solid fa-plus"></i>
   
               ${remaining}
               ${remaining === 1
                   ? "outro item"
                   : "outros itens"
               }
   
           </div>
       `;
   
   }
   
   
   /* ============================================================
      33. PRODUTO INDIVIDUAL
      ============================================================ */
   
   function createOrderProductHTML(item) {
   
       const image =
           sanitizeImageUrl(
               item.imagem
           );
   
   
       const imageHTML =
           image
               ? `
                   <img
                       src="${escapeAttribute(image)}"
                       alt="${escapeAttribute(item.nome)}"
                       loading="lazy"
                       onerror="
                           this.style.display='none';
                           this.nextElementSibling.style.display='block';
                       "
                   >
   
                   <i
                       class="fa-solid fa-gears"
                       style="display:none"
                   ></i>
               `
               : `
                   <i class="fa-solid fa-gears"></i>
               `;
   
   
       const meta = [];
   
   
       if (item.marca) {
           meta.push(item.marca);
       }
   
   
       if (item.codigo) {
   
           meta.push(
               `Cód. ${item.codigo}`
           );
   
       }
   
   
       meta.push(
           `Qtd. ${item.quantidade}`
       );
   
   
       return `
           <div class="order-product">
   
               <div class="order-product-image">
   
                   ${imageHTML}
   
               </div>
   
   
               <div class="order-product-info">
   
                   <strong>
                       ${escapeHTML(item.nome)}
                   </strong>
   
                   <small>
                       ${escapeHTML(
                           meta.join(" • ")
                       )}
                   </small>
   
               </div>
   
   
               <div class="order-product-price">
   
                   ${formatCurrency(
                       item.subtotal
                   )}
   
               </div>
   
           </div>
       `;
   
   }
   
   
   /* ============================================================
      34. PAGAMENTO
      ============================================================ */
   
   function createPaymentHTML(pedido) {
   
       if (!pedido.pagamento) {
           return "";
       }
   
       return `
           <div class="order-payment-info">
   
               <i class="fa-solid fa-circle-check"></i>
   
               <span>
   
                   Pagamento:
                   <strong>
                       ${escapeHTML(
                           formatPaymentMethod(
                               pedido.pagamento
                           )
                       )}
                   </strong>
   
               </span>
   
           </div>
       `;
   
   }
   
   
   /* ============================================================
      35. ENTREGA
      ============================================================ */
   
   function createDeliveryHTML(pedido) {
   
       if (
           pedido.status === "cancelado"
       ) {
   
           return `
               <div class="order-delivery-info">
   
                   <i class="fa-solid fa-ban"></i>
   
                   <span>
                       Este pedido foi cancelado.
                   </span>
   
               </div>
           `;
   
       }
   
   
       if (
           pedido.status === "entregue"
       ) {
   
           return `
               <div class="order-delivery-info">
   
                   <i class="fa-solid fa-circle-check"></i>
   
                   <span>
   
                       Pedido
                       <strong>
                           entregue
                       </strong>.
   
                   </span>
   
               </div>
           `;
   
       }
   
   
       if (pedido.entregaPrevista) {
   
           return `
               <div class="order-delivery-info">
   
                   <i class="fa-solid fa-truck-fast"></i>
   
                   <span>
   
                       Previsão de entrega:
                       <strong>
                           ${escapeHTML(
                               formatDate(
                                   pedido.entregaPrevista
                               )
                           )}
                       </strong>
   
                   </span>
   
               </div>
           `;
   
       }
   
   
       if (
           pedido.status === "enviado"
       ) {
   
           return `
               <div class="order-delivery-info">
   
                   <i class="fa-solid fa-truck-fast"></i>
   
                   <span>
                       Seu pedido está em transporte.
                   </span>
   
               </div>
           `;
   
       }
   
   
       return "";
   
   }
   
   
   /* ============================================================
      36. TIMELINE
      ============================================================ */
   
   function createTimelineHTML(pedido) {
   
       const steps = [
   
           {
               key: "pendente",
               label: "Pedido",
               icon: "fa-receipt"
           },
   
           {
               key: "pago",
               label: "Pagamento",
               icon: "fa-credit-card"
           },
   
           {
               key: "preparacao",
               label: "Preparação",
               icon: "fa-box-open"
           },
   
           {
               key: "enviado",
               label: "Enviado",
               icon: "fa-truck-fast"
           },
   
           {
               key: "entregue",
               label: "Entregue",
               icon: "fa-house-circle-check"
           }
   
       ];
   
   
       const statusIndex =
           getTimelineIndex(
               pedido.status
           );
   
   
       const progress =
           Math.max(
               0,
               Math.min(
                   100,
                   (statusIndex /
                       (steps.length - 1)) *
                       100
               )
           );
   
   
       const itemsHTML =
           steps
               .map(
                   (step, index) => {
   
                       let className = "";
   
                       if (index < statusIndex) {
   
                           className =
                               "complete";
   
                       } else if (
                           index === statusIndex
                       ) {
   
                           className =
                               pedido.status ===
                               "entregue"
                                   ? "complete"
                                   : "current";
   
                       }
   
   
                       return `
                           <div
                               class="
                                   order-timeline-item
                                   ${className}
                               "
                           >
   
                               <span
                                   class="order-timeline-point"
                               >
   
                                   <i
                                       class="
                                           fa-solid
                                           ${step.icon}
                                       "
                                   ></i>
   
                               </span>
   
                               <strong>
                                   ${step.label}
                               </strong>
   
                           </div>
                       `;
   
                   }
               )
               .join("");
   
   
       return `
           <div class="order-timeline">
   
               <div class="order-timeline-line">
   
                   <span
                       class="order-timeline-line-progress"
                       style="width:${progress}%"
                   ></span>
   
               </div>
   
               <div class="order-timeline-items">
   
                   ${itemsHTML}
   
               </div>
   
           </div>
       `;
   
   }
   
   
   /* ============================================================
      37. ÍNDICE TIMELINE
      ============================================================ */
   
   function getTimelineIndex(status) {
   
       const indexes = {
   
           pendente: 0,
           pago: 1,
           preparacao: 2,
           enviado: 3,
           entregue: 4
   
       };
   
       return indexes[status] ?? 0;
   
   }
   
   
   /* ============================================================
      38. AÇÕES DO PEDIDO
      ============================================================ */
   
   function createOrderActionsHTML(pedido) {
   
       let html = `
           <button
               type="button"
               class="order-action-button primary"
               data-action="details"
               data-order-id="${escapeAttribute(pedido.id)}"
           >
   
               <i class="fa-solid fa-eye"></i>
   
               Ver detalhes
   
           </button>
       `;
   
   
       if (
           pedido.codigoRastreio &&
           pedido.status === "enviado"
       ) {
   
           html += `
               <button
                   type="button"
                   class="order-action-button"
                   data-action="tracking"
                   data-order-id="${escapeAttribute(pedido.id)}"
               >
   
                   <i class="fa-solid fa-location-dot"></i>
   
                   Rastrear
   
               </button>
           `;
   
       }
   
   
       if (
           pedido.status === "entregue"
       ) {
   
           html += `
               <button
                   type="button"
                   class="order-action-button"
                   data-action="buy-again"
                   data-order-id="${escapeAttribute(pedido.id)}"
               >
   
                   <i class="fa-solid fa-rotate-right"></i>
   
                   Comprar novamente
   
               </button>
           `;
   
       }
   
   
       if (
           canCancelOrder(pedido)
       ) {
   
           html += `
               <button
                   type="button"
                   class="order-action-button danger"
                   data-action="cancel"
                   data-order-id="${escapeAttribute(pedido.id)}"
               >
   
                   <i class="fa-solid fa-ban"></i>
   
                   Cancelar
   
               </button>
           `;
   
       }
   
   
       html += `
           <a
               href="suporte.html?pedido=${encodeURIComponent(pedido.id)}"
               class="order-action-button"
           >
   
               <i class="fa-solid fa-headset"></i>
   
               Ajuda
   
           </a>
       `;
   
   
       return html;
   
   }
   
   
   /* ============================================================
      39. PODE CANCELAR?
      ============================================================ */
   
   function canCancelOrder(pedido) {
   
       return [
           "pendente",
           "pago",
           "preparacao"
       ].includes(
           pedido.status
       );
   
   }
   
   
   /* ============================================================
      40. CLIQUE NOS CARDS
      ============================================================ */
   
   function handleOrderListClick(event) {
   
       const button =
           event.target.closest(
               "[data-action][data-order-id]"
           );
   
   
       if (!button) {
           return;
       }
   
   
       const action =
           button.dataset.action;
   
       const orderId =
           button.dataset.orderId;
   
   
       const pedido =
           findOrderById(orderId);
   
   
       if (!pedido) {
   
           showToast(
               "Pedido não encontrado.",
               "error"
           );
   
           return;
   
       }
   
   
       switch (action) {
   
           case "details":
   
               openOrderDetails(pedido);
   
               break;
   
   
           case "tracking":
   
               handleTracking(pedido);
   
               break;
   
   
           case "buy-again":
   
               buyAgain(pedido);
   
               break;
   
   
           case "cancel":
   
               openCancelModal(pedido);
   
               break;
   
       }
   
   }
   
   
   /* ============================================================
      41. LOCALIZAR PEDIDO
      ============================================================ */
   
   function findOrderById(id) {
   
       return (
           OrdersState.pedidos.find(
               pedido =>
                   String(pedido.id) ===
                   String(id)
           ) ||
           null
       );
   
   }
   
   
   /* ============================================================
      42. MODAIS
      ============================================================ */
   
   function configureModalEvents() {
   
       OrdersElements.orderDetailsClose
           ?.addEventListener(
               "click",
               closeOrderDetails
           );
   
   
       OrdersElements.orderDetailsModal
           ?.addEventListener(
               "click",
               event => {
   
                   if (
                       event.target ===
                       OrdersElements.orderDetailsModal
                   ) {
   
                       closeOrderDetails();
   
                   }
   
               }
           );
   
   
       OrdersElements.cancelOrderBackButton
           ?.addEventListener(
               "click",
               closeCancelModal
           );
   
   
       OrdersElements.cancelOrderModal
           ?.addEventListener(
               "click",
               event => {
   
                   if (
                       event.target ===
                       OrdersElements.cancelOrderModal
                   ) {
   
                       closeCancelModal();
   
                   }
   
               }
           );
   
   
       OrdersElements.cancelOrderConfirmButton
           ?.addEventListener(
               "click",
               confirmOrderCancellation
           );
   
   
       document.addEventListener(
           "keydown",
           event => {
   
               if (event.key !== "Escape") {
                   return;
               }
   
               if (
                   OrdersElements.orderDetailsModal &&
                   !OrdersElements.orderDetailsModal.hidden
               ) {
   
                   closeOrderDetails();
   
               }
   
               if (
                   OrdersElements.cancelOrderModal &&
                   !OrdersElements.cancelOrderModal.hidden
               ) {
   
                   closeCancelModal();
   
               }
   
           }
       );
   
   }
   
   
   /* ============================================================
      43. ABRIR DETALHES
      ============================================================ */
   
   function openOrderDetails(pedido) {
   
       OrdersState.pedidoSelecionado =
           pedido;
   
   
       if (
           OrdersElements.orderDetailsTitle
       ) {
   
           OrdersElements.orderDetailsTitle.textContent =
               `Pedido #${formatOrderNumber(
                   pedido.numero
               )}`;
   
       }
   
   
       if (
           OrdersElements.orderDetailsContent
       ) {
   
           OrdersElements.orderDetailsContent.innerHTML =
               createOrderDetailsHTML(
                   pedido
               );
   
       }
   
   
       if (
           OrdersElements.orderDetailsModal
       ) {
   
           OrdersElements.orderDetailsModal.hidden =
               false;
   
       }
   
   
       lockBodyScroll();
   
   }
   
   
   /* ============================================================
      44. FECHAR DETALHES
      ============================================================ */
   
   function closeOrderDetails() {
   
       if (
           OrdersElements.orderDetailsModal
       ) {
   
           OrdersElements.orderDetailsModal.hidden =
               true;
   
       }
   
   
       OrdersState.pedidoSelecionado =
           null;
   
   
       unlockBodyScroll();
   
   }
   
   
   /* ============================================================
      45. HTML DETALHES
      ============================================================ */
   
   function createOrderDetailsHTML(pedido) {
   
       const products =
           pedido.itens.length
               ? pedido.itens
                   .map(
                       item =>
                           createOrderProductHTML(
                               item
                           )
                   )
                   .join("")
               : `
                   <p>
                       Os itens deste pedido não foram
                       informados pela API.
                   </p>
               `;
   
   
       const address =
           formatAddress(
               pedido.endereco
           );
   
   
       return `
   
           <section class="order-detail-section">
   
               <h3>
                   Resumo do pedido
               </h3>
   
   
               <div class="order-detail-grid">
   
                   <div class="order-detail-info">
   
                       <small>
                           Número
                       </small>
   
                       <strong>
                           #${escapeHTML(
                               formatOrderNumber(
                                   pedido.numero
                               )
                           )}
                       </strong>
   
                   </div>
   
   
                   <div class="order-detail-info">
   
                       <small>
                           Data
                       </small>
   
                       <strong>
                           ${escapeHTML(
                               formatDate(
                                   pedido.data
                               )
                           )}
                       </strong>
   
                   </div>
   
   
                   <div class="order-detail-info">
   
                       <small>
                           Status
                       </small>
   
                       <strong>
                           ${escapeHTML(
                               getStatusLabel(
                                   pedido.status
                               )
                           )}
                       </strong>
   
                   </div>
   
   
                   <div class="order-detail-info">
   
                       <small>
                           Total
                       </small>
   
                       <strong>
                           ${formatCurrency(
                               pedido.total
                           )}
                       </strong>
   
                   </div>
   
               </div>
   
           </section>
   
   
           <section class="order-detail-section">
   
               <h3>
                   Produtos
               </h3>
   
               <div class="order-products">
   
                   ${products}
   
               </div>
   
           </section>
   
   
           ${
               pedido.pagamento
                   ? `
                       <section class="order-detail-section">
   
                           <h3>
                               Pagamento
                           </h3>
   
                           <div class="order-detail-info">
   
                               <small>
                                   Forma de pagamento
                               </small>
   
                               <strong>
                                   ${escapeHTML(
                                       formatPaymentMethod(
                                           pedido.pagamento
                                       )
                                   )}
                               </strong>
   
                           </div>
   
                       </section>
                   `
                   : ""
           }
   
   
           ${
               address
                   ? `
                       <section class="order-detail-section">
   
                           <h3>
                               Endereço de entrega
                           </h3>
   
                           <div class="order-detail-address">
   
                               ${escapeHTML(address)}
   
                           </div>
   
                       </section>
                   `
                   : ""
           }
   
   
           ${
               pedido.codigoRastreio
                   ? `
                       <section class="order-detail-section">
   
                           <h3>
                               Rastreamento
                           </h3>
   
                           <div class="order-detail-info">
   
                               <small>
                                   Código
                               </small>
   
                               <strong>
                                   ${escapeHTML(
                                       pedido.codigoRastreio
                                   )}
                               </strong>
   
                           </div>
   
                       </section>
                   `
                   : ""
           }
   
   
           ${
               pedido.status !== "cancelado"
                   ? `
                       <section class="order-detail-section">
   
                           <h3>
                               Andamento
                           </h3>
   
                           ${createTimelineHTML(
                               pedido
                           )}
   
                       </section>
                   `
                   : ""
           }
   
       `;
   
   }
   
   
   /* ============================================================
      46. RASTREAMENTO
      ============================================================ */
   
   function handleTracking(pedido) {
   
       if (!pedido.codigoRastreio) {
   
           showToast(
               "O código de rastreamento ainda não está disponível.",
               "info"
           );
   
           return;
   
       }
   
   
       openOrderDetails(pedido);
   
   }
   
   
   /* ============================================================
      47. COMPRAR NOVAMENTE
      ============================================================ */
   
   function buyAgain(pedido) {
   
       if (
           !pedido.itens ||
           pedido.itens.length === 0
       ) {
   
           showToast(
               "Não foi possível recuperar os produtos deste pedido.",
               "error"
           );
   
           return;
   
       }
   
   
       const carrinho =
           getCart();
   
   
       pedido.itens.forEach(item => {
   
           const existing =
               carrinho.find(
                   produto =>
                       String(
                           getCartProductId(
                               produto
                           )
                       ) ===
                       String(item.id)
               );
   
   
           if (existing) {
   
               existing.quantidade =
                   Math.max(
                       1,
                       Number(
                           existing.quantidade ||
                           existing.qtd ||
                           1
                       )
                   ) +
                   item.quantidade;
   
           } else {
   
               carrinho.push({
   
                   id:
                       item.id,
   
                   id_produto:
                       item.id,
   
                   nome:
                       item.nome,
   
                   preco:
                       item.preco,
   
                   imagem:
                       item.imagem,
   
                   quantidade:
                       item.quantidade,
   
                   marca:
                       item.marca,
   
                   codigo:
                       item.codigo
   
               });
   
           }
   
       });
   
   
       saveCart(carrinho);
   
       updateCartCounter();
   
   
       showToast(
           "Produtos adicionados ao carrinho."
       );
   
   }
   
   
   /* ============================================================
      48. ABRIR CANCELAMENTO
      ============================================================ */
   
   function openCancelModal(pedido) {
   
       if (!canCancelOrder(pedido)) {
   
           showToast(
               "Este pedido não pode mais ser cancelado por esta página.",
               "error"
           );
   
           return;
   
       }
   
   
       OrdersState.pedidoCancelamento =
           pedido;
   
   
       if (
           OrdersElements.cancelOrderMessage
       ) {
   
           OrdersElements.cancelOrderMessage.hidden =
               true;
   
           OrdersElements.cancelOrderMessage.textContent =
               "";
   
       }
   
   
       if (
           OrdersElements.cancelOrderModal
       ) {
   
           OrdersElements.cancelOrderModal.hidden =
               false;
   
       }
   
   
       lockBodyScroll();
   
   }
   
   
   /* ============================================================
      49. FECHAR CANCELAMENTO
      ============================================================ */
   
   function closeCancelModal() {
   
       if (
           OrdersElements.cancelOrderModal
       ) {
   
           OrdersElements.cancelOrderModal.hidden =
               true;
   
       }
   
   
       OrdersState.pedidoCancelamento =
           null;
   
   
       unlockBodyScroll();
   
   }
   
   
   /* ============================================================
      50. CONFIRMAR CANCELAMENTO
      ============================================================ */
   
   async function confirmOrderCancellation() {
   
       const pedido =
           OrdersState.pedidoCancelamento;
   
   
       if (!pedido) {
           return;
       }
   
   
       const button =
           OrdersElements.cancelOrderConfirmButton;
   
   
       setButtonLoading(
           button,
           true,
           "Cancelando..."
       );
   
   
       try {
   
           const url =
               `${ORDERS_CONFIG.apiBaseUrl}` +
               `${ORDERS_CONFIG.endpoints.cancelarPedido}` +
               `/${encodeURIComponent(pedido.id)}/cancelar`;
   
   
           const response =
               await fetch(
                   url,
                   {
                       method: "PATCH",
   
                       headers: {
                           "Content-Type":
                               "application/json",
   
                           "Accept":
                               "application/json"
                       },
   
                       body:
                           JSON.stringify({
                               id_cliente:
                                   getClientId(
                                       OrdersState.cliente
                                   )
                           })
                   }
               );
   
   
           if (!response.ok) {
   
               let message =
                   "Não foi possível cancelar este pedido.";
   
   
               try {
   
                   const data =
                       await response.json();
   
                   message =
                       data.message ||
                       data.mensagem ||
                       data.error ||
                       message;
   
               } catch (_) {
                   // resposta sem JSON
               }
   
   
               throw new Error(message);
   
           }
   
   
           closeCancelModal();
   
   
           showToast(
               "Pedido cancelado."
           );
   
   
           await loadOrders({
               silent: true
           });
   
   
       } catch (error) {
   
           console.error(
               "Erro ao cancelar pedido:",
               error
           );
   
   
           if (
               OrdersElements.cancelOrderMessage
           ) {
   
               OrdersElements.cancelOrderMessage.textContent =
                   error.message ||
                   "Não foi possível cancelar o pedido.";
   
               OrdersElements.cancelOrderMessage.hidden =
                   false;
   
           }
   
       } finally {
   
           setButtonLoading(
               button,
               false,
               "Confirmar cancelamento"
           );
   
       }
   
   }
   
   
   /* ============================================================
      51. CARRINHO
      ============================================================ */
   
   function getCart() {
   
       try {
   
           const raw =
               localStorage.getItem(
                   ORDERS_CONFIG.storage.carrinho
               );
   
           if (!raw) {
               return [];
           }
   
           const parsed =
               JSON.parse(raw);
   
           return Array.isArray(parsed)
               ? parsed
               : [];
   
       } catch (error) {
   
           console.warn(
               "Erro ao carregar carrinho:",
               error
           );
   
           return [];
   
       }
   
   }
   
   
   /* ============================================================
      52. SALVAR CARRINHO
      ============================================================ */
   
   function saveCart(carrinho) {
   
       try {
   
           localStorage.setItem(
               ORDERS_CONFIG.storage.carrinho,
               JSON.stringify(carrinho)
           );
   
           window.dispatchEvent(
               new CustomEvent(
                   "apc:cart-updated",
                   {
                       detail: {
                           carrinho
                       }
                   }
               )
           );
   
       } catch (error) {
   
           console.error(
               "Erro ao salvar carrinho:",
               error
           );
   
       }
   
   }
   
   
   /* ============================================================
      53. ID PRODUTO CARRINHO
      ============================================================ */
   
   function getCartProductId(item) {
   
       return firstDefined(
           item.id_produto,
           item.produto_id,
           item.id
       );
   
   }
   
   
   /* ============================================================
      54. CONTADOR CARRINHO
      ============================================================ */
   
   function updateCartCounter() {
   
       const carrinho =
           getCart();
   
   
       const total =
           carrinho.reduce(
               (sum, item) => {
   
                   const quantidade =
                       Number(
                           item.quantidade ||
                           item.qtd ||
                           1
                       );
   
                   return (
                       sum +
                       (
                           Number.isFinite(
                               quantidade
                           )
                               ? quantidade
                               : 1
                       )
                   );
   
               },
               0
           );
   
   
       if (
           OrdersElements.headerCartCount
       ) {
   
           OrdersElements.headerCartCount.textContent =
               String(total);
   
   
           OrdersElements.headerCartCount.classList.add(
               "cart-count-pop"
           );
   
   
           setTimeout(
               () => {
   
                   OrdersElements.headerCartCount
                       ?.classList.remove(
                           "cart-count-pop"
                       );
   
               },
               300
           );
   
       }
   
   }
   
   
   /* ============================================================
      55. ATUALIZAÇÃO DO CARRINHO ENTRE ABAS
      ============================================================ */
   
   window.addEventListener(
       "storage",
       event => {
   
           if (
               event.key ===
               ORDERS_CONFIG.storage.carrinho
           ) {
   
               updateCartCounter();
   
           }
   
       }
   );
   
   
   window.addEventListener(
       "apc:cart-updated",
       updateCartCounter
   );
   
   
   /* ============================================================
      56. RESULTADOS
      ============================================================ */
   
   function updateResultsInfo() {
   
       const total =
           OrdersState.pedidosFiltrados.length;
   
   
       const filtering =
           OrdersState.filtroStatus !== "todos" ||
           Boolean(OrdersState.busca);
   
   
       if (
           OrdersElements.ordersVisibleCount
       ) {
   
           OrdersElements.ordersVisibleCount.textContent =
               String(total);
   
       }
   
   
       if (
           OrdersElements.ordersResultsLabel
       ) {
   
           OrdersElements.ordersResultsLabel.textContent =
               total === 1
                   ? "pedido encontrado"
                   : "pedidos encontrados";
   
       }
   
   
       if (
           OrdersElements.ordersResultsInfo
       ) {
   
           OrdersElements.ordersResultsInfo.hidden =
               OrdersState.pedidos.length === 0;
   
       }
   
   
       if (
           OrdersElements.clearAllFiltersButton
       ) {
   
           OrdersElements.clearAllFiltersButton.hidden =
               !filtering;
   
       }
   
   }
   
   
   /* ============================================================
      57. LIMPAR BUSCA
      ============================================================ */
   
   function clearOrderSearch() {
   
       OrdersState.busca =
           "";
   
   
       if (
           OrdersElements.ordersSearchInput
       ) {
   
           OrdersElements.ordersSearchInput.value =
               "";
   
           OrdersElements.ordersSearchInput.focus();
   
       }
   
   
       updateSearchClearButton();
   
       applyFiltersAndRender();
   
   }
   
   
   /* ============================================================
      58. RESET FILTROS
      ============================================================ */
   
   function resetAllFilters() {
   
       OrdersState.busca =
           "";
   
       OrdersState.filtroStatus =
           "todos";
   
       OrdersState.ordenacao =
           "recentes";
   
   
       if (
           OrdersElements.ordersSearchInput
       ) {
   
           OrdersElements.ordersSearchInput.value =
               "";
   
       }
   
   
       if (
           OrdersElements.ordersStatusFilter
       ) {
   
           OrdersElements.ordersStatusFilter.value =
               "todos";
   
       }
   
   
       if (
           OrdersElements.ordersSort
       ) {
   
           OrdersElements.ordersSort.value =
               "recentes";
   
       }
   
   
       document
           .querySelectorAll(
               "[data-order-filter]"
           )
           .forEach(button => {
   
               button.classList.toggle(
                   "active",
                   button.dataset.orderFilter ===
                       "todos"
               );
   
           });
   
   
       updateSearchClearButton();
   
       applyFiltersAndRender();
   
   }
   
   
   /* ============================================================
      59. BOTÃO LIMPAR BUSCA
      ============================================================ */
   
   function updateSearchClearButton() {
   
       if (
           OrdersElements.ordersSearchClear
       ) {
   
           OrdersElements.ordersSearchClear.hidden =
               !OrdersState.busca;
   
       }
   
   }
   
   
   /* ============================================================
      60. ESTADO LOADING
      ============================================================ */
   
   function showLoadingState() {
   
       hideAllMainStates();
   
       if (
           OrdersElements.ordersLoading
       ) {
   
           OrdersElements.ordersLoading.hidden =
               false;
   
       }
   
   }
   
   
   /* ============================================================
      61. ESTADO LOGIN
      ============================================================ */
   
   function showLoginRequired() {
   
       hideAllMainStates();
   
   
       if (
           OrdersElements.ordersLoginRequired
       ) {
   
           OrdersElements.ordersLoginRequired.hidden =
               false;
   
       }
   
   
       if (
           OrdersElements.ordersResultsInfo
       ) {
   
           OrdersElements.ordersResultsInfo.hidden =
               true;
   
       }
   
   }
   
   
   /* ============================================================
      62. ESTADO ERRO
      ============================================================ */
   
   function showErrorState(message) {
   
       hideAllMainStates();
   
   
       if (
           OrdersElements.ordersErrorMessage
       ) {
   
           OrdersElements.ordersErrorMessage.textContent =
               message;
   
       }
   
   
       if (
           OrdersElements.ordersErrorState
       ) {
   
           OrdersElements.ordersErrorState.hidden =
               false;
   
       }
   
   }
   
   
   /* ============================================================
      63. ESCONDER ESTADOS
      ============================================================ */
   
   function hideAllMainStates() {
   
       const elements = [
   
           OrdersElements.ordersLoading,
           OrdersElements.ordersList,
           OrdersElements.ordersEmptyState,
           OrdersElements.ordersNoResults,
           OrdersElements.ordersErrorState,
           OrdersElements.ordersLoginRequired
   
       ];
   
   
       elements.forEach(element => {
   
           if (element) {
   
               element.hidden =
                   true;
   
           }
   
       });
   
   }
   
   
   /* ============================================================
      64. ANIMAR CARDS
      ============================================================ */
   
   function animateRenderedCards() {
   
       const cards =
           OrdersElements.ordersList
               ?.querySelectorAll(
                   ".order-card"
               );
   
   
       if (!cards) {
           return;
       }
   
   
       cards.forEach(
           (card, index) => {
   
               card.style.animationDelay =
                   `${index * ORDERS_CONFIG.animationDelay}ms`;
   
           }
       );
   
   }
   
   
   /* ============================================================
      65. TOAST
      ============================================================ */
   
   let toastTimer = null;
   
   
   function showToast(
       message,
       type = "success"
   ) {
   
       const toast =
           OrdersElements.ordersToast;
   
   
       if (!toast) {
           return;
       }
   
   
       if (toastTimer) {
   
           clearTimeout(toastTimer);
   
       }
   
   
       if (
           OrdersElements.ordersToastText
       ) {
   
           OrdersElements.ordersToastText.textContent =
               message;
   
       }
   
   
       const icon =
           toast.querySelector(
               ".orders-toast-icon i"
           );
   
   
       if (icon) {
   
           icon.className =
               type === "error"
                   ? "fa-solid fa-circle-exclamation"
                   : type === "info"
                       ? "fa-solid fa-circle-info"
                       : "fa-solid fa-circle-check";
   
       }
   
   
       toast.classList.add(
           "is-visible"
       );
   
   
       toastTimer =
           setTimeout(
               () => {
   
                   toast.classList.remove(
                       "is-visible"
                   );
   
               },
               3200
           );
   
   }
   
   
   /* ============================================================
      66. HEADER
      ============================================================ */
   
   function configureHeader() {
   
       const cliente =
           getLoggedClient();
   
   
       if (cliente) {
   
           configureLoggedClient(
               cliente
           );
   
       }
   
   }
   
   
   /* ============================================================
      67. PESQUISA HEADER
      ============================================================ */
   
   function configureHeaderSearch() {
   
       OrdersElements.headerSearchForm
           ?.addEventListener(
               "submit",
               event => {
   
                   event.preventDefault();
   
   
                   const search =
                       OrdersElements.headerSearchInput
                           ?.value
                           .trim();
   
   
                   if (!search) {
   
                       window.location.href =
                           "produtos.html";
   
                       return;
   
                   }
   
   
                   window.location.href =
                       `produtos.html?busca=${encodeURIComponent(search)}`;
   
               }
           );
   
   }
   
   
   /* ============================================================
      68. TEMA
      ============================================================ */
   
   function configureTheme() {
   
       const toggle =
           OrdersElements.themeToggle;
   
   
       if (!toggle) {
           return;
       }
   
   
       let theme = null;
   
   
       try {
   
           theme =
               localStorage.getItem(
                   ORDERS_CONFIG.storage.tema
               );
   
       } catch (_) {
           // storage indisponível
       }
   
   
       if (
           theme === "dark" ||
           theme === "escuro"
       ) {
   
           document.body.classList.add(
               "dark-theme"
           );
   
       }
   
   
       updateThemeIcon();
   
   
       toggle.addEventListener(
           "click",
           () => {
   
               document.body.classList.toggle(
                   "dark-theme"
               );
   
   
               const dark =
                   document.body.classList.contains(
                       "dark-theme"
                   );
   
   
               try {
   
                   localStorage.setItem(
                       ORDERS_CONFIG.storage.tema,
                       dark
                           ? "dark"
                           : "light"
                   );
   
               } catch (_) {
                   // storage indisponível
               }
   
   
               updateThemeIcon();
   
           }
       );
   
   }
   
   
   /* ============================================================
      69. ÍCONE TEMA
      ============================================================ */
   
   function updateThemeIcon() {
   
       const icon =
           OrdersElements.themeToggle
               ?.querySelector("i");
   
   
       if (!icon) {
           return;
       }
   
   
       const dark =
           document.body.classList.contains(
               "dark-theme"
           );
   
   
       icon.className =
           dark
               ? "fa-solid fa-sun"
               : "fa-solid fa-moon";
   
   }
   
   
   /* ============================================================
      70. MENU MOBILE
      ============================================================ */
   
   function configureMobileMenu() {
   
       OrdersElements.mobileMenuButton
           ?.addEventListener(
               "click",
               openMobileMenu
           );
   
   
       OrdersElements.mobileMenuClose
           ?.addEventListener(
               "click",
               closeMobileMenu
           );
   
   
       OrdersElements.mobileMenuOverlay
           ?.addEventListener(
               "click",
               closeMobileMenu
           );
   
   
       OrdersElements.mobileMenu
           ?.querySelectorAll("a")
           .forEach(link => {
   
               link.addEventListener(
                   "click",
                   closeMobileMenu
               );
   
           });
   
   }
   
   
   /* ============================================================
      71. ABRIR MENU
      ============================================================ */
   
   function openMobileMenu() {
   
       if (
           OrdersElements.mobileMenuOverlay
       ) {
   
           OrdersElements.mobileMenuOverlay.hidden =
               false;
   
       }
   
   
       requestAnimationFrame(
           () => {
   
               OrdersElements.mobileMenu
                   ?.classList.add("is-open");
   
               OrdersElements.mobileMenuOverlay
                   ?.classList.add("is-visible");
   
           }
       );
   
   
       OrdersElements.mobileMenu
           ?.setAttribute(
               "aria-hidden",
               "false"
           );
   
   
       OrdersElements.mobileMenuButton
           ?.setAttribute(
               "aria-expanded",
               "true"
           );
   
   
       lockBodyScroll();
   
   }
   
   
   /* ============================================================
      72. FECHAR MENU
      ============================================================ */
   
   function closeMobileMenu() {
   
       OrdersElements.mobileMenu
           ?.classList.remove(
               "is-open"
           );
   
       OrdersElements.mobileMenuOverlay
           ?.classList.remove(
               "is-visible"
           );
   
   
       OrdersElements.mobileMenu
           ?.setAttribute(
               "aria-hidden",
               "true"
           );
   
   
       OrdersElements.mobileMenuButton
           ?.setAttribute(
               "aria-expanded",
               "false"
           );
   
   
       setTimeout(
           () => {
   
               if (
                   OrdersElements.mobileMenuOverlay
               ) {
   
                   OrdersElements.mobileMenuOverlay.hidden =
                       true;
   
               }
   
           },
           280
       );
   
   
       unlockBodyScroll();
   
   }
   
   
   /* ============================================================
      73. SCROLL
      ============================================================ */
   
   function configureScrollEffects() {
   
       let previousScroll =
           window.scrollY;
   
   
       window.addEventListener(
           "scroll",
           throttle(
               () => {
   
                   const currentScroll =
                       window.scrollY;
   
   
                   /* BACK TO TOP */
   
                   if (
                       OrdersElements.backToTop
                   ) {
   
                       OrdersElements.backToTop.classList.toggle(
                           "is-visible",
                           currentScroll > 550
                       );
   
                   }
   
   
                   /*
                      HEADER:
   
                      não alteramos agressivamente o site.js.
                      Apenas adicionamos classes que o CSS
                      geral pode aproveitar.
                   */
   
                   if (
                       OrdersElements.siteHeader
                   ) {
   
                       OrdersElements.siteHeader.classList.toggle(
                           "is-scrolled",
                           currentScroll > 30
                       );
   
   
                       if (
                           currentScroll > previousScroll &&
                           currentScroll > 180
                       ) {
   
                           OrdersElements.siteHeader.classList.add(
                               "is-scroll-down"
                           );
   
                       } else {
   
                           OrdersElements.siteHeader.classList.remove(
                               "is-scroll-down"
                           );
   
                       }
   
                   }
   
   
                   previousScroll =
                       currentScroll;
   
               },
               80
           ),
           {
               passive: true
           }
       );
   
   
       OrdersElements.backToTop
           ?.addEventListener(
               "click",
               () => {
   
                   window.scrollTo({
                       top: 0,
                       behavior: "smooth"
                   });
   
               }
           );
   
   }
   
   
   /* ============================================================
      74. REVEAL ANIMATIONS
      ============================================================ */
   
   function configureRevealAnimations() {
   
       const targets =
           document.querySelectorAll(
               `
               .orders-dashboard-header,
               .orders-stats,
               .orders-toolbar,
               .orders-benefit-card,
               .orders-support-card
               `
           );
   
   
       if (
           !("IntersectionObserver" in window)
       ) {
   
           targets.forEach(
               target =>
                   target.classList.add(
                       "is-visible"
                   )
           );
   
           return;
   
       }
   
   
       targets.forEach(
           target =>
               target.classList.add(
                   "orders-reveal"
               )
       );
   
   
       const observer =
           new IntersectionObserver(
               entries => {
   
                   entries.forEach(
                       entry => {
   
                           if (
                               !entry.isIntersecting
                           ) {
                               return;
                           }
   
   
                           entry.target.classList.add(
                               "is-visible"
                           );
   
   
                           observer.unobserve(
                               entry.target
                           );
   
                       }
                   );
   
               },
               {
                   threshold: 0.12
               }
           );
   
   
       targets.forEach(
           target =>
               observer.observe(target)
       );
   
   }
   
   
   /* ============================================================
      75. ANO
      ============================================================ */
   
   function configureCurrentYear() {
   
       if (
           OrdersElements.currentYear
       ) {
   
           OrdersElements.currentYear.textContent =
               String(
                   new Date().getFullYear()
               );
   
       }
   
   }
   
   
   /* ============================================================
      76. FORMATAR NÚMERO PEDIDO
      ============================================================ */
   
   function formatOrderNumber(value) {
   
       if (
           value === undefined ||
           value === null
       ) {
   
           return "—";
   
       }
   
   
       const string =
           String(value).trim();
   
   
       if (/^\d+$/.test(string)) {
   
           return string.padStart(
               6,
               "0"
           );
   
       }
   
   
       return string;
   
   }
   
   
   /* ============================================================
      77. FORMATAR MOEDA
      ============================================================ */
   
   function formatCurrency(value) {
   
       const number =
           toNumber(value);
   
   
       return new Intl.NumberFormat(
           "pt-BR",
           {
               style: "currency",
               currency: "BRL"
           }
       ).format(number);
   
   }
   
   
   /* ============================================================
      78. FORMATAR DATA
      ============================================================ */
   
   function formatDate(value) {
   
       if (!value) {
           return "Data não informada";
       }
   
   
       const date =
           parseDate(value);
   
   
       if (
           !date ||
           Number.isNaN(
               date.getTime()
           )
       ) {
   
           return String(value);
   
       }
   
   
       return new Intl.DateTimeFormat(
           "pt-BR",
           {
               day: "2-digit",
               month: "2-digit",
               year: "numeric"
           }
       ).format(date);
   
   }
   
   
   /* ============================================================
      79. PARSE DE DATA
      ============================================================ */
   
   function parseDate(value) {
   
       if (value instanceof Date) {
           return value;
       }
   
   
       if (
           typeof value === "number"
       ) {
   
           return new Date(value);
   
       }
   
   
       const string =
           String(value).trim();
   
   
       /*
          DD/MM/YYYY
       */
   
       const br =
           string.match(
               /^(\d{2})\/(\d{2})\/(\d{4})/
           );
   
   
       if (br) {
   
           return new Date(
               Number(br[3]),
               Number(br[2]) - 1,
               Number(br[1])
           );
   
       }
   
   
       const parsed =
           new Date(string);
   
   
       return parsed;
   
   }
   
   
   /* ============================================================
      80. TIMESTAMP
      ============================================================ */
   
   function getTimestamp(value) {
   
       const date =
           parseDate(value);
   
   
       if (
           !date ||
           Number.isNaN(
               date.getTime()
           )
       ) {
   
           return 0;
   
       }
   
   
       return date.getTime();
   
   }
   
   
   /* ============================================================
      81. FORMA DE PAGAMENTO
      ============================================================ */
   
   function formatPaymentMethod(value) {
   
       const normalized =
           removeAccents(
               String(value)
                   .toLowerCase()
           );
   
   
       if (
           normalized.includes("pix")
       ) {
           return "PIX";
       }
   
   
       if (
           normalized.includes("credito")
       ) {
           return "Cartão de crédito";
       }
   
   
       if (
           normalized.includes("debito")
       ) {
           return "Cartão de débito";
       }
   
   
       if (
           normalized.includes("boleto")
       ) {
           return "Boleto";
       }
   
   
       return String(value);
   
   }
   
   
   /* ============================================================
      82. FORMATAR ENDEREÇO
      ============================================================ */
   
   function formatAddress(endereco) {
   
       if (!endereco) {
           return "";
       }
   
   
       if (endereco.texto) {
   
           return endereco.texto;
   
       }
   
   
       const firstLine =
           [
               endereco.rua,
               endereco.numero
           ]
               .filter(Boolean)
               .join(", ");
   
   
       const secondLine =
           [
               endereco.complemento,
               endereco.bairro
           ]
               .filter(Boolean)
               .join(" • ");
   
   
       const thirdLine =
           [
               endereco.cidade,
               endereco.estado
           ]
               .filter(Boolean)
               .join(" - ");
   
   
       const lines =
           [
               firstLine,
               secondLine,
               thirdLine,
               endereco.cep
                   ? `CEP ${endereco.cep}`
                   : ""
           ]
               .filter(Boolean);
   
   
       return lines.join(" | ");
   
   }
   
   
   /* ============================================================
      83. SANITIZAR IMAGEM
      ============================================================ */
   
   function sanitizeImageUrl(value) {
   
       if (!value) {
           return "";
       }
   
   
       const url =
           String(value).trim();
   
   
       if (
           url.startsWith("javascript:")
       ) {
   
           return "";
   
       }
   
   
       return url;
   
   }
   
   
   /* ============================================================
      84. ESCAPAR HTML
      ============================================================ */
   
   function escapeHTML(value) {
   
       return String(
           value ?? ""
       )
           .replaceAll("&", "&amp;")
           .replaceAll("<", "&lt;")
           .replaceAll(">", "&gt;")
           .replaceAll('"', "&quot;")
           .replaceAll("'", "&#039;");
   
   }
   
   
   /* ============================================================
      85. ESCAPAR ATRIBUTO
      ============================================================ */
   
   function escapeAttribute(value) {
   
       return escapeHTML(value);
   
   }
   
   
   /* ============================================================
      86. PRIMEIRO VALOR DEFINIDO
      ============================================================ */
   
   function firstDefined(...values) {
   
       for (const value of values) {
   
           if (
               value !== undefined &&
               value !== null &&
               value !== ""
           ) {
   
               return value;
   
           }
   
       }
   
       return null;
   
   }
   
   
   /* ============================================================
      87. CONVERTER NÚMERO
      ============================================================ */
   
   function toNumber(value) {
   
       if (
           typeof value === "number"
       ) {
   
           return Number.isFinite(value)
               ? value
               : 0;
   
       }
   
   
       if (!value) {
           return 0;
       }
   
   
       let text =
           String(value)
               .trim()
               .replace(/[R$\s]/g, "");
   
   
       /*
          1.299,90
       */
   
       if (
           text.includes(",") &&
           text.includes(".")
       ) {
   
           text =
               text
                   .replace(/\./g, "")
                   .replace(",", ".");
   
       } else if (
           text.includes(",")
       ) {
   
           text =
               text.replace(",", ".");
   
       }
   
   
       const number =
           Number(text);
   
   
       return Number.isFinite(number)
           ? number
           : 0;
   
   }
   
   
   /* ============================================================
      88. REMOVER ACENTOS
      ============================================================ */
   
   function removeAccents(value) {
   
       return String(value)
           .normalize("NFD")
           .replace(
               /[\u0300-\u036f]/g,
               ""
           );
   
   }
   
   
   /* ============================================================
      89. BUTTON LOADING
      ============================================================ */
   
   function setButtonLoading(
       button,
       loading,
       text
   ) {
   
       if (!button) {
           return;
       }
   
   
       if (loading) {
   
           button.disabled =
               true;
   
           button.dataset.originalHtml =
               button.innerHTML;
   
           button.innerHTML = `
               <i class="fa-solid fa-spinner fa-spin"></i>
               ${escapeHTML(text)}
           `;
   
       } else {
   
           button.disabled =
               false;
   
   
           if (
               button.dataset.originalHtml
           ) {
   
               button.innerHTML =
                   button.dataset.originalHtml;
   
               delete button.dataset.originalHtml;
   
           } else {
   
               button.textContent =
                   text;
   
           }
   
       }
   
   }
   
   
   /* ============================================================
      90. BODY SCROLL LOCK
      ============================================================ */
   
   let bodyLockCount = 0;
   
   
   function lockBodyScroll() {
   
       bodyLockCount += 1;
   
       document.body.style.overflow =
           "hidden";
   
   }
   
   
   function unlockBodyScroll() {
   
       bodyLockCount =
           Math.max(
               0,
               bodyLockCount - 1
           );
   
   
       if (bodyLockCount === 0) {
   
           document.body.style.overflow =
               "";
   
       }
   
   }
   
   
   /* ============================================================
      91. DEBOUNCE
      ============================================================ */
   
   function debounce(
       callback,
       delay = 200
   ) {
   
       let timer = null;
   
   
       return function (...args) {
   
           clearTimeout(timer);
   
   
           timer =
               setTimeout(
                   () => {
   
                       callback.apply(
                           this,
                           args
                       );
   
                   },
                   delay
               );
   
       };
   
   }
   
   
   /* ============================================================
      92. THROTTLE
      ============================================================ */
   
   function throttle(
       callback,
       delay = 100
   ) {
   
       let waiting = false;
   
   
       return function (...args) {
   
           if (waiting) {
               return;
           }
   
   
           waiting = true;
   
   
           callback.apply(
               this,
               args
           );
   
   
           setTimeout(
               () => {
   
                   waiting = false;
   
               },
               delay
           );
   
       };
   
   }
   
   
   /* ============================================================
      93. ERROS GLOBAIS ESPECÍFICOS DA PÁGINA
      ============================================================ */
   
   window.addEventListener(
       "unhandledrejection",
       event => {
   
           console.error(
               "Promise rejeitada em pedidos:",
               event.reason
           );
   
       }
   );
   
   
   /* ============================================================
      94. EVENTO CUSTOMIZADO DE LOGIN
      ============================================================ */
   
   window.addEventListener(
       "apc:client-login",
       async event => {
   
           const cliente =
               event.detail?.cliente ||
               getLoggedClient();
   
   
           if (!cliente) {
               return;
           }
   
   
           OrdersState.cliente =
               cliente;
   
   
           configureLoggedClient(
               cliente
           );
   
   
           await loadOrders();
   
       }
   );
   
   
   /* ============================================================
      95. EVENTO CUSTOMIZADO DE LOGOUT
      ============================================================ */
   
   window.addEventListener(
       "apc:client-logout",
       () => {
   
           OrdersState.cliente =
               null;
   
           OrdersState.pedidos =
               [];
   
           OrdersState.pedidosFiltrados =
               [];
   
   
           showLoginRequired();
   
           updateOrderCounters();
   
       }
   );
   
   
   /* ============================================================
      96. API PÚBLICA DA PÁGINA
   
      Útil futuramente para outras partes do sistema
      chamarem atualização sem duplicar código.
      ============================================================ */
   
   window.AutoPecaCertaPedidos = {
   
       atualizar() {
   
           return loadOrders({
               silent: true
           });
   
       },
   
   
       abrirPedido(id) {
   
           const pedido =
               findOrderById(id);
   
   
           if (!pedido) {
               return false;
           }
   
   
           openOrderDetails(
               pedido
           );
   
   
           return true;
   
       },
   
   
       obterPedidos() {
   
           return [
               ...OrdersState.pedidos
           ];
   
       },
   
   
       obterCliente() {
   
           return OrdersState.cliente
               ? {
                   ...OrdersState.cliente
               }
               : null;
   
       }
   
   };
   
   
   /* ============================================================
      FIM PEDIDOS.JS
      ============================================================ */

/* ============================================================
   AUTO PEÇA CERTA
   CHECKOUT.JS
   ============================================================ */

   "use strict";


   /* ============================================================
      01. CONFIGURAÇÃO
      ============================================================ */
   
   const CHECKOUT_CONFIG = {
   
       apiBase: "http://localhost:3000/api",
   
       endpoints: {
           pedidos: "/pedidos"
       },
   
       storage: {
           carrinho: "carrinho",
           cliente: "clienteLogado",
           clientePedido: "clientePedido",
           ultimoPedido: "ultimoPedido"
       },
   
       cepApi: "https://viacep.com.br/ws/",
   
       toastDuration: 3200
   
   };
   
   
   /* ============================================================
      02. ESTADO
      ============================================================ */
   
   const checkoutState = {
   
       carrinho: [],
   
       cliente: null,
   
       subtotal: 0,
   
       desconto: 0,
   
       frete: 0,
   
       total: 0,
   
       shippingSelected: null,
   
       paymentSelected: null,
   
       processing: false,
   
       cepConsultado: null,
   
       pedidoCriado: null
   
   };
   
   
   /* ============================================================
      03. HELPERS DOM
      ============================================================ */
   
   const $ = (selector, context = document) =>
       context.querySelector(selector);
   
   const $$ = (selector, context = document) =>
       Array.from(context.querySelectorAll(selector));
   
   
   /* ============================================================
      04. HELPERS STORAGE
      ============================================================ */
   
   function safeJSONParse(value, fallback = null) {
   
       try {
   
           if (!value) {
               return fallback;
           }
   
           return JSON.parse(value);
   
       } catch (error) {
   
           console.warn(
               "[Checkout] JSON inválido:",
               error
           );
   
           return fallback;
   
       }
   
   }
   
   
   function getStorageJSON(key, fallback = null) {
   
       return safeJSONParse(
           localStorage.getItem(key),
           fallback
       );
   
   }
   
   
   function setStorageJSON(key, value) {
   
       try {
   
           localStorage.setItem(
               key,
               JSON.stringify(value)
           );
   
           return true;
   
       } catch (error) {
   
           console.error(
               "[Checkout] Erro ao salvar no localStorage:",
               error
           );
   
           return false;
   
       }
   
   }
   
   
   /* ============================================================
      05. NORMALIZAÇÃO DE NÚMEROS
      ============================================================ */
   
   function toNumber(value) {
   
       if (typeof value === "number") {
   
           return Number.isFinite(value)
               ? value
               : 0;
   
       }
   
       if (typeof value !== "string") {
           return 0;
       }
   
       let clean = value
           .replace(/[^\d,.-]/g, "")
           .trim();
   
       if (!clean) {
           return 0;
       }
   
       /*
           Exemplo:
           1.299,90 -> 1299.90
       */
   
       if (
           clean.includes(",") &&
           clean.includes(".")
       ) {
   
           clean = clean
               .replace(/\./g, "")
               .replace(",", ".");
   
       } else if (clean.includes(",")) {
   
           clean = clean.replace(",", ".");
   
       }
   
       const number = Number(clean);
   
       return Number.isFinite(number)
           ? number
           : 0;
   
   }
   
   
   /* ============================================================
      06. MOEDA
      ============================================================ */
   
   function formatCurrency(value) {
   
       return new Intl.NumberFormat(
           "pt-BR",
           {
               style: "currency",
               currency: "BRL"
           }
       ).format(
           toNumber(value)
       );
   
   }
   
   
   /* ============================================================
      07. ESCAPE HTML
      ============================================================ */
   
   function escapeHTML(value = "") {
   
       return String(value)
           .replaceAll("&", "&amp;")
           .replaceAll("<", "&lt;")
           .replaceAll(">", "&gt;")
           .replaceAll('"', "&quot;")
           .replaceAll("'", "&#039;");
   
   }
   
   
   /* ============================================================
      08. IMAGEM SEGURA
      ============================================================ */
   
   function normalizeImage(value) {
   
       if (!value) {
           return "";
       }
   
       return String(value).trim();
   
   }
   
   
   /* ============================================================
      09. IDENTIFICAR ID DO CLIENTE
      ============================================================ */
   
   function getClienteId(cliente) {
   
       if (!cliente) {
           return null;
       }
   
       return (
           cliente.id_cliente ??
           cliente.id ??
           cliente.cliente_id ??
           null
       );
   
   }
   
   
   /* ============================================================
      10. IDENTIFICAR ID DO PRODUTO
      ============================================================ */
   
   function getProdutoId(produto) {
   
       return (
           produto.id_produto ??
           produto.produto_id ??
           produto.id ??
           null
       );
   
   }
   
   
   /* ============================================================
      11. NOME DO PRODUTO
      ============================================================ */
   
   function getProdutoNome(produto) {
   
       return (
           produto.nome ??
           produto.nome_produto ??
           produto.titulo ??
           produto.descricao ??
           "Produto"
       );
   
   }
   
   
   /* ============================================================
      12. PREÇO DO PRODUTO
      ============================================================ */
   
   function getProdutoPreco(produto) {
   
       return toNumber(
           produto.preco ??
           produto.preco_unitario ??
           produto.valor ??
           produto.price ??
           0
       );
   
   }
   
   
   /* ============================================================
      13. QUANTIDADE DO PRODUTO
      ============================================================ */
   
   function getProdutoQuantidade(produto) {
   
       const quantidade = Number(
           produto.quantidade ??
           produto.qtd ??
           produto.quantity ??
           1
       );
   
       if (
           !Number.isFinite(quantidade) ||
           quantidade <= 0
       ) {
           return 1;
       }
   
       return Math.floor(quantidade);
   
   }
   
   
   /* ============================================================
      14. IMAGEM DO PRODUTO
      ============================================================ */
   
   function getProdutoImagem(produto) {
   
       return normalizeImage(
           produto.imagem ??
           produto.image ??
           produto.foto ??
           produto.url_imagem ??
           ""
       );
   
   }
   
   
   /* ============================================================
      15. SKU DO PRODUTO
      ============================================================ */
   
   function getProdutoSku(produto) {
   
       return (
           produto.sku ??
           produto.codigo ??
           produto.codigo_produto ??
           produto.referencia ??
           ""
       );
   
   }
   
   
   /* ============================================================
      16. NORMALIZAR CARRINHO
      ============================================================ */
   
   function normalizeCart(rawCart) {
   
       if (!Array.isArray(rawCart)) {
           return [];
       }
   
       return rawCart
           .filter(Boolean)
           .map((produto) => {
   
               return {
   
                   ...produto,
   
                   id_produto:
                       getProdutoId(produto),
   
                   nome:
                       getProdutoNome(produto),
   
                   preco:
                       getProdutoPreco(produto),
   
                   quantidade:
                       getProdutoQuantidade(produto),
   
                   imagem:
                       getProdutoImagem(produto),
   
                   sku:
                       getProdutoSku(produto)
   
               };
   
           })
           .filter((produto) => {
   
               return (
                   produto.nome &&
                   produto.quantidade > 0
               );
   
           });
   
   }
   
   
   /* ============================================================
      17. CARREGAR CARRINHO
      ============================================================ */
   
   function loadCart() {
   
       const possibleKeys = [
           CHECKOUT_CONFIG.storage.carrinho,
           "cart",
           "carrinhoAPC"
       ];
   
       let rawCart = [];
   
       for (const key of possibleKeys) {
   
           const value = getStorageJSON(
               key,
               null
           );
   
           if (
               Array.isArray(value) &&
               value.length
           ) {
   
               rawCart = value;
               break;
   
           }
   
       }
   
       checkoutState.carrinho =
           normalizeCart(rawCart);
   
   }
   
   
   /* ============================================================
      18. CARREGAR CLIENTE
      ============================================================ */
   
   function loadCustomer() {
   
       checkoutState.cliente =
           getStorageJSON(
               CHECKOUT_CONFIG.storage.cliente,
               null
           );
   
   }
   
   
   /* ============================================================
      19. ELEMENTOS
      ============================================================ */
   
   const checkoutElements = {};
   
   
   function cacheElements() {
   
       checkoutElements.heroCheckoutItems =
           $("#heroCheckoutItems");
   
   
       /* CLIENTE */
   
       checkoutElements.loggedCustomer =
           $("#loggedCustomer");
   
       checkoutElements.checkoutLoginRequired =
           $("#checkoutLoginRequired");
   
       checkoutElements.customerName =
           $("#customerName");
   
       checkoutElements.customerEmail =
           $("#customerEmail");
   
       checkoutElements.customerPhone =
           $("#customerPhone");
   
       checkoutElements.customerDocument =
           $("#customerDocument");
   
       checkoutElements.customerStatus =
           $("#customerStatus");
   
       checkoutElements.checkoutCustomerAvatar =
           $("#checkoutCustomerAvatar");
   
       checkoutElements.checkoutCustomerInitial =
           $("#checkoutCustomerInitial");
   
       checkoutElements.checkoutCustomerName =
           $("#checkoutCustomerName");
   
       checkoutElements.checkoutCustomerEmail =
           $("#checkoutCustomerEmail");
   
       checkoutElements.headerAccountLabel =
           $("#headerAccountLabel");
   
       checkoutElements.accountButton =
           $("#accountButton");
   
   
       /* ENDEREÇO */
   
       checkoutElements.addressCep =
           $("#addressCep");
   
       checkoutElements.addressStreet =
           $("#addressStreet");
   
       checkoutElements.addressNumber =
           $("#addressNumber");
   
       checkoutElements.addressComplement =
           $("#addressComplement");
   
       checkoutElements.addressDistrict =
           $("#addressDistrict");
   
       checkoutElements.addressCity =
           $("#addressCity");
   
       checkoutElements.addressState =
           $("#addressState");
   
       checkoutElements.addressStatus =
           $("#addressStatus");
   
       checkoutElements.saveAddress =
           $("#saveAddress");
   
       checkoutElements.cepLoader =
           $("#cepLoader");
   
   
       /* ENTREGA */
   
       checkoutElements.shippingStatus =
           $("#shippingStatus");
   
       checkoutElements.shippingPlaceholder =
           $("#shippingPlaceholder");
   
       checkoutElements.shippingOptions =
           $("#shippingOptions");
   
       checkoutElements.shippingError =
           $("#shippingError");
   
   
       /* PAGAMENTO */
   
       checkoutElements.paymentStatus =
           $("#paymentStatus");
   
       checkoutElements.paymentError =
           $("#paymentError");
   
   
       /* OBSERVAÇÕES */
   
       checkoutElements.orderNotes =
           $("#orderNotes");
   
       checkoutElements.notesCounter =
           $("#notesCounter");
   
   
       /* RESUMO */
   
       checkoutElements.checkoutSummaryProducts =
           $("#checkoutSummaryProducts");
   
       checkoutElements.checkoutSubtotal =
           $("#checkoutSubtotal");
   
       checkoutElements.checkoutDiscount =
           $("#checkoutDiscount");
   
       checkoutElements.checkoutShipping =
           $("#checkoutShipping");
   
       checkoutElements.checkoutTotal =
           $("#checkoutTotal");
   
   
       /* TERMOS */
   
       checkoutElements.acceptTerms =
           $("#acceptTerms");
   
       checkoutElements.termsError =
           $("#termsError");
   
   
       /* BOTÃO */
   
       checkoutElements.finishOrderButton =
           $("#finishOrderButton");
   
       checkoutElements.finishButtonLoader =
           $("#finishButtonLoader");
   
   
       /* CHECKOUT VAZIO */
   
       checkoutElements.checkoutEmpty =
           $("#checkoutEmpty");
   
       checkoutElements.checkoutContent =
           $(".checkout-content");
   
       checkoutElements.checkoutBenefits =
           $(".checkout-benefits");
   
       checkoutElements.checkoutProgress =
           $(".checkout-progress-section");
   
   
       /* MODAL CONFIRMAÇÃO */
   
       checkoutElements.confirmationModal =
           $("#confirmationModal");
   
       checkoutElements.confirmationModalClose =
           $("#confirmationModalClose");
   
       checkoutElements.confirmationCancel =
           $("#confirmationCancel");
   
       checkoutElements.confirmationConfirm =
           $("#confirmationConfirm");
   
       checkoutElements.confirmationTotal =
           $("#confirmationTotal");
   
   
       /* MODAL SUCESSO */
   
       checkoutElements.successModal =
           $("#successModal");
   
       checkoutElements.successOrderNumber =
           $("#successOrderNumber");
   
       checkoutElements.viewOrderButton =
           $("#viewOrderButton");
   
   
       /* MODAL ERRO */
   
       checkoutElements.errorModal =
           $("#errorModal");
   
       checkoutElements.errorModalClose =
           $("#errorModalClose");
   
       checkoutElements.checkoutErrorButton =
           $("#checkoutErrorButton");
   
       checkoutElements.checkoutErrorMessage =
           $("#checkoutErrorMessage");
   
   
       /* TOAST */
   
       checkoutElements.checkoutToast =
           $("#checkoutToast");
   
       checkoutElements.checkoutToastText =
           $("#checkoutToastText");
   
   
       /* ANO */
   
       checkoutElements.currentYear =
           $("#currentYear");
   
   }
   
   
   /* ============================================================
      20. QUANTIDADE TOTAL
      ============================================================ */
   
   function getCartQuantity() {
   
       return checkoutState.carrinho.reduce(
           (total, produto) => {
   
               return (
                   total +
                   getProdutoQuantidade(produto)
               );
   
           },
           0
       );
   
   }
   
   
   /* ============================================================
      21. CALCULAR SUBTOTAL
      ============================================================ */
   
   function calculateSubtotal() {
   
       return checkoutState.carrinho.reduce(
           (total, produto) => {
   
               const preco =
                   getProdutoPreco(produto);
   
               const quantidade =
                   getProdutoQuantidade(produto);
   
               return (
                   total +
                   preco * quantidade
               );
   
           },
           0
       );
   
   }
   
   
   /* ============================================================
      22. RECALCULAR TOTAIS
      ============================================================ */
   
   function recalculateTotals() {
   
       checkoutState.subtotal =
           calculateSubtotal();
   
       checkoutState.desconto =
           Math.max(
               0,
               toNumber(checkoutState.desconto)
           );
   
       checkoutState.frete =
           Math.max(
               0,
               toNumber(checkoutState.frete)
           );
   
       checkoutState.total =
           Math.max(
               0,
               checkoutState.subtotal -
               checkoutState.desconto +
               checkoutState.frete
           );
   
       updateSummaryValues();
   
   }
   
   
   /* ============================================================
      23. ATUALIZAR RESUMO
      ============================================================ */
   
   function updateSummaryValues() {
   
       if (
           checkoutElements.checkoutSubtotal
       ) {
   
           checkoutElements.checkoutSubtotal.textContent =
               formatCurrency(
                   checkoutState.subtotal
               );
   
       }
   
   
       if (
           checkoutElements.checkoutDiscount
       ) {
   
           checkoutElements.checkoutDiscount.textContent =
               checkoutState.desconto > 0
                   ? `- ${formatCurrency(checkoutState.desconto)}`
                   : formatCurrency(0);
   
       }
   
   
       if (
           checkoutElements.checkoutShipping
       ) {
   
           checkoutElements.checkoutShipping.textContent =
               checkoutState.shippingSelected
                   ? (
                       checkoutState.frete === 0
                           ? "Grátis"
                           : formatCurrency(
                               checkoutState.frete
                           )
                   )
                   : "A calcular";
   
       }
   
   
       if (
           checkoutElements.checkoutTotal
       ) {
   
           checkoutElements.checkoutTotal.textContent =
               formatCurrency(
                   checkoutState.total
               );
   
       }
   
   
       if (
           checkoutElements.confirmationTotal
       ) {
   
           checkoutElements.confirmationTotal.textContent =
               formatCurrency(
                   checkoutState.total
               );
   
       }
   
   }
   
   
   /* ============================================================
      24. RENDERIZAR QUANTIDADE HERO
      ============================================================ */
   
   function renderHeroQuantity() {
   
       const quantity =
           getCartQuantity();
   
       if (
           checkoutElements.heroCheckoutItems
       ) {
   
           checkoutElements.heroCheckoutItems.textContent =
               quantity === 1
                   ? "1 item"
                   : `${quantity} itens`;
   
       }
   
   }
   
   
   /* ============================================================
      25. RENDERIZAR PRODUTOS
      ============================================================ */
   
   function renderSummaryProducts() {
   
       const container =
           checkoutElements.checkoutSummaryProducts;
   
       if (!container) {
           return;
       }
   
       container.innerHTML = "";
   
       checkoutState.carrinho.forEach(
           (produto, index) => {
   
               const item =
                   document.createElement("article");
   
               item.className =
                   "checkout-summary-product is-entering";
   
               item.style.animationDelay =
                   `${index * 45}ms`;
   
               const nome =
                   escapeHTML(
                       getProdutoNome(produto)
                   );
   
               const imagem =
                   escapeHTML(
                       getProdutoImagem(produto)
                   );
   
               const quantidade =
                   getProdutoQuantidade(produto);
   
               const preco =
                   getProdutoPreco(produto);
   
               const sku =
                   escapeHTML(
                       getProdutoSku(produto)
                   );
   
               const totalItem =
                   preco * quantidade;
   
               item.innerHTML = `
   
                   <div class="checkout-summary-product-image">
   
                       ${
                           imagem
                               ? `
                                   <img
                                       src="${imagem}"
                                       alt="${nome}"
                                       loading="lazy"
                                   >
                               `
                               : `
                                   <i
                                       class="fa-solid fa-gears"
                                       aria-hidden="true"
                                   ></i>
                               `
                       }
   
                       <span class="checkout-summary-product-quantity">
                           ${quantidade}
                       </span>
   
                   </div>
   
   
                   <div class="checkout-summary-product-info">
   
                       <strong>
                           ${nome}
                       </strong>
   
                       ${
                           sku
                               ? `
                                   <small>
                                       Ref. ${sku}
                                   </small>
                               `
                               : `
                                   <small>
                                       ${quantidade} ${
                                           quantidade === 1
                                               ? "unidade"
                                               : "unidades"
                                       }
                                   </small>
                               `
                       }
   
                   </div>
   
   
                   <strong class="checkout-summary-product-price">
   
                       ${formatCurrency(totalItem)}
   
                   </strong>
   
               `;
   
               container.appendChild(item);
   
           }
       );
   
   }
   
   
   /* ============================================================
      26. CLIENTE
      ============================================================ */
   
   function renderCustomer() {
   
       const cliente =
           checkoutState.cliente;
   
       if (!cliente) {
   
           renderGuestCustomer();
   
           return;
   
       }
   
       const nome =
           cliente.nome ??
           cliente.nome_completo ??
           cliente.name ??
           "";
   
       const email =
           cliente.email ??
           "";
   
       const telefone =
           cliente.telefone ??
           cliente.celular ??
           cliente.phone ??
           "";
   
       const cpf =
           cliente.cpf ??
           cliente.documento ??
           "";
   
       const foto =
           cliente.foto ??
           cliente.avatar ??
           cliente.imagem ??
           "";
   
       if (
           checkoutElements.loggedCustomer
       ) {
   
           checkoutElements.loggedCustomer.hidden =
               false;
   
       }
   
       if (
           checkoutElements.checkoutLoginRequired
       ) {
   
           checkoutElements.checkoutLoginRequired.hidden =
               true;
   
       }
   
   
       if (
           checkoutElements.checkoutCustomerName
       ) {
   
           checkoutElements.checkoutCustomerName.textContent =
               nome || "Cliente";
   
       }
   
   
       if (
           checkoutElements.checkoutCustomerEmail
       ) {
   
           checkoutElements.checkoutCustomerEmail.textContent =
               email || "";
   
       }
   
   
       if (
           checkoutElements.checkoutCustomerInitial
       ) {
   
           checkoutElements.checkoutCustomerInitial.textContent =
               nome
                   ? nome.trim().charAt(0).toUpperCase()
                   : "C";
   
       }
   
   
       if (
           foto &&
           checkoutElements.checkoutCustomerAvatar
       ) {
   
           checkoutElements.checkoutCustomerAvatar.src =
               foto;
   
           checkoutElements.checkoutCustomerAvatar.hidden =
               false;
   
           if (
               checkoutElements.checkoutCustomerInitial
           ) {
   
               checkoutElements.checkoutCustomerInitial.hidden =
                   true;
   
           }
   
       }
   
   
       setInputValue(
           checkoutElements.customerName,
           nome
       );
   
       setInputValue(
           checkoutElements.customerEmail,
           email
       );
   
       setInputValue(
           checkoutElements.customerPhone,
           telefone
               ? maskPhone(telefone)
               : ""
       );
   
       setInputValue(
           checkoutElements.customerDocument,
           cpf
               ? maskCPF(cpf)
               : ""
       );
   
   
       if (
           checkoutElements.headerAccountLabel
       ) {
   
           checkoutElements.headerAccountLabel.textContent =
               getFirstName(nome) || "Minha conta";
   
       }
   
   
       if (
           checkoutElements.accountButton
       ) {
   
           checkoutElements.accountButton.href =
               "perfil.html";
   
       }
   
   
       restoreCustomerAddress(cliente);
   
       updateCustomerStatus();
   
   }
   
   
   /* ============================================================
      27. VISUAL VISITANTE
      ============================================================ */
   
   function renderGuestCustomer() {
   
       if (
           checkoutElements.loggedCustomer
       ) {
   
           checkoutElements.loggedCustomer.hidden =
               true;
   
       }
   
       if (
           checkoutElements.checkoutLoginRequired
       ) {
   
           checkoutElements.checkoutLoginRequired.hidden =
               false;
   
       }
   
       if (
           checkoutElements.headerAccountLabel
       ) {
   
           checkoutElements.headerAccountLabel.textContent =
               "Entrar";
   
       }
   
       if (
           checkoutElements.accountButton
       ) {
   
           checkoutElements.accountButton.href =
               "login.html";
   
       }
   
   }
   
   
   /* ============================================================
      28. PRIMEIRO NOME
      ============================================================ */
   
   function getFirstName(name) {
   
       if (!name) {
           return "";
       }
   
       return String(name)
           .trim()
           .split(/\s+/)[0];
   
   }
   
   
   /* ============================================================
      29. SET INPUT
      ============================================================ */
   
   function setInputValue(element, value) {
   
       if (!element) {
           return;
       }
   
       if (
           value === null ||
           value === undefined
       ) {
           return;
       }
   
       element.value =
           String(value);
   
   }
   
   
   /* ============================================================
      30. RESTAURAR ENDEREÇO
      ============================================================ */
   
   function restoreCustomerAddress(cliente) {
   
       const endereco =
           cliente.endereco ??
           cliente.address ??
           cliente.endereco_entrega ??
           null;
   
       if (!endereco) {
           return;
       }
   
       setInputValue(
           checkoutElements.addressCep,
           maskCEP(
               endereco.cep ?? ""
           )
       );
   
       setInputValue(
           checkoutElements.addressStreet,
           endereco.rua ??
           endereco.logradouro ??
           ""
       );
   
       setInputValue(
           checkoutElements.addressNumber,
           endereco.numero ??
           ""
       );
   
       setInputValue(
           checkoutElements.addressComplement,
           endereco.complemento ??
           ""
       );
   
       setInputValue(
           checkoutElements.addressDistrict,
           endereco.bairro ??
           ""
       );
   
       setInputValue(
           checkoutElements.addressCity,
           endereco.cidade ??
           endereco.localidade ??
           ""
       );
   
       setInputValue(
           checkoutElements.addressState,
           endereco.estado ??
           endereco.uf ??
           ""
       );
   
   }
   
   
   /* ============================================================
      31. SOMENTE NÚMEROS
      ============================================================ */
   
   function onlyNumbers(value) {
   
       return String(value || "")
           .replace(/\D/g, "");
   
   }
   
   
   /* ============================================================
      32. MÁSCARA CPF
      ============================================================ */
   
   function maskCPF(value) {
   
       const numbers =
           onlyNumbers(value)
               .slice(0, 11);
   
       return numbers
           .replace(
               /(\d{3})(\d)/,
               "$1.$2"
           )
           .replace(
               /(\d{3})(\d)/,
               "$1.$2"
           )
           .replace(
               /(\d{3})(\d{1,2})$/,
               "$1-$2"
           );
   
   }
   
   
   /* ============================================================
      33. MÁSCARA CEP
      ============================================================ */
   
   function maskCEP(value) {
   
       const numbers =
           onlyNumbers(value)
               .slice(0, 8);
   
       return numbers.replace(
           /(\d{5})(\d)/,
           "$1-$2"
       );
   
   }
   
   
   /* ============================================================
      34. MÁSCARA TELEFONE
      ============================================================ */
   
   function maskPhone(value) {
   
       const numbers =
           onlyNumbers(value)
               .slice(0, 11);
   
       if (numbers.length <= 10) {
   
           return numbers
               .replace(
                   /(\d{2})(\d)/,
                   "($1) $2"
               )
               .replace(
                   /(\d{4})(\d)/,
                   "$1-$2"
               );
   
       }
   
       return numbers
           .replace(
               /(\d{2})(\d)/,
               "($1) $2"
           )
           .replace(
               /(\d{5})(\d)/,
               "$1-$2"
           );
   
   }
   
   
   /* ============================================================
      35. VALIDAÇÃO CPF
      ============================================================ */
   
   function validateCPF(value) {
   
       const cpf =
           onlyNumbers(value);
   
       if (cpf.length !== 11) {
           return false;
       }
   
       if (/^(\d)\1{10}$/.test(cpf)) {
           return false;
       }
   
       let sum = 0;
   
       for (let i = 0; i < 9; i++) {
   
           sum +=
               Number(cpf[i]) *
               (10 - i);
   
       }
   
       let digit =
           (sum * 10) % 11;
   
       if (digit === 10) {
           digit = 0;
       }
   
       if (
           digit !== Number(cpf[9])
       ) {
           return false;
       }
   
       sum = 0;
   
       for (let i = 0; i < 10; i++) {
   
           sum +=
               Number(cpf[i]) *
               (11 - i);
   
       }
   
       digit =
           (sum * 10) % 11;
   
       if (digit === 10) {
           digit = 0;
       }
   
       return (
           digit === Number(cpf[10])
       );
   
   }
   
   
   /* ============================================================
      36. VALIDAÇÃO EMAIL
      ============================================================ */
   
   function validateEmail(email) {
   
       return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
           .test(
               String(email || "").trim()
           );
   
   }
   
   
   /* ============================================================
      37. ERRO DE CAMPO
      ============================================================ */
   
   function setFieldError(
       input,
       message
   ) {
   
       if (!input) {
           return;
       }
   
       const field =
           input.closest(
               ".checkout-field"
           );
   
       if (field) {
   
           field.classList.add(
               "is-error"
           );
   
           field.classList.remove(
               "is-valid"
           );
   
       }
   
       const error =
           document.querySelector(
               `[data-error-for="${input.id}"]`
           );
   
       if (error) {
   
           error.textContent =
               message || "";
   
       }
   
   }
   
   
   /* ============================================================
      38. CAMPO VÁLIDO
      ============================================================ */
   
   function setFieldValid(input) {
   
       if (!input) {
           return;
       }
   
       const field =
           input.closest(
               ".checkout-field"
           );
   
       if (field) {
   
           field.classList.remove(
               "is-error"
           );
   
           field.classList.add(
               "is-valid"
           );
   
       }
   
       const error =
           document.querySelector(
               `[data-error-for="${input.id}"]`
           );
   
       if (error) {
   
           error.textContent = "";
   
       }
   
   }
   
   
   /* ============================================================
      39. LIMPAR ESTADO DO CAMPO
      ============================================================ */
   
   function clearFieldState(input) {
   
       if (!input) {
           return;
       }
   
       const field =
           input.closest(
               ".checkout-field"
           );
   
       if (field) {
   
           field.classList.remove(
               "is-error",
               "is-valid"
           );
   
       }
   
       const error =
           document.querySelector(
               `[data-error-for="${input.id}"]`
           );
   
       if (error) {
           error.textContent = "";
       }
   
   }
   
   
   /* ============================================================
      40. VALIDAR CLIENTE
      ============================================================ */
   
   function validateCustomer() {
   
       let valid = true;
   
       const nome =
           checkoutElements.customerName
               ?.value
               .trim() || "";
   
       const email =
           checkoutElements.customerEmail
               ?.value
               .trim() || "";
   
       const telefone =
           onlyNumbers(
               checkoutElements.customerPhone
                   ?.value
           );
   
       const cpf =
           checkoutElements.customerDocument
               ?.value
               .trim() || "";
   
   
       if (nome.length < 3) {
   
           setFieldError(
               checkoutElements.customerName,
               "Informe seu nome completo."
           );
   
           valid = false;
   
       } else {
   
           setFieldValid(
               checkoutElements.customerName
           );
   
       }
   
   
       if (!validateEmail(email)) {
   
           setFieldError(
               checkoutElements.customerEmail,
               "Informe um e-mail válido."
           );
   
           valid = false;
   
       } else {
   
           setFieldValid(
               checkoutElements.customerEmail
           );
   
       }
   
   
       if (
           telefone.length < 10 ||
           telefone.length > 11
       ) {
   
           setFieldError(
               checkoutElements.customerPhone,
               "Informe um telefone válido."
           );
   
           valid = false;
   
       } else {
   
           setFieldValid(
               checkoutElements.customerPhone
           );
   
       }
   
   
       if (!validateCPF(cpf)) {
   
           setFieldError(
               checkoutElements.customerDocument,
               "Informe um CPF válido."
           );
   
           valid = false;
   
       } else {
   
           setFieldValid(
               checkoutElements.customerDocument
           );
   
       }
   
   
       setSectionStatus(
           checkoutElements.customerStatus,
           valid
               ? "Concluído"
               : "Revisar",
           valid
               ? "valid"
               : "error"
       );
   
       return valid;
   
   }
   
   
   /* ============================================================
      41. STATUS CLIENTE DINÂMICO
      ============================================================ */
   
   function updateCustomerStatus() {
   
       const nome =
           checkoutElements.customerName
               ?.value
               .trim();
   
       const email =
           checkoutElements.customerEmail
               ?.value
               .trim();
   
       const telefone =
           onlyNumbers(
               checkoutElements.customerPhone
                   ?.value
           );
   
       const cpf =
           onlyNumbers(
               checkoutElements.customerDocument
                   ?.value
           );
   
       const complete =
           nome?.length >= 3 &&
           validateEmail(email) &&
           telefone.length >= 10 &&
           cpf.length === 11;
   
       if (complete) {
   
           setSectionStatus(
               checkoutElements.customerStatus,
               "Preenchido",
               "valid"
           );
   
       } else {
   
           setSectionStatus(
               checkoutElements.customerStatus,
               "Aguardando"
           );
   
       }
   
   }
   
   
   /* ============================================================
      42. VALIDAR ENDEREÇO
      ============================================================ */
   
   function validateAddress() {
   
       let valid = true;
   
       const fields = [
   
           {
               element:
                   checkoutElements.addressCep,
   
               valid:
                   onlyNumbers(
                       checkoutElements.addressCep
                           ?.value
                   ).length === 8,
   
               message:
                   "Informe um CEP válido."
           },
   
           {
               element:
                   checkoutElements.addressStreet,
   
               valid:
                   (
                       checkoutElements.addressStreet
                           ?.value
                           .trim()
                           .length || 0
                   ) >= 3,
   
               message:
                   "Informe a rua."
           },
   
           {
               element:
                   checkoutElements.addressNumber,
   
               valid:
                   Boolean(
                       checkoutElements.addressNumber
                           ?.value
                           .trim()
                   ),
   
               message:
                   "Informe o número."
           },
   
           {
               element:
                   checkoutElements.addressDistrict,
   
               valid:
                   Boolean(
                       checkoutElements.addressDistrict
                           ?.value
                           .trim()
                   ),
   
               message:
                   "Informe o bairro."
           },
   
           {
               element:
                   checkoutElements.addressCity,
   
               valid:
                   Boolean(
                       checkoutElements.addressCity
                           ?.value
                           .trim()
                   ),
   
               message:
                   "Informe a cidade."
           },
   
           {
               element:
                   checkoutElements.addressState,
   
               valid:
                   Boolean(
                       checkoutElements.addressState
                           ?.value
                   ),
   
               message:
                   "Selecione o estado."
           }
   
       ];
   
   
       fields.forEach((field) => {
   
           if (!field.valid) {
   
               setFieldError(
                   field.element,
                   field.message
               );
   
               valid = false;
   
           } else {
   
               setFieldValid(
                   field.element
               );
   
           }
   
       });
   
   
       setSectionStatus(
           checkoutElements.addressStatus,
           valid
               ? "Concluído"
               : "Revisar",
           valid
               ? "valid"
               : "error"
       );
   
       return valid;
   
   }
   
   
   /* ============================================================
      43. ATUALIZAR STATUS ENDEREÇO
      ============================================================ */
   
   function updateAddressStatus() {
   
       const cep =
           onlyNumbers(
               checkoutElements.addressCep
                   ?.value
           );
   
       const street =
           checkoutElements.addressStreet
               ?.value
               .trim();
   
       const number =
           checkoutElements.addressNumber
               ?.value
               .trim();
   
       const district =
           checkoutElements.addressDistrict
               ?.value
               .trim();
   
       const city =
           checkoutElements.addressCity
               ?.value
               .trim();
   
       const state =
           checkoutElements.addressState
               ?.value;
   
       const complete =
           cep.length === 8 &&
           street &&
           number &&
           district &&
           city &&
           state;
   
       if (complete) {
   
           setSectionStatus(
               checkoutElements.addressStatus,
               "Preenchido",
               "valid"
           );
   
       } else {
   
           setSectionStatus(
               checkoutElements.addressStatus,
               "Aguardando"
           );
   
       }
   
   }
   
   
   /* ============================================================
      44. STATUS DE SEÇÃO
      ============================================================ */
   
   function setSectionStatus(
       element,
       text,
       type = ""
   ) {
   
       if (!element) {
           return;
       }
   
       element.classList.remove(
           "is-valid",
           "is-error"
       );
   
       if (type === "valid") {
   
           element.classList.add(
               "is-valid"
           );
   
       }
   
       if (type === "error") {
   
           element.classList.add(
               "is-error"
           );
   
       }
   
       element.innerHTML = `
   
           <i class="fa-solid fa-circle"></i>
   
           ${escapeHTML(text)}
   
       `;
   
   }
   
   
   /* ============================================================
      45. CONSULTAR CEP
      ============================================================ */
   
   async function searchCEP() {
   
       const input =
           checkoutElements.addressCep;
   
       if (!input) {
           return;
       }
   
       const cep =
           onlyNumbers(
               input.value
           );
   
       if (cep.length !== 8) {
   
           checkoutState.cepConsultado =
               null;
   
           resetShipping();
   
           return;
   
       }
   
       if (
           checkoutState.cepConsultado === cep
       ) {
           return;
       }
   
       checkoutState.cepConsultado =
           cep;
   
       toggleCepLoader(true);
   
       try {
   
           const response =
               await fetch(
                   `${CHECKOUT_CONFIG.cepApi}${cep}/json/`
               );
   
           if (!response.ok) {
   
               throw new Error(
                   "Falha ao consultar CEP."
               );
   
           }
   
           const data =
               await response.json();
   
           if (data.erro) {
   
               throw new Error(
                   "CEP não encontrado."
               );
   
           }
   
   
           setInputValue(
               checkoutElements.addressStreet,
               data.logradouro || ""
           );
   
           setInputValue(
               checkoutElements.addressDistrict,
               data.bairro || ""
           );
   
           setInputValue(
               checkoutElements.addressCity,
               data.localidade || ""
           );
   
           setInputValue(
               checkoutElements.addressState,
               data.uf || ""
           );
   
   
           clearFieldState(
               checkoutElements.addressCep
           );
   
           setFieldValid(
               checkoutElements.addressCep
           );
   
   
           updateAddressStatus();
   
   
           /*
               IMPORTANTE:
   
               Aqui não inventamos valor real de frete.
   
               Enquanto não houver integração com transportadora,
               mostramos apenas uma opção que depende da cotação
               real do backend.
   
               Se o seu backend já retornar frete, você poderá
               substituir renderPendingShipping() por uma chamada
               à API de frete.
           */
   
           renderPendingShipping();
   
   
           if (
               checkoutElements.addressNumber
           ) {
   
               checkoutElements.addressNumber.focus();
   
           }
   
       } catch (error) {
   
           console.error(
               "[Checkout] CEP:",
               error
           );
   
           checkoutState.cepConsultado =
               null;
   
           setFieldError(
               input,
               error.message ||
               "Não foi possível consultar o CEP."
           );
   
           showShippingError();
   
       } finally {
   
           toggleCepLoader(false);
   
       }
   
   }
   
   
   /* ============================================================
      46. LOADER CEP
      ============================================================ */
   
   function toggleCepLoader(show) {
   
       if (
           checkoutElements.cepLoader
       ) {
   
           checkoutElements.cepLoader.hidden =
               !show;
   
       }
   
   }
   
   
   /* ============================================================
      47. FRETE PENDENTE DE INTEGRAÇÃO
      ============================================================ */
   
   function renderPendingShipping() {
   
       const container =
           checkoutElements.shippingOptions;
   
       if (!container) {
           return;
       }
   
       if (
           checkoutElements.shippingPlaceholder
       ) {
   
           checkoutElements.shippingPlaceholder.hidden =
               true;
   
       }
   
       if (
           checkoutElements.shippingError
       ) {
   
           checkoutElements.shippingError.hidden =
               true;
   
       }
   
       container.hidden =
           false;
   
       container.innerHTML = `
   
           <div class="shipping-placeholder">
   
               <span>
   
                   <i class="fa-solid fa-truck-fast"></i>
   
               </span>
   
   
               <div>
   
                   <strong>
                       Endereço identificado
                   </strong>
   
                   <p>
                       O valor e o prazo da entrega serão
                       definidos pela integração de frete
                       conectada ao sistema.
                   </p>
   
               </div>
   
           </div>
   
       `;
   
       checkoutState.shippingSelected =
           null;
   
       checkoutState.frete =
           0;
   
       setSectionStatus(
           checkoutElements.shippingStatus,
           "Aguardando cotação"
       );
   
       recalculateTotals();
   
   }
   
   
   /* ============================================================
      48. RENDERIZAR OPÇÕES REAIS DE FRETE
      ============================================================ */
   
   function renderShippingOptions(options = []) {
   
       const container =
           checkoutElements.shippingOptions;
   
       if (!container) {
           return;
       }
   
       if (!Array.isArray(options)) {
           options = [];
       }
   
       if (!options.length) {
   
           renderPendingShipping();
   
           return;
   
       }
   
       if (
           checkoutElements.shippingPlaceholder
       ) {
   
           checkoutElements.shippingPlaceholder.hidden =
               true;
   
       }
   
       if (
           checkoutElements.shippingError
       ) {
   
           checkoutElements.shippingError.hidden =
               true;
   
       }
   
       container.hidden =
           false;
   
       container.innerHTML = "";
   
   
       options.forEach(
           (option, index) => {
   
               const id =
                   option.id ??
                   option.codigo ??
                   `frete-${index}`;
   
               const nome =
                   option.nome ??
                   option.servico ??
                   "Entrega";
   
               const prazo =
                   option.prazo ??
                   option.prazo_dias ??
                   "";
   
               const valor =
                   toNumber(
                       option.valor ??
                       option.preco ??
                       0
                   );
   
               const label =
                   document.createElement(
                       "label"
                   );
   
               label.className =
                   "shipping-option";
   
               label.innerHTML = `
   
                   <input
                       type="radio"
                       name="shippingMethod"
                       value="${escapeHTML(id)}"
                       data-price="${valor}"
                   >
   
   
                   <span class="shipping-option-card">
   
                       <span class="shipping-option-icon">
   
                           <i class="fa-solid fa-truck"></i>
   
                       </span>
   
   
                       <span class="shipping-option-info">
   
                           <strong>
                               ${escapeHTML(nome)}
                           </strong>
   
                           <small>
                               ${
                                   prazo
                                       ? escapeHTML(
                                           `${prazo} dias úteis`
                                       )
                                       : "Prazo informado pela transportadora"
                               }
                           </small>
   
                       </span>
   
   
                       <strong class="shipping-option-price">
   
                           ${
                               valor === 0
                                   ? "Grátis"
                                   : formatCurrency(valor)
                           }
   
                       </strong>
   
                   </span>
   
               `;
   
               container.appendChild(
                   label
               );
   
           }
       );
   
   }
   
   
   /* ============================================================
      49. SELECIONAR FRETE
      ============================================================ */
   
   function handleShippingChange(event) {
   
       const input =
           event.target.closest(
               'input[name="shippingMethod"]'
           );
   
       if (!input) {
           return;
       }
   
       checkoutState.shippingSelected =
           input.value;
   
       checkoutState.frete =
           toNumber(
               input.dataset.price
           );
   
       setSectionStatus(
           checkoutElements.shippingStatus,
           "Selecionado",
           "valid"
       );
   
       recalculateTotals();
   
   }
   
   
   /* ============================================================
      50. RESET FRETE
      ============================================================ */
   
   function resetShipping() {
   
       checkoutState.shippingSelected =
           null;
   
       checkoutState.frete =
           0;
   
       if (
           checkoutElements.shippingOptions
       ) {
   
           checkoutElements.shippingOptions.hidden =
               true;
   
           checkoutElements.shippingOptions.innerHTML =
               "";
   
       }
   
       if (
           checkoutElements.shippingError
       ) {
   
           checkoutElements.shippingError.hidden =
               true;
   
       }
   
       if (
           checkoutElements.shippingPlaceholder
       ) {
   
           checkoutElements.shippingPlaceholder.hidden =
               false;
   
       }
   
       setSectionStatus(
           checkoutElements.shippingStatus,
           "Aguardando CEP"
       );
   
       recalculateTotals();
   
   }
   
   
   /* ============================================================
      51. ERRO FRETE
      ============================================================ */
   
   function showShippingError() {
   
       if (
           checkoutElements.shippingPlaceholder
       ) {
   
           checkoutElements.shippingPlaceholder.hidden =
               true;
   
       }
   
       if (
           checkoutElements.shippingOptions
       ) {
   
           checkoutElements.shippingOptions.hidden =
               true;
   
       }
   
       if (
           checkoutElements.shippingError
       ) {
   
           checkoutElements.shippingError.hidden =
               false;
   
       }
   
       setSectionStatus(
           checkoutElements.shippingStatus,
           "Erro",
           "error"
       );
   
   }
   
   
   /* ============================================================
      52. PAGAMENTO
      ============================================================ */
   
   function handlePaymentChange(event) {
   
       const input =
           event.target.closest(
               'input[name="paymentMethod"]'
           );
   
       if (!input) {
           return;
       }
   
       checkoutState.paymentSelected =
           input.value;
   
       if (
           checkoutElements.paymentError
       ) {
   
           checkoutElements.paymentError.textContent =
               "";
   
       }
   
       setSectionStatus(
           checkoutElements.paymentStatus,
           "Selecionado",
           "valid"
       );
   
   }
   
   
   /* ============================================================
      53. VALIDAR PAGAMENTO
      ============================================================ */
   
   function validatePayment() {
   
       const checked =
           $(
               'input[name="paymentMethod"]:checked'
           );
   
       if (!checked) {
   
           if (
               checkoutElements.paymentError
           ) {
   
               checkoutElements.paymentError.textContent =
                   "Selecione uma forma de pagamento.";
   
           }
   
           setSectionStatus(
               checkoutElements.paymentStatus,
               "Revisar",
               "error"
           );
   
           return false;
   
       }
   
       checkoutState.paymentSelected =
           checked.value;
   
       if (
           checkoutElements.paymentError
       ) {
   
           checkoutElements.paymentError.textContent =
               "";
   
       }
   
       setSectionStatus(
           checkoutElements.paymentStatus,
           "Selecionado",
           "valid"
       );
   
       return true;
   
   }
   
   
   /* ============================================================
      54. VALIDAR TERMOS
      ============================================================ */
   
   function validateTerms() {
   
       if (
           !checkoutElements.acceptTerms
               ?.checked
       ) {
   
           if (
               checkoutElements.termsError
           ) {
   
               checkoutElements.termsError.textContent =
                   "Confirme os dados antes de finalizar.";
   
           }
   
           return false;
   
       }
   
       if (
           checkoutElements.termsError
       ) {
   
           checkoutElements.termsError.textContent =
               "";
   
       }
   
       return true;
   
   }
   
   
   /* ============================================================
      55. VALIDAR CARRINHO
      ============================================================ */
   
   function validateCart() {
   
       if (
           !checkoutState.carrinho.length
       ) {
   
           showErrorModal(
               "Seu carrinho está vazio."
           );
   
           return false;
   
       }
   
       return true;
   
   }
   
   
   /* ============================================================
      56. VALIDAR LOGIN
      ============================================================ */
   
   function validateLogin() {
   
       const clienteId =
           getClienteId(
               checkoutState.cliente
           );
   
       if (!clienteId) {
   
           showErrorModal(
               "Entre na sua conta antes de finalizar o pedido."
           );
   
           return false;
   
       }
   
       return true;
   
   }
   
   
   /* ============================================================
      57. VALIDAÇÃO COMPLETA
      ============================================================ */
   
   function validateCheckout() {
   
       const cartValid =
           validateCart();
   
       if (!cartValid) {
           return false;
       }
   
       const loginValid =
           validateLogin();
   
       if (!loginValid) {
           return false;
       }
   
       const customerValid =
           validateCustomer();
   
       const addressValid =
           validateAddress();
   
       const paymentValid =
           validatePayment();
   
       const termsValid =
           validateTerms();
   
   
       const valid =
           customerValid &&
           addressValid &&
           paymentValid &&
           termsValid;
   
   
       if (!valid) {
   
           scrollToFirstError();
   
           shakeInvalidCard();
   
       }
   
       return valid;
   
   }
   
   
   /* ============================================================
      58. SCROLL PRIMEIRO ERRO
      ============================================================ */
   
   function scrollToFirstError() {
   
       const errorField =
           $(".checkout-field.is-error");
   
       if (errorField) {
   
           errorField.scrollIntoView({
               behavior: "smooth",
               block: "center"
           });
   
           return;
   
       }
   
       if (
           checkoutElements.paymentError
               ?.textContent
       ) {
   
           const paymentCard =
               checkoutElements.paymentError.closest(
                   ".checkout-card"
               );
   
           paymentCard?.scrollIntoView({
               behavior: "smooth",
               block: "center"
           });
   
           return;
   
       }
   
       if (
           checkoutElements.termsError
               ?.textContent
       ) {
   
           checkoutElements.acceptTerms
               ?.closest(
                   ".checkout-summary"
               )
               ?.scrollIntoView({
                   behavior: "smooth",
                   block: "center"
               });
   
       }
   
   }
   
   
   /* ============================================================
      59. SHAKE
      ============================================================ */
   
   function shakeInvalidCard() {
   
       const card =
           $(".checkout-field.is-error")
               ?.closest(
                   ".checkout-card"
               );
   
       if (!card) {
           return;
       }
   
       card.classList.remove(
           "checkout-shake"
       );
   
       void card.offsetWidth;
   
       card.classList.add(
           "checkout-shake"
       );
   
       window.setTimeout(
           () => {
   
               card.classList.remove(
                   "checkout-shake"
               );
   
           },
           500
       );
   
   }
   
   
   /* ============================================================
      60. DADOS DO CLIENTE
      ============================================================ */
   
   function getCustomerFormData() {
   
       return {
   
           nome:
               checkoutElements.customerName
                   ?.value
                   .trim() || "",
   
           email:
               checkoutElements.customerEmail
                   ?.value
                   .trim() || "",
   
           telefone:
               onlyNumbers(
                   checkoutElements.customerPhone
                       ?.value
               ),
   
           cpf:
               onlyNumbers(
                   checkoutElements.customerDocument
                       ?.value
               )
   
       };
   
   }
   
   
   /* ============================================================
      61. DADOS ENDEREÇO
      ============================================================ */
   
   function getAddressData() {
   
       return {
   
           cep:
               onlyNumbers(
                   checkoutElements.addressCep
                       ?.value
               ),
   
           rua:
               checkoutElements.addressStreet
                   ?.value
                   .trim() || "",
   
           numero:
               checkoutElements.addressNumber
                   ?.value
                   .trim() || "",
   
           complemento:
               checkoutElements.addressComplement
                   ?.value
                   .trim() || "",
   
           bairro:
               checkoutElements.addressDistrict
                   ?.value
                   .trim() || "",
   
           cidade:
               checkoutElements.addressCity
                   ?.value
                   .trim() || "",
   
           estado:
               checkoutElements.addressState
                   ?.value || ""
   
       };
   
   }
   
   
   /* ============================================================
      62. ITENS PARA API
      ============================================================ */
   
   function getOrderItems() {
   
       return checkoutState.carrinho.map(
           (produto) => {
   
               return {
   
                   id_produto:
                       getProdutoId(produto),
   
                   quantidade:
                       getProdutoQuantidade(produto),
   
                   preco_unitario:
                       getProdutoPreco(produto)
   
               };
   
           }
       );
   
   }
   
   
   /* ============================================================
      63. PAYLOAD PEDIDO
      ============================================================ */
   
   function buildOrderPayload() {
   
       const cliente =
           getCustomerFormData();
   
       const endereco =
           getAddressData();
   
       const idCliente =
           getClienteId(
               checkoutState.cliente
           );
   
       return {
   
           id_cliente:
               idCliente,
   
           itens:
               getOrderItems(),
   
           endereco_entrega:
               endereco,
   
           cliente:
               cliente,
   
           forma_pagamento:
               checkoutState.paymentSelected,
   
           frete: {
   
               metodo:
                   checkoutState.shippingSelected,
   
               valor:
                   checkoutState.frete
   
           },
   
           valores: {
   
               subtotal:
                   checkoutState.subtotal,
   
               desconto:
                   checkoutState.desconto,
   
               frete:
                   checkoutState.frete,
   
               total:
                   checkoutState.total
   
           },
   
           observacoes:
               checkoutElements.orderNotes
                   ?.value
                   .trim() || ""
   
       };
   
   }
   
   
   /* ============================================================
      64. ABRIR CONFIRMAÇÃO
      ============================================================ */
   
   function openConfirmationModal() {
   
       if (
           !validateCheckout()
       ) {
           return;
       }
   
       if (
           checkoutElements.confirmationTotal
       ) {
   
           checkoutElements.confirmationTotal.textContent =
               formatCurrency(
                   checkoutState.total
               );
   
       }
   
       openModal(
           checkoutElements.confirmationModal
       );
   
   }
   
   
   /* ============================================================
      65. CRIAR PEDIDO
      ============================================================ */
   
   async function createOrder() {
   
       if (
           checkoutState.processing
       ) {
           return;
       }
   
       if (
           !validateCheckout()
       ) {
   
           closeModal(
               checkoutElements.confirmationModal
           );
   
           return;
   
       }
   
       checkoutState.processing =
           true;
   
       setProcessingState(true);
   
       const payload =
           buildOrderPayload();
   
       try {
   
           const response =
               await fetch(
                   CHECKOUT_CONFIG.apiBase +
                   CHECKOUT_CONFIG.endpoints.pedidos,
                   {
                       method: "POST",
   
                       headers: {
                           "Content-Type":
                               "application/json"
                       },
   
                       body:
                           JSON.stringify(
                               payload
                           )
                   }
               );
   
   
           const responseData =
               await parseResponse(
                   response
               );
   
   
           if (!response.ok) {
   
               const message =
                   responseData?.message ??
                   responseData?.erro ??
                   responseData?.error ??
                   `Erro ${response.status} ao criar o pedido.`;
   
               throw new Error(
                   message
               );
   
           }
   
   
           const pedido =
               normalizeCreatedOrder(
                   responseData
               );
   
   
           checkoutState.pedidoCriado =
               pedido;
   
   
           saveLastOrder(
               pedido,
               payload
           );
   
   
           saveAddressIfNecessary();
   
   
           clearCartAfterSuccess();
   
   
           closeModal(
               checkoutElements.confirmationModal
           );
   
   
           showSuccessModal(
               pedido
           );
   
       } catch (error) {
   
           console.error(
               "[Checkout] Erro ao criar pedido:",
               error
           );
   
           closeModal(
               checkoutElements.confirmationModal
           );
   
           showErrorModal(
               error.message ||
               "Não foi possível criar o pedido."
           );
   
       } finally {
   
           checkoutState.processing =
               false;
   
           setProcessingState(false);
   
       }
   
   }
   
   
   /* ============================================================
      66. PARSE RESPONSE
      ============================================================ */
   
   async function parseResponse(response) {
   
       const contentType =
           response.headers.get(
               "content-type"
           ) || "";
   
       if (
           contentType.includes(
               "application/json"
           )
       ) {
   
           try {
   
               return await response.json();
   
           } catch {
   
               return null;
   
           }
   
       }
   
       try {
   
           const text =
               await response.text();
   
           return text
               ? { message: text }
               : null;
   
       } catch {
   
           return null;
   
       }
   
   }
   
   
   /* ============================================================
      67. NORMALIZAR PEDIDO CRIADO
      ============================================================ */
   
   function normalizeCreatedOrder(data) {
   
       if (!data) {
   
           return {
               id: null
           };
   
       }
   
       const pedido =
           data.pedido ??
           data.data ??
           data;
   
   
       return {
   
           ...pedido,
   
           id:
               pedido.id_pedido ??
               pedido.id ??
               pedido.numero_pedido ??
               null
   
       };
   
   }
   
   
   /* ============================================================
      68. SALVAR ÚLTIMO PEDIDO
      ============================================================ */
   
   function saveLastOrder(
       pedido,
       payload
   ) {
   
       const data = {
   
           pedido,
   
           payload,
   
           criado_em:
               new Date().toISOString()
   
       };
   
       setStorageJSON(
           CHECKOUT_CONFIG.storage.ultimoPedido,
           data
       );
   
   
       /*
           Compatibilidade com o fluxo anterior
           da Auto Peça Certa.
       */
   
       setStorageJSON(
           CHECKOUT_CONFIG.storage.clientePedido,
           {
               id_cliente:
                   payload.id_cliente,
   
               id_pedido:
                   pedido.id ??
                   null
           }
       );
   
   }
   
   
   /* ============================================================
      69. SALVAR ENDEREÇO LOCALMENTE
      ============================================================ */
   
   function saveAddressIfNecessary() {
   
       if (
           !checkoutElements.saveAddress
               ?.checked
       ) {
           return;
       }
   
       if (
           !checkoutState.cliente
       ) {
           return;
       }
   
       const clienteAtualizado = {
   
           ...checkoutState.cliente,
   
           endereco:
               getAddressData()
   
       };
   
       checkoutState.cliente =
           clienteAtualizado;
   
       setStorageJSON(
           CHECKOUT_CONFIG.storage.cliente,
           clienteAtualizado
       );
   
   }
   
   
   /* ============================================================
      70. LIMPAR CARRINHO
      ============================================================ */
   
   function clearCartAfterSuccess() {
   
       checkoutState.carrinho =
           [];
   
       const possibleKeys = [
           CHECKOUT_CONFIG.storage.carrinho,
           "cart",
           "carrinhoAPC"
       ];
   
       possibleKeys.forEach(
           (key) => {
   
               localStorage.removeItem(
                   key
               );
   
           }
       );
   
   }
   
   
   /* ============================================================
      71. ESTADO PROCESSANDO
      ============================================================ */
   
   function setProcessingState(processing) {
   
       if (
           checkoutElements.finishOrderButton
       ) {
   
           checkoutElements.finishOrderButton.disabled =
               processing;
   
       }
   
       if (
           checkoutElements.finishButtonLoader
       ) {
   
           checkoutElements.finishButtonLoader.hidden =
               !processing;
   
       }
   
       if (
           checkoutElements.confirmationConfirm
       ) {
   
           checkoutElements.confirmationConfirm.disabled =
               processing;
   
           const text =
               checkoutElements.confirmationConfirm.querySelector(
                   "span"
               );
   
           if (text) {
   
               text.textContent =
                   processing
                       ? "Enviando pedido..."
                       : "Confirmar pedido";
   
           }
   
       }
   
   }
   
   
   /* ============================================================
      72. MODAL
      ============================================================ */
   
   function openModal(modal) {
   
       if (!modal) {
           return;
       }
   
       modal.hidden =
           false;
   
       document.body.style.overflow =
           "hidden";
   
   }
   
   
   function closeModal(modal) {
   
       if (!modal) {
           return;
       }
   
       modal.hidden =
           true;
   
       const anyOpen =
           $(
               ".checkout-modal-overlay:not([hidden])"
           );
   
       if (!anyOpen) {
   
           document.body.style.overflow =
               "";
   
       }
   
   }
   
   
   /* ============================================================
      73. MODAL SUCESSO
      ============================================================ */
   
   function showSuccessModal(pedido) {
   
       const numero =
           pedido?.numero_pedido ??
           pedido?.id_pedido ??
           pedido?.id ??
           "Registrado";
   
       if (
           checkoutElements.successOrderNumber
       ) {
   
           checkoutElements.successOrderNumber.textContent =
               numero === "Registrado"
                   ? numero
                   : `#${numero}`;
   
       }
   
       openModal(
           checkoutElements.successModal
       );
   
   }
   
   
   /* ============================================================
      74. MODAL ERRO
      ============================================================ */
   
   function showErrorModal(message) {
   
       if (
           checkoutElements.checkoutErrorMessage
       ) {
   
           checkoutElements.checkoutErrorMessage.textContent =
               message ||
               "Confira seus dados e tente novamente.";
   
       }
   
       openModal(
           checkoutElements.errorModal
       );
   
   }
   
   
   /* ============================================================
      75. TOAST
      ============================================================ */
   
   let checkoutToastTimer =
       null;
   
   
   function showToast(message) {
   
       const toast =
           checkoutElements.checkoutToast;
   
       if (!toast) {
           return;
       }
   
       if (
           checkoutElements.checkoutToastText
       ) {
   
           checkoutElements.checkoutToastText.textContent =
               message;
   
       }
   
       window.clearTimeout(
           checkoutToastTimer
       );
   
       toast.classList.add(
           "is-visible"
       );
   
       checkoutToastTimer =
           window.setTimeout(
               () => {
   
                   toast.classList.remove(
                       "is-visible"
                   );
   
               },
               CHECKOUT_CONFIG.toastDuration
           );
   
   }
   
   
   /* ============================================================
      76. CONTADOR OBSERVAÇÕES
      ============================================================ */
   
   function updateNotesCounter() {
   
       if (
           !checkoutElements.orderNotes ||
           !checkoutElements.notesCounter
       ) {
           return;
       }
   
       const length =
           checkoutElements.orderNotes
               .value
               .length;
   
       checkoutElements.notesCounter.textContent =
           `${length} / 500`;
   
   }
   
   
   /* ============================================================
      77. CHECKOUT VAZIO
      ============================================================ */
   
   function handleEmptyCheckout() {
   
       const empty =
           checkoutState.carrinho.length === 0;
   
       if (
           checkoutElements.checkoutEmpty
       ) {
   
           checkoutElements.checkoutEmpty.hidden =
               !empty;
   
       }
   
       if (
           checkoutElements.checkoutContent
       ) {
   
           checkoutElements.checkoutContent.hidden =
               empty;
   
       }
   
       if (
           checkoutElements.checkoutBenefits
       ) {
   
           checkoutElements.checkoutBenefits.hidden =
               empty;
   
       }
   
       if (
           checkoutElements.checkoutProgress
       ) {
   
           checkoutElements.checkoutProgress.hidden =
               empty;
   
       }
   
       return empty;
   
   }
   
   
   /* ============================================================
      78. EVENTO CPF
      ============================================================ */
   
   function handleCPFInput(event) {
   
       event.target.value =
           maskCPF(
               event.target.value
           );
   
       clearFieldState(
           event.target
       );
   
       updateCustomerStatus();
   
   }
   
   
   /* ============================================================
      79. EVENTO TELEFONE
      ============================================================ */
   
   function handlePhoneInput(event) {
   
       event.target.value =
           maskPhone(
               event.target.value
           );
   
       clearFieldState(
           event.target
       );
   
       updateCustomerStatus();
   
   }
   
   
   /* ============================================================
      80. EVENTO CEP
      ============================================================ */
   
   function handleCEPInput(event) {
   
       const previousCEP =
           checkoutState.cepConsultado;
   
       event.target.value =
           maskCEP(
               event.target.value
           );
   
       const currentCEP =
           onlyNumbers(
               event.target.value
           );
   
       clearFieldState(
           event.target
       );
   
       if (
           previousCEP &&
           previousCEP !== currentCEP
       ) {
   
           checkoutState.cepConsultado =
               null;
   
           resetShipping();
   
       }
   
       updateAddressStatus();
   
       if (
           currentCEP.length === 8
       ) {
   
           searchCEP();
   
       }
   
   }
   
   
   /* ============================================================
      81. EVENTOS CLIENTE
      ============================================================ */
   
   function bindCustomerEvents() {
   
       checkoutElements.customerName
           ?.addEventListener(
               "input",
               () => {
   
                   clearFieldState(
                       checkoutElements.customerName
                   );
   
                   updateCustomerStatus();
   
               }
           );
   
   
       checkoutElements.customerEmail
           ?.addEventListener(
               "input",
               () => {
   
                   clearFieldState(
                       checkoutElements.customerEmail
                   );
   
                   updateCustomerStatus();
   
               }
           );
   
   
       checkoutElements.customerPhone
           ?.addEventListener(
               "input",
               handlePhoneInput
           );
   
   
       checkoutElements.customerDocument
           ?.addEventListener(
               "input",
               handleCPFInput
           );
   
   }
   
   
   /* ============================================================
      82. EVENTOS ENDEREÇO
      ============================================================ */
   
   function bindAddressEvents() {
   
       checkoutElements.addressCep
           ?.addEventListener(
               "input",
               handleCEPInput
           );
   
   
       checkoutElements.addressCep
           ?.addEventListener(
               "blur",
               searchCEP
           );
   
   
       const fields = [
   
           checkoutElements.addressStreet,
           checkoutElements.addressNumber,
           checkoutElements.addressDistrict,
           checkoutElements.addressCity,
           checkoutElements.addressState
   
       ];
   
   
       fields.forEach(
           (field) => {
   
               field?.addEventListener(
                   "input",
                   () => {
   
                       clearFieldState(
                           field
                       );
   
                       updateAddressStatus();
   
                   }
               );
   
   
               field?.addEventListener(
                   "change",
                   () => {
   
                       clearFieldState(
                           field
                       );
   
                       updateAddressStatus();
   
                   }
               );
   
           }
       );
   
   }
   
   
   /* ============================================================
      83. EVENTOS FRETE
      ============================================================ */
   
   function bindShippingEvents() {
   
       checkoutElements.shippingOptions
           ?.addEventListener(
               "change",
               handleShippingChange
           );
   
   }
   
   
   /* ============================================================
      84. EVENTOS PAGAMENTO
      ============================================================ */
   
   function bindPaymentEvents() {
   
       $$(
           'input[name="paymentMethod"]'
       ).forEach(
           (input) => {
   
               input.addEventListener(
                   "change",
                   handlePaymentChange
               );
   
           }
       );
   
   }
   
   
   /* ============================================================
      85. EVENTOS OBSERVAÇÃO
      ============================================================ */
   
   function bindNotesEvents() {
   
       checkoutElements.orderNotes
           ?.addEventListener(
               "input",
               updateNotesCounter
           );
   
   }
   
   
   /* ============================================================
      86. EVENTOS TERMOS
      ============================================================ */
   
   function bindTermsEvents() {
   
       checkoutElements.acceptTerms
           ?.addEventListener(
               "change",
               () => {
   
                   if (
                       checkoutElements.acceptTerms.checked &&
                       checkoutElements.termsError
                   ) {
   
                       checkoutElements.termsError.textContent =
                           "";
   
                   }
   
               }
           );
   
   }
   
   
   /* ============================================================
      87. EVENTOS BOTÕES
      ============================================================ */
   
   function bindButtonEvents() {
   
       checkoutElements.finishOrderButton
           ?.addEventListener(
               "click",
               openConfirmationModal
           );
   
   
       checkoutElements.confirmationModalClose
           ?.addEventListener(
               "click",
               () => {
   
                   closeModal(
                       checkoutElements.confirmationModal
                   );
   
               }
           );
   
   
       checkoutElements.confirmationCancel
           ?.addEventListener(
               "click",
               () => {
   
                   closeModal(
                       checkoutElements.confirmationModal
                   );
   
               }
           );
   
   
       checkoutElements.confirmationConfirm
           ?.addEventListener(
               "click",
               createOrder
           );
   
   
       checkoutElements.errorModalClose
           ?.addEventListener(
               "click",
               () => {
   
                   closeModal(
                       checkoutElements.errorModal
                   );
   
               }
           );
   
   
       checkoutElements.checkoutErrorButton
           ?.addEventListener(
               "click",
               () => {
   
                   closeModal(
                       checkoutElements.errorModal
                   );
   
               }
           );
   
   
       checkoutElements.viewOrderButton
           ?.addEventListener(
               "click",
               () => {
   
                   window.location.href =
                       "pedidos.html";
   
               }
           );
   
   }
   
   
   /* ============================================================
      88. FECHAR MODAL PELO FUNDO
      ============================================================ */
   
   function bindOverlayEvents() {
   
       [
           checkoutElements.confirmationModal,
           checkoutElements.errorModal
   
       ].forEach(
           (overlay) => {
   
               overlay?.addEventListener(
                   "click",
                   (event) => {
   
                       if (
                           event.target === overlay
                       ) {
   
                           closeModal(
                               overlay
                           );
   
                       }
   
                   }
               );
   
           }
       );
   
   }
   
   
   /* ============================================================
      89. ESC
      ============================================================ */
   
   function bindKeyboardEvents() {
   
       document.addEventListener(
           "keydown",
           (event) => {
   
               if (
                   event.key !== "Escape"
               ) {
                   return;
               }
   
               if (
                   checkoutState.processing
               ) {
                   return;
               }
   
               const modal =
                   $(
                       ".checkout-modal-overlay:not([hidden])"
                   );
   
               if (
                   modal &&
                   modal !== checkoutElements.successModal
               ) {
   
                   closeModal(
                       modal
                   );
   
               }
   
           }
       );
   
   }
   
   
   /* ============================================================
      90. ANO
      ============================================================ */
   
   function renderYear() {
   
       if (
           checkoutElements.currentYear
       ) {
   
           checkoutElements.currentYear.textContent =
               new Date().getFullYear();
   
       }
   
   }
   
   
   /* ============================================================
      91. IMAGENS COM ERRO
      ============================================================ */
   
   function bindImageFallback() {
   
       document.addEventListener(
           "error",
           (event) => {
   
               const image =
                   event.target;
   
               if (
                   !(image instanceof HTMLImageElement)
               ) {
                   return;
               }
   
               if (
                   !image.closest(
                       ".checkout-summary-product-image"
                   )
               ) {
                   return;
               }
   
               const container =
                   image.parentElement;
   
               image.remove();
   
               if (
                   container &&
                   !container.querySelector(
                       ".fa-gears"
                   )
               ) {
   
                   const icon =
                       document.createElement(
                           "i"
                       );
   
                   icon.className =
                       "fa-solid fa-gears";
   
                   icon.setAttribute(
                       "aria-hidden",
                       "true"
                   );
   
                   container.prepend(
                       icon
                   );
   
               }
   
           },
           true
       );
   
   }
   
   
   /* ============================================================
      92. ANIMAÇÃO DOS CARDS AO SCROLL
      ============================================================ */
   
   function setupScrollAnimations() {
   
       const cards =
           $$(".checkout-card");
   
       if (
           !("IntersectionObserver" in window)
       ) {
   
           cards.forEach(
               (card) => {
   
                   card.classList.add(
                       "is-visible"
                   );
   
               }
           );
   
           return;
   
       }
   
       const observer =
           new IntersectionObserver(
               (entries) => {
   
                   entries.forEach(
                       (entry) => {
   
                           if (
                               entry.isIntersecting
                           ) {
   
                               entry.target.classList.add(
                                   "is-visible"
                               );
   
                               observer.unobserve(
                                   entry.target
                               );
   
                           }
   
                       }
                   );
   
               },
               {
                   threshold: 0.08,
                   rootMargin:
                       "0px 0px -40px 0px"
               }
           );
   
   
       cards.forEach(
           (card) => {
   
               observer.observe(
                   card
               );
   
           }
       );
   
   }
   
   
   /* ============================================================
      93. VALIDAÇÃO PROGRESSIVA
      ============================================================ */
   
   function setupProgressiveValidation() {
   
       const inputs =
           $$(
               ".checkout-field input, .checkout-field select"
           );
   
       inputs.forEach(
           (input) => {
   
               input.addEventListener(
                   "blur",
                   () => {
   
                       /*
                           Não mostra erro agressivamente
                           enquanto o cliente ainda está
                           preenchendo.
   
                           Apenas remove o estado visual
                           quando estiver vazio.
                       */
   
                       if (!input.value.trim()) {
   
                           clearFieldState(
                               input
                           );
   
                       }
   
                   }
               );
   
           }
       );
   
   }
   
   
   /* ============================================================
      94. API DE FRETE FUTURA
      ============================================================ */
   
   /*
       Quando o backend possuir rota de frete,
       esta função poderá ser ativada.
   
       Exemplo esperado:
   
       POST /api/frete/calcular
   
       {
           cep: "00000000",
           itens: [...]
       }
   
       Retorno:
   
       {
           opcoes: [
               {
                   id: "normal",
                   nome: "Entrega normal",
                   prazo: 5,
                   valor: 24.90
               }
           ]
       }
   */
   
   async function requestShippingFromBackend() {
   
       const cep =
           onlyNumbers(
               checkoutElements.addressCep
                   ?.value
           );
   
       if (cep.length !== 8) {
           return [];
       }
   
       try {
   
           const response =
               await fetch(
                   `${CHECKOUT_CONFIG.apiBase}/frete/calcular`,
                   {
                       method: "POST",
   
                       headers: {
                           "Content-Type":
                               "application/json"
                       },
   
                       body:
                           JSON.stringify({
                               cep,
                               itens:
                                   getOrderItems()
                           })
                   }
               );
   
           if (!response.ok) {
               return [];
           }
   
           const data =
               await response.json();
   
           return (
               data.opcoes ??
               data.options ??
               []
           );
   
       } catch (error) {
   
           console.warn(
               "[Checkout] Serviço de frete ainda não disponível:",
               error
           );
   
           return [];
   
       }
   
   }
   
   
   /* ============================================================
      95. SINCRONIZAÇÃO DO CARRINHO
      ============================================================ */
   
   function handleStorageChange(event) {
   
       const cartKeys = [
           CHECKOUT_CONFIG.storage.carrinho,
           "cart",
           "carrinhoAPC"
       ];
   
       if (
           !cartKeys.includes(
               event.key
           )
       ) {
           return;
       }
   
       loadCart();
   
       if (
           handleEmptyCheckout()
       ) {
           return;
       }
   
       renderHeroQuantity();
   
       renderSummaryProducts();
   
       recalculateTotals();
   
   }
   
   
   /* ============================================================
      96. BIND STORAGE
      ============================================================ */
   
   function bindStorageEvents() {
   
       window.addEventListener(
           "storage",
           handleStorageChange
       );
   
   }
   
   
   /* ============================================================
      97. INICIALIZAR DADOS
      ============================================================ */
   
   function initializeData() {
   
       loadCart();
   
       loadCustomer();
   
   }
   
   
   /* ============================================================
      98. RENDERIZAÇÃO INICIAL
      ============================================================ */
   
   function initialRender() {
   
       renderYear();
   
       const empty =
           handleEmptyCheckout();
   
       if (empty) {
           return;
       }
   
       renderHeroQuantity();
   
       renderSummaryProducts();
   
       renderCustomer();
   
       recalculateTotals();
   
       updateNotesCounter();
   
   }
   
   
   /* ============================================================
      99. BIND GERAL
      ============================================================ */
   
   function bindEvents() {
   
       bindCustomerEvents();
   
       bindAddressEvents();
   
       bindShippingEvents();
   
       bindPaymentEvents();
   
       bindNotesEvents();
   
       bindTermsEvents();
   
       bindButtonEvents();
   
       bindOverlayEvents();
   
       bindKeyboardEvents();
   
       bindImageFallback();
   
       bindStorageEvents();
   
   }
   
   
   /* ============================================================
      100. INICIALIZAÇÃO
      ============================================================ */
   
   function initCheckout() {
   
       try {
   
           cacheElements();
   
           initializeData();
   
           initialRender();
   
           bindEvents();
   
           setupScrollAnimations();
   
           setupProgressiveValidation();
   
           console.info(
               "[Auto Peça Certa] Checkout inicializado."
           );
   
       } catch (error) {
   
           console.error(
               "[Auto Peça Certa] Falha ao iniciar checkout:",
               error
           );
   
       }
   
   }
   
   
   /* ============================================================
      101. DOM READY
      ============================================================ */
   
   if (
       document.readyState === "loading"
   ) {
   
       document.addEventListener(
           "DOMContentLoaded",
           initCheckout
       );
   
   } else {
   
       initCheckout();
   
   }
   
   
   /* ============================================================
      102. EXPORT INTERNO PARA INTEGRAÇÃO FUTURA
      ============================================================ */
   
   window.AutoPecaCheckout = {
   
       getState() {
   
           return {
               ...checkoutState
           };
   
       },
   
   
       refreshCart() {
   
           loadCart();
   
           handleEmptyCheckout();
   
           renderHeroQuantity();
   
           renderSummaryProducts();
   
           recalculateTotals();
   
       },
   
   
       setShippingOptions(options) {
   
           renderShippingOptions(
               options
           );
   
       },
   
   
       recalculate() {
   
           recalculateTotals();
   
       },
   
   
       showToast(message) {
   
           showToast(message);
   
       }
   
   };

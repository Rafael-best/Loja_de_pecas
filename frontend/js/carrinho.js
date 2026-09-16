(() => {

  "use strict";


  /* =========================================================
     CONFIGURAÇÃO
  ========================================================== */

  const STORAGE_KEY = "carrinho";


  /* =========================================================
     HELPERS
  ========================================================== */

  const $ = (
      selector,
      context = document
  ) => context.querySelector(selector);


  const $$ = (
      selector,
      context = document
  ) => [
      ...context.querySelectorAll(selector)
  ];


  const escapeHTML = (value = "") => {

      return String(value)

          .replaceAll("&", "&amp;")

          .replaceAll("<", "&lt;")

          .replaceAll(">", "&gt;")

          .replaceAll('"', "&quot;")

          .replaceAll("'", "&#039;");

  };


  const toNumber = (value) => {

      const number =
          Number(value);

      return Number.isFinite(number)
          ? number
          : 0;

  };


  const formatCurrency = (value) => {

      return new Intl.NumberFormat(
          "pt-BR",
          {
              style: "currency",
              currency: "BRL"
          }
      ).format(
          toNumber(value)
      );

  };


  /* =========================================================
     DOM
  ========================================================== */

  const cartLayout =
      $("#cartLayout");


  const cartItems =
      $("#cartItems");


  const emptyCart =
      $("#emptyCart");


  const cartProductCount =
      $("#cartProductCount");


  const heroCartItems =
      $("#heroCartItems");


  const cartCount =
      $("#cartCount");


  const summarySubtotal =
      $("#summarySubtotal");


  const summaryDiscount =
      $("#summaryDiscount");


  const summaryTotal =
      $("#summaryTotal");


  const clearCartButton =
      $("#clearCartButton");


  const checkoutButton =
      $("#checkoutButton");


  const removeModal =
      $("#removeModal");


  const removeModalText =
      $("#removeModalText");


  const removeModalConfirm =
      $("#removeModalConfirm");


  const clearModal =
      $("#clearModal");


  /* =========================================================
     ESTADO
  ========================================================== */

  let cart = [];

  let pendingRemoveIndex = null;

  let toastTimer = null;


  /* =========================================================
     COMPATIBILIDADE COM O SITE.JS
  ========================================================== */

  const getCart = () => {

      /*
       * Primeiro tentamos utilizar o sistema global
       * já existente no site.js.
       */

      if (
          window.APC &&
          typeof window.APC.getCart === "function"
      ) {

          const globalCart =
              window.APC.getCart();

          return Array.isArray(globalCart)
              ? globalCart
              : [];

      }


      /*
       * Fallback direto para localStorage.
       */

      try {

          const stored =
              JSON.parse(
                  localStorage.getItem(
                      STORAGE_KEY
                  ) || "[]"
              );

          return Array.isArray(stored)
              ? stored
              : [];

      } catch (error) {

          console.error(
              "Erro ao ler o carrinho:",
              error
          );

          return [];

      }

  };


  const saveCart = () => {

      /*
       * Usa APC quando disponível.
       */

      if (
          window.APC &&
          typeof window.APC.setCart === "function"
      ) {

          window.APC.setCart(cart);

      } else {

          localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(cart)
          );

      }


      /*
       * Atualiza contador global se existir.
       */

      if (
          window.APC &&
          typeof window.APC.updateCartCount === "function"
      ) {

          window.APC.updateCartCount();

      }


      updateHeaderCartCount();

  };


  /* =========================================================
     NORMALIZAÇÃO DOS ITENS
  ========================================================== */

  const getItemId = (item) => {

      return (
          item.id_produto ??
          item.produto_id ??
          item.id ??
          ""
      );

  };


  const getItemName = (item) => {

      return (
          item.nome ??
          item.nome_produto ??
          item.descricao ??
          "Produto"
      );

  };


  const getItemPrice = (item) => {

      return toNumber(
          item.preco ??
          item.preco_produto ??
          item.valor ??
          0
      );

  };


  const getItemImage = (item) => {

      return (
          item.imagem ??
          item.imagem_url ??
          item.url_imagem ??
          ""
      );

  };


  const getItemQuantity = (item) => {

      const quantity =
          parseInt(
              item.quantidade ??
              item.qtd ??
              1,
              10
          );

      return Number.isFinite(quantity)
          ? Math.max(1, quantity)
          : 1;

  };


  const getItemBrand = (item) => {

      return (
          item.marca ??
          item.nome_marca ??
          ""
      );

  };


  const getItemCategory = (item) => {

      return (
          item.categoria ??
          item.nome_categoria ??
          ""
      );

  };


  const getItemCode = (item) => {

      return (
          item.codigo ??
          item.codigo_produto ??
          item.sku ??
          ""
      );

  };


  /* =========================================================
     NORMALIZAR CARRINHO
  ========================================================== */

  const normalizeCart = () => {

      cart = getCart()
          .filter(
              item =>
                  item &&
                  typeof item === "object"
          )
          .map(
              item => ({
                  ...item,
                  quantidade:
                      getItemQuantity(item)
              })
          );

  };


  /* =========================================================
     CÁLCULOS
  ========================================================== */

  const calculateCart = () => {

      let subtotal = 0;

      let quantity = 0;


      cart.forEach(item => {

          const itemQuantity =
              getItemQuantity(item);

          const itemPrice =
              getItemPrice(item);


          quantity +=
              itemQuantity;


          subtotal +=
              itemPrice *
              itemQuantity;

      });


      /*
       * Desconto = 0 por enquanto.
       *
       * Não vamos inventar cupom ou desconto.
       * Quando o backend tiver promoção real,
       * o valor pode vir do servidor.
       */

      const discount = 0;


      const total =
          Math.max(
              0,
              subtotal - discount
          );


      return {

          subtotal,

          discount,

          total,

          quantity

      };

  };


  /* =========================================================
     HEADER COUNT
  ========================================================== */

  const updateHeaderCartCount = () => {

      const totals =
          calculateCart();


      if (cartCount) {

          cartCount.textContent =
              String(
                  totals.quantity
              );

      }


      if (heroCartItems) {

          heroCartItems.textContent =
              totals.quantity === 1
                  ? "1 item"
                  : `${totals.quantity} itens`;

      }

  };


  /* =========================================================
     TOAST
  ========================================================== */

  const showToast = (message) => {

      const toast =
          $("#cartToast");


      const toastText =
          $("#cartToastText");


      if (
          !toast ||
          !toastText
      ) {

          return;

      }


      toastText.textContent =
          message;


      toast.classList.add(
          "visible"
      );


      if (toastTimer) {

          clearTimeout(
              toastTimer
          );

      }


      toastTimer =
          setTimeout(
              () => {

                  toast.classList.remove(
                      "visible"
                  );

              },
              2500
          );

  };


  /* =========================================================
     IMAGEM DO PRODUTO
  ========================================================== */

  const createImageMarkup = (item) => {

      const image =
          getItemImage(item);


      const name =
          escapeHTML(
              getItemName(item)
          );


      if (!image) {

          return `
              <span class="cart-item-image-fallback">
                  <i class="fa-solid fa-gears"></i>
              </span>
          `;

      }


      return `
          <img
              src="${escapeHTML(image)}"
              alt="${name}"
              loading="lazy"
          >

          <span
              class="cart-item-image-fallback"
              hidden
          >
              <i class="fa-solid fa-gears"></i>
          </span>
      `;

  };


  /* =========================================================
     CRIAR ITEM
  ========================================================== */

  const createCartItem = (
      item,
      index
  ) => {

      const article =
          document.createElement(
              "article"
          );


      article.className =
          "cart-item";


      article.dataset.index =
          String(index);


      const name =
          escapeHTML(
              getItemName(item)
          );


      const brand =
          escapeHTML(
              getItemBrand(item)
          );


      const category =
          escapeHTML(
              getItemCategory(item)
          );


      const code =
          escapeHTML(
              getItemCode(item)
          );


      const price =
          getItemPrice(item);


      const quantity =
          getItemQuantity(item);


      const total =
          price * quantity;


      const categoryText =
          brand ||
          category ||
          "AUTO PEÇA CERTA";


      article.innerHTML = `

          <div class="cart-item-image">

              ${createImageMarkup(item)}

          </div>


          <div class="cart-item-info">

              <span class="cart-item-category">

                  ${categoryText}

              </span>


              <h3 class="cart-item-title">

                  ${name}

              </h3>


              ${
                  code
                      ? `
                          <span class="cart-item-code">
                              Código: ${code}
                          </span>
                      `
                      : `
                          <span class="cart-item-code"></span>
                      `
              }


              <span class="cart-item-stock">

                  <i class="fa-solid fa-circle"></i>

                  Adicionado ao carrinho

              </span>


              <div class="cart-item-bottom">

                  <div
                      class="cart-quantity"
                      aria-label="Quantidade"
                  >

                      <button
                          type="button"
                          data-action="decrease"
                          aria-label="Diminuir quantidade"
                      >

                          <i class="fa-solid fa-minus"></i>

                      </button>


                      <span>

                          ${quantity}

                      </span>


                      <button
                          type="button"
                          data-action="increase"
                          aria-label="Aumentar quantidade"
                      >

                          <i class="fa-solid fa-plus"></i>

                      </button>

                  </div>


                  <button
                      type="button"
                      class="cart-remove-button"
                      data-action="remove"
                  >

                      <i class="fa-regular fa-trash-can"></i>

                      Remover

                  </button>

              </div>

          </div>


          <div class="cart-item-price">

              <small>
                  Valor unitário
              </small>


              <span class="cart-item-unit-price">

                  ${formatCurrency(price)}

              </span>


              <strong class="cart-item-total">

                  ${formatCurrency(total)}

              </strong>

          </div>

      `;


      /*
       * Tratamento de erro de imagem
       * sem usar inline onerror.
       */

      const image =
          $("img", article);


      const fallback =
          $(".cart-item-image-fallback", article);


      if (
          image &&
          fallback
      ) {

          image.addEventListener(
              "error",
              () => {

                  image.hidden = true;

                  fallback.hidden = false;

              },
              {
                  once: true
              }
          );

      }


      /*
       * Diminuir quantidade
       */

      $(
          '[data-action="decrease"]',
          article
      )
          ?.addEventListener(
              "click",
              () => {

                  decreaseQuantity(
                      index
                  );

              }
          );


      /*
       * Aumentar quantidade
       */

      $(
          '[data-action="increase"]',
          article
      )
          ?.addEventListener(
              "click",
              () => {

                  increaseQuantity(
                      index
                  );

              }
          );


      /*
       * Remover
       */

      $(
          '[data-action="remove"]',
          article
      )
          ?.addEventListener(
              "click",
              () => {

                  openRemoveModal(
                      index
                  );

              }
          );


      /*
       * Entrada animada.
       */

      window.setTimeout(
          () => {

              article.classList.add(
                  "visible"
              );

          },
          45 + index * 60
      );


      return article;

  };


  /* =========================================================
     RENDERIZAR
  ========================================================== */

  const renderCart = () => {

      const totals =
          calculateCart();


      /*
       * Carrinho vazio.
       */

      if (cart.length === 0) {

          if (cartLayout) {

              cartLayout.hidden =
                  true;

          }


          if (emptyCart) {

              emptyCart.hidden =
                  false;

          }


          updateSummary();

          updateHeaderCartCount();

          return;

      }


      /*
       * Carrinho com produtos.
       */

      if (cartLayout) {

          cartLayout.hidden =
              false;

      }


      if (emptyCart) {

          emptyCart.hidden =
              true;

      }


      if (cartItems) {

          cartItems.innerHTML =
              "";


          cart.forEach(
              (
                  item,
                  index
              ) => {

                  cartItems.appendChild(
                      createCartItem(
                          item,
                          index
                      )
                  );

              }
          );

      }


      if (cartProductCount) {

          cartProductCount.textContent =
              totals.quantity === 1
                  ? "1 produto"
                  : `${totals.quantity} produtos`;

      }


      updateSummary();

      updateHeaderCartCount();

  };


  /* =========================================================
     RESUMO
  ========================================================== */

  const updateSummary = () => {

      const totals =
          calculateCart();


      if (summarySubtotal) {

          summarySubtotal.textContent =
              formatCurrency(
                  totals.subtotal
              );

      }


      if (summaryDiscount) {

          summaryDiscount.textContent =
              totals.discount > 0
                  ? `- ${formatCurrency(
                      totals.discount
                  )}`
                  : formatCurrency(0);

      }


      if (summaryTotal) {

          summaryTotal.textContent =
              formatCurrency(
                  totals.total
              );

      }

  };


  /* =========================================================
     AUMENTAR QUANTIDADE
  ========================================================== */

  const increaseQuantity = (index) => {

      const item =
          cart[index];


      if (!item) {

          return;

      }


      item.quantidade =
          getItemQuantity(item) + 1;


      saveCart();

      renderCart();


      showToast(
          "Quantidade atualizada."
      );

  };


  /* =========================================================
     DIMINUIR QUANTIDADE
  ========================================================== */

  const decreaseQuantity = (index) => {

      const item =
          cart[index];


      if (!item) {

          return;

      }


      const current =
          getItemQuantity(item);


      if (current <= 1) {

          openRemoveModal(
              index
          );

          return;

      }


      item.quantidade =
          current - 1;


      saveCart();

      renderCart();


      showToast(
          "Quantidade atualizada."
      );

  };


  /* =========================================================
     MODAL REMOVER
  ========================================================== */

  const openRemoveModal = (index) => {

      const item =
          cart[index];


      if (
          !item ||
          !removeModal
      ) {

          return;

      }


      pendingRemoveIndex =
          index;


      if (removeModalText) {

          removeModalText.textContent =
              `“${getItemName(item)}” será removido do seu carrinho.`;

      }


      removeModal.hidden =
          false;


      document.body.style.overflow =
          "hidden";


      removeModalConfirm
          ?.focus();

  };


  const closeRemoveModal = () => {

      if (!removeModal) {

          return;

      }


      removeModal.hidden =
          true;


      pendingRemoveIndex =
          null;


      document.body.style.overflow =
          "";

  };


  const confirmRemove = () => {

      if (
          pendingRemoveIndex === null ||
          !cart[pendingRemoveIndex]
      ) {

          closeRemoveModal();

          return;

      }


      const index =
          pendingRemoveIndex;


      const element =
          document.querySelector(
              `.cart-item[data-index="${index}"]`
          );


      /*
       * Fechamos o modal antes da animação.
       */

      removeModal.hidden =
          true;


      document.body.style.overflow =
          "";


      if (element) {

          element.classList.add(
              "removing"
          );

      }


      window.setTimeout(
          () => {

              cart.splice(
                  index,
                  1
              );


              pendingRemoveIndex =
                  null;


              saveCart();

              renderCart();


              showToast(
                  "Produto removido do carrinho."
              );

          },
          element
              ? 390
              : 0
      );

  };


  /* =========================================================
     EVENTOS MODAL REMOVER
  ========================================================== */

  $("#removeModalClose")
      ?.addEventListener(
          "click",
          closeRemoveModal
      );


  $("#removeModalCancel")
      ?.addEventListener(
          "click",
          closeRemoveModal
      );


  removeModalConfirm
      ?.addEventListener(
          "click",
          confirmRemove
      );


  removeModal
      ?.addEventListener(
          "click",
          event => {

              if (
                  event.target ===
                  removeModal
              ) {

                  closeRemoveModal();

              }

          }
      );


  /* =========================================================
     LIMPAR CARRINHO
  ========================================================== */

  const openClearModal = () => {

      if (
          cart.length === 0 ||
          !clearModal
      ) {

          return;

      }


      clearModal.hidden =
          false;


      document.body.style.overflow =
          "hidden";


      $("#clearModalConfirm")
          ?.focus();

  };


  const closeClearModal = () => {

      if (!clearModal) {

          return;

      }


      clearModal.hidden =
          true;


      document.body.style.overflow =
          "";

  };


  const confirmClearCart = () => {

      cart = [];


      saveCart();

      closeClearModal();

      renderCart();


      showToast(
          "Carrinho limpo."
      );

  };


  clearCartButton
      ?.addEventListener(
          "click",
          openClearModal
      );


  $("#clearModalClose")
      ?.addEventListener(
          "click",
          closeClearModal
      );


  $("#clearModalCancel")
      ?.addEventListener(
          "click",
          closeClearModal
      );


  $("#clearModalConfirm")
      ?.addEventListener(
          "click",
          confirmClearCart
      );


  clearModal
      ?.addEventListener(
          "click",
          event => {

              if (
                  event.target ===
                  clearModal
              ) {

                  closeClearModal();

              }

          }
      );


  /* =========================================================
     ESC FECHA MODAIS
  ========================================================== */

  document.addEventListener(
      "keydown",
      event => {

          if (
              event.key !== "Escape"
          ) {

              return;

          }


          if (
              removeModal &&
              !removeModal.hidden
          ) {

              closeRemoveModal();

          }


          if (
              clearModal &&
              !clearModal.hidden
          ) {

              closeClearModal();

          }

      }
  );


  /* =========================================================
     CHECKOUT
  ========================================================== */

  const goToCheckout = () => {

      if (
          cart.length === 0
      ) {

          showToast(
              "Seu carrinho está vazio."
          );

          return;

      }


      /*
       * Salva novamente antes de sair
       * para garantir que checkout.html
       * receba o estado mais recente.
       */

      saveCart();


      window.location.href =
          "checkout.html";

  };


  checkoutButton
      ?.addEventListener(
          "click",
          goToCheckout
      );


  /* =========================================================
     BUSCA DO HEADER
  ========================================================== */

  $("#headerSearchForm")
      ?.addEventListener(
          "submit",
          event => {

              event.preventDefault();


              const value =
                  $("#headerSearchInput")
                      ?.value
                      .trim() || "";


              if (!value) {

                  window.location.href =
                      "produtos.html";

                  return;

              }


              window.location.href =
                  `produtos.html?busca=${encodeURIComponent(
                      value
                  )}`;

          }
      );


  /* =========================================================
     USUÁRIO DO HEADER
  ========================================================== */

  const updateUserHeader = () => {

      const label =
          $("#headerAccountLabel");


      const accountButton =
          $("#accountButton");


      if (
          !label ||
          !accountButton
      ) {

          return;

      }


      try {

          const client =
              JSON.parse(
                  localStorage.getItem(
                      "clienteLogado"
                  ) || "null"
              );


          if (!client) {

              label.textContent =
                  "Entrar";


              accountButton.href =
                  "login.html";


              return;

          }


          const name =
              client.nome ??
              client.nome_cliente ??
              client.name ??
              "Minha conta";


          const firstName =
              String(name)
                  .trim()
                  .split(/\s+/)[0];


          label.textContent =
              firstName ||
              "Minha conta";


          accountButton.href =
              "perfil.html";


      } catch (error) {

          console.warn(
              "Não foi possível ler clienteLogado.",
              error
          );


          label.textContent =
              "Entrar";


          accountButton.href =
              "login.html";

      }

  };


  /* =========================================================
     PARTÍCULAS
  ========================================================== */

  const createParticles = () => {

      const container =
          $("#cartParticles");


      if (!container) {

          return;

      }


      const reducedMotion =
          window.matchMedia(
              "(prefers-reduced-motion: reduce)"
          ).matches;


      if (reducedMotion) {

          return;

      }


      const quantity =
          window.innerWidth <= 700
              ? 11
              : 22;


      const fragment =
          document.createDocumentFragment();


      for (
          let index = 0;
          index < quantity;
          index += 1
      ) {

          const particle =
              document.createElement(
                  "span"
              );


          particle.className =
              "cart-particle";


          particle.style.setProperty(
              "--x",
              `${45 + Math.random() * 53}%`
          );


          particle.style.setProperty(
              "--y",
              `${10 + Math.random() * 80}%`
          );


          particle.style.setProperty(
              "--size",
              `${1 + Math.random() * 2.5}px`
          );


          particle.style.setProperty(
              "--duration",
              `${5 + Math.random() * 7}s`
          );


          particle.style.setProperty(
              "--delay",
              `${-Math.random() * 8}s`
          );


          fragment.appendChild(
              particle
          );

      }


      container.appendChild(
          fragment
      );

  };


  /* =========================================================
     ANO
  ========================================================== */

  const updateYear = () => {

      const year =
          $("#currentYear");


      if (year) {

          year.textContent =
              String(
                  new Date().getFullYear()
              );

      }

  };


  /* =========================================================
     MENU MOBILE - FALLBACK
  ========================================================== */

  const initializeMobileMenuFallback = () => {

      /*
       * O site.js deve cuidar do menu global.
       *
       * Esse fallback só é ativado caso o site.js
       * não tenha marcado o menu como inicializado.
       */

      const toggle =
          $("#menuToggle");


      const close =
          $("#menuClose");


      const menu =
          $("#mobileMenu");


      const overlay =
          $("#mobileMenuOverlay");


      if (
          !toggle ||
          !close ||
          !menu ||
          !overlay
      ) {

          return;

      }


      if (
          menu.dataset.cartFallbackInitialized ===
          "true"
      ) {

          return;

      }


      menu.dataset.cartFallbackInitialized =
          "true";


      const openMenu = () => {

          menu.classList.add(
              "open"
          );


          overlay.classList.add(
              "open"
          );

      };


      const closeMenu = () => {

          menu.classList.remove(
              "open"
          );


          overlay.classList.remove(
              "open"
          );

      };


      /*
       * Não adicionamos listeners se o site.js
       * já marcou explicitamente o elemento.
       */

      if (
          toggle.dataset.siteInitialized ===
          "true"
      ) {

          return;

      }


      toggle.addEventListener(
          "click",
          openMenu
      );


      close.addEventListener(
          "click",
          closeMenu
      );


      overlay.addEventListener(
          "click",
          closeMenu
      );

  };


  /* =========================================================
     SINCRONIZAÇÃO ENTRE ABAS
  ========================================================== */

  window.addEventListener(
      "storage",
      event => {

          if (
              event.key !== STORAGE_KEY
          ) {

              return;

          }


          normalizeCart();

          renderCart();

      }
  );


  /* =========================================================
     INICIALIZAÇÃO
  ========================================================== */

  const init = () => {

      normalizeCart();

      updateUserHeader();

      updateYear();

      createParticles();

      initializeMobileMenuFallback();

      renderCart();

  };


  /*
   * Como o script está no final do HTML,
   * o DOM já está disponível.
   */

  init();


})();
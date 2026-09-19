/* ============================================================
   AUTO PEÇA CERTA
   PERFIL.JS
   Página: Minha Conta
   ============================================================ */

   "use strict";


   /* ============================================================
      01. CONFIGURAÇÃO
      ============================================================ */
   
   const PROFILE_CONFIG = {
   
       API_BASE_URL: "http://localhost:3000/api",
   
       STORAGE: {
           CLIENTE: "clienteLogado",
           PEDIDO: "clientePedido",
           CARRINHO: "carrinho",
           TEMA: "tema",
           AVATAR_PREFIX: "apc_avatar_"
       },
   
       ENDPOINTS: {
           CLIENTES: "/clientes",
           PEDIDOS: "/pedidos",
           ENDERECOS: "/enderecos"
       },
   
       MAX_AVATAR_SIZE: 3 * 1024 * 1024,
   
       ALLOWED_AVATAR_TYPES: [
           "image/jpeg",
           "image/png",
           "image/webp"
       ],
   
       TOAST_DURATION: 3500
   
   };
   
   
   /* ============================================================
      02. ESTADO
      ============================================================ */
   
   const ProfileState = {
   
       cliente: null,
   
       pedidos: [],
   
       enderecos: [],
   
       enderecoEditando: null,
   
       enderecoExcluindo: null,
   
       avatarLocal: null,
   
       carregando: false
   
   };
   
   
   /* ============================================================
      03. SELETORES
      ============================================================ */
   
   const $ = (selector, context = document) =>
       context.querySelector(selector);
   
   const $$ = (selector, context = document) =>
       Array.from(context.querySelectorAll(selector));
   
   
   /* ============================================================
      04. ELEMENTOS
      ============================================================ */
   
   const Elements = {};
   
   
   /* ============================================================
      05. INICIALIZAÇÃO
      ============================================================ */
   
   document.addEventListener("DOMContentLoaded", () => {
   
       cacheElements();
   
       initializeProfile();
   
   });
   
   
   async function initializeProfile() {
   
       configureCurrentYear();
   
       configureTheme();
   
       configureHeader();
   
       configureMobileMenu();
   
       configureSearch();
   
       configureBackToTop();
   
       configureRevealAnimations();
   
       configureModals();
   
       configureAvatar();
   
       configureForms();
   
       configurePasswordVisibility();
   
       configureLogout();
   
       configureAddressActions();
   
       configureGlobalEvents();
   
       updateCartCounters();
   
       const cliente = getStoredClient();
   
       if (!cliente) {
   
           showLoggedOutState();
   
           return;
   
       }
   
       ProfileState.cliente = normalizeClient(cliente);
   
       showLoggedInState();
   
       renderClient(ProfileState.cliente);
   
       loadSavedAvatar();
   
       await refreshProfileData();
   
   }
   
   
   /* ============================================================
      06. CACHE DOS ELEMENTOS
      ============================================================ */
   
   function cacheElements() {
   
       Elements.profileLoginRequired =
           $("#profileLoginRequired");
   
       Elements.profileAuthenticated =
           $("#profileAuthenticated");
   
   
       /* HEADER */
   
       Elements.siteHeader =
           $("#siteHeader");
   
       Elements.themeToggle =
           $("#themeToggle");
   
       Elements.headerSearchForm =
           $("#headerSearchForm");
   
       Elements.headerSearchInput =
           $("#headerSearchInput");
   
       Elements.headerAccountLabel =
           $("#headerAccountLabel");
   
       Elements.headerAvatar =
           $("#headerAvatar");
   
       Elements.headerAvatarImage =
           $("#headerAvatarImage");
   
       Elements.headerAvatarInitial =
           $("#headerAvatarInitial");
   
       Elements.headerCartCount =
           $("#headerCartCount");
   
   
       /* MOBILE */
   
       Elements.mobileMenuButton =
           $("#mobileMenuButton");
   
       Elements.mobileMenu =
           $("#mobileMenu");
   
       Elements.mobileMenuClose =
           $("#mobileMenuClose");
   
       Elements.mobileMenuOverlay =
           $("#mobileMenuOverlay");
   
   
       /* HERO */
   
       Elements.profileHeroName =
           $("#profileHeroName");
   
       Elements.profileHeroEmail =
           $("#profileHeroEmail");
   
       Elements.profileCustomerSince =
           $("#profileCustomerSince");
   
       Elements.profileAvatar =
           $("#profileAvatar");
   
       Elements.profileAvatarImage =
           $("#profileAvatarImage");
   
       Elements.profileAvatarInitial =
           $("#profileAvatarInitial");
   
       Elements.profileAvatarEdit =
           $("#profileAvatarEdit");
   
       Elements.profileAvatarInput =
           $("#profileAvatarInput");
   
       Elements.profileEditMainButton =
           $("#profileEditMainButton");
   
   
       /* CONTADORES */
   
       Elements.profileOrdersCount =
           $("#profileOrdersCount");
   
       Elements.profileActiveOrdersCount =
           $("#profileActiveOrdersCount");
   
       Elements.profileCartCount =
           $("#profileCartCount");
   
   
       /* DADOS */
   
       Elements.profileFullName =
           $("#profileFullName");
   
       Elements.profileEmail =
           $("#profileEmail");
   
       Elements.profilePhone =
           $("#profilePhone");
   
       Elements.profileCpf =
           $("#profileCpf");
   
       Elements.editPersonalDataButton =
           $("#editPersonalDataButton");
   
   
       /* ENDEREÇOS */
   
       Elements.profileAddressLoading =
           $("#profileAddressLoading");
   
       Elements.profileAddressList =
           $("#profileAddressList");
   
       Elements.profileAddressEmpty =
           $("#profileAddressEmpty");
   
       Elements.addAddressButton =
           $("#addAddressButton");
   
       Elements.addFirstAddressButton =
           $("#addFirstAddressButton");
   
   
       /* PEDIDOS */
   
       Elements.profileRecentOrdersLoading =
           $("#profileRecentOrdersLoading");
   
       Elements.profileRecentOrders =
           $("#profileRecentOrders");
   
       Elements.profileRecentOrdersEmpty =
           $("#profileRecentOrdersEmpty");
   
   
       /* PERFIL MODAL */
   
       Elements.editProfileModal =
           $("#editProfileModal");
   
       Elements.editProfileModalClose =
           $("#editProfileModalClose");
   
       Elements.editProfileCancelButton =
           $("#editProfileCancelButton");
   
       Elements.editProfileForm =
           $("#editProfileForm");
   
       Elements.editProfileName =
           $("#editProfileName");
   
       Elements.editProfileEmail =
           $("#editProfileEmail");
   
       Elements.editProfilePhone =
           $("#editProfilePhone");
   
       Elements.editProfileCpf =
           $("#editProfileCpf");
   
       Elements.editProfileMessage =
           $("#editProfileMessage");
   
       Elements.editProfileSaveButton =
           $("#editProfileSaveButton");
   
   
       /* ENDEREÇO MODAL */
   
       Elements.addressModal =
           $("#addressModal");
   
       Elements.addressModalTitle =
           $("#addressModalTitle");
   
       Elements.addressModalClose =
           $("#addressModalClose");
   
       Elements.addressCancelButton =
           $("#addressCancelButton");
   
       Elements.addressForm =
           $("#addressForm");
   
       Elements.addressId =
           $("#addressId");
   
       Elements.addressCep =
           $("#addressCep");
   
       Elements.addressLabel =
           $("#addressLabel");
   
       Elements.addressStreet =
           $("#addressStreet");
   
       Elements.addressNumber =
           $("#addressNumber");
   
       Elements.addressComplement =
           $("#addressComplement");
   
       Elements.addressNeighborhood =
           $("#addressNeighborhood");
   
       Elements.addressCity =
           $("#addressCity");
   
       Elements.addressState =
           $("#addressState");
   
       Elements.addressDefault =
           $("#addressDefault");
   
       Elements.addressFormMessage =
           $("#addressFormMessage");
   
       Elements.addressSaveButton =
           $("#addressSaveButton");
   
   
       /* EXCLUSÃO */
   
       Elements.deleteAddressModal =
           $("#deleteAddressModal");
   
       Elements.deleteAddressMessage =
           $("#deleteAddressMessage");
   
       Elements.deleteAddressCancelButton =
           $("#deleteAddressCancelButton");
   
       Elements.deleteAddressConfirmButton =
           $("#deleteAddressConfirmButton");
   
   
       /* SENHA */
   
       Elements.changePasswordButton =
           $("#changePasswordButton");
   
       Elements.passwordModal =
           $("#passwordModal");
   
       Elements.passwordModalClose =
           $("#passwordModalClose");
   
       Elements.passwordCancelButton =
           $("#passwordCancelButton");
   
       Elements.passwordForm =
           $("#passwordForm");
   
       Elements.currentPassword =
           $("#currentPassword");
   
       Elements.newPassword =
           $("#newPassword");
   
       Elements.confirmPassword =
           $("#confirmPassword");
   
       Elements.passwordFormMessage =
           $("#passwordFormMessage");
   
       Elements.passwordSaveButton =
           $("#passwordSaveButton");
   
   
       /* LOGOUT */
   
       Elements.profileLogoutButton =
           $("#profileLogoutButton");
   
       Elements.logoutModal =
           $("#logoutModal");
   
       Elements.logoutCancelButton =
           $("#logoutCancelButton");
   
       Elements.logoutConfirmButton =
           $("#logoutConfirmButton");
   
   
       /* OUTROS */
   
       Elements.profileToast =
           $("#profileToast");
   
       Elements.profileToastText =
           $("#profileToastText");
   
       Elements.backToTop =
           $("#backToTop");
   
   }
   
   
   /* ============================================================
      07. LOCAL STORAGE
      ============================================================ */
   
   function getStoredClient() {
   
       const raw =
           localStorage.getItem(
               PROFILE_CONFIG.STORAGE.CLIENTE
           );
   
       if (!raw) {
           return null;
       }
   
       try {
   
           const parsed = JSON.parse(raw);
   
           if (!parsed || typeof parsed !== "object") {
               return null;
           }
   
           return parsed;
   
       } catch (error) {
   
           console.warn(
               "clienteLogado não contém JSON válido.",
               error
           );
   
           return null;
   
       }
   
   }
   
   
   function saveStoredClient(cliente) {
   
       if (!cliente) {
           return;
       }
   
       localStorage.setItem(
           PROFILE_CONFIG.STORAGE.CLIENTE,
           JSON.stringify(cliente)
       );
   
   }
   
   
   /* ============================================================
      08. NORMALIZAÇÃO DO CLIENTE
      ============================================================ */
   
   function normalizeClient(cliente = {}) {
   
       return {
   
           ...cliente,
   
           id_cliente:
               cliente.id_cliente ??
               cliente.id ??
               cliente.cliente_id ??
               null,
   
           nome:
               cliente.nome ??
               cliente.nome_completo ??
               cliente.name ??
               "",
   
           email:
               cliente.email ??
               cliente.e_mail ??
               "",
   
           telefone:
               cliente.telefone ??
               cliente.celular ??
               cliente.phone ??
               "",
   
           cpf:
               cliente.cpf ??
               cliente.documento ??
               "",
   
           foto:
               cliente.foto ??
               cliente.avatar ??
               cliente.foto_perfil ??
               "",
   
           data_cadastro:
               cliente.data_cadastro ??
               cliente.created_at ??
               cliente.criado_em ??
               null
   
       };
   
   }
   
   
   /* ============================================================
      09. ESTADO DE LOGIN
      ============================================================ */
   
   function showLoggedOutState() {
   
       if (Elements.profileLoginRequired) {
   
           Elements.profileLoginRequired.hidden = false;
   
       }
   
       if (Elements.profileAuthenticated) {
   
           Elements.profileAuthenticated.hidden = true;
   
       }
   
       if (Elements.headerAccountLabel) {
   
           Elements.headerAccountLabel.textContent =
               "Entrar";
   
       }
   
   }
   
   
   function showLoggedInState() {
   
       if (Elements.profileLoginRequired) {
   
           Elements.profileLoginRequired.hidden = true;
   
       }
   
       if (Elements.profileAuthenticated) {
   
           Elements.profileAuthenticated.hidden = false;
   
       }
   
   }
   
   
   /* ============================================================
      10. RENDERIZAÇÃO DO CLIENTE
      ============================================================ */
   
   function renderClient(cliente) {
   
       if (!cliente) {
           return;
       }
   
       const nome =
           safeText(cliente.nome) ||
           "Cliente";
   
       const email =
           safeText(cliente.email) ||
           "E-mail não informado";
   
       const telefone =
           safeText(cliente.telefone) ||
           "Não informado";
   
       const cpf =
           cliente.cpf
               ? formatCPF(cliente.cpf)
               : "Não informado";
   
   
       setText(
           Elements.profileHeroName,
           firstNameOrFullName(nome)
       );
   
       setText(
           Elements.profileHeroEmail,
           email
       );
   
       setText(
           Elements.profileFullName,
           nome
       );
   
       setText(
           Elements.profileEmail,
           email
       );
   
       setText(
           Elements.profilePhone,
           telefone
       );
   
       setText(
           Elements.profileCpf,
           cpf
       );
   
       setText(
           Elements.headerAccountLabel,
           firstName(nome)
       );
   
       renderCustomerSince(cliente);
   
       renderInitials(nome);
   
   }
   
   
   /* ============================================================
      11. DATA DE CADASTRO
      ============================================================ */
   
   function renderCustomerSince(cliente) {
   
       if (!Elements.profileCustomerSince) {
           return;
       }
   
       if (!cliente.data_cadastro) {
   
           Elements.profileCustomerSince.innerHTML = `
               <i class="fa-solid fa-calendar-check"></i>
               Cliente Auto Peça Certa
           `;
   
           return;
   
       }
   
       const date =
           parseDate(cliente.data_cadastro);
   
       if (!date) {
           return;
       }
   
       const formatted =
           new Intl.DateTimeFormat(
               "pt-BR",
               {
                   month: "long",
                   year: "numeric"
               }
           ).format(date);
   
       Elements.profileCustomerSince.innerHTML = `
           <i class="fa-solid fa-calendar-check"></i>
           Cliente desde ${escapeHTML(formatted)}
       `;
   
   }
   
   
   /* ============================================================
      12. INICIAIS
      ============================================================ */
   
   function renderInitials(nome) {
   
       const initials =
           getInitials(nome);
   
       if (Elements.profileAvatarInitial) {
   
           Elements.profileAvatarInitial.textContent =
               initials;
   
       }
   
       if (Elements.headerAvatarInitial) {
   
           Elements.headerAvatarInitial.textContent =
               initials;
   
       }
   
   }
   
   
   function getInitials(nome) {
   
       if (!nome) {
           return "AP";
       }
   
       const partes =
           nome
               .trim()
               .split(/\s+/)
               .filter(Boolean);
   
       if (!partes.length) {
           return "AP";
       }
   
       if (partes.length === 1) {
   
           return partes[0]
               .substring(0, 2)
               .toUpperCase();
   
       }
   
       return (
           partes[0][0] +
           partes[partes.length - 1][0]
       ).toUpperCase();
   
   }
   
   
   /* ============================================================
      13. AVATAR
      ============================================================ */
   
   function configureAvatar() {
   
       if (Elements.profileAvatarEdit) {
   
           Elements.profileAvatarEdit.addEventListener(
               "click",
               () => {
   
                   Elements.profileAvatarInput?.click();
   
               }
           );
   
       }
   
       if (Elements.profileAvatarInput) {
   
           Elements.profileAvatarInput.addEventListener(
               "change",
               handleAvatarSelection
           );
   
       }
   
   }
   
   
   function handleAvatarSelection(event) {
   
       const file =
           event.target.files?.[0];
   
       if (!file) {
           return;
       }
   
       if (
           !PROFILE_CONFIG.ALLOWED_AVATAR_TYPES
               .includes(file.type)
       ) {
   
           showToast(
               "Use uma imagem JPG, PNG ou WEBP.",
               "error"
           );
   
           event.target.value = "";
   
           return;
   
       }
   
       if (
           file.size >
           PROFILE_CONFIG.MAX_AVATAR_SIZE
       ) {
   
           showToast(
               "A imagem deve ter no máximo 3 MB.",
               "error"
           );
   
           event.target.value = "";
   
           return;
   
       }
   
       const reader =
           new FileReader();
   
       Elements.profileAvatar
           ?.classList.add("is-loading");
   
       reader.onload = () => {
   
           const result =
               String(reader.result || "");
   
           if (!result) {
               return;
           }
   
           saveAvatarLocally(result);
   
           renderAvatar(result);
   
           Elements.profileAvatar
               ?.classList.remove("is-loading");
   
           showToast(
               "Foto de perfil atualizada."
           );
   
       };
   
       reader.onerror = () => {
   
           Elements.profileAvatar
               ?.classList.remove("is-loading");
   
           showToast(
               "Não foi possível carregar a imagem.",
               "error"
           );
   
       };
   
       reader.readAsDataURL(file);
   
   }
   
   
   function avatarStorageKey() {
   
       const id =
           getClientId();
   
       return (
           PROFILE_CONFIG.STORAGE.AVATAR_PREFIX +
           String(id || "cliente")
       );
   
   }
   
   
   function saveAvatarLocally(dataURL) {
   
       try {
   
           localStorage.setItem(
               avatarStorageKey(),
               dataURL
           );
   
           ProfileState.avatarLocal =
               dataURL;
   
       } catch (error) {
   
           console.warn(
               "Não foi possível salvar o avatar.",
               error
           );
   
       }
   
   }
   
   
   function loadSavedAvatar() {
   
       let avatar = null;
   
       try {
   
           avatar =
               localStorage.getItem(
                   avatarStorageKey()
               );
   
       } catch (error) {
   
           console.warn(error);
   
       }
   
       if (!avatar) {
   
           avatar =
               ProfileState.cliente?.foto ||
               null;
   
       }
   
       if (avatar) {
   
           ProfileState.avatarLocal =
               avatar;
   
           renderAvatar(avatar);
   
       }
   
   }
   
   
   function renderAvatar(source) {
   
       if (!source) {
           return;
       }
   
       if (Elements.profileAvatarImage) {
   
           Elements.profileAvatarImage.src =
               source;
   
           Elements.profileAvatarImage.hidden =
               false;
   
       }
   
       if (Elements.profileAvatarInitial) {
   
           Elements.profileAvatarInitial.style.display =
               "none";
   
       }
   
       if (Elements.headerAvatarImage) {
   
           Elements.headerAvatarImage.src =
               source;
   
           Elements.headerAvatarImage.hidden =
               false;
   
       }
   
       if (Elements.headerAvatarInitial) {
   
           Elements.headerAvatarInitial.style.display =
               "none";
   
       }
   
   }
   
   
   /* ============================================================
      14. ID CLIENTE
      ============================================================ */
   
   function getClientId() {
   
       return (
           ProfileState.cliente?.id_cliente ??
           ProfileState.cliente?.id ??
           null
       );
   
   }
   
   
   /* ============================================================
      15. ATUALIZAR DADOS
      ============================================================ */
   
   async function refreshProfileData() {
   
       const idCliente =
           getClientId();
   
       if (!idCliente) {
   
           renderAddresses([]);
   
           renderOrders([]);
   
           return;
   
       }
   
       await Promise.allSettled([
   
           loadClientFromAPI(idCliente),
   
           loadOrders(idCliente),
   
           loadAddresses(idCliente)
   
       ]);
   
   }
   
   
   /* ============================================================
      16. CLIENTE API
      ============================================================ */
   
   async function loadClientFromAPI(idCliente) {
   
       const candidates = [
   
           `${PROFILE_CONFIG.API_BASE_URL}${PROFILE_CONFIG.ENDPOINTS.CLIENTES}/${encodeURIComponent(idCliente)}`,
   
           `${PROFILE_CONFIG.API_BASE_URL}${PROFILE_CONFIG.ENDPOINTS.CLIENTES}?id_cliente=${encodeURIComponent(idCliente)}`
   
       ];
   
       for (const url of candidates) {
   
           try {
   
               const response =
                   await fetch(url, {
                       method: "GET",
                       headers: {
                           Accept: "application/json"
                       }
                   });
   
               if (!response.ok) {
                   continue;
               }
   
               const data =
                   await response.json();
   
               const cliente =
                   extractSingleClient(data);
   
               if (!cliente) {
                   continue;
               }
   
               const normalized =
                   normalizeClient({
                       ...ProfileState.cliente,
                       ...cliente
                   });
   
               ProfileState.cliente =
                   normalized;
   
               saveStoredClient(normalized);
   
               renderClient(normalized);
   
               return normalized;
   
           } catch (error) {
   
               console.warn(
                   "Falha ao buscar cliente:",
                   error
               );
   
           }
   
       }
   
       return null;
   
   }
   
   
   function extractSingleClient(data) {
   
       if (!data) {
           return null;
       }
   
       if (Array.isArray(data)) {
   
           return data[0] || null;
   
       }
   
       if (
           Array.isArray(data.clientes)
       ) {
   
           return data.clientes[0] || null;
   
       }
   
       if (data.cliente) {
   
           return data.cliente;
   
       }
   
       if (data.data) {
   
           if (Array.isArray(data.data)) {
   
               return data.data[0] || null;
   
           }
   
           if (typeof data.data === "object") {
   
               return data.data;
   
           }
   
       }
   
       if (typeof data === "object") {
   
           return data;
   
       }
   
       return null;
   
   }
   
   
   /* ============================================================
      17. PEDIDOS
      ============================================================ */
   
   async function loadOrders(idCliente) {
   
       setOrdersLoading(true);
   
       try {
   
           const url =
               `${PROFILE_CONFIG.API_BASE_URL}` +
               `${PROFILE_CONFIG.ENDPOINTS.PEDIDOS}` +
               `?id_cliente=${encodeURIComponent(idCliente)}`;
   
           const response =
               await fetch(url, {
                   method: "GET",
                   headers: {
                       Accept: "application/json"
                   }
               });
   
           if (!response.ok) {
   
               throw new Error(
                   `HTTP ${response.status}`
               );
   
           }
   
           const data =
               await response.json();
   
           const pedidos =
               normalizeArrayResponse(
                   data,
                   [
                       "pedidos",
                       "orders"
                   ]
               );
   
           ProfileState.pedidos =
               pedidos;
   
           renderOrders(pedidos);
   
       } catch (error) {
   
           console.warn(
               "Não foi possível carregar os pedidos.",
               error
           );
   
           ProfileState.pedidos = [];
   
           renderOrders([]);
   
       } finally {
   
           setOrdersLoading(false);
   
       }
   
   }
   
   
   /* ============================================================
      18. RENDERIZAR PEDIDOS
      ============================================================ */
   
   function renderOrders(pedidos) {
   
       const list =
           Array.isArray(pedidos)
               ? pedidos
               : [];
   
       updateOrderCounters(list);
   
       if (!Elements.profileRecentOrders) {
           return;
       }
   
       Elements.profileRecentOrders.innerHTML =
           "";
   
       if (!list.length) {
   
           if (Elements.profileRecentOrdersEmpty) {
   
               Elements.profileRecentOrdersEmpty.hidden =
                   false;
   
           }
   
           return;
   
       }
   
       if (Elements.profileRecentOrdersEmpty) {
   
           Elements.profileRecentOrdersEmpty.hidden =
               true;
   
       }
   
       const ordered =
           [...list]
               .sort(compareOrdersByDate)
               .slice(0, 3);
   
       ordered.forEach((pedido) => {
   
           const element =
               createRecentOrderElement(pedido);
   
           Elements.profileRecentOrders
               .appendChild(element);
   
       });
   
   }
   
   
   function createRecentOrderElement(pedido) {
   
       const article =
           document.createElement("article");
   
       article.className =
           "profile-recent-order";
   
       const id =
           pedido.id_pedido ??
           pedido.id ??
           pedido.numero_pedido ??
           "";
   
       const numero =
           pedido.numero_pedido ??
           pedido.codigo ??
           id ??
           "Pedido";
   
       const status =
           pedido.status ??
           pedido.situacao ??
           "Em processamento";
   
       const date =
           pedido.data_pedido ??
           pedido.created_at ??
           pedido.data ??
           null;
   
       const total =
           pedido.valor_total ??
           pedido.total ??
           pedido.valor ??
           null;
   
       const statusClass =
           getOrderStatusClass(status);
   
       article.innerHTML = `
   
           <div class="profile-recent-order-icon">
   
               <i class="fa-solid fa-box"></i>
   
           </div>
   
           <div class="profile-recent-order-info">
   
               <strong>
                   Pedido ${escapeHTML(
                       formatOrderNumber(numero)
                   )}
               </strong>
   
               <small>
                   ${escapeHTML(
                       formatDate(date)
                   )}
               </small>
   
           </div>
   
           <span
               class="profile-order-status ${statusClass}"
           >
               ${escapeHTML(status)}
           </span>
   
           ${
               total !== null &&
               total !== undefined
                   ? `
                       <strong
                           class="profile-recent-order-value"
                       >
                           ${escapeHTML(
                               formatCurrency(total)
                           )}
                       </strong>
                   `
                   : ""
           }
   
           <a
               href="pedidos.html${id ? `?pedido=${encodeURIComponent(id)}` : ""}"
               class="profile-recent-order-link"
               aria-label="Ver pedido"
           >
               <i class="fa-solid fa-arrow-right"></i>
           </a>
   
       `;
   
       return article;
   
   }
   
   
   function updateOrderCounters(pedidos) {
   
       const total =
           pedidos.length;
   
       const ativos =
           pedidos.filter((pedido) => {
   
               const status =
                   normalizeString(
                       pedido.status ??
                       pedido.situacao ??
                       ""
                   );
   
               const finalizados = [
                   "entregue",
                   "finalizado",
                   "concluido",
                   "concluído",
                   "cancelado",
                   "cancelada"
               ];
   
               return !finalizados.includes(status);
   
           }).length;
   
       setText(
           Elements.profileOrdersCount,
           String(total)
       );
   
       setText(
           Elements.profileActiveOrdersCount,
           String(ativos)
       );
   
   }
   
   
   function setOrdersLoading(isLoading) {
   
       if (Elements.profileRecentOrdersLoading) {
   
           Elements.profileRecentOrdersLoading.hidden =
               !isLoading;
   
       }
   
   }
   
   
   /* ============================================================
      19. ENDEREÇOS
      ============================================================ */
   
   async function loadAddresses(idCliente) {
   
       setAddressLoading(true);
   
       try {
   
           const url =
               `${PROFILE_CONFIG.API_BASE_URL}` +
               `${PROFILE_CONFIG.ENDPOINTS.ENDERECOS}` +
               `?id_cliente=${encodeURIComponent(idCliente)}`;
   
           const response =
               await fetch(url, {
                   method: "GET",
                   headers: {
                       Accept: "application/json"
                   }
               });
   
           if (!response.ok) {
   
               throw new Error(
                   `HTTP ${response.status}`
               );
   
           }
   
           const data =
               await response.json();
   
           const enderecos =
               normalizeArrayResponse(
                   data,
                   [
                       "enderecos",
                       "addresses"
                   ]
               );
   
           ProfileState.enderecos =
               enderecos;
   
           renderAddresses(enderecos);
   
       } catch (error) {
   
           console.warn(
               "Não foi possível carregar endereços.",
               error
           );
   
           ProfileState.enderecos = [];
   
           renderAddresses([]);
   
       } finally {
   
           setAddressLoading(false);
   
       }
   
   }
   
   
   /* ============================================================
      20. RENDER ENDEREÇOS
      ============================================================ */
   
   function renderAddresses(enderecos) {
   
       const list =
           Array.isArray(enderecos)
               ? enderecos
               : [];
   
       if (!Elements.profileAddressList) {
           return;
       }
   
       Elements.profileAddressList.innerHTML =
           "";
   
       if (!list.length) {
   
           if (Elements.profileAddressEmpty) {
   
               Elements.profileAddressEmpty.hidden =
                   false;
   
           }
   
           return;
   
       }
   
       if (Elements.profileAddressEmpty) {
   
           Elements.profileAddressEmpty.hidden =
               true;
   
       }
   
       list.forEach((endereco) => {
   
           Elements.profileAddressList
               .appendChild(
                   createAddressElement(endereco)
               );
   
       });
   
   }
   
   
   function createAddressElement(endereco) {
   
       const article =
           document.createElement("article");
   
       const id =
           endereco.id_endereco ??
           endereco.id ??
           "";
   
       const principal =
           Boolean(
               endereco.principal ??
               endereco.padrao ??
               endereco.default ??
               false
           );
   
       article.className =
           `profile-address-card${
               principal
                   ? " is-default"
                   : ""
           }`;
   
       article.dataset.addressId =
           String(id);
   
       const identificacao =
           endereco.identificacao ??
           endereco.apelido ??
           endereco.nome ??
           "Endereço";
   
       const rua =
           endereco.rua ??
           endereco.logradouro ??
           "";
   
       const numero =
           endereco.numero ??
           "";
   
       const complemento =
           endereco.complemento ??
           "";
   
       const bairro =
           endereco.bairro ??
           "";
   
       const cidade =
           endereco.cidade ??
           "";
   
       const estado =
           endereco.estado ??
           endereco.uf ??
           "";
   
       const cep =
           endereco.cep ??
           "";
   
       const line1 =
           [rua, numero]
               .filter(Boolean)
               .join(", ");
   
       const line2 =
           [
               complemento,
               bairro
           ]
               .filter(Boolean)
               .join(" • ");
   
       const line3 =
           [
               cidade,
               estado
           ]
               .filter(Boolean)
               .join(" - ");
   
       article.innerHTML = `
   
           <div class="profile-address-card-header">
   
               <div class="profile-address-card-title">
   
                   <span class="profile-address-card-icon">
   
                       <i class="fa-solid fa-location-dot"></i>
   
                   </span>
   
                   <div>
   
                       <strong>
                           ${escapeHTML(identificacao)}
                       </strong>
   
                       ${
                           principal
                               ? `
                                   <span
                                       class="profile-address-default"
                                   >
                                       <i class="fa-solid fa-circle-check"></i>
                                       Principal
                                   </span>
                               `
                               : ""
                       }
   
                   </div>
   
               </div>
   
               <div class="profile-address-actions">
   
                   <button
                       type="button"
                       class="profile-address-action"
                       data-action="edit-address"
                       data-address-id="${escapeAttribute(id)}"
                       aria-label="Editar endereço"
                       title="Editar endereço"
                   >
                       <i class="fa-solid fa-pen"></i>
                   </button>
   
                   <button
                       type="button"
                       class="profile-address-action delete"
                       data-action="delete-address"
                       data-address-id="${escapeAttribute(id)}"
                       aria-label="Excluir endereço"
                       title="Excluir endereço"
                   >
                       <i class="fa-solid fa-trash"></i>
                   </button>
   
               </div>
   
           </div>
   
           ${
               line1
                   ? `<p>${escapeHTML(line1)}</p>`
                   : ""
           }
   
           ${
               line2
                   ? `<p>${escapeHTML(line2)}</p>`
                   : ""
           }
   
           ${
               line3
                   ? `<p>${escapeHTML(line3)}</p>`
                   : ""
           }
   
           ${
               cep
                   ? `<p>CEP ${escapeHTML(formatCEP(cep))}</p>`
                   : ""
           }
   
       `;
   
       return article;
   
   }
   
   
   function setAddressLoading(isLoading) {
   
       if (Elements.profileAddressLoading) {
   
           Elements.profileAddressLoading.hidden =
               !isLoading;
   
       }
   
   }
   
   
   /* ============================================================
      21. AÇÕES ENDEREÇO
      ============================================================ */
   
   function configureAddressActions() {
   
       Elements.addAddressButton
           ?.addEventListener(
               "click",
               openNewAddressModal
           );
   
       Elements.addFirstAddressButton
           ?.addEventListener(
               "click",
               openNewAddressModal
           );
   
       Elements.profileAddressList
           ?.addEventListener(
               "click",
               handleAddressListClick
           );
   
       Elements.deleteAddressConfirmButton
           ?.addEventListener(
               "click",
               confirmDeleteAddress
           );
   
   }
   
   
   function handleAddressListClick(event) {
   
       const button =
           event.target.closest(
               "[data-action]"
           );
   
       if (!button) {
           return;
       }
   
       const action =
           button.dataset.action;
   
       const id =
           button.dataset.addressId;
   
       if (action === "edit-address") {
   
           openEditAddressModal(id);
   
       }
   
       if (action === "delete-address") {
   
           openDeleteAddressModal(id);
   
       }
   
   }
   
   
   /* ============================================================
      22. NOVO ENDEREÇO
      ============================================================ */
   
   function openNewAddressModal() {
   
       ProfileState.enderecoEditando =
           null;
   
       Elements.addressForm?.reset();
   
       clearFormErrors(
           Elements.addressForm
       );
   
       clearMessage(
           Elements.addressFormMessage
       );
   
       setText(
           Elements.addressModalTitle,
           "Novo endereço"
       );
   
       if (Elements.addressId) {
   
           Elements.addressId.value =
               "";
   
       }
   
       openModal(
           Elements.addressModal
       );
   
       setTimeout(() => {
   
           Elements.addressCep?.focus();
   
       }, 100);
   
   }
   
   
   /* ============================================================
      23. EDITAR ENDEREÇO
      ============================================================ */
   
   function openEditAddressModal(id) {
   
       const endereco =
           ProfileState.enderecos.find(
               (item) =>
                   String(
                       item.id_endereco ??
                       item.id
                   ) === String(id)
           );
   
       if (!endereco) {
   
           showToast(
               "Endereço não encontrado.",
               "error"
           );
   
           return;
   
       }
   
       ProfileState.enderecoEditando =
           endereco;
   
       clearFormErrors(
           Elements.addressForm
       );
   
       clearMessage(
           Elements.addressFormMessage
       );
   
       setText(
           Elements.addressModalTitle,
           "Editar endereço"
       );
   
       setInputValue(
           Elements.addressId,
           endereco.id_endereco ??
           endereco.id
       );
   
       setInputValue(
           Elements.addressCep,
           formatCEP(endereco.cep ?? "")
       );
   
       setInputValue(
           Elements.addressLabel,
           endereco.identificacao ??
           endereco.apelido ??
           ""
       );
   
       setInputValue(
           Elements.addressStreet,
           endereco.rua ??
           endereco.logradouro ??
           ""
       );
   
       setInputValue(
           Elements.addressNumber,
           endereco.numero ??
           ""
       );
   
       setInputValue(
           Elements.addressComplement,
           endereco.complemento ??
           ""
       );
   
       setInputValue(
           Elements.addressNeighborhood,
           endereco.bairro ??
           ""
       );
   
       setInputValue(
           Elements.addressCity,
           endereco.cidade ??
           ""
       );
   
       setInputValue(
           Elements.addressState,
           endereco.estado ??
           endereco.uf ??
           ""
       );
   
       if (Elements.addressDefault) {
   
           Elements.addressDefault.checked =
               Boolean(
                   endereco.principal ??
                   endereco.padrao ??
                   false
               );
   
       }
   
       openModal(
           Elements.addressModal
       );
   
   }
   
   
   /* ============================================================
      24. EXCLUIR ENDEREÇO
      ============================================================ */
   
   function openDeleteAddressModal(id) {
   
       const endereco =
           ProfileState.enderecos.find(
               (item) =>
                   String(
                       item.id_endereco ??
                       item.id
                   ) === String(id)
           );
   
       if (!endereco) {
   
           showToast(
               "Endereço não encontrado.",
               "error"
           );
   
           return;
   
       }
   
       ProfileState.enderecoExcluindo =
           endereco;
   
       clearMessage(
           Elements.deleteAddressMessage
       );
   
       openModal(
           Elements.deleteAddressModal
       );
   
   }
   
   
   async function confirmDeleteAddress() {
   
       const endereco =
           ProfileState.enderecoExcluindo;
   
       if (!endereco) {
           return;
       }
   
       const id =
           endereco.id_endereco ??
           endereco.id;
   
       if (!id) {
   
           showMessage(
               Elements.deleteAddressMessage,
               "Não foi possível identificar o endereço."
           );
   
           return;
   
       }
   
       setButtonLoading(
           Elements.deleteAddressConfirmButton,
           true,
           "Excluindo..."
       );
   
       try {
   
           const url =
               `${PROFILE_CONFIG.API_BASE_URL}` +
               `${PROFILE_CONFIG.ENDPOINTS.ENDERECOS}` +
               `/${encodeURIComponent(id)}`;
   
           const response =
               await fetch(url, {
                   method: "DELETE",
                   headers: {
                       Accept: "application/json"
                   }
               });
   
           if (!response.ok) {
   
               throw await createAPIError(response);
   
           }
   
           ProfileState.enderecos =
               ProfileState.enderecos.filter(
                   (item) =>
                       String(
                           item.id_endereco ??
                           item.id
                       ) !== String(id)
               );
   
           renderAddresses(
               ProfileState.enderecos
           );
   
           closeModal(
               Elements.deleteAddressModal
           );
   
           ProfileState.enderecoExcluindo =
               null;
   
           showToast(
               "Endereço excluído."
           );
   
       } catch (error) {
   
           showMessage(
               Elements.deleteAddressMessage,
               error.message ||
               "Não foi possível excluir o endereço."
           );
   
       } finally {
   
           setButtonLoading(
               Elements.deleteAddressConfirmButton,
               false
           );
   
       }
   
   }
   
   
   /* ============================================================
      25. FORMULÁRIOS
      ============================================================ */
   
   function configureForms() {
   
       Elements.profileEditMainButton
           ?.addEventListener(
               "click",
               openEditProfileModal
           );
   
       Elements.editPersonalDataButton
           ?.addEventListener(
               "click",
               openEditProfileModal
           );
   
       Elements.editProfileForm
           ?.addEventListener(
               "submit",
               handleProfileSubmit
           );
   
       Elements.addressForm
           ?.addEventListener(
               "submit",
               handleAddressSubmit
           );
   
       Elements.passwordForm
           ?.addEventListener(
               "submit",
               handlePasswordSubmit
           );
   
       Elements.addressCep
           ?.addEventListener(
               "input",
               handleCEPInput
           );
   
       Elements.editProfileCpf
           ?.addEventListener(
               "input",
               handleCPFInput
           );
   
       Elements.editProfilePhone
           ?.addEventListener(
               "input",
               handlePhoneInput
           );
   
   }
   
   
   /* ============================================================
      26. MODAL EDITAR PERFIL
      ============================================================ */
   
   function openEditProfileModal() {
   
       const cliente =
           ProfileState.cliente;
   
       if (!cliente) {
           return;
       }
   
       clearFormErrors(
           Elements.editProfileForm
       );
   
       clearMessage(
           Elements.editProfileMessage
       );
   
       setInputValue(
           Elements.editProfileName,
           cliente.nome
       );
   
       setInputValue(
           Elements.editProfileEmail,
           cliente.email
       );
   
       setInputValue(
           Elements.editProfilePhone,
           cliente.telefone
       );
   
       setInputValue(
           Elements.editProfileCpf,
           formatCPF(cliente.cpf ?? "")
       );
   
       openModal(
           Elements.editProfileModal
       );
   
       setTimeout(() => {
   
           Elements.editProfileName?.focus();
   
       }, 100);
   
   }
   
   
   /* ============================================================
      27. SALVAR PERFIL
      ============================================================ */
   
   async function handleProfileSubmit(event) {
   
       event.preventDefault();
   
       clearFormErrors(
           Elements.editProfileForm
       );
   
       clearMessage(
           Elements.editProfileMessage
       );
   
       const nome =
           Elements.editProfileName
               ?.value.trim() || "";
   
       const email =
           Elements.editProfileEmail
               ?.value.trim() || "";
   
       const telefone =
           Elements.editProfilePhone
               ?.value.trim() || "";
   
       const cpf =
           Elements.editProfileCpf
               ?.value.trim() || "";
   
       let valid = true;
   
       if (nome.length < 3) {
   
           setFieldError(
               Elements.editProfileName,
               "Informe seu nome completo."
           );
   
           valid = false;
   
       }
   
       if (!isValidEmail(email)) {
   
           setFieldError(
               Elements.editProfileEmail,
               "Informe um e-mail válido."
           );
   
           valid = false;
   
       }
   
       if (
           cpf &&
           onlyDigits(cpf).length !== 11
       ) {
   
           setFieldError(
               Elements.editProfileCpf,
               "Informe um CPF com 11 dígitos."
           );
   
           valid = false;
   
       }
   
       if (!valid) {
           return;
       }
   
       const idCliente =
           getClientId();
   
       const payload = {
   
           nome,
   
           email,
   
           telefone:
               onlyDigits(telefone),
   
           cpf:
               onlyDigits(cpf)
   
       };
   
       setButtonLoading(
           Elements.editProfileSaveButton,
           true,
           "Salvando..."
       );
   
       try {
   
           let serverData = null;
   
           if (idCliente) {
   
               serverData =
                   await updateClientAPI(
                       idCliente,
                       payload
                   );
   
           }
   
           const updated =
               normalizeClient({
                   ...ProfileState.cliente,
                   ...payload,
                   ...(serverData || {})
               });
   
           ProfileState.cliente =
               updated;
   
           saveStoredClient(updated);
   
           renderClient(updated);
   
           closeModal(
               Elements.editProfileModal
           );
   
           showToast(
               "Dados pessoais atualizados."
           );
   
       } catch (error) {
   
           showMessage(
               Elements.editProfileMessage,
               error.message ||
               "Não foi possível salvar seus dados."
           );
   
       } finally {
   
           setButtonLoading(
               Elements.editProfileSaveButton,
               false
           );
   
       }
   
   }
   
   
   /* ============================================================
      28. UPDATE CLIENTE API
      ============================================================ */
   
   async function updateClientAPI(
       idCliente,
       payload
   ) {
   
       const url =
           `${PROFILE_CONFIG.API_BASE_URL}` +
           `${PROFILE_CONFIG.ENDPOINTS.CLIENTES}` +
           `/${encodeURIComponent(idCliente)}`;
   
       let response =
           await fetch(url, {
   
               method: "PUT",
   
               headers: {
                   "Content-Type": "application/json",
                   Accept: "application/json"
               },
   
               body: JSON.stringify(payload)
   
           });
   
       if (
           response.status === 404 ||
           response.status === 405
       ) {
   
           response =
               await fetch(url, {
   
                   method: "PATCH",
   
                   headers: {
                       "Content-Type": "application/json",
                       Accept: "application/json"
                   },
   
                   body: JSON.stringify(payload)
   
               });
   
       }
   
       if (!response.ok) {
   
           throw await createAPIError(response);
   
       }
   
       if (
           response.status === 204
       ) {
   
           return payload;
   
       }
   
       try {
   
           const data =
               await response.json();
   
           return (
               data.cliente ??
               data.data ??
               data
           );
   
       } catch {
   
           return payload;
   
       }
   
   }
   
   
   /* ============================================================
      29. SALVAR ENDEREÇO
      ============================================================ */
   
   async function handleAddressSubmit(event) {
   
       event.preventDefault();
   
       clearFormErrors(
           Elements.addressForm
       );
   
       clearMessage(
           Elements.addressFormMessage
       );
   
       const payload =
           getAddressPayload();
   
       if (!validateAddress(payload)) {
           return;
       }
   
       const idCliente =
           getClientId();
   
       if (!idCliente) {
   
           showMessage(
               Elements.addressFormMessage,
               "Cliente não identificado."
           );
   
           return;
   
       }
   
       payload.id_cliente =
           idCliente;
   
       const idEndereco =
           Elements.addressId
               ?.value.trim() || "";
   
       setButtonLoading(
           Elements.addressSaveButton,
           true,
           "Salvando..."
       );
   
       try {
   
           let saved;
   
           if (idEndereco) {
   
               saved =
                   await updateAddressAPI(
                       idEndereco,
                       payload
                   );
   
               updateAddressState(
                   idEndereco,
                   saved
               );
   
           } else {
   
               saved =
                   await createAddressAPI(
                       payload
                   );
   
               ProfileState.enderecos.push(
                   saved
               );
   
           }
   
           if (payload.principal) {
   
               ProfileState.enderecos =
                   ProfileState.enderecos.map(
                       (item) => {
   
                           const itemId =
                               item.id_endereco ??
                               item.id;
   
                           const savedId =
                               saved.id_endereco ??
                               saved.id;
   
                           return {
                               ...item,
                               principal:
                                   String(itemId) ===
                                   String(savedId)
                           };
   
                       }
                   );
   
           }
   
           renderAddresses(
               ProfileState.enderecos
           );
   
           closeModal(
               Elements.addressModal
           );
   
           showToast(
               idEndereco
                   ? "Endereço atualizado."
                   : "Endereço adicionado."
           );
   
       } catch (error) {
   
           showMessage(
               Elements.addressFormMessage,
               error.message ||
               "Não foi possível salvar o endereço."
           );
   
       } finally {
   
           setButtonLoading(
               Elements.addressSaveButton,
               false
           );
   
       }
   
   }
   
   
   /* ============================================================
      30. PAYLOAD ENDEREÇO
      ============================================================ */
   
   function getAddressPayload() {
   
       return {
   
           cep:
               onlyDigits(
                   Elements.addressCep?.value || ""
               ),
   
           identificacao:
               Elements.addressLabel
                   ?.value.trim() || "",
   
           rua:
               Elements.addressStreet
                   ?.value.trim() || "",
   
           numero:
               Elements.addressNumber
                   ?.value.trim() || "",
   
           complemento:
               Elements.addressComplement
                   ?.value.trim() || "",
   
           bairro:
               Elements.addressNeighborhood
                   ?.value.trim() || "",
   
           cidade:
               Elements.addressCity
                   ?.value.trim() || "",
   
           estado:
               Elements.addressState
                   ?.value.trim() || "",
   
           principal:
               Boolean(
                   Elements.addressDefault
                       ?.checked
               )
   
       };
   
   }
   
   
   /* ============================================================
      31. VALIDAR ENDEREÇO
      ============================================================ */
   
   function validateAddress(payload) {
   
       let valid = true;
   
       if (
           payload.cep.length !== 8
       ) {
   
           setFieldError(
               Elements.addressCep,
               "Informe um CEP válido."
           );
   
           valid = false;
   
       }
   
       if (!payload.rua) {
   
           setFieldError(
               Elements.addressStreet,
               "Informe a rua."
           );
   
           valid = false;
   
       }
   
       if (!payload.numero) {
   
           setFieldError(
               Elements.addressNumber,
               "Informe o número."
           );
   
           valid = false;
   
       }
   
       if (!payload.bairro) {
   
           setFieldError(
               Elements.addressNeighborhood,
               "Informe o bairro."
           );
   
           valid = false;
   
       }
   
       if (!payload.cidade) {
   
           setFieldError(
               Elements.addressCity,
               "Informe a cidade."
           );
   
           valid = false;
   
       }
   
       if (!payload.estado) {
   
           setFieldError(
               Elements.addressState,
               "Selecione o estado."
           );
   
           valid = false;
   
       }
   
       return valid;
   
   }
   
   
   /* ============================================================
      32. CRIAR ENDEREÇO API
      ============================================================ */
   
   async function createAddressAPI(payload) {
   
       const url =
           `${PROFILE_CONFIG.API_BASE_URL}` +
           `${PROFILE_CONFIG.ENDPOINTS.ENDERECOS}`;
   
       const response =
           await fetch(url, {
   
               method: "POST",
   
               headers: {
                   "Content-Type": "application/json",
                   Accept: "application/json"
               },
   
               body: JSON.stringify(payload)
   
           });
   
       if (!response.ok) {
   
           throw await createAPIError(response);
   
       }
   
       const data =
           await safeJSON(response);
   
       return (
           data?.endereco ??
           data?.data ??
           data ??
           payload
       );
   
   }
   
   
   /* ============================================================
      33. UPDATE ENDEREÇO API
      ============================================================ */
   
   async function updateAddressAPI(
       id,
       payload
   ) {
   
       const url =
           `${PROFILE_CONFIG.API_BASE_URL}` +
           `${PROFILE_CONFIG.ENDPOINTS.ENDERECOS}` +
           `/${encodeURIComponent(id)}`;
   
       let response =
           await fetch(url, {
   
               method: "PUT",
   
               headers: {
                   "Content-Type": "application/json",
                   Accept: "application/json"
               },
   
               body: JSON.stringify(payload)
   
           });
   
       if (
           response.status === 404 ||
           response.status === 405
       ) {
   
           response =
               await fetch(url, {
   
                   method: "PATCH",
   
                   headers: {
                       "Content-Type": "application/json",
                       Accept: "application/json"
                   },
   
                   body: JSON.stringify(payload)
   
               });
   
       }
   
       if (!response.ok) {
   
           throw await createAPIError(response);
   
       }
   
       const data =
           await safeJSON(response);
   
       return {
           ...payload,
           ...(data?.endereco ??
               data?.data ??
               data ??
               {}),
           id_endereco:
               data?.id_endereco ??
               data?.endereco?.id_endereco ??
               id
       };
   
   }
   
   
   function updateAddressState(
       id,
       saved
   ) {
   
       ProfileState.enderecos =
           ProfileState.enderecos.map(
               (item) => {
   
                   const itemId =
                       item.id_endereco ??
                       item.id;
   
                   if (
                       String(itemId) !==
                       String(id)
                   ) {
   
                       return item;
   
                   }
   
                   return {
                       ...item,
                       ...saved
                   };
   
               }
           );
   
   }
   
   
   /* ============================================================
      34. ALTERAR SENHA
      ============================================================ */
   
   function configurePasswordVisibility() {
   
       $$(
           ".profile-password-toggle"
       ).forEach((button) => {
   
           button.addEventListener(
               "click",
               () => {
   
                   const targetId =
                       button.dataset.passwordTarget;
   
                   const input =
                       document.getElementById(
                           targetId
                       );
   
                   if (!input) {
                       return;
                   }
   
                   const visible =
                       input.type === "text";
   
                   input.type =
                       visible
                           ? "password"
                           : "text";
   
                   const icon =
                       $("i", button);
   
                   if (icon) {
   
                       icon.className =
                           visible
                               ? "fa-solid fa-eye"
                               : "fa-solid fa-eye-slash";
   
                   }
   
                   button.setAttribute(
                       "aria-label",
                       visible
                           ? "Mostrar senha"
                           : "Ocultar senha"
                   );
   
               }
           );
   
       });
   
   }
   
   
   async function handlePasswordSubmit(event) {
   
       event.preventDefault();
   
       clearFormErrors(
           Elements.passwordForm
       );
   
       clearMessage(
           Elements.passwordFormMessage
       );
   
       const atual =
           Elements.currentPassword
               ?.value || "";
   
       const nova =
           Elements.newPassword
               ?.value || "";
   
       const confirmar =
           Elements.confirmPassword
               ?.value || "";
   
       let valid = true;
   
       if (!atual) {
   
           setFieldError(
               Elements.currentPassword,
               "Informe sua senha atual."
           );
   
           valid = false;
   
       }
   
       if (nova.length < 6) {
   
           setFieldError(
               Elements.newPassword,
               "A nova senha deve ter pelo menos 6 caracteres."
           );
   
           valid = false;
   
       }
   
       if (nova !== confirmar) {
   
           setFieldError(
               Elements.confirmPassword,
               "As senhas não coincidem."
           );
   
           valid = false;
   
       }
   
       if (!valid) {
           return;
       }
   
       const idCliente =
           getClientId();
   
       if (!idCliente) {
   
           showMessage(
               Elements.passwordFormMessage,
               "Cliente não identificado."
           );
   
           return;
   
       }
   
       setButtonLoading(
           Elements.passwordSaveButton,
           true,
           "Alterando..."
       );
   
       try {
   
           await changePasswordAPI(
               idCliente,
               atual,
               nova
           );
   
           Elements.passwordForm?.reset();
   
           closeModal(
               Elements.passwordModal
           );
   
           showToast(
               "Senha alterada com sucesso."
           );
   
       } catch (error) {
   
           showMessage(
               Elements.passwordFormMessage,
               error.message ||
               "Não foi possível alterar a senha."
           );
   
       } finally {
   
           setButtonLoading(
               Elements.passwordSaveButton,
               false
           );
   
       }
   
   }
   
   
   /* ============================================================
      35. SENHA API
      ============================================================ */
   
   async function changePasswordAPI(
       idCliente,
       senhaAtual,
       novaSenha
   ) {
   
       const candidates = [
   
           `${PROFILE_CONFIG.API_BASE_URL}${PROFILE_CONFIG.ENDPOINTS.CLIENTES}/${encodeURIComponent(idCliente)}/senha`,
   
           `${PROFILE_CONFIG.API_BASE_URL}${PROFILE_CONFIG.ENDPOINTS.CLIENTES}/alterar-senha`
   
       ];
   
       let lastError = null;
   
       for (const url of candidates) {
   
           try {
   
               const response =
                   await fetch(url, {
   
                       method: "PUT",
   
                       headers: {
                           "Content-Type": "application/json",
                           Accept: "application/json"
                       },
   
                       body: JSON.stringify({
                           id_cliente: idCliente,
                           senhaAtual,
                           novaSenha,
                           senha_atual: senhaAtual,
                           nova_senha: novaSenha
                       })
   
                   });
   
               if (
                   response.ok
               ) {
   
                   return true;
   
               }
   
               if (
                   response.status !== 404 &&
                   response.status !== 405
               ) {
   
                   throw await createAPIError(
                       response
                   );
   
               }
   
           } catch (error) {
   
               lastError =
                   error;
   
           }
   
       }
   
       throw (
           lastError ||
           new Error(
               "A rota de alteração de senha ainda não está disponível na API."
           )
       );
   
   }
   
   
   /* ============================================================
      36. CEP
      ============================================================ */
   
   function handleCEPInput(event) {
   
       event.target.value =
           formatCEP(
               event.target.value
           );
   
   }
   
   
   /* ============================================================
      37. CPF
      ============================================================ */
   
   function handleCPFInput(event) {
   
       event.target.value =
           formatCPF(
               event.target.value
           );
   
   }
   
   
   /* ============================================================
      38. TELEFONE
      ============================================================ */
   
   function handlePhoneInput(event) {
   
       event.target.value =
           formatPhone(
               event.target.value
           );
   
   }
   
   
   /* ============================================================
      39. MODAIS
      ============================================================ */
   
   function configureModals() {
   
       Elements.editProfileModalClose
           ?.addEventListener(
               "click",
               () =>
                   closeModal(
                       Elements.editProfileModal
                   )
           );
   
       Elements.editProfileCancelButton
           ?.addEventListener(
               "click",
               () =>
                   closeModal(
                       Elements.editProfileModal
                   )
           );
   
   
       Elements.addressModalClose
           ?.addEventListener(
               "click",
               () =>
                   closeModal(
                       Elements.addressModal
                   )
           );
   
       Elements.addressCancelButton
           ?.addEventListener(
               "click",
               () =>
                   closeModal(
                       Elements.addressModal
                   )
           );
   
   
       Elements.deleteAddressCancelButton
           ?.addEventListener(
               "click",
               () =>
                   closeModal(
                       Elements.deleteAddressModal
                   )
           );
   
   
       Elements.changePasswordButton
           ?.addEventListener(
               "click",
               () => {
   
                   Elements.passwordForm
                       ?.reset();
   
                   clearFormErrors(
                       Elements.passwordForm
                   );
   
                   clearMessage(
                       Elements.passwordFormMessage
                   );
   
                   openModal(
                       Elements.passwordModal
                   );
   
               }
           );
   
   
       Elements.passwordModalClose
           ?.addEventListener(
               "click",
               () =>
                   closeModal(
                       Elements.passwordModal
                   )
           );
   
       Elements.passwordCancelButton
           ?.addEventListener(
               "click",
               () =>
                   closeModal(
                       Elements.passwordModal
                   )
           );
   
   
       $$(".profile-modal")
           .forEach((modal) => {
   
               modal.addEventListener(
                   "mousedown",
                   (event) => {
   
                       if (
                           event.target === modal
                       ) {
   
                           closeModal(modal);
   
                       }
   
                   }
               );
   
           });
   
   }
   
   
   function openModal(modal) {
   
       if (!modal) {
           return;
       }
   
       modal.hidden = false;
   
       document.body.style.overflow =
           "hidden";
   
   }
   
   
   function closeModal(modal) {
   
       if (!modal) {
           return;
       }
   
       modal.hidden = true;
   
       if (
           !document.querySelector(
               ".profile-modal:not([hidden])"
           )
       ) {
   
           document.body.style.overflow =
               "";
   
       }
   
   }
   
   
   /* ============================================================
      40. ESC
      ============================================================ */
   
   function configureGlobalEvents() {
   
       document.addEventListener(
           "keydown",
           (event) => {
   
               if (
                   event.key !== "Escape"
               ) {
                   return;
               }
   
               const opened =
                   document.querySelector(
                       ".profile-modal:not([hidden])"
                   );
   
               if (opened) {
   
                   closeModal(opened);
   
                   return;
   
               }
   
               closeMobileMenu();
   
           }
       );
   
   }
   
   
   /* ============================================================
      41. LOGOUT
      ============================================================ */
   
   function configureLogout() {
   
       Elements.profileLogoutButton
           ?.addEventListener(
               "click",
               () =>
                   openModal(
                       Elements.logoutModal
                   )
           );
   
       Elements.logoutCancelButton
           ?.addEventListener(
               "click",
               () =>
                   closeModal(
                       Elements.logoutModal
                   )
           );
   
       Elements.logoutConfirmButton
           ?.addEventListener(
               "click",
               logout
           );
   
   }
   
   
   function logout() {
   
       localStorage.removeItem(
           PROFILE_CONFIG.STORAGE.CLIENTE
       );
   
       localStorage.removeItem(
           PROFILE_CONFIG.STORAGE.PEDIDO
       );
   
       window.location.href =
           "login.html";
   
   }
   
   
   /* ============================================================
      42. CARRINHO
      ============================================================ */
   
   function updateCartCounters() {
   
       const count =
           getCartItemCount();
   
       setText(
           Elements.headerCartCount,
           String(count)
       );
   
       setText(
           Elements.profileCartCount,
           String(count)
       );
   
   }
   
   
   function getCartItemCount() {
   
       const possibleKeys = [
           "carrinho",
           "cart",
           "apc_carrinho"
       ];
   
       for (const key of possibleKeys) {
   
           const raw =
               localStorage.getItem(key);
   
           if (!raw) {
               continue;
           }
   
           try {
   
               const data =
                   JSON.parse(raw);
   
               const items =
                   Array.isArray(data)
                       ? data
                       : (
                           data.itens ??
                           data.items ??
                           []
                       );
   
               if (!Array.isArray(items)) {
                   continue;
               }
   
               return items.reduce(
                   (total, item) => {
   
                       const quantidade =
                           Number(
                               item.quantidade ??
                               item.qtd ??
                               item.quantity ??
                               1
                           );
   
                       return (
                           total +
                           (
                               Number.isFinite(quantidade)
                                   ? quantidade
                                   : 1
                           )
                       );
   
                   },
                   0
               );
   
           } catch {
               continue;
           }
   
       }
   
       return 0;
   
   }
   
   
   /* ============================================================
      43. TEMA
      ============================================================ */
   
   function configureTheme() {
   
       const savedTheme =
           localStorage.getItem(
               PROFILE_CONFIG.STORAGE.TEMA
           );
   
       if (
           savedTheme === "dark"
       ) {
   
           document.body.classList.add(
               "dark-theme"
           );
   
       }
   
       updateThemeIcon();
   
       Elements.themeToggle
           ?.addEventListener(
               "click",
               () => {
   
                   document.body.classList.toggle(
                       "dark-theme"
                   );
   
                   const dark =
                       document.body.classList.contains(
                           "dark-theme"
                       );
   
                   localStorage.setItem(
                       PROFILE_CONFIG.STORAGE.TEMA,
                       dark
                           ? "dark"
                           : "light"
                   );
   
                   updateThemeIcon();
   
               }
           );
   
   }
   
   
   function updateThemeIcon() {
   
       const icon =
           Elements.themeToggle
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
      44. HEADER
      ============================================================ */
   
   function configureHeader() {
   
       if (!Elements.siteHeader) {
           return;
       }
   
       let previousScroll =
           window.scrollY;
   
       let ticking =
           false;
   
       window.addEventListener(
           "scroll",
           () => {
   
               if (ticking) {
                   return;
               }
   
               ticking = true;
   
               requestAnimationFrame(() => {
   
                   const current =
                       window.scrollY;
   
                   Elements.siteHeader
                       .classList.toggle(
                           "is-scrolled",
                           current > 20
                       );
   
                   if (
                       current > previousScroll &&
                       current > 180
                   ) {
   
                       Elements.siteHeader
                           .classList.add(
                               "header-hidden"
                           );
   
                   } else {
   
                       Elements.siteHeader
                           .classList.remove(
                               "header-hidden"
                           );
   
                   }
   
                   previousScroll =
                       Math.max(current, 0);
   
                   ticking = false;
   
               });
   
           },
           {
               passive: true
           }
       );
   
   }
   
   
   /* ============================================================
      45. PESQUISA
      ============================================================ */
   
   function configureSearch() {
   
       Elements.headerSearchForm
           ?.addEventListener(
               "submit",
               (event) => {
   
                   event.preventDefault();
   
                   const query =
                       Elements.headerSearchInput
                           ?.value.trim() || "";
   
                   if (!query) {
   
                       Elements.headerSearchInput
                           ?.focus();
   
                       return;
   
                   }
   
                   window.location.href =
                       `produtos.html?busca=${encodeURIComponent(query)}`;
   
               }
           );
   
   }
   
   
   /* ============================================================
      46. MENU MOBILE
      ============================================================ */
   
   function configureMobileMenu() {
   
       Elements.mobileMenuButton
           ?.addEventListener(
               "click",
               openMobileMenu
           );
   
       Elements.mobileMenuClose
           ?.addEventListener(
               "click",
               closeMobileMenu
           );
   
       Elements.mobileMenuOverlay
           ?.addEventListener(
               "click",
               closeMobileMenu
           );
   
       $$(".mobile-menu-navigation a")
           .forEach((link) => {
   
               link.addEventListener(
                   "click",
                   closeMobileMenu
               );
   
           });
   
   }
   
   
   function openMobileMenu() {
   
       if (
           !Elements.mobileMenu ||
           !Elements.mobileMenuOverlay
       ) {
           return;
       }
   
       Elements.mobileMenuOverlay.hidden =
           false;
   
       requestAnimationFrame(() => {
   
           Elements.mobileMenuOverlay
               .classList.add(
                   "is-visible"
               );
   
           Elements.mobileMenu
               .classList.add(
                   "is-open"
               );
   
       });
   
       Elements.mobileMenu
           .setAttribute(
               "aria-hidden",
               "false"
           );
   
       Elements.mobileMenuButton
           ?.setAttribute(
               "aria-expanded",
               "true"
           );
   
       document.body.style.overflow =
           "hidden";
   
   }
   
   
   function closeMobileMenu() {
   
       if (
           !Elements.mobileMenu ||
           !Elements.mobileMenuOverlay
       ) {
           return;
       }
   
       Elements.mobileMenuOverlay
           .classList.remove(
               "is-visible"
           );
   
       Elements.mobileMenu
           .classList.remove(
               "is-open"
           );
   
       Elements.mobileMenu
           .setAttribute(
               "aria-hidden",
               "true"
           );
   
       Elements.mobileMenuButton
           ?.setAttribute(
               "aria-expanded",
               "false"
           );
   
       window.setTimeout(() => {
   
           if (
               !Elements.mobileMenu
                   .classList.contains(
                       "is-open"
                   )
           ) {
   
               Elements.mobileMenuOverlay.hidden =
                   true;
   
           }
   
       }, 300);
   
       if (
           !document.querySelector(
               ".profile-modal:not([hidden])"
           )
       ) {
   
           document.body.style.overflow =
               "";
   
       }
   
   }
   
   
   /* ============================================================
      47. VOLTAR AO TOPO
      ============================================================ */
   
   function configureBackToTop() {
   
       if (!Elements.backToTop) {
           return;
       }
   
       const update =
           () => {
   
               Elements.backToTop
                   .classList.toggle(
                       "is-visible",
                       window.scrollY > 500
                   );
   
           };
   
       window.addEventListener(
           "scroll",
           update,
           {
               passive: true
           }
       );
   
       update();
   
       Elements.backToTop
           .addEventListener(
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
      48. ANIMAÇÕES DE ENTRADA
      ============================================================ */
   
   function configureRevealAnimations() {
   
       const elements = [
   
           ...$$(".profile-summary-card"),
   
           ...$$(".profile-card"),
   
           ...$$(".profile-side-card"),
   
           ...$$(".profile-support-card")
   
       ];
   
       elements.forEach((element) => {
   
           element.classList.add(
               "profile-reveal"
           );
   
       });
   
       if (
           !("IntersectionObserver" in window)
       ) {
   
           elements.forEach((element) => {
   
               element.classList.add(
                   "is-visible"
               );
   
           });
   
           return;
   
       }
   
       const observer =
           new IntersectionObserver(
               (entries) => {
   
                   entries.forEach((entry) => {
   
                       if (!entry.isIntersecting) {
                           return;
                       }
   
                       entry.target.classList.add(
                           "is-visible"
                       );
   
                       observer.unobserve(
                           entry.target
                       );
   
                   });
   
               },
               {
                   threshold: 0.08,
                   rootMargin:
                       "0px 0px -35px 0px"
               }
           );
   
       elements.forEach((element) => {
   
           observer.observe(element);
   
       });
   
   }
   
   
   /* ============================================================
      49. ANO
      ============================================================ */
   
   function configureCurrentYear() {
   
       const year =
           $("#currentYear");
   
       if (year) {
   
           year.textContent =
               String(
                   new Date().getFullYear()
               );
   
       }
   
   }
   
   
   /* ============================================================
      50. TOAST
      ============================================================ */
   
   let toastTimeout = null;
   
   
   function showToast(
       message,
       type = "success"
   ) {
   
       if (
           !Elements.profileToast ||
           !Elements.profileToastText
       ) {
   
           console.log(message);
   
           return;
   
       }
   
       clearTimeout(
           toastTimeout
       );
   
       Elements.profileToastText.textContent =
           message;
   
       Elements.profileToast
           .classList.toggle(
               "is-error",
               type === "error"
           );
   
       const icon =
           Elements.profileToast
               .querySelector(
                   ".profile-toast-icon i"
               );
   
       if (icon) {
   
           icon.className =
               type === "error"
                   ? "fa-solid fa-circle-exclamation"
                   : "fa-solid fa-circle-check";
   
       }
   
       Elements.profileToast
           .classList.add(
               "is-visible"
           );
   
       toastTimeout =
           window.setTimeout(() => {
   
               Elements.profileToast
                   ?.classList.remove(
                       "is-visible"
                   );
   
           }, PROFILE_CONFIG.TOAST_DURATION);
   
   }
   
   
   /* ============================================================
      51. BUTTON LOADING
      ============================================================ */
   
   function setButtonLoading(
       button,
       loading,
       text = "Aguarde..."
   ) {
   
       if (!button) {
           return;
       }
   
       if (loading) {
   
           if (
               !button.dataset.originalHtml
           ) {
   
               button.dataset.originalHtml =
                   button.innerHTML;
   
           }
   
           button.disabled =
               true;
   
           button.classList.add(
               "is-loading"
           );
   
           button.innerHTML = `
               <i class="fa-solid fa-spinner"></i>
               ${escapeHTML(text)}
           `;
   
           return;
   
       }
   
       button.disabled =
           false;
   
       button.classList.remove(
           "is-loading"
       );
   
       if (
           button.dataset.originalHtml
       ) {
   
           button.innerHTML =
               button.dataset.originalHtml;
   
       }
   
   }
   
   
   /* ============================================================
      52. ERROS DOS CAMPOS
      ============================================================ */
   
   function setFieldError(
       input,
       message
   ) {
   
       if (!input) {
           return;
       }
   
       const group =
           input.closest(
               ".profile-form-group"
           );
   
       if (!group) {
           return;
       }
   
       group.classList.add(
           "has-error"
       );
   
       const error =
           $(".profile-field-error", group);
   
       if (error) {
   
           error.textContent =
               message;
   
       }
   
   }
   
   
   function clearFormErrors(form) {
   
       if (!form) {
           return;
       }
   
       $$(
           ".profile-form-group",
           form
       ).forEach((group) => {
   
           group.classList.remove(
               "has-error"
           );
   
           const error =
               $(".profile-field-error", group);
   
           if (error) {
   
               error.textContent =
                   "";
   
           }
   
       });
   
   }
   
   
   /* ============================================================
      53. MENSAGENS
      ============================================================ */
   
   function showMessage(
       element,
       message,
       success = false
   ) {
   
       if (!element) {
           return;
       }
   
       element.textContent =
           message;
   
       element.hidden =
           false;
   
       element.classList.toggle(
           "success",
           success
       );
   
   }
   
   
   function clearMessage(element) {
   
       if (!element) {
           return;
       }
   
       element.textContent =
           "";
   
       element.hidden =
           true;
   
       element.classList.remove(
           "success"
       );
   
   }
   
   
   /* ============================================================
      54. FORMATAÇÃO CPF
      ============================================================ */
   
   function formatCPF(value) {
   
       const digits =
           onlyDigits(value)
               .slice(0, 11);
   
       if (!digits) {
           return "";
       }
   
       return digits
           .replace(
               /^(\d{3})(\d)/,
               "$1.$2"
           )
           .replace(
               /^(\d{3})\.(\d{3})(\d)/,
               "$1.$2.$3"
           )
           .replace(
               /\.(\d{3})(\d)/,
               ".$1-$2"
           );
   
   }
   
   
   /* ============================================================
      55. TELEFONE
      ============================================================ */
   
   function formatPhone(value) {
   
       const digits =
           onlyDigits(value)
               .slice(0, 11);
   
       if (!digits) {
           return "";
       }
   
       if (digits.length <= 10) {
   
           return digits
               .replace(
                   /^(\d{2})(\d)/,
                   "($1) $2"
               )
               .replace(
                   /(\d{4})(\d)/,
                   "$1-$2"
               );
   
       }
   
       return digits
           .replace(
               /^(\d{2})(\d)/,
               "($1) $2"
           )
           .replace(
               /(\d{5})(\d)/,
               "$1-$2"
           );
   
   }
   
   
   /* ============================================================
      56. CEP
      ============================================================ */
   
   function formatCEP(value) {
   
       const digits =
           onlyDigits(value)
               .slice(0, 8);
   
       return digits.replace(
           /^(\d{5})(\d)/,
           "$1-$2"
       );
   
   }
   
   
   /* ============================================================
      57. MOEDA
      ============================================================ */
   
   function formatCurrency(value) {
   
       let number;
   
       if (
           typeof value === "string"
       ) {
   
           const normalized =
               value
                   .replace(/[^\d,.-]/g, "")
                   .replace(/\./g, "")
                   .replace(",", ".");
   
           number =
               Number(normalized);
   
       } else {
   
           number =
               Number(value);
   
       }
   
       if (!Number.isFinite(number)) {
   
           return "R$ 0,00";
   
       }
   
       return new Intl.NumberFormat(
           "pt-BR",
           {
               style: "currency",
               currency: "BRL"
           }
       ).format(number);
   
   }
   
   
   /* ============================================================
      58. DATA
      ============================================================ */
   
   function formatDate(value) {
   
       const date =
           parseDate(value);
   
       if (!date) {
   
           return "Data não informada";
   
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
   
   
   function parseDate(value) {
   
       if (!value) {
           return null;
       }
   
       const date =
           value instanceof Date
               ? value
               : new Date(value);
   
       if (
           Number.isNaN(
               date.getTime()
           )
       ) {
   
           return null;
   
       }
   
       return date;
   
   }
   
   
   /* ============================================================
      59. ORDENAR PEDIDOS
      ============================================================ */
   
   function compareOrdersByDate(a, b) {
   
       const dateA =
           parseDate(
               a.data_pedido ??
               a.created_at ??
               a.data
           );
   
       const dateB =
           parseDate(
               b.data_pedido ??
               b.created_at ??
               b.data
           );
   
       const timeA =
           dateA
               ? dateA.getTime()
               : 0;
   
       const timeB =
           dateB
               ? dateB.getTime()
               : 0;
   
       return timeB - timeA;
   
   }
   
   
   /* ============================================================
      60. STATUS
      ============================================================ */
   
   function getOrderStatusClass(status) {
   
       const normalized =
           normalizeString(status);
   
       if (
           normalized.includes("entreg")
       ) {
   
           return "entregue";
   
       }
   
       if (
           normalized.includes("cancel")
       ) {
   
           return "cancelado";
   
       }
   
       return "";
   
   }
   
   
   /* ============================================================
      61. NÚMERO PEDIDO
      ============================================================ */
   
   function formatOrderNumber(value) {
   
       const string =
           String(value || "")
               .trim();
   
       if (!string) {
           return "";
       }
   
       if (
           string.startsWith("#")
       ) {
   
           return string;
   
       }
   
       return `#${string}`;
   
   }
   
   
   /* ============================================================
      62. NORMALIZAR ARRAY DA API
      ============================================================ */
   
   function normalizeArrayResponse(
       data,
       keys = []
   ) {
   
       if (Array.isArray(data)) {
   
           return data;
   
       }
   
       if (!data) {
   
           return [];
   
       }
   
       for (const key of keys) {
   
           if (
               Array.isArray(data[key])
           ) {
   
               return data[key];
   
           }
   
       }
   
       if (
           Array.isArray(data.data)
       ) {
   
           return data.data;
   
       }
   
       return [];
   
   }
   
   
   /* ============================================================
      63. API ERROR
      ============================================================ */
   
   async function createAPIError(response) {
   
       let message =
           `Erro ${response.status}.`;
   
       try {
   
           const data =
               await response.json();
   
           message =
               data.message ??
               data.mensagem ??
               data.error ??
               message;
   
       } catch {
   
           try {
   
               const text =
                   await response.text();
   
               if (text) {
   
                   message =
                       text;
   
               }
   
           } catch {
               /* nada */
           }
   
       }
   
       return new Error(message);
   
   }
   
   
   async function safeJSON(response) {
   
       try {
   
           return await response.json();
   
       } catch {
   
           return null;
   
       }
   
   }
   
   
   /* ============================================================
      64. EMAIL
      ============================================================ */
   
   function isValidEmail(email) {
   
       if (!email) {
           return false;
       }
   
       return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
           .test(email);
   
   }
   
   
   /* ============================================================
      65. UTILIDADES
      ============================================================ */
   
   function onlyDigits(value) {
   
       return String(value ?? "")
           .replace(/\D/g, "");
   
   }
   
   
   function normalizeString(value) {
   
       return String(value ?? "")
           .trim()
           .toLowerCase()
           .normalize("NFD")
           .replace(
               /[\u0300-\u036f]/g,
               ""
           );
   
   }
   
   
   function safeText(value) {
   
       if (
           value === null ||
           value === undefined
       ) {
   
           return "";
   
       }
   
       return String(value).trim();
   
   }
   
   
   function setText(
       element,
       value
   ) {
   
       if (!element) {
           return;
       }
   
       element.textContent =
           value ?? "";
   
   }
   
   
   function setInputValue(
       element,
       value
   ) {
   
       if (!element) {
           return;
       }
   
       element.value =
           value ?? "";
   
   }
   
   
   function firstName(nome) {
   
       const text =
           safeText(nome);
   
       if (!text) {
           return "Cliente";
       }
   
       return text.split(/\s+/)[0];
   
   }
   
   
   function firstNameOrFullName(nome) {
   
       const text =
           safeText(nome);
   
       if (!text) {
           return "Cliente";
       }
   
       return text;
   
   }
   
   
   /* ============================================================
      66. SEGURANÇA HTML
      ============================================================ */
   
   function escapeHTML(value) {
   
       return String(value ?? "")
           .replace(
               /&/g,
               "&amp;"
           )
           .replace(
               /</g,
               "&lt;"
           )
           .replace(
               />/g,
               "&gt;"
           )
           .replace(
               /"/g,
               "&quot;"
           )
           .replace(
               /'/g,
               "&#039;"
           );
   
   }
   
   
   function escapeAttribute(value) {
   
       return escapeHTML(
           String(value ?? "")
       );
   
   }
   
   
   /* ============================================================
      67. SINCRONIZAÇÃO ENTRE ABAS
      ============================================================ */
   
   window.addEventListener(
       "storage",
       (event) => {
   
           if (
               event.key ===
               PROFILE_CONFIG.STORAGE.CLIENTE
           ) {
   
               const cliente =
                   getStoredClient();
   
               if (!cliente) {
   
                   window.location.reload();
   
                   return;
   
               }
   
               ProfileState.cliente =
                   normalizeClient(cliente);
   
               renderClient(
                   ProfileState.cliente
               );
   
           }
   
   
           if (
               [
                   "carrinho",
                   "cart",
                   "apc_carrinho"
               ].includes(event.key)
           ) {
   
               updateCartCounters();
   
           }
   
   
           if (
               event.key ===
               PROFILE_CONFIG.STORAGE.TEMA
           ) {
   
               const dark =
                   event.newValue === "dark";
   
               document.body
                   .classList.toggle(
                       "dark-theme",
                       dark
                   );
   
               updateThemeIcon();
   
           }
   
       }
   );
   
   
   /* ============================================================
      68. ATUALIZA CARRINHO QUANDO VOLTA PARA A ABA
      ============================================================ */
   
   window.addEventListener(
       "focus",
       () => {
   
           updateCartCounters();
   
       }
   );
   
   
   /* ============================================================
      69. LIMPEZA DO ESTADO DE ENDEREÇO AO FECHAR
      ============================================================ */
   
   Elements.addressModalClose
       ?.addEventListener(
           "click",
           () => {
   
               ProfileState.enderecoEditando =
                   null;
   
           }
       );
   
   
   /* ============================================================
      70. PROTEÇÃO CONTRA SUBMIT DUPLO
      ============================================================ */
   
   document.addEventListener(
       "submit",
       (event) => {
   
           const form =
               event.target;
   
           if (
               !(form instanceof HTMLFormElement)
           ) {
   
               return;
   
           }
   
           const submitButton =
               form.querySelector(
                   'button[type="submit"]'
               );
   
           if (
               submitButton?.disabled
           ) {
   
               event.preventDefault();
   
           }
   
       },
       true
   );
   
   
   /* ============================================================
      71. FIM
      ============================================================ */
   
   console.info(
       "%cAuto Peça Certa",
       "font-weight:900;color:#146cff;font-size:15px"
   );
   
   console.info(
       "Perfil carregado."
   );
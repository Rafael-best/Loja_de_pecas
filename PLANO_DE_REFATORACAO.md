# Plano de Refatoração

## Escopo desta análise

Este documento registra o estado encontrado na branch `feature_Rafael` no commit `6eb8d48`. Nenhuma funcionalidade foi alterada nesta etapa. O sistema é uma loja de autopeças com frontend estático (HTML, CSS e JavaScript), backend Node.js/Express e intenção de persistência em MySQL.

## Diagnóstico arquitetural

O projeto possui duas linhas de implementação que ainda não formam uma aplicação integrada:

- O frontend de catálogo, carrinho e checkout usa `localStorage` e uma lista fixa de 15 produtos (`produtosMock`).
- O backend disponibiliza um CRUD básico sob `/api`, baseado em MySQL, concentrado em `backend/routes.js`.
- Algumas telas chamam contratos que a API atual não implementa: detalhes de pedido, inclusão de item por pedido, alteração de status e cancelamento.
- Há arquivos planejados para modularização (`backend/routes/*.js` e diversos JS/HTML/CSS do frontend), mas a maioria está vazia ou não é importada.

Consequentemente, o risco principal não é uma refatoração estética: é preservar e consolidar contratos de domínio antes de reorganizar arquivos.

## Estrutura atual

```text
Loja_de_pecas/
├── frontend/
│   ├── *.html                 # páginas; várias ainda vazias ou de teste
│   ├── js/                    # scripts por tela, com trechos duplicados
│   ├── css/                   # login.css é usado; há folhas vazias/não usadas
│   ├── assets/ e img/         # imagens, ícones e fundos
│   └── data/produtos.json     # vazio
├── backend/
│   ├── server.js              # Express, CORS global e montagem de /api
│   ├── routes.js              # todas as rotas efetivamente montadas
│   ├── db.js                  # pool MySQL e credenciais locais fixas
│   └── routes/                # tentativa incompleta de modularização
├── package.json               # apenas cors, sem scripts
└── backend/package.json       # express, cors e mysql2, sem scripts
```

Não há esquema SQL, migrations, testes automatizados, configuração por ambiente, documentação de execução ou pipeline de CI visíveis no repositório.

## Frontend, HTML, CSS e JavaScript

### Estado observado

- `produtos.html`, `carrinho.html`, `pedidos.html` e `admin.html` são as telas mais desenvolvidas. Usam Bootstrap via CDN; `admin.html` contém CSS e JavaScript extensos inline.
- `login.html` possui layout próprio e `login.css` apresenta boa composição visual, inclusive breakpoints em 900 px e 500 px. Porém o HTML não contém os elementos com IDs `btnLogin`, `email` e `mensagem` esperados por `js/login.js`; o script tende a falhar ao carregar. O botão também não tem o fluxo de submit tratado pelo script.
- A imagem da tela de login referencia `assets/imagens/logo.png`, mas os arquivos estão em `assets/images/`; portanto o logotipo não é encontrado em servidores case-sensitive ou em qualquer caminho literal.
- A tela de produtos oferece busca local, toast e contador de carrinho. O último comando de `js/produtos.js` chama `mostrarMensagem(...)`, função inexistente, provocando erro de execução após a renderização inicial.
- O checkout valida cliente, carrinho, estoque local e pagamento, mas envia um pedido com total zero e espera `id_pedido` diretamente na resposta. A rota atual retorna o resultado do MySQL, normalmente com `insertId`. Depois chama `POST /api/pedidos/:id/itens`, rota inexistente.
- A página de pedidos faz uma requisição adicional por pedido (`GET /api/pedidos/:id`) e a tela administrativa depende de quatro endpoints que não existem. Mesmo que fossem implementados, há risco de N+1 requisições.
- Existem duplicações de helpers de moeda, carrinho e toast. O uso frequente de `innerHTML` com valores de API/localStorage não faz escape de conteúdo.
- Existem sinais de caracteres com codificação inconsistente (por exemplo, textos como `PeÃ§as`); isso precisa ser confirmado e normalizado para UTF-8 antes de qualquer revisão de conteúdo.

### Responsividade, UI, UX e acessibilidade

- Há pontos positivos: meta viewport nas principais telas, grid responsivo do Bootstrap, tabela/cartões alternados no carrinho e breakpoints no painel administrativo.
- A responsividade não é sistêmica: regras vivem em `style` inline, `login.css`, `styles.css` e folhas vazias, tornando comportamentos difíceis de prever. A classe `w-md-auto` usada no checkout não é uma utilidade padrão do Bootstrap.
- Produtos e pedidos comunicam bem as ações principais, mas faltam estados de carregamento, tratamento consistente de erros, confirmação/feedback acessível e navegação global coerente.
- Campos de login têm labels visuais sem associação `for`/`id`; o controle de mostrar senha chama uma função que não existe no HTML atual; links de cadastro e recuperação são placeholders (`#`).
- O toast não possui região ARIA (`role=status` ou `aria-live`). Botões de `+`, `-` e remoção dependem de rótulos visuais mínimos e handlers inline. O painel gera conteúdo dinâmico sem gerenciamento de foco.
- Não há evidência de auditoria com leitor de tela, teclado, contraste ou zoom. Esses testes devem acompanhar a correção dos fluxos, e não ser deixados para o fim.

## Backend, API e banco de dados

### Estado observado

- `server.js` inicia Express na porta fixa 3000, habilita `cors()` para todas as origens, aceita JSON e monta `routes.js` em `/api`.
- `routes.js` expõe `GET`/`POST` para `clientes`, `fornecedores`, `produtos`, `pedidos` e `itens`. Os inserts usam placeholders SQL, o que é positivo contra injeção nesses parâmetros.
- As rotas em `backend/routes/` não são montadas. `login.js` nessa pasta usa nomes de colunas diferentes (`email`, `senha`, `nome`) dos usados em `routes.js` (`email_cliente`, `senha_cliente`, `nome_cliente`); não deve ser considerado contrato ativo.
- O banco é inferido pelas consultas: `clientes`, `fornecedores`, `produtos`, `pedidos` e `itens_pedido`. Não há DDL, chaves, índices, constraints ou dados de exemplo versionados.
- `db.js` contém host, usuário e senha (`root`/`root`) no código e realiza teste de conexão ao importar o módulo. Não existe `.env.example`.

### Contrato efetivo atual

| Recurso | Rotas existentes | Observação |
|---|---|---|
| Clientes | `GET /api/clientes`, `POST /api/clientes` | Retorna todos os campos, inclusive senha. |
| Login | `POST /api/login` | Compara senha em texto puro e retorna o objeto completo do cliente. |
| Fornecedores | `GET /api/fornecedores`, `POST /api/fornecedores` | Sem validação de entrada. |
| Produtos | `GET /api/produtos`, `POST /api/produtos` | Lista inclui nome do fornecedor por `LEFT JOIN`. |
| Pedidos | `GET /api/pedidos`, `POST /api/pedidos` | Não calcula total nem trata itens/estoque transacionalmente. |
| Itens | `GET /api/itens`, `POST /api/itens` | Endpoint global, não aninhado ao pedido. |

Não existem autenticação por token/sessão, autorização por perfil, paginação, filtros no servidor, validação de payload, documentação OpenAPI, versionamento da API, limites de requisição ou tratamento centralizado de erros.

## Segurança, performance e escalabilidade

### Prioridade crítica

1. Remover credenciais do código e revogar/alterar qualquer senha que tenha sido usada fora de ambiente local.
2. Armazenar senhas com hash forte (por exemplo, bcrypt/argon2); nunca comparar ou retornar senha em texto puro.
3. Implementar autenticação e autorização por papel antes de disponibilizar o painel administrativo. Hoje qualquer origem pode chamar endpoints de escrita e não há separação entre cliente e administrador.
4. Validar, normalizar e limitar todos os payloads; retornar erros padronizados sem expor objetos internos do MySQL.
5. Evitar XSS: dados interpolados em `innerHTML` precisam ser renderizados por APIs DOM seguras ou devidamente escapados.

### Desempenho e crescimento

- O pool com `connectionLimit: 10` é um ponto de partida, mas precisa de configuração por ambiente, monitoramento e timeouts.
- `SELECT *` e listagens sem paginação não escalam. Criar índices para chaves estrangeiras e colunas de busca/ordenação depois de registrar consultas reais.
- O carregamento de pedidos no frontend faz uma chamada por pedido; criar endpoint de detalhe agregado, paginação e/ou incluir itens de forma controlada reduz latência.
- Imagens e bibliotecas via CDN simplificam o protótipo, mas dependem da rede. Adotar cache, versionamento e estratégia de build quando o produto estabilizar.
- A atualização de estoque, inserção de itens e cálculo de total devem ocorrer em transação no servidor. O estoque e o total não podem ser autoridade do navegador.

## Roteiro proposto (para uma etapa futura de implementação)

### Fase 0 — Baseline e decisão de contrato

1. Preservar esta branch e criar testes manuais dos fluxos atuais, inclusive seus comportamentos esperados.
2. Definir papéis (cliente e administrador), entidades, estados de pedido, campos obrigatórios e contrato da API em documento aprovado.
3. Criar DDL/migrations reproduzíveis e dados mínimos de desenvolvimento. Confirmar os nomes definitivos das colunas antes de adaptar frontend ou backend.

### Fase 1 — Segurança e fundação do backend

1. Introduzir configuração por ambiente, `.env.example`, scripts de execução e validação de variáveis obrigatórias.
2. Modularizar por domínio (rotas, controllers/serviços, repositórios), sem alterar os contratos até que haja versão/migração planejada.
3. Adicionar validação, middleware de erro, autenticação, autorização e respostas sem dados sensíveis.
4. Criar transação de criação/cancelamento de pedido que valide estoque, grave itens, calcule total e mantenha estoque consistente.
5. Publicar OpenAPI e testes de integração para cada rota.

### Fase 2 — Integração e qualidade do frontend

1. Eleger a API como fonte de verdade para produtos, carrinho/pedido e sessão; remover progressivamente o catálogo mock apenas depois de a API estar pronta.
2. Centralizar cliente HTTP, configuração de URL, formatação e componentes/rotinas reutilizáveis; separar script e estilo do HTML administrativo.
3. Corrigir os contratos da tela de login, links, IDs, caminhos de assets, codificação e fluxos vazios.
4. Substituir inserção insegura de HTML, adicionar estados de carregamento/erro/sucesso e tratamento de foco/ARIA.
5. Cobrir desktop e mobile nos breakpoints definidos, com testes de teclado, leitor de tela e contraste.

### Fase 3 — Operação e evolução

1. Adicionar lint, testes unitários/e2e, CI, logs estruturados e monitoramento de erros.
2. Implementar paginação, filtros e índices guiados por métricas.
3. Planejar cache, filas e separação de serviços apenas se a carga justificar; no estágio atual, um monólito modular é a solução mais simples e adequada.

## Critérios para iniciar a refatoração

- Esquema SQL e contrato de API aprovados.
- Estratégia de migração de dados e de senhas definida.
- Cobertura de testes dos fluxos de login, catálogo, carrinho, pedido, estoque e administração.
- Nenhuma mudança diretamente em `main`; todo trabalho e toda revisão permanecem em branches de feature.

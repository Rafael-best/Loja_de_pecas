# TODO

## Como usar

Backlog derivado da análise da branch `feature_Rafael`. Nada desta lista foi implementado nesta etapa. Prioridades: **P0** bloqueia segurança ou fluxo essencial; **P1** é necessário para uma primeira versão integrada; **P2** melhora qualidade e evolução.

## P0 — Bloqueadores

- [ ] Remover credenciais de MySQL de `backend/db.js`, adotar variáveis de ambiente e criar `.env.example` sem segredos.
- [ ] Alterar/invalidar credenciais que possam ter sido expostas fora do ambiente local.
- [ ] Implementar hash de senha, autenticação e autorização; impedir retorno de senha em qualquer resposta.
- [ ] Restringir CORS por ambiente e proteger endpoints de escrita.
- [ ] Definir e versionar o esquema MySQL (migrations, chaves estrangeiras, índices e constraints).
- [ ] Consolidar um único contrato de login e corrigir a incompatibilidade entre `login.html` e `js/login.js`.
- [ ] Escolher a API como fonte de verdade para produtos, pedidos e estoque; remover o conflito com `produtosMock` somente após a integração estar pronta.
- [ ] Implementar fluxo transacional de pedido: validar cliente/produtos/estoque, gravar itens, calcular total no servidor e atualizar estoque.
- [ ] Formalizar e implementar os endpoints exigidos pelas telas, ou adaptar as telas ao contrato escolhido: detalhe de pedido, itens do pedido, status e cancelamento.
- [ ] Sanitizar renderização dinâmica para impedir XSS (`innerHTML` com dados externos/localStorage).

## P1 — Integração e organização

- [ ] Criar scripts `dev`, `start`, `test` e instruções de instalação/execução.
- [ ] Modularizar backend por domínio (rotas, controllers/serviços, repositórios e middlewares) e remover/terminar arquivos de rota vazios.
- [ ] Padronizar nomes de campos de cliente e respostas de API; documentar payloads e códigos HTTP com OpenAPI.
- [ ] Adicionar validação de entrada e tratamento centralizado de erros.
- [ ] Retornar IDs e recursos criados em formato consistente; não expor erro cru do banco.
- [ ] Implementar paginação, ordenação e filtros server-side para produtos, clientes e pedidos.
- [ ] Substituir a busca de detalhes de pedidos em loop por endpoint agregado/paginado.
- [ ] Corrigir chamada inexistente `mostrarMensagem` em `js/produtos.js` e eliminar duplicações de helper.
- [ ] Corrigir caminhos de assets, links de navegação e páginas/arquivos vazios ou removê-los após decisão de produto.
- [ ] Padronizar UTF-8 nos arquivos e validar textos com acentos.
- [ ] Mover CSS/JS inline do painel administrativo para arquivos versionados e organizados por responsabilidade.
- [ ] Unificar estilos e remover folhas CSS vazias/não utilizadas após confirmar referências.

## P1 — UX, UI e acessibilidade

- [ ] Fornecer estados de carregamento, vazio, erro e sucesso consistentes para todas as requisições.
- [ ] Associar labels a inputs, corrigir controle de visibilidade de senha e tratar envio de formulário com teclado.
- [ ] Adicionar `aria-live` a mensagens/toasts e mover foco para feedback/erros relevantes.
- [ ] Revisar nomes acessíveis dos botões de incremento, decremento, remoção e ações administrativas.
- [ ] Testar navegação por teclado, leitor de tela, contraste, zoom 200% e layouts em 320 px, 576 px, 768 px, 900 px e desktop.
- [ ] Definir design tokens e componentes compartilhados para cabeçalho, botões, formulários, cards e mensagens.

## P2 — Qualidade, observabilidade e escala

- [ ] Configurar ESLint/Prettier e convenções de nomes, módulos e tratamento de erros.
- [ ] Criar testes unitários para regras de preço/estoque/status e testes de integração da API.
- [ ] Criar testes e2e para login, catálogo, carrinho, checkout e administração.
- [ ] Adicionar CI para lint, testes e checagem de migrations.
- [ ] Adicionar logs estruturados, health check, monitoramento de erros e métricas do pool MySQL.
- [ ] Definir políticas de rate limiting, cabeçalhos de segurança, tamanho máximo de payload e auditoria de ações administrativas.
- [ ] Otimizar imagens e estratégia de cache/build; avaliar hospedagem local dos assets críticos em vez de depender somente de CDNs.
- [ ] Introduzir cache e processamento assíncrono apenas quando métricas comprovarem necessidade.

## Critério de pronto para a próxima fase

- [ ] Contrato de API, esquema de banco e regras de negócio aprovados.
- [ ] Fluxo de pedido integral testado sem depender de dados mock no navegador.
- [ ] Autorização impede cliente de acessar operação administrativa e dados de outros clientes.
- [ ] Estoque e total permanecem consistentes em cenários de erro e concorrência.
- [ ] Alterações continuam exclusivamente em `feature_Rafael`; nenhuma ação de merge para `main` é realizada.

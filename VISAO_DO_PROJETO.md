# Visão do Projeto — Loja de Autopeças

## Produto final

A versão final será um sistema web responsivo de gestão e venda de autopeças. Ele atenderá dois públicos no mesmo produto, com experiências próprias e permissões claras:

- **Cliente:** encontra peças, consulta disponibilidade, compra com segurança e acompanha seus pedidos.
- **Administrador:** mantém o catálogo e fornecedores, acompanha vendas, controla estoque e opera o ciclo de vida dos pedidos.

O sistema terá uma única fonte de verdade: a API e o banco de dados. O navegador será responsável por apresentar informações e coletar ações; preço, estoque, total e permissão serão validados no servidor.

## Princípios da experiência

1. **Encontrar antes de procurar:** busca evidente, categorias claras e cards de produto comparáveis.
2. **Comprar com confiança:** estoque, preço, subtotal, total e status sempre visíveis e compreensíveis.
3. **Poucos passos:** a jornada de compra deve ir de catálogo a confirmação sem páginas redundantes.
4. **Operar sem ambiguidade:** o administrador vê prioridades, alertas e consequências de cada ação.
5. **Acessível e responsivo por padrão:** navegação por teclado, contraste adequado, feedback não dependente apenas de cor e interfaces móveis completas.

## Arquitetura visual

### Linguagem de interface

A identidade visual será funcional, limpa e adequada ao segmento automotivo:

- Base clara, superfícies brancas e hierarquia por sombras e bordas sutis.
- Cor primária azul para navegação e ações principais; verde para disponibilidade/sucesso; âmbar para alerta/pendência; vermelho apenas para erro, exclusão ou cancelamento.
- Tipografia sem serifa, legível e com escala consistente para título, seção, texto e metadados.
- Ícones com rótulo ou tooltip, nunca como único meio de comunicação em ações importantes.
- Espaçamento em uma escala única e cantos/botões padronizados, evitando estilos isolados por tela.

### Layout responsivo

| Faixa | Comportamento esperado |
|---|---|
| Mobile (320–575 px) | Uma coluna, cabeçalho compacto, filtros em painel/accordion, carrinho e resumo em blocos empilhados. |
| Tablet (576–991 px) | Grid de 2–3 produtos, filtros laterais quando houver espaço e tabelas com rolagem horizontal ou cartões equivalentes. |
| Desktop (992 px+) | Conteúdo centralizado, catálogo em 3–4 colunas, filtros laterais persistentes e painel administrativo com navegação lateral. |

Nenhuma operação essencial dependerá de hover, largura fixa, tabela não adaptada ou precisão de mouse.

### Sistema de feedback

Toda tela usará os mesmos estados visuais: carregando (skeleton ou indicador), vazio com ação sugerida, sucesso, alerta, erro recuperável e erro crítico. Mensagens assíncronas serão anunciadas com regiões ARIA e não interromperão a tarefa do usuário sem necessidade.

## Navegação

### Navegação pública e do cliente

O cabeçalho terá logotipo com retorno ao início, busca, acesso à conta e carrinho com contador. Em mobile, essas funções estarão em menu acessível sem esconder a busca e o carrinho.

```text
Início / Catálogo
├── Busca e categorias
├── Lista de produtos
│   └── Detalhe do produto
│       └── Adicionar ao carrinho
├── Carrinho
│   └── Checkout
│       └── Confirmação do pedido
├── Meus pedidos
│   └── Detalhe do pedido
└── Minha conta
```

O usuário não autenticado poderá navegar e pesquisar; para concluir uma compra, será direcionado ao login/cadastro e voltará ao checkout preservando o carrinho. Após entrar, o cabeçalho exibirá acesso a pedidos e conta, além de uma saída explícita.

### Navegação administrativa

Após autenticação com perfil administrativo, a área de gestão terá cabeçalho compacto e uma barra lateral em desktop — recolhível em mobile — com:

```text
Painel
├── Visão geral
├── Pedidos
├── Produtos
├── Estoque
├── Fornecedores
├── Clientes (consulta autorizada)
└── Minha conta / Sair
```

A área administrativa não ficará exposta em links públicos e cada rota será protegida também no servidor. A navegação informará a localização atual por título, breadcrumb quando útil e item ativo.

## Telas da versão final

### Cliente

| Tela | Objetivo e conteúdo principal |
|---|---|
| Início | Destaque da loja, atalhos de categoria, produtos em evidência e chamada para o catálogo. |
| Login e cadastro | Acesso, criação de conta e recuperação de senha com validações claras e sem revelar dados sensíveis. |
| Catálogo | Busca, categorias, filtros, ordenação, paginação e cards de produtos. |
| Detalhe do produto | Galeria local de imagens, nome, código/SKU, descrição, compatibilidade quando disponível, preço, estoque e ação de compra. |
| Carrinho | Itens editáveis, subtotais, total, remoção, persistência por conta e CTA para checkout. |
| Checkout | Resumo imutável dos itens, confirmação de dados, seleção de pagamento e confirmação explícita da compra. |
| Confirmação | Número do pedido, status inicial, total, próximos passos e link para detalhe. |
| Meus pedidos | Histórico paginado, filtros por status/data e acesso a detalhes. |
| Detalhe do pedido | Itens, valores congelados, status, linha do tempo e ações permitidas ao cliente. |
| Minha conta | Dados de contato, atualização segura de credenciais e preferências permitidas. |

### Administrador

| Tela | Objetivo e conteúdo principal |
|---|---|
| Visão geral | Indicadores de pedidos por status, faturamento, itens com estoque baixo e ações pendentes. |
| Pedidos | Lista com busca/filtros, paginação, detalhe e alteração de status conforme regras autorizadas. |
| Detalhe administrativo do pedido | Dados do cliente autorizados, itens, histórico, total, estoque relacionado e ações auditáveis. |
| Produtos | Listagem, busca, filtros, criação e edição de cadastro, preço, categoria, descrição e imagens. |
| Estoque | Saldo por produto, alertas de mínimo, ajustes justificados e histórico de movimentações. |
| Fornecedores | Cadastro e consulta de fornecedores vinculados aos produtos. |
| Clientes | Consulta restrita a dados necessários para atendimento, sem expor credenciais. |

## Componentes reutilizáveis

O frontend adotará componentes ou módulos visuais reutilizáveis, mesmo que a primeira implementação permaneça em JavaScript sem framework:

- **AppShell:** cabeçalho, navegação, conteúdo principal e rodapé.
- **Botão:** variações primária, secundária, perigosa, link e carregando; tamanhos e estados de foco consistentes.
- **Campo de formulário:** label associado, ajuda, erro, obrigatório, máscara e estado de validação.
- **Modal de confirmação:** usado somente para ações destrutivas/relevantes, com foco gerenciado.
- **Toast/alerta:** feedback acessível e padronizado.
- **EmptyState, ErrorState e LoadingState:** usados em listas, buscas e requisições.
- **Card de produto:** imagem, nome, código, preço, status de estoque e ação de adicionar.
- **Seletor de quantidade:** controles acessíveis de aumentar/diminuir, limites de estoque e entrada numérica validada.
- **Resumo de pedido:** itens, subtotal, desconto/frete quando aplicável e total.
- **Badge de status:** rótulo textual e cor para `Pendente`, `Enviado`, `Entregue` e `Cancelado`.
- **Tabela responsiva/lista:** tabela em desktop e apresentação em cartões quando necessário no mobile.
- **Barra de busca e filtros:** mesma interação no catálogo e nos painéis administrativos.
- **Paginação:** com estado atual, total e navegação por teclado.

## Catálogo e imagens locais

O catálogo será alimentado pela API e não por lista mock no navegador. Cada produto terá, no mínimo:

- identificador, SKU/código interno, nome, descrição e categoria;
- preço atual, quantidade disponível e indicador de disponibilidade;
- fornecedor e campos de compatibilidade quando o negócio os definir;
- imagem principal e galeria opcional, com texto alternativo descritivo.

As imagens de produto serão armazenadas e servidas localmente pelo projeto/infraestrutura, em uma estrutura previsível e separada dos arquivos de interface. O banco armazenará metadados e caminhos relativos; o frontend nunca dependerá de URL externa para renderizar o catálogo principal. Cada imagem terá versões otimizadas por tamanho quando a evolução do produto justificar, `alt` significativo e fallback visual quando não houver imagem.

Exemplo conceitual de organização:

```text
assets/
└── produtos/
    └── {sku}/
        ├── principal.webp
        ├── detalhe-01.webp
        └── detalhe-02.webp
```

O cadastro administrativo permitirá associar, ordenar, substituir e remover imagens conforme permissão. A entrega futura deverá validar tipo, tamanho e nome do arquivo; não haverá upload arbitrário exposto ao cliente.

## Perfis e permissões

### Cliente

Pode criar e manter sua conta, navegar pelo catálogo, administrar seu próprio carrinho, concluir pedido e ver exclusivamente seus próprios pedidos e dados. Não pode alterar preços, estoque, catálogo, status administrativo ou dados de outros clientes.

### Administrador

Pode operar catálogo, fornecedores, estoque e pedidos, além de visualizar indicadores. Ações que modificam preço, estoque, status ou cancelamento devem ter validação, confirmação quando necessário e registro de auditoria. O perfil administrativo não elimina a necessidade de o servidor validar toda permissão.

## Jornada do cliente

1. O cliente chega à página inicial ou catálogo e usa busca, categoria ou filtro.
2. Compara cards e abre o detalhe para confirmar a peça, preço e disponibilidade.
3. Adiciona ao carrinho; recebe confirmação acessível e o contador é atualizado.
4. Ajusta quantidades no carrinho e vê o total recalculado.
5. No checkout, autentica-se se necessário, confirma pagamento e revisa o pedido.
6. O servidor valida estoque e valor; a confirmação apresenta número e status inicial.
7. O cliente acompanha o pedido em “Meus pedidos”, sem depender de consulta a dados de outros usuários.

Em qualquer ponto, erros de rede ou estoque indisponível explicam o ocorrido, preservam a entrada do usuário quando possível e oferecem uma próxima ação clara.

## Jornada do administrador

1. O administrador entra em painel com prioridades: pedidos pendentes e estoque baixo.
2. Localiza pedido por número, cliente, data ou status e consulta o detalhe completo.
3. Atualiza o status apenas pelas transições permitidas; o cliente passa a ver a alteração em seu histórico.
4. Mantém produto e fornecedor em telas próprias, com validações antes de salvar.
5. Ajusta estoque de forma justificada e rastreável, sem alterar totais históricos de pedidos.

## Requisitos de qualidade da experiência

- Todas as páginas terão título de documento, hierarquia de headings e foco visível.
- Formulários serão utilizáveis por teclado e terão erros próximos ao campo, com texto explicativo.
- Contraste e tamanhos de toque atenderão uso em mobile; cor nunca será a única indicação de status.
- Dados do usuário, pedidos e estoque serão carregados com feedback, paginação e mensagens de indisponibilidade adequadas.
- A interface respeitará o idioma português do Brasil e formatação de moeda/data consistentes.
- Operações administrativas e de checkout terão prevenção contra clique repetido e confirmação de resultado no servidor.

## Direção de arquitetura técnica

Visualmente, o sistema se comportará como uma aplicação única e consistente. Tecnicamente, o frontend consumirá uma API versionada; o backend será um monólito modular Node.js/Express; e o MySQL manterá clientes, produtos, fornecedores, pedidos, itens, estoque e metadados de imagens. O crescimento futuro será guiado por métricas, sem introduzir microserviços ou complexidade antes da necessidade real.

Esta visão preserva as funcionalidades já pretendidas — catálogo, carrinho, login, pedidos e administração — e define a forma coerente de integrá-las na versão final.

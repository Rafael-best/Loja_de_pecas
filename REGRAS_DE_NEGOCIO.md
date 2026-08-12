# Regras de Negócio

## Nota de escopo

Este documento separa regras que estão efetivamente codificadas na branch `feature_Rafael` de comportamentos apenas sugeridos pela interface. Ele não pressupõe que os fluxos estejam integrados ponta a ponta.

## Entidades identificadas

- **Cliente:** nome, endereço, telefone, e-mail e senha (`clientes`).
- **Fornecedor:** nome, endereço, telefone e e-mail (`fornecedores`).
- **Produto:** nome, descrição, preço, quantidade em estoque e fornecedor (`produtos`).
- **Pedido:** cliente, data, forma de pagamento, status e total (`pedidos`).
- **Item de pedido:** pedido, produto, quantidade e preço unitário (`itens_pedido`).

O esquema físico e suas restrições não estão versionados; os campos acima são inferidos pelo código SQL e pelo frontend.

## Regras efetivamente implementadas

### Clientes e autenticação

1. É possível listar e cadastrar clientes pela API.
2. O cadastro de cliente recebe nome, endereço, telefone, e-mail e senha.
3. O login ativo da API procura um cliente por `email_cliente` e `senha_cliente` e considera o acesso válido quando há resultado.
4. Para páginas de produtos, carrinho e pedidos, o navegador exige o objeto `clienteLogado` no `localStorage`; sem ele, redireciona para `index.html`.
5. Após login bem-sucedido no script de frontend, são gravados `id_cliente`, nome e e-mail em `clienteLogado`, e um carrinho vazio é inicializado se necessário.
6. Sair remove apenas `clienteLogado`; o carrinho permanece salvo no navegador.

### Produtos e estoque

1. A API permite listar e cadastrar produtos com fornecedor opcional no resultado (`LEFT JOIN`).
2. O catálogo que a tela de produtos realmente apresenta é uma lista mock local com 15 produtos, armazenada em `produtosMock` no `localStorage`; ela não consulta `GET /api/produtos`.
3. A busca do catálogo filtra nome e descrição, sem distinção entre maiúsculas e minúsculas.
4. Ao incluir item no carrinho, a quantidade inicial é 1; inclusões posteriores incrementam a quantidade.
5. O catálogo local impede que a quantidade do item no carrinho supere `quantidade_estoque` do mock.
6. No carrinho, quantidade menor ou igual a zero remove o item; quantidade maior que o estoque local é recusada.

### Carrinho e compra

1. O carrinho é persistido no `localStorage` do navegador e não é associado, no servidor, a um cliente autenticado.
2. O subtotal é `preço do item × quantidade`, e o total exibido é a soma dos subtotais.
3. Para finalizar, a interface exige cliente identificado, carrinho não vazio e forma de pagamento selecionada.
4. As formas de pagamento disponíveis nas telas são Pix, Cartão e Boleto.
5. A interface tenta criar pedido com status `Pendente` e, em seguida, criar seus itens.

### Pedidos e administração

1. A API permite listar pedidos, gravar pedido com cliente, data, pagamento, status e total, e listar/gravar itens por endpoint global.
2. A página de pedidos tenta mostrar somente pedidos cujo `id_cliente` corresponda ao cliente salvo no navegador.
3. A tela administrativa apresenta como estados possíveis `Pendente`, `Enviado`, `Entregue` e `Cancelado`.
4. O faturamento exibido no painel administrativo considera somente pedidos com status `Entregue`.
5. O painel sugere ações de alterar status, adicionar item e cancelar pedido.

## Regras sugeridas, mas não asseguradas pela implementação

As regras abaixo aparecem no fluxo ou no modelo, porém a API atual não as garante:

1. Criar um pedido deve gerar um identificador compatível com o frontend e criar seus itens.
2. Todo item deve pertencer a um pedido existente e a um produto existente.
3. O preço unitário do item deve ser definido/congelado no momento da compra; o total do pedido deve ser calculado no servidor a partir dos itens.
4. Incluir item, alterar quantidade ou cancelar pedido deve atualizar estoque de forma atômica e impedir estoque negativo.
5. Um cliente só pode consultar seus próprios pedidos; ações administrativas devem exigir perfil autorizado.
6. Status devem obedecer transições permitidas (por exemplo, impedir alteração de pedido cancelado ou entregue sem regra explícita).
7. E-mail de cliente e fornecedor deve ter formato válido e, para cliente, unicidade definida.
8. Senhas devem ser protegidas por hash e nunca ser devolvidas por API.
9. Produtos, fornecedores e clientes precisam de validação de campos obrigatórios, preço não negativo e quantidade inteira não negativa.

## Incompatibilidades que impedem aplicar algumas regras

- O checkout chama `POST /api/pedidos/:id/itens`, mas essa rota não existe; a rota implementada é `POST /api/itens` e requer também `preco_unitario`.
- Checkout, pedidos e painel chamam `GET /api/pedidos/:id`; a rota não existe.
- O painel chama `PATCH /api/pedidos/:id/status` e `PATCH /api/pedidos/:id/cancelar`; essas rotas não existem.
- O checkout não envia `data_pedido`, e envia `total_pedido: 0`; a API não corrige nem calcula esses valores.
- O resultado do insert de pedido não é adaptado para o formato `id_pedido` esperado pela interface.
- A tela de login e seu script não compartilham os mesmos IDs/contrato de formulário; portanto a regra de login da interface não é executável como está.

## Decisões pendentes

Antes de evoluir regras, é necessário decidir: tipos de usuários e permissões; cancelamento/devolução; reserva de estoque; frete/impostos/descontos; meios e confirmação de pagamento; política de edição de pedido; e regras de exclusão/arquivamento de cadastros.

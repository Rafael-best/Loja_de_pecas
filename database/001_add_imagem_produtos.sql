-- Sprint 2: adicionar o nome do arquivo de imagem ao catálogo.
-- Execute manualmente no banco loja_pecas somente se a coluna ainda não existir.
-- Os arquivos correspondentes devem ficar em frontend/assets/images/produtos/.

ALTER TABLE produtos
  ADD COLUMN imagem VARCHAR(255) NULL AFTER descricao_produto;

-- Exemplo de uso posterior:
-- UPDATE produtos SET imagem = 'rolamento-6204.webp' WHERE id_produto = 1;

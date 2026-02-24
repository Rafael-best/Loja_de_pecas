<?php
include 'conexao.php';
$resultado = mysqli_query($conexao, "SELECT * FROM produtos");
?>

<!DOCTYPE html>
<html>
<head>
    <title>Produtos</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<h2>Produtos Disponíveis</h2>

<table>
<tr>
    <th>Nome</th>
    <th>Descrição</th>
    <th>Preço</th>
    <th>Estoque</th>
</tr>

<?php while($produto = mysqli_fetch_assoc($resultado)) { ?>
<tr>
    <td><?php echo $produto['nome_produto']; ?></td>
    <td><?php echo $produto['descricao_produto']; ?></td>
    <td>R$ <?php echo $produto['preco_produto']; ?></td>
    <td><?php echo $produto['quantidade_estoque']; ?></td>
</tr>
<?php } ?>

</table>

<br>
<a href="index.php">Voltar</a>

</body>
</html>
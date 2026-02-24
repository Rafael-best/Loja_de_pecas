<?php
include 'conexao.php';

$nome = $_POST['nome'];
$endereco = $_POST['endereco'];
$telefone = $_POST['telefone'];
$email = $_POST['email'];

$sql = "INSERT INTO clientes (nome_cliente, endereco_cliente, telefone_cliente, email_cliente)
VALUES ('$nome', '$endereco', '$telefone', '$email')";

if (mysqli_query($conexao, $sql)) {
    echo "Cliente cadastrado com sucesso! <br><br>";
    echo "<a href='index.php'>Voltar</a>";
} else {
    echo "Erro: " . mysqli_error($conexao);
}
?>
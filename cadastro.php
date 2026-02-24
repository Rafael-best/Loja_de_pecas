<!DOCTYPE html>
<html>
<head>
    <title>Cadastro</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<h2>Cadastro de Cliente</h2>

<form action="salvar_cliente.php" method="POST">
    <input type="text" name="nome" placeholder="Nome" required><br><br>
    <input type="text" name="endereco" placeholder="Endereço"><br><br>
    <input type="text" name="telefone" placeholder="Telefone"><br><br>
    <input type="email" name="email" placeholder="Email"><br><br>
    <button type="submit">Cadastrar</button>
</form>

<br>
<a href="index.php">Voltar</a>

</body>
</html>
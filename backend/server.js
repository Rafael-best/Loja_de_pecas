const express = require("express");
const cors = require("cors");

const app = express();



app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


const loginRoutes = require("./routes/login");

app.use("/api/login", loginRoutes);



app.get("/", (req, res) => {
    res.json({
        sistema: "Loja de Peças",
        versao: "2.0",
        status: "Servidor Online",
        data: new Date()
    });
});



app.use((err, req, res, next) => {

    console.error(err.stack);

    res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno do servidor."
    });

});



const PORT = 3000;

app.listen(PORT, () => {

    console.log("======================================");
    console.log("🚗 LOJA DE PEÇAS");
    console.log("======================================");
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log("API: http://localhost:3000/api");
    console.log("======================================");

});
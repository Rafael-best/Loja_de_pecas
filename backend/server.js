const express = require("express");
const cors = require("cors");

const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.get("/", (req, res) => {
    res.status(200).json({
        status: "online",
        mensagem: "API Loja de Peças funcionando!"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado em http://localhost:${PORT}`);
});
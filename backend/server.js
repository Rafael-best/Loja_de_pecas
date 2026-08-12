const express = require("express");
const cors = require("cors");
const path = require("path");

const routes = require("./routes");

const app = express();


// =====================
// MIDDLEWARES
// =====================

app.use(cors());
app.use(express.json());


// =====================
// ARQUIVOS DO FRONTEND
// =====================

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);


// =====================
// ROTAS DA API
// =====================

app.use("/api", routes);


// =====================
// PÁGINA INICIAL
// =====================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../frontend/login.html")
    );
});


// =====================
// SERVIDOR
// =====================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("====================================");
    console.log("🚀 Servidor iniciado!");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("🐘 Banco: PostgreSQL");
    console.log("====================================");
});


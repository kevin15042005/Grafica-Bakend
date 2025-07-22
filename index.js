// backend/index.js
import express from "express";
import cors from "cors";
import rutasPlataformas from "./routes/plataformas.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.use("/porcentajes", rutasPlataformas); // Cambiado a ruta semántica

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

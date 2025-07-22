import express from "express";
import cors from "cors";
import rutasPlataformas from "./routes/plataformas.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/", rutasPlataformas); // Ruta: http://localhost:3000/porcentajes

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

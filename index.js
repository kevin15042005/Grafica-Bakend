import express from 'express';
import cors from 'cors';
import plataformasRouter from './routes/plataformas.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/porcentajes', plataformasRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
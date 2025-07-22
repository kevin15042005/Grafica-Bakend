import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import plataformasRouter from './routes/plataformas.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Evitar cache para datos siempre frescos
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Rutas
app.use('/porcentajes', plataformasRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

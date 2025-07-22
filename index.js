import express from 'express';
import cors from 'cors';
import plataformasRouter from './routes/plataformas.js';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('excel')); // Servir archivos Excel directamente

// Configuración para evitar caché
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use('/porcentajes', plataformasRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
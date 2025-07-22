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

// Middleware para actualización en tiempo real
app.use((req, res, next) => {
  // Forzar actualización de los archivos Excel antes de cada solicitud
  ['Inhouse-Grafica.xlsx', 'Vendors-Grafica.xlsx'].forEach(file => {
    const filePath = path.join('excel', file);
    if (fs.existsSync(filePath)) {
      fs.utimesSync(filePath, new Date(), new Date());
    }
  });
  next();
});

app.use('/porcentajes', plataformasRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
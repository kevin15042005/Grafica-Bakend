import express from 'express';
import cors from 'cors';
import { leerDatosPorTipo } from './sheetReader.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());

// Endpoint
app.get('/porcentajes/:tipo', async (req, res) => {
  try {
    const tipo = req.params.tipo.toLowerCase();
    const dueño = req.query.dueño || null; 

    if (!['inhouse', 'vendor'].includes(tipo)) {
      return res.status(400).json({ 
        error: 'Tipo inválido. Usar "inhouse" o "vendor"' 
      });
    }

    const datos = await leerDatosPorTipo(tipo, dueño);
    res.json(datos);
  } catch (error) {
    console.error('❌ Error en el endpoint:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalle: error.message 
    });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor listo en http://localhost:${port}`);
});
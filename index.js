import express from 'express';
import cors from 'cors';
import { leerDatosPorTipo, leerCalendario } from './sheetReader.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Endpoint porcentajes
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint calendario
app.get('/calendario', async (req, res) => {
  try {
    const eventos = await leerCalendario();
    res.json(eventos);
  } catch (error) {
    console.error('❌ Error en /calendario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor listo en http://localhost:${port}`);
});

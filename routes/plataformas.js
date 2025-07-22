import express from 'express';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const sheets = {
  inhouse: '1lfSUqhjeaCj24XoM_lPu4JZlUAZCqm71UZRf4aBa7Zg',
  vendors: '14uGWQ2tskK5zYUsVaMZkdWpqoHjFX76ClRzocmtqSKA',
};

async function obtenerDatos(sheetId) {
  const doc = new GoogleSpreadsheet(sheetId);

  await doc.useServiceAccountAuth({
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  });

  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  return rows.map(row => row.toObject());
}

router.get('/inhouse', async (req, res) => {
  try {
    const datos = await obtenerDatos(sheets.inhouse);
    res.json(datos);
  } catch (error) {
    console.error('Error al obtener datos inhouse:', error);
    res.status(500).json({ error: 'Error al obtener datos inhouse' });
  }
});

router.get('/vendors', async (req, res) => {
  try {
    const datos = await obtenerDatos(sheets.vendors);
    res.json(datos);
  } catch (error) {
    console.error('Error al obtener datos vendors:', error);
    res.status(500).json({ error: 'Error al obtener datos vendors' });
  }
});

export default router;

// sheetReader1.js
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();

async function leerCalendario() {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID_CALENDARIO;

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    if (rows.length === 0) {
      console.warn("⚠️ No hay datos en el calendario");
      return [];
    }

    const eventos = rows.map((row) => ({
      plataforma: row.get("Plataforma")?.trim() || "Sin plataforma",
      fecha: row.get("Fecha") || null,
      descripcion: row.get("Descipcion")?.trim() || "", // corregido
    }));

    return eventos;
  } catch (error) {
    console.error("❌ Error leyendo calendario:", error);
    return [];
  }
}

export { leerCalendario };

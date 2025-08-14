// sheetReader1.js
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();
//Completado

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
    
    // Asegúrate de usar el nombre correcto de la hoja
    const sheet = doc.sheetsByTitle["Calendario"] || doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    return rows.map((row) => ({
      title: row.get("Plataforma") || "Evento sin título",
      start: row.get("Fecha de Reunion") || new Date().toISOString(),
      end: row.get("Fecha de Finalización") || null, // Opcional
      description: row.get("Descripcion") || "",
      // Puedes añadir más campos si necesitas
      color: row.get("Color") || "#3a87ad" // Color opcional
    }));

  } catch (error) {
    console.error("❌ Error leyendo calendario:", error);
    return [];
  }
}

export { leerCalendario };

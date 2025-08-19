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
    const sheet = doc.sheetsByIndex[0]; // Asume que es la primera hoja
    const rows = await sheet.getRows();

    return rows.map((row) => {
      // Convierte formato de fecha dd/mm/yyyy -> yyyy-mm-dd
      const fechaParts = row.get("Fecha")?.split("/");
      const fechaISO =
        fechaParts?.length === 3
          ? `${fechaParts[2]}-${fechaParts[1].padStart(2, "0")}-${fechaParts[0].padStart(2, "0")}`
          : null;

      // Leer estado
      const estado = row.get("Estado") ? parseInt(row.get("Estado")) : null;

      // Determinar color según estado
      let color = "#999"; // default gris
      if (estado === 1) color = "green";     // Culminado
      else if (estado === 0) color = "red";  // No culminado
      else if (estado === 2) color = "orange"; // En proceso

      return {
        title: row.get("Plataforma") || "Evento sin título",
        start: fechaISO || new Date().toISOString().split("T")[0],
        description: row.get("Descripcion") || "", 
        dueño: row.get("Dueño") || "NO ASIGNADO", 
        estado: estado,
        color: color,
      };
    });
  } catch (error) {
    console.error("❌ Error leyendo calendario:", error);
    return [];
  }
}

export { leerCalendario };

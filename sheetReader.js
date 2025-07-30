import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();

const COLUMNAS_RELEVANTES = [
  "Analisis de Seguridad",
  "Comité de Asignaciones",
  "Formato de Recepcion de Infraestructura",
  "Ingeneria de Detalle",
  "Manual de Troublehooting",
  "Matriz de Perfilamiento",
  "Ola Datacenter",
  "Rutina de Mantenimiento",
  "SLAs Proveedor",
];

async function leerDatosPorTipo(tipo, filtroDueño = null) {
  try {
    const sheetId =
      tipo === "inhouse"
        ? process.env.GOOGLE_SHEET_ID_INHOUSE
        : process.env.GOOGLE_SHEET_ID_VENDOR;

    // Autenticación
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    // Cargar encabezados y filas
    const rows = await sheet.getRows();

    if (rows.length === 0) {
      console.warn("⚠️ No se encontraron filas con datos");
      return [];
    }

    // Procesar y filtrar filas
    const resultado = rows
      .map((row) => {
        const nombrePlataforma = row.get("Plataforma")?.trim() || "Sin nombre";
        const dueño = row.get("Dueño")?.trim().toUpperCase() || "NO ASIGNADO"; // Corregido el paréntesis

        // Contar columnas completadas
        let completadas = 0;
        const detalle = COLUMNAS_RELEVANTES.map((col) => {
          const valor = row.get(col)?.toString().trim();
          const completada = valor && valor !== "0" && valor.trim() !== "";
          if (completada) completadas++;

          return {
            nombre: col,
            completada,
            estado: valor,
          };
        });

        const porcentaje = Math.round(
          (completadas / COLUMNAS_RELEVANTES.length) * 100
        );
        let color =
          porcentaje >= 66 ? "verde" : porcentaje >= 33 ? "amarillo" : "rojo";

        return {
          plataforma: nombrePlataforma,
          dueño,
          porcentaje,
          color,
          completadas,
          totalColumnas: COLUMNAS_RELEVANTES.length,
          detalle,
        };
      })
      .filter(
        (item) =>
          !filtroDueño || item.dueño.includes(filtroDueño.toUpperCase().trim())
      );

    return resultado;
  } catch (error) {
    console.error(`❌ Error leyendo datos (${tipo}):`, error);
    return [];
  }
}

export { leerDatosPorTipo };

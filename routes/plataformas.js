// backend/routes/plataformas.js
import express from "express";
import XLSX from "xlsx";
import path from "path";
import fs from "fs";

const router = express.Router();

const analizarArchivo = (rutaArchivo) => {
  const workbook = XLSX.readFile(rutaArchivo);
  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  const datos = XLSX.utils.sheet_to_json(hoja, { header: 1 });

  const resultados = [];

  for (let i = 1; i < datos.length; i++) {
    const fila = datos[i];
    const nombre = fila[0];
    const celdas = fila.slice(1);

    let total = 0;
    let verde = 0;
    let amarillo = 0;
    let naranja = 0;
    let rojo = 0;
    let azul = 0;
    let rojoOscuro = 0;

    for (let celda of celdas) {
      total++;

      if (celda === 1 || celda === "1") verde++;
      else if (celda === 0 || celda === "0") amarillo++;
      else if (celda === "EN PROCESO") naranja++;
      else if (celda === "DEFINIENDO RESPONSABLE") azul++;
      else if (celda === "INHABILITADA") rojoOscuro++;
      else rojo++;
    }

    const porcentaje = parseFloat(((verde / total) * 100).toFixed(2));

    resultados.push({
      plataforma: nombre,
      porcentaje,
      verde,
      amarillo,
      naranja,
      azul,
      rojo,
      rojoOscuro
    });
  }

  return resultados;
};

router.get("/", (req, res) => {
  try {
    const archivo1 = path.join("excel", "Inhouse-Grafica.xlsx");
    const archivo2 = path.join("excel", "Vendors-Grafica.xlsx");

    const resultados1 = analizarArchivo(archivo1);
    const resultados2 = analizarArchivo(archivo2);

    const resultadosCombinados = [...resultados1, ...resultados2];

    res.json(resultadosCombinados);
  } catch (err) {
    res.status(500).json({ error: "Error al analizar los archivos Excel" });
  }
});

export default router;

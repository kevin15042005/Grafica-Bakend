import express from "express";
import XLSX from "xlsx";
import path from "path";

const router = express.Router();

const analizarArchivo = (rutaArchivo, tipo) => {
  const workbook = XLSX.readFile(rutaArchivo);
  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  const datos = XLSX.utils.sheet_to_json(hoja, { header: 1 });

  return datos.slice(1).map((fila) => {
    const plataforma = fila[0];
    const celdas = fila.slice(1);
    const total = celdas.length;
    
    const verde = celdas.filter(c => c === 1 || c === "1").length;
    const porcentaje = parseFloat(((verde / total) * 100).toFixed(2));

    return {
      plataforma,
      porcentaje,
      tipo,
      verde,
      amarillo: celdas.filter(c => c === 0 || c === "0").length,
      naranja: celdas.filter(c => c === "EN PROCESO").length,
      azul: celdas.filter(c => c === "DEFINIENDO RESPONSABLE").length,
      rojo: celdas.filter(c => 
        ![1, "1", 0, "0", "EN PROCESO", "DEFINIENDO RESPONSABLE"].includes(c)
      ).length
    };
  });
};

// Rutas separadas
router.get("/inhouse", (req, res) => {
  try {
    const archivo = path.join("excel", "Inhouse-Grafica.xlsx");
    res.json(analizarArchivo(archivo, "inhouse"));
  } catch (err) {
    res.status(500).json({ error: "Error al analizar archivo Inhouse" });
  }
});

router.get("/vendor", (req, res) => {
  try {
    const archivo = path.join("excel", "Vendors-Grafica.xlsx");
    res.json(analizarArchivo(archivo, "vendor"));
  } catch (err) {
    res.status(500).json({ error: "Error al analizar archivo Vendor" });
  }
});

export default router;
import express from 'express';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const getFileModifiedTime = (filePath) => {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return 0;
  }
};

const cache = {
  inhouse: { data: null, lastModified: 0 },
  vendor: { data: null, lastModified: 0 }
};

const procesarArchivo = (rutaArchivo, tipo) => {
  const currentModified = getFileModifiedTime(rutaArchivo);
  
  // Usar cache si el archivo no ha cambiado
  if (cache[tipo].data && cache[tipo].lastModified >= currentModified) {
    return cache[tipo].data;
  }

  const workbook = XLSX.readFile(rutaArchivo);
  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  const datos = XLSX.utils.sheet_to_json(hoja, { header: 1 });

  const resultados = datos.slice(1).map(fila => {
    const celdas = fila.slice(1).filter(c => c !== null && c !== undefined);
    const total = celdas.length;
    const verde = celdas.filter(c => c === 1 || c === "1").length;
    
    // Cálculo preciso del porcentaje
    const porcentaje = total > 0 ? Math.min(100, parseFloat(((verde / total) * 100).toFixed(2))) : 0;

    return {
      plataforma: fila[0],
      tipo,
      porcentaje,
      verde,
      amarillo: celdas.filter(c => c === 0 || c === "0").length,
      naranja: celdas.filter(c => c === "EN PROCESO").length,
      azul: celdas.filter(c => c === "DEFINIENDO RESPONSABLE").length,
      rojo: celdas.filter(c => 
        ![1, "1", 0, "0", "EN PROCESO", "DEFINIENDO RESPONSABLE"].includes(c)
      ).length,
      totalCasillas: total
    };
  });

  // Actualizar cache
  cache[tipo] = {
    data: resultados,
    lastModified: currentModified
  };

  return resultados;
};

router.get('/:tipo', (req, res) => {
  try {
    const tipo = req.params.tipo.toLowerCase();
    const archivo = path.join('excel', 
      tipo === 'inhouse' ? 'Inhouse-Grafica.xlsx' : 'Vendors-Grafica.xlsx');
    
    if (!fs.existsSync(archivo)) {
      return res.status(404).json({ error: `Archivo no encontrado para ${tipo}` });
    }

    const resultados = procesarArchivo(archivo, tipo);
    res.json(resultados);
  } catch (err) {
    console.error(`Error procesando ${req.params.tipo}:`, err);
    res.status(500).json({ error: `Error al procesar ${req.params.tipo}` });
  }
});

export default router;
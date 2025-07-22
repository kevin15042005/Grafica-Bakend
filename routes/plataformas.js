import express from 'express';
import XLSX from 'xlsx';
import path from 'path';

const router = express.Router();

const procesarArchivo = (rutaArchivo, tipo) => {
  const workbook = XLSX.readFile(rutaArchivo);
  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(hoja, { header: 1 })
    .slice(1)
    .map(fila => {
      const celdas = fila.slice(1);
      const total = celdas.length;
      const verde = celdas.filter(c => c === 1 || c === "1").length;
      
      return {
        plataforma: fila[0],
        tipo,
        porcentaje: parseFloat(((verde / total) * 100).toFixed(2)),
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

router.get('/:tipo', (req, res) => {
  try {
    const tipo = req.params.tipo.toLowerCase();
    const archivo = path.join('excel', 
      tipo === 'inhouse' ? 'Inhouse-Grafica.xlsx' : 'Vendors-Grafica.xlsx');
    
    res.json(procesarArchivo(archivo, tipo));
  } catch (err) {
    res.status(500).json({ error: `Error al procesar ${req.params.tipo}` });
  }
});

export default router;
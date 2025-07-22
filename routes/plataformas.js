import express from 'express';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const MAX_CASILLAS = 9; // Máximo de casillas a evaluar

const procesarArchivo = (rutaArchivo, tipo) => {
  try {
    const workbook = XLSX.readFile(rutaArchivo);
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const datos = XLSX.utils.sheet_to_json(hoja, { header: 1 });

    return datos.slice(1).map(fila => {
      // Tomar solo las primeras 9 columnas (casillas)
      const celdas = fila.slice(1, MAX_CASILLAS + 1);
      const totalRelevantes = celdas.filter(c => 
        c !== null && c !== undefined && c !== ''
      ).length;
      
      const verde = celdas.filter(c => c === 1 || c === "1").length;
      
      // Cálculo preciso del porcentaje
      const porcentaje = totalRelevantes > 0 
        ? Math.min(100, Math.round((verde / totalRelevantes) * 10000) / 100)
        : 0;

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
        totalCasillas: totalRelevantes
      };
    });
  } catch (error) {
    console.error(`Error procesando archivo ${rutaArchivo}:`, error);
    return [];
  }
};

// Ruta para verificar cambios
router.get('/verificar-actualizacion', (req, res) => {
  try {
    const archivos = {
      inhouse: path.join('excel', 'Inhouse-Grafica.xlsx'),
      vendor: path.join('excel', 'Vendors-Grafica.xlsx')
    };
    
    const resultados = {};
    for (const [tipo, archivo] of Object.entries(archivos)) {
      resultados[tipo] = {
        existe: fs.existsSync(archivo),
        modificado: fs.existsSync(archivo) ? fs.statSync(archivo).mtimeMs : 0
      };
    }
    
    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: 'Error verificando archivos' });
  }
});

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
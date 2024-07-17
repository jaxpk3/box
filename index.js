const express = require('express');
const app = express();
const XLSX = require('xlsx');
const path = require('path');

// Configuración para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

const workbook = XLSX.readFile('./mnt/data/DB.xlsx');

// Ruta para buscar por nombre de producto
app.get('/search/product/:name', (req, res) => {
  const productName = req.params.name.toLowerCase();
  let results = [];

  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const products = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    for (let i = 1; i < products.length; i++) {
      if (products[i][0] && products[i][0].toLowerCase() === productName) {
        results.push({
          caja: sheetName,
          producto: products[i][0],
          cantidad: products[i][1]
        });
      }
    }
  });

  res.json(results);
});

// Ruta para buscar por número de caja
app.get('/search/box/:name', (req, res) => {
  const boxName = req.params.name;
  const worksheet = workbook.Sheets[boxName];

  if (!worksheet) {
    return res.status(404).json({ error: 'Caja no encontrada' });
  }

  const products = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  let results = [];

  for (let i = 1; i < products.length; i++) {
    if (products[i][0]) {
      results.push({
        producto: products[i][0],
        cantidad: products[i][1]
      });
    }
  }

  res.json(results);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

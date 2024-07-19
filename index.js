
const express = require('express');
const app = express();
const XLSX = require('xlsx');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

// Configuración para servir archivos estáticos y parsear JSON
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Configuración de Multer para la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const box = req.body.caja;
    const dir = `./uploads/${box}`;

    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

const workbook = XLSX.readFile('./mnt/data/DB.xlsx');


// Ruta para buscar por nombre de producto (con búsqueda parcial)
app.get('/search/product/:name', (req, res) => {
  const productName = req.params.name.toLowerCase();
  let results = [];

  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const products = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    for (let i = 1; i < products.length; i++) {
      const product = products[i][0].toLowerCase();
      if (product.includes(productName)) {
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

// Ruta para buscar por número de caja (con búsqueda parcial)
app.get('/search/box/:name', (req, res) => {
  const boxName = req.params.name.toLowerCase();
  let results = [];

  workbook.SheetNames.forEach(sheetName => {
    if (sheetName.toLowerCase().includes(boxName)) {
      const worksheet = workbook.Sheets[sheetName];
      const products = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      for (let i = 1; i < products.length; i++) {
        if (products[i][0]) {
          results.push({
            caja: sheetName,
            producto: products[i][0],
            cantidad: products[i][1]
          });
        }
      }
    }
  });

  res.json(results);
});

// Ruta para agregar un producto
app.post('/addProduct', (req, res) => {
  const { caja, producto, cantidad } = req.body;
  const worksheet = workbook.Sheets[caja];

  if (!worksheet) {
    return res.status(404).json({ error: 'Caja no encontrada' });
  }

  const products = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  products.push([producto, cantidad]);

  const newWorksheet = XLSX.utils.aoa_to_sheet(products);
  workbook.Sheets[caja] = newWorksheet;
  XLSX.writeFile(workbook, './mnt/data/DB.xlsx');

  res.json({ message: 'Producto agregado exitosamente' });
});

// Ruta para editar un producto
app.put('/editProduct', (req, res) => {
  const { caja, producto, cantidad } = req.body;
  const worksheet = workbook.Sheets[caja];

  if (!worksheet) {
    return res.status(404).json({ error: 'Caja no encontrada' });
  }

  const products = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  let productFound = false;

  for (let i = 1; i < products.length; i++) {
    if (products[i][0] === producto) {
      products[i][1] = cantidad;
      productFound = true;
      break;
    }
  }

  if (!productFound) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const newWorksheet = XLSX.utils.aoa_to_sheet(products);
  workbook.Sheets[caja] = newWorksheet;
  XLSX.writeFile(workbook, './mnt/data/DB.xlsx');

  res.json({ message: 'Producto editado exitosamente' });
});

// Ruta para eliminar un producto
app.delete('/deleteProduct', (req, res) => {
  const { caja, producto } = req.body;
  const worksheet = workbook.Sheets[caja];

  if (!worksheet) {
    return res.status(404).json({ error: 'Caja no encontrada' });
  }

  const products = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const newProducts = products.filter(p => p[0] !== producto);

  if (newProducts.length === products.length) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const newWorksheet = XLSX.utils.aoa_to_sheet(newProducts);
  workbook.Sheets[caja] = newWorksheet;
  XLSX.writeFile(workbook, './mnt/data/DB.xlsx');

  res.json({ message: 'Producto eliminado exitosamente' });
});







// Ruta para cargar imágenes asociadas a una caja
app.post('/uploadImage', upload.array('images'), (req, res) => {
  const box = req.body.caja;
  const files = req.files;
  const worksheet = workbook.Sheets[box];

  if (!worksheet) {
    return res.status(404).json({ error: 'Caja no encontrada' });
  }

  let imagePaths = [];

  if (files) {
    files.forEach(file => {
      imagePaths.push(file.path);
    });
  }

  // Guardar los paths de las imágenes en una columna de la hoja de cálculo
  let lastRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 }).length;
  worksheet[`A${lastRow + 1}`] = { v: 'Imágenes' };
  worksheet[`B${lastRow + 1}`] = { v: imagePaths.join(', ') };

  XLSX.writeFile(workbook, './mnt/data/DB.xlsx');

  res.json({ message: 'Imágenes subidas exitosamente', files });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


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






//Nuevo:::::::::::::::::::
app.use('/images', express.static(path.join(__dirname, 'images')));



// Configuración de Multer para la carga de archivos
/*REEMPLAZO ESTO
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
*/

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'images', req.body.caja);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
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

// Ruta para buscar por número de caja (modificada para incluir imágenes)
app.get('/search/box/:name', (req, res) => {
  const boxName = req.params.name;
  const worksheet = workbook.Sheets[boxName];

  if (!worksheet) {
    return res.status(404).json({ error: 'Caja no encontrada' });
  }

  const products = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  let results = [];
  let imagePaths = [];

  for (let i = 1; i < products.length; i++) {
    if (products[i][0] === 'Imágenes') {
      imagePaths = products[i][1].split(', ');
    } else if (products[i][0]) {
      results.push({
        producto: products[i][0],
        cantidad: products[i][1]
      });
    }
  }

  res.json({ productos: results, imagenes: imagePaths });
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

app.post('/uploadImage', upload.array('images', 12), (req, res) => {
  const boxName = req.body.caja;
  const files = req.files;
  let imagePaths = files.map(file => `/images/${boxName}/${file.filename}`);

  // Guardar las rutas de las imágenes en la hoja de cálculo
  const worksheet = workbook.Sheets[boxName];
  if (!worksheet) {
    return res.status(404).json({ error: 'Caja no encontrada' });
  }

  let imagesRow = -1;
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === 'Imágenes') {
      imagesRow = i;
      break;
    }
  }

  if (imagesRow === -1) {
    // Si no existe la fila de imágenes, agregarla al final
    rows.push(['Imágenes', imagePaths.join(', ')]);
  } else {
    // Si existe, actualizar la fila
    rows[imagesRow][1] = rows[imagesRow][1] ? rows[imagesRow][1] + ', ' + imagePaths.join(', ') : imagePaths.join(', ');
  }

  const newSheet = XLSX.utils.aoa_to_sheet(rows);
  workbook.Sheets[boxName] = newSheet;
  XLSX.writeFile(workbook, './mnt/data/DB.xlsx');

  res.json({ message: 'Imágenes subidas exitosamente.' });
});





// Ruta para agregar una nueva caja
app.post('/addBox', (req, res) => {
  const { caja } = req.body;

  if (workbook.SheetNames.includes(caja)) {
    return res.status(400).json({ error: 'La caja ya existe' });
  }

  // Crear la estructura inicial de la caja
  const newSheetData = [
    ['producto', 'cantidad']
  ];

  // Agregar la nueva hoja al libro de trabajo
  const newSheet = XLSX.utils.aoa_to_sheet(newSheetData);
  workbook.SheetNames.push(caja);
  workbook.Sheets[caja] = newSheet;

  // Guardar el archivo de Excel
  XLSX.writeFile(workbook, './mnt/data/DB.xlsx');

  res.json({ message: 'Caja agregada exitosamente' });
});





const port = 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


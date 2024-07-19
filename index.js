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

// Rutas existentes para búsqueda y gestión de productos...
// Aquí agregarás las rutas anteriores para buscar, agregar, editar y eliminar productos

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

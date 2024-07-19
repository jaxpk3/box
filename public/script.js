// Función de búsqueda (existente)
function search() {
  const boxInput = document.getElementById('boxInput').value.trim().toLowerCase();
  const productInput = document.getElementById('productInput').value.trim().toLowerCase();
  const resultsDiv = document.getElementById('results');

  if (!boxInput && !productInput) {
    resultsDiv.innerHTML = 'Por favor, introduce un número de caja o nombre de producto.';
    return;
  }

  if (boxInput && !productInput) {
    fetch(`/search/box/${boxInput}`)
      .then(response => response.json())
      .then(data => {
        if (data.length === 0) {
          resultsDiv.innerHTML = `No se encontraron cajas que coincidan con "${boxInput}".`;
        } else {
          let html = `<h2>Resultados para cajas que coinciden con "${boxInput}"</h2>`;
          html += '<ul>';
          data.forEach(item => {
            html += `<li>Producto: ${item.producto}, Cantidad: ${item.cantidad}</li>`;
          });
          html += '</ul>';
          resultsDiv.innerHTML = html;
        }
      });
  } else if (!boxInput && productInput) {
    fetch(`/search/product/${productInput}`)
      .then(response => response.json())
      .then(data => {
        if (data.length === 0) {
          resultsDiv.innerHTML = `No se encontraron productos que coincidan con "${productInput}".`;
        } else {
          let html = `<h2>Resultados para productos que coinciden con "${productInput}"</h2>`;
          html += '<ul>';
          data.forEach(item => {
            html += `<li>Producto: ${item.producto}, Caja: ${item.caja}, Cantidad: ${item.cantidad}</li>`;
          });
          html += '</ul>';
          resultsDiv.innerHTML = html;
        }
      });
  } else {
    fetch(`/search/box/${boxInput}`)
      .then(response => response.json())
      .then(data => {
        if (data.length === 0) {
          resultsDiv.innerHTML = `No se encontraron cajas que coincidan con "${boxInput}".`;
        } else {
          let productFound = false;
          let html = `<h2>Resultados para cajas que coinciden con "${boxInput}" y producto "${productInput}"</h2>`;
          let results = [];

          data.forEach(box => {
            if (box.producto.toLowerCase().includes(productInput)) {
              productFound = true;
              results.push(`<li>Producto: ${box.producto}, Cantidad: ${box.cantidad}</li>`);
            }
          });

          if (productFound) {
            html += '<ul>' + results.join('') + '</ul>';
          } else {
            html = `No se encontró el producto "${productInput}" en la caja "${boxInput}".`;
          }
          resultsDiv.innerHTML = html;
        }
      });
  }
}

// Agregar la función para buscar al presionar Enter en cualquiera de los campos
document.getElementById("boxInput").addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    search();
  }
});

document.getElementById("productInput").addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    search();
  }
});

// Función para agregar un producto (existente)
function addProduct() {
  const box = document.getElementById('addBox').value.trim();
  const product = document.getElementById('addProduct').value.trim();
  const quantity = document.getElementById('addQuantity').value.trim();
  const resultDiv = document.getElementById('addResult');

  fetch('/addProduct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ caja: box, producto: product, cantidad: quantity })
  })
    .then(response => response.json())
    .then(data => {
      resultDiv.innerHTML = data.message;
    })
    .catch(error => {
      resultDiv.innerHTML = 'Error al agregar el producto.';
    });
}

// Función para editar un producto (existente)
function editProduct() {
  const box = document.getElementById('editBox').value.trim();
  const product = document.getElementById('editProduct').value.trim();
  const quantity = document.getElementById('editQuantity').value.trim();
  const resultDiv = document.getElementById('editResult');

  fetch('/editProduct', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ caja: box, producto: product, cantidad: quantity })
  })
    .then(response => response.json())
    .then(data => {
      resultDiv.innerHTML = data.message;
    })
    .catch(error => {
      resultDiv.innerHTML = 'Error al editar el producto.';
    });
}

// Función para eliminar un producto (existente)
function deleteProduct() {
  const box = document.getElementById('deleteBox').value.trim();
  const product = document.getElementById('deleteProduct').value.trim();
  const resultDiv = document.getElementById('deleteResult');

  fetch('/deleteProduct', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ caja: box, producto: product })
  })
    .then(response => response.json())
    .then(data => {
      resultDiv.innerHTML = data.message;
    })
    .catch(error => {
      resultDiv.innerHTML = 'Error al eliminar el producto.';
    });
}

// Función para subir imágenes
function uploadImages() {
  const box = document.getElementById('uploadBox').value.trim();
  const images = document.getElementById('uploadImages').files;
  const resultDiv = document.getElementById('uploadResult');

  if (!box || images.length === 0) {
    resultDiv.innerHTML = 'Por favor, introduce el número de caja y selecciona al menos una imagen.';
    return;
  }

  const formData = new FormData();
  formData.append('caja', box);

  for (let i = 0; i < images.length; i++) {
    formData.append('images', images[i]);
  }

  fetch('/uploadImage', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      resultDiv.innerHTML = data.message;
    })
    .catch(error => {
      resultDiv.innerHTML = 'Error al subir las imágenes.';
    });
}

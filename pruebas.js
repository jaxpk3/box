// Función de búsqueda (modificada para incluir imágenes)
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
          if (data.error) {
            resultsDiv.innerHTML = data.error;
          } else {
            let html = `<h2>Productos en la caja ${boxInput}</h2>`;
            html += '<ul>';
            data.productos.forEach(item => {
              html += `<li>Producto: ${item.producto}, Cantidad: ${item.cantidad}</li>`;
            });
            html += '</ul>';
  
            if (data.imagenes.length > 0) {
              html += `<h2>Imágenes de la caja ${boxInput}</h2>`;
              html += '<div>';
              data.imagenes.forEach(image => {
                html += `<img src="${image}" alt="Imagen de la caja ${boxInput}" style="max-width: 200px; margin: 5px;">`;
              });
              html += '</div>';
            }
  
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
          if (data.error) {
            resultsDiv.innerHTML = data.error;
          } else {
            let productFound = false;
            let html = `<h2>Resultados para caja ${boxInput} y producto "${productInput}"</h2>`;
            let results = [];
  
            data.productos.forEach(item => {
              if (item.producto.toLowerCase().includes(productInput)) {
                productFound = true;
                results.push(`<li>Producto: ${item.producto}, Cantidad: ${item.cantidad}</li>`);
              }
            });
  
            if (productFound) {
              html += '<ul>' + results.join('') + '</ul>';
            } else {
              html = `No se encontró el producto "${productInput}" en la caja "${boxInput}".`;
            }
  
            if (data.imagenes.length > 0) {
              html += `<h2>Imágenes de la caja ${boxInput}</h2>`;
              html += '<div>';
              data.imagenes.forEach(image => {
                html += `<img src="${image}" alt="Imagen de la caja ${boxInput}" style="max-width: 200px; margin: 5px;">`;
              });
              html += '</div>';
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
  
  // Funciones de agregar, editar, eliminar y subir imágenes (sin cambios)
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
  
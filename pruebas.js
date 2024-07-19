function search() {
    const boxInput = document.getElementById('boxInput').value.trim().toLowerCase();
    const productInput = document.getElementById('productInput').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('results');
    const imagesContainer = document.getElementById('imagesContainer');
  
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
                html += `<img src="${image}" alt="Imagen de la caja ${boxInput}">`;
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
                html += `<img src="${image}" alt="Imagen de la caja ${boxInput}">`;
              });
              html += '</div>';
            }
  
            resultsDiv.innerHTML = html;
          }
        });
    }
  }
  
  function uploadImages() {
    const box = document.getElementById('uploadBox').value.trim();
    const files = document.getElementById('uploadImages').files;
    const uploadResult = document.getElementById('uploadResult');
  
    if (!box || files.length === 0) {
      uploadResult.innerHTML = 'Por favor, introduce el número de caja y selecciona imágenes.';
      return;
    }
  
    const formData = new FormData();
    formData.append('caja', box);
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
  
    fetch('/uploadImage', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        uploadResult.innerHTML = data.message;
        document.getElementById('uploadBox').value = '';
        document.getElementById('uploadImages').value = '';
      })
      .catch(error => {
        uploadResult.innerHTML = 'Error al subir las imágenes.';
      });
  }
  
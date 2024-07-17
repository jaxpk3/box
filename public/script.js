function search() {
  const boxInput = document.getElementById('boxInput').value.trim().toLowerCase();
  const productInput = document.getElementById('productInput').value.trim().toLowerCase();
  const resultsDiv = document.getElementById('results');

  // Verificar que al menos uno de los campos esté lleno
  if (!boxInput && !productInput) {
    resultsDiv.innerHTML = 'Por favor, introduce un número de caja o nombre de producto.';
    return;
  }

  // Determinar qué tipo de búsqueda realizar
  if (boxInput && !productInput) {
      // Búsqueda por número de caja
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
      // Búsqueda por nombre de producto
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
      // Búsqueda combinada
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

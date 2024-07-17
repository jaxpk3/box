// Buscador del lado del Frontend


function search() {
  const boxInput = document.getElementById('boxInput').value.trim();
  const productInput = document.getElementById('productInput').value.trim();
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
        if (data.error) {
          resultsDiv.innerHTML = data.error;
        } else {
          let html = `<h2>Productos en la caja ${boxInput}</h2>`;
          html += '<ul>';
          data.forEach(item => {
            html += `<li>${item.producto}: ${item.cantidad} unidades</li>`;
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
          resultsDiv.innerHTML = `No se encontró el producto "${productInput}".`;
        } else {
          let html = `<h2>Resultados de búsqueda para "${productInput}"</h2>`;
          html += '<ul>';
          data.forEach(item => {
            html += `<li>Producto: ${item.producto}, Caja: ${item.caja}, Cantidad: ${item.cantidad}</li>`;
          });
          html += '</ul>';
          resultsDiv.innerHTML = html;
        }
      });
  } else {
    // Búsqueda combinada (no implementada aquí, puedes adaptar según necesites)
    resultsDiv.innerHTML = 'Búsqueda combinada no implementada.';
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

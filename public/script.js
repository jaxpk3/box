function search() {
  const input = document.getElementById('searchInput').value;
  const resultsDiv = document.getElementById('results');

  if (!input) {
    resultsDiv.innerHTML = 'Por favor, introduce un nombre de producto o número de caja.';
    return;
  }

  // Determinar si es un producto o una caja
  const isBox = !isNaN(input);

  if (isBox) {
    fetch(`/search/box/${input}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          resultsDiv.innerHTML = data.error;
        } else {
          let html = `<h2>Productos en la caja ${input}</h2>`;
          html += '<ul>';
          data.forEach(item => {
            html += `<li>${item.producto}: ${item.cantidad} unidades</li>`;
          });
          html += '</ul>';
          resultsDiv.innerHTML = html;
        }
      });
  } else {
    fetch(`/search/product/${input}`)
      .then(response => response.json())
      .then(data => {
        if (data.length === 0) {
          resultsDiv.innerHTML = `No se encontró el producto "${input}".`;
        } else {
          let html = `<h2>Resultados de búsqueda para "${input}"</h2>`;
          html += '<ul>';
          data.forEach(item => {
            html += `<li>Producto: ${item.producto}, Caja: ${item.caja}, Cantidad: ${item.cantidad}</li>`;
          });
          html += '</ul>';
          resultsDiv.innerHTML = html;
        }
      });
  }
}

// Agregar la función para buscar al presionar Enter
document.getElementById("searchInput").addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
      search();
  }
});

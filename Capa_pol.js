// Verificar que Leaflet esté disponible antes de ejecutar el script
if (typeof L === "undefined") {
  console.error("Leaflet no está cargado correctamente. Verifica que la biblioteca se haya incluido en index.html.");
} else {
  document.addEventListener("DOMContentLoaded", function () {
      console.log("DOM cargado, iniciando carga del GeoJSON...");

      // Verificar que 'map' ya esté definido
      if (typeof map === "undefined") {
          console.error("El objeto 'map' no está definido. Verifica que se haya inicializado en otro archivo.");
          return;
      }

      // Si existe un grupo de capas previo, lo removemos
      if (map.geojsonBaseLayerGroup) {
          map.removeLayer(map.geojsonBaseLayerGroup);
      }

      // Creamos un grupo de capas exclusivo para el GeoJSON
      map.geojsonBaseLayerGroup = L.layerGroup().addTo(map);

      // Declarar la variable global para la capa IDS_AO
      IDS_AO_layer = null;

      // Deshabilitar el checkbox hasta que la capa se cargue
      var toggleCheckbox = document.getElementById("toggleIDSCheckbox");
      if (toggleCheckbox) {
          toggleCheckbox.disabled = true;
      }

      // Función para cargar el GeoJSON
      function loadGeoJSON(url) {
          console.log("Número de capas previas en geojsonBaseLayerGroup antes de limpiar:", map.geojsonBaseLayerGroup.getLayers().length);
          map.geojsonBaseLayerGroup.clearLayers();
          IDS_AO_layer = null;

          // Agregar un parámetro de cache busting para evitar el uso de versiones cacheadas
          const urlConCacheBust = url + "?v=" + Date.now();
          console.log(`Cargando GeoJSON desde: ${urlConCacheBust}`);

          fetch(urlConCacheBust)
              .then(response => response.ok ? response.json() : Promise.reject(`Error al cargar el archivo: ${response.statusText}`))
              .then(data => {
                  console.log("GeoJSON cargado:", data);

                  if (!data || !data.features || data.features.length === 0) {
                      throw new Error("El archivo GeoJSON no contiene 'features' válidos.");
                  }

                  // Paleta de tonos rojos para cada categoría basada en e_idsm
                  const coloresPorCategoria = {
                      "Muy alto": "#6B0000",
                      "Alto": "#A80000",
                      "Medio": "#D43A3A",
                      "Bajo": "#F07A7A",
                      "Muy bajo": "#FACACA",
                      "Sin información": "#9E9E9E"
                  };

                  // Crear la capa GeoJSON y asignar estilos
                  IDS_AO_layer = L.geoJSON(data, {
                      style: feature => {
                          let categoria = (feature.properties?.e_idsm || "Sin información").toString().trim();
                          // Normalizar cadena para coincidir exactamente con las categorías esperadas
                          if (!categoria) categoria = "Sin información";
                          const color = coloresPorCategoria[categoria] || coloresPorCategoria["Sin información"];
                          // Estilo para la categoría
                          return {
                              color: color,
                              weight: categoria === "Sin información" ? 1 : 2,
                              fillOpacity: categoria === "Sin información" ? 0.35 : 0.6,
                              fillColor: color
                          };
                      },
                      onEachFeature: (feature, layer) => {
                          let popupContent = `<h3>${feature.properties?.name || "Sin título"}</h3>
                                              <p><strong>e_idsm:</strong> ${feature.properties?.e_idsm || "No especificado"}</p>`;
                          layer.bindPopup(popupContent);

                          if (L.DomEvent && typeof L.DomEvent.disableClickPropagation === "function") {
                              L.DomEvent.disableClickPropagation(layer);
                          }

                          // Eventos de resaltado
                          layer.on("mouseover", () => layer.setStyle({ fillOpacity: 1, weight: 3 }));
                          layer.on("mouseout", () => layer.setStyle({ fillOpacity: 0.6, weight: 2 }));
                      }
                  });

                  // Agregar la capa al grupo exclusivo y moverla al fondo
                  map.geojsonBaseLayerGroup.addLayer(IDS_AO_layer);
                  IDS_AO_layer.eachLayer(layer => layer.bringToBack());

                  console.log("Capa GeoJSON cargada, actualizada y movida al fondo correctamente.");

                  // Habilitar el checkbox para que el usuario pueda interactuar
                  if (toggleCheckbox) {
                      toggleCheckbox.disabled = false;
                      // activar o desactivar según estado actual
                      if (!toggleCheckbox.checked) {
                          map.geojsonBaseLayerGroup.removeLayer(IDS_AO_layer);
                      }
                      toggleCheckbox.addEventListener('change', function(e) {
                          if (!IDS_AO_layer) return;
                          if (e.target.checked) {
                              map.geojsonBaseLayerGroup.addLayer(IDS_AO_layer);
                          } else {
                              map.geojsonBaseLayerGroup.removeLayer(IDS_AO_layer);
                          }
                      });
                  }
              })
              .catch(error => console.error("Error al cargar el GeoJSON:", error));
      }

      // Ejecutar la carga del GeoJSON
      loadGeoJSON("data/IDS AO.geojson");

      // Aplicar fuente Montserrat Medium dinámicamente
      document.querySelectorAll(".lista-capas li span, .lista-capas li label, .form-check-label").forEach(element => {
          element.style.fontFamily = "Montserrat, sans-serif";
          element.style.fontWeight = "400";
      });
  });
}
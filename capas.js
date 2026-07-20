document.addEventListener("DOMContentLoaded", function () {
  // Verifica si Leaflet y el mapa están definidos
  if (typeof L === "undefined" || typeof map === "undefined") {
      console.error("Leaflet o el mapa no están definidos. Verifica que `mapabase.js` se cargue primero.");
      return;
  }

  // Crear un "pane" exclusivo para las capas de puntos con z-index alto
  if (!map.getPane('capasPuntosPane')) {
      map.createPane('capasPuntosPane');
      map.getPane('capasPuntosPane').style.zIndex = 450;
  }

  // Objeto para almacenar las capas de puntos
  let capasPuntos = {};

  // Verifica que exista el contenedor en el sidebar
  let controlCapasContainer = document.getElementById("controlCapasContainer");
  if (!controlCapasContainer) {
      console.error("No se encontró el contenedor #controlCapasContainer en el HTML.");
      return;
  }

  // Crear la lista de controles en el sidebar
  let listaCapas = document.createElement("ul");
  listaCapas.className = "lista-capas";
  controlCapasContainer.appendChild(listaCapas);

  // Diccionario de íconos personalizados para cada capa
  const iconosCapas = {
      "Centros de Atención y Cuidado Infantil": L.icon({
          iconUrl: "img/icono/CACI.png",
          iconSize: [40, 40],
          iconAnchor: [30, 30],
          popupAnchor: [0, -32]
      }),
      "Casas de Adulto Mayor": L.icon({
          iconUrl: "img/icono/CAM.png",
          iconSize: [40, 40],
          iconAnchor: [30, 30],
          popupAnchor: [0, -32]
      }),
      "Centros de Desarrollo Comunitario": L.icon({
          iconUrl: "img/icono/CDC.png",
          iconSize: [40, 40],
          iconAnchor: [30, 30],
          popupAnchor: [0, -32]
      }),
      "Centros Culturales": L.icon({
          iconUrl: "img/icono/CC.png",
          iconSize: [40, 40],
          iconAnchor: [30, 30],
          popupAnchor: [0, -32]
      }),
      "Centros Interactivos": L.icon({
          iconUrl: "img/icono/CDC_CI.png",
          iconSize: [40, 40],
          iconAnchor: [30, 30],
          popupAnchor: [0, -32]
      }),
      "Centros de Artes y Oficios": L.icon({
          iconUrl: "img/icono/CAO.png",
          iconSize: [40, 40],
          iconAnchor: [30, 30],
          popupAnchor: [0, -32]
      })
  };

  // Función para cargar cada capa GeoJSON
  function cargarCapaPuntos(nombreCapa, url) {
      fetch(url)
          .then(response => {
              if (!response.ok) {
                  throw new Error(`Error al cargar ${nombreCapa}: ${response.statusText}`);
              }
              return response.json();
          })
          .then(data => {
              console.log(`Capa ${nombreCapa} cargada correctamente`, data);

              // Crear la capa GeoJSON sin añadirla al mapa de inmediato
              capasPuntos[nombreCapa] = L.geoJSON(data, {
                  pane: 'capasPuntosPane',
                  pointToLayer: function (feature, latlng) {
                      return L.marker(latlng, { icon: iconosCapas[nombreCapa] });
                  },
                  onEachFeature: function (feature, layer) {
                      let nombre = feature.properties["Name"] || "Sin nombre";
                      let tipo = feature.properties["Tipo"] || "No especificado";
                      let direccion = feature.properties["Direccion"] || "Sin dirección";
                      let telefono = feature.properties["Telefono"] || "No disponible";
                      let descripcion = feature.properties["Descripcion"] || "Sin información";
                      let vista1 = feature.properties["Vista1"] || "";
                      let vista2 = feature.properties["Vista2"] || "";

                      // Construcción del contenido del popup con la información original
                      let popupContent = `<b>${nombre}</b><br>
                                          <b>Tipo:</b> ${tipo}<br>
                                          <b>Dirección:</b> ${direccion}<br>
                                          <b>Teléfono:</b> ${telefono}<br>
                                          <b>Descripción:</b> ${descripcion}<br>`;

                      // Agregar imágenes en la parte inferior si existen
                      if (vista1) {
                          popupContent += `<img src="${vista1}" width="200px" style="margin-top:10px;"><br>`;
                      }
                      if (vista2) {
                          popupContent += `<img src="${vista2}" width="200px" style="margin-top:10px;"><br>`;
                      }

                      layer.bindPopup(popupContent);
                  }
              });

              // Crear el ítem en la lista del sidebar para el control de la capa
              let itemCapa = document.createElement("li");

              // Crear el checkbox para mostrar/ocultar la capa
              let checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.checked = false; // La capa se inicia apagada

              // Al cambiar el estado, se agrega o quita la capa del mapa
              checkbox.addEventListener("change", function () {
                  if (checkbox.checked) {
                      capasPuntos[nombreCapa].addTo(map);
                      capasPuntos[nombreCapa].bringToFront();
                  } else {
                      map.removeLayer(capasPuntos[nombreCapa]);
                  }
              });

              // Crear la imagen del ícono de la capa
              let iconoImg = document.createElement("img");
              let icono = iconosCapas[nombreCapa];
              iconoImg.src = icono ? icono.options.iconUrl : "img/icono/default.png";
              iconoImg.width = 24;
              iconoImg.height = 24;
              iconoImg.style.marginRight = "8px";

              // Crear la etiqueta con el nombre de la capa
              let label = document.createElement("span");
              label.textContent = nombreCapa;

              // Agregar checkbox, ícono y etiqueta al ítem de la lista
              itemCapa.appendChild(checkbox);
              itemCapa.appendChild(iconoImg);
              itemCapa.appendChild(label);
              listaCapas.appendChild(itemCapa);

          })
          .catch(error => console.error(`Error al cargar la capa ${nombreCapa}:`, error));
  }

  // Llamar a la función para cargar cada una de las capas (sin activarlas inicialmente)
  cargarCapaPuntos("Centros de Atención y Cuidado Infantil", "archivos/vectores/dataSHP_CACI_mod.geojson");
  cargarCapaPuntos("Casas de Adulto Mayor", "archivos/vectores/dataSHP_CAM_mod.geojson");
  cargarCapaPuntos("Centros de Desarrollo Comunitario", "archivos/vectores/dataSHP_CDC_mod.geojson");
  cargarCapaPuntos("Centros Culturales", "archivos/vectores/dataSHP_CC_mod.geojson");
  cargarCapaPuntos("Centros Interactivos", "archivos/vectores/dataSHP_CDC_CI_mod.geojson");
  cargarCapaPuntos("Centros de Artes y Oficios", "archivos/vectores/dataSHP_CAO_mod.geojson");
});
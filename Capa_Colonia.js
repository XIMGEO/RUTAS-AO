// Espera a que todo el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", function () {

    // Verifica que Leaflet y el objeto del mapa estén definidos correctamente
    if (typeof L === "undefined" || typeof map === "undefined") {
        console.error("Leaflet o el mapa no están definidos. Verifica la carga de `mapabase.js`.");
        return;
    }

    // Crea un pane personalizado para las colonias, con z-index para controlar su orden en el mapa
    if (!map.getPane('coloniasPane')) {
        map.createPane('coloniasPane');
        map.getPane('coloniasPane').style.zIndex = 500;
    }

    let capaColonias = null;              // Guardará la capa con los polígonos de colonias
    let vistaInicialAplicada = false;     // Evita que el ajuste de vista se aplique más de una vez
    let coloniaSeleccionada = null;       // Almacena la colonia actualmente seleccionada

    // Cargar archivo GeoJSON con los polígonos de colonias
    fetch("archivos/vectores/colonias_wgs84_geojson_renombrado.geojson")
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al cargar el archivo GeoJSON: " + response.statusText);
            }
            return response.json(); // Convierte la respuesta a objeto JSON
        })
        .then(data => {
            console.log("GeoJSON de colonias cargado correctamente:", data);

            // Crea la capa de polígonos en Leaflet usando el GeoJSON cargado
            capaColonias = L.geoJSON(data, {
                pane: 'coloniasPane', // Usa el pane personalizado
                style: {
                    color: "red",   // Bordes rojos por defecto
                    weight: 3,      // Grosor del borde
                    opacity: 0.7,
                    fillOpacity: 0  // Sin relleno al inicio
                },
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.NOMBRE) {
                        var popupContent = `
                            <div class="popup">
                                <b>Colonia:</b> ${feature.properties.NOMBRE}<br>
                                <div class="estadisticasBoton">
                                    <button class="VerEstadisticas btn btn-danger" onclick="verEstadisticas('${feature.properties.NOMBRE}')">
                                        Ver Estadísticas
                                    </button>
                                </div>
                            </div>
                        `;
                        layer.bindPopup(popupContent);

                        // Evento de selección de colonia
                        layer.on("click", function () {
                            seleccionarColonia(layer);
                        });
                    }
                }
            }).addTo(map);

            if (!vistaInicialAplicada) {
                map.fitBounds(capaColonias.getBounds());
                vistaInicialAplicada = true;
            }
        })
        .catch(error => console.error("Error al cargar el GeoJSON:", error));

    // 🔹 Función mejorada: Aplica sombreado solo cuando se realiza el zoom y lo restablece al seleccionar otra colonia
    function seleccionarColonia(layer) {
        // Restablece todas las colonias al estado inicial (borde rojo, sin opacidad)
        capaColonias.eachLayer(function (capa) {
            capa.setStyle({ fillOpacity: 0, color: "red", weight: 3 });
        });

        // Aplica borde amarillo más grueso a la colonia seleccionada sin sombreado
        layer.setStyle({ color: "yellow", weight: 6, fillOpacity: 0 });

        // Asegura que la colonia seleccionada se muestre por encima de las demás
        layer.bringToFront();

        coloniaSeleccionada = layer; // Guarda la nueva selección

        // Ajusta la vista del mapa a la colonia seleccionada con zoom consistente
        let bounds = layer.getBounds();
        let center = bounds.getCenter();
        
        // Calcula un zoom apropiado basado en el tamaño de la colonia
        // Usa un zoom fijo para garantizar consistencia
        let zoomLevel = 16;
        
        // Primero centra el mapa en la colonia con el zoom calculado
        map.setView(center, zoomLevel, { animate: true, duration: 0.5 });

        // Aplica sombreado a las demás colonias solo después de realizar el zoom
        setTimeout(() => {
            capaColonias.eachLayer(function (capa) {
                if (capa !== layer) { // No afecta la colonia seleccionada
                    capa.setStyle({ fillOpacity: 0.5, color: "gray", weight: 3 }); // Opacidad gris al 50%
                }
            });
        }, 500); // Se activa justo después del zoom

        layer.openPopup(); // Abre el popup de la colonia seleccionada
    }

    // Función global para hacer zoom a una colonia desde otra parte del código (ej: buscador)
    window.zoomAColonia = function (nombreColonia) {
        if (!capaColonias) {
            console.warn("La capa de colonias aún no se ha cargado.");
            return;
        }

        let encontrado = false;

        // Busca la colonia por nombre y selecciona la que coincide
        capaColonias.eachLayer(function (layer) {
            if (layer.feature.properties && layer.feature.properties.NOMBRE) {
                let nombreEnMapa = layer.feature.properties.NOMBRE.trim().toLowerCase();
                let nombreBuscado = nombreColonia.trim().toLowerCase();

                if (nombreEnMapa === nombreBuscado) {
                    seleccionarColonia(layer);
                    encontrado = true;
                }
            }
        });

        if (!encontrado) {
            console.warn(`No se encontró la colonia: ${nombreColonia}`);
        }
    };
});
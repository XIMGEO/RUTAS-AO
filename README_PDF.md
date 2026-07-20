# Generador de PDF de Rutas - Geoportal AO

## Descripción
Este proyecto proporciona dos formas de generar un PDF con mapas de rutas mostrando:
- Extensión de las rutas (líneas en el mapa)
- Nodos con sus popups abiertos
- Tiempos y velocidades promedio

## Opción 1: Usando HTML + Leaflet (Recomendado)

### Instrucciones:
1. Abre el archivo `generar_pdf_rutas.html` en tu navegador web
2. Espera a que carguen los mapas (puede tomar 10-15 segundos)
3. Haz click en el botón azul "Descargar PDF"
4. El PDF se descargará automáticamente como `Rutas_Geoportal_AO.pdf`

### Requisitos:
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet (para cargar los tiles de OpenStreetMap)
- Librerías JavaScript incluidas (Leaflet, html2pdf)

### Contenido del PDF:
- **Página 1**: Mapa de Ruta Matutino
  - Visualización de todas las rutas matutinas
  - Nodos marcados con puntos rojos
  - Datos de tiempo promedio (Ruta Transporte y Ruta Vehículo)
  - Gráfico de velocidades promedio

- **Página 2**: Mapa de Ruta Tarde
  - Visualización de todas las rutas de la tarde
  - Nodos marcados con puntos rojos
  - Datos de tiempo promedio (Ruta Transporte y Ruta Vehículo)
  - Gráfico de velocidades promedio

## Opción 2: Usando Python (Generación automática)

### Instrucciones:
```bash
python generar_pdf_rutas.py
```

Este script genera un PDF sin necesidad de navegador.

## Datos Incluidos

### Tiempos Promedio (en minutos):
- **Matutino**:
  - Ruta Transporte: 61.33 min
  - Ruta Vehículo: 35.50 min

- **Tarde**:
  - Ruta Transporte: 58.67 min
  - Ruta Vehículo: 33.85 min

### Velocidades Promedio (km/h):
- **Matutino**:
  - Ruta Transporte: 9.8 km/h
  - Ruta Vehículo: 15.6 km/h

- **Tarde**:
  - Ruta Transporte: 10.2 km/h
  - Ruta Vehículo: 16.0 km/h

## Archivos Utilizados

- `generar_pdf_rutas.html` - Interfaz web para generar PDF
- `data/rutas_matutino.geojson` - Datos de rutas matutino
- `data/rutas_tarde.geojson` - Datos de rutas tarde
- `data/NODOS MATUTINO.geojson` - Datos de nodos matutino
- `data/NODOS TARDE.geojson` - Datos de nodos tarde
- `data/tiempos.json` - Datos de tiempos promedio

## Colores de Rutas

En el mapa, cada ruta tiene un color diferente:
- Ruta 1: Rojo (#FF0000)
- Ruta 2: Azul (#0000FF)
- Ruta 4: Naranja (#FFA500)
- Ruta 5: Verde (#00AA00)
- Ruta 7: Morado (#9900FF)
- Ruta 8: Cian (#00FFFF)
- Ruta 9: Magenta (#FF00FF)
- Ruta 10: Verde claro (#00AA00)
- Ruta 11: Verde más claro (#00BB00)
- Ruta 12: Verde aún más claro (#00CC00)

## Solución de Problemas

### El PDF no se descarga
1. Verifica que tienes un navegador moderno
2. Verifica que los mapas estén cargados (deberías ver líneas de colores y puntos rojos)
3. Intenta recargar la página (F5 o Ctrl+R)

### Los mapas no cargan
1. Verifica tu conexión a internet
2. Verifica que los archivos GeoJSON están en las ubicaciones correctas:
   - `data/rutas_matutino.geojson`
   - `data/rutas_tarde.geojson`
   - `data/NODOS MATUTINO.geojson`
   - `data/NODOS TARDE.geojson`

### Los nodos no muestran popups
- Los popups se abren automáticamente. Si no se ven, intenta hacer zoom in el mapa (botón +)

## Notas

- Los datos mostrados son promedios basados en el análisis de las rutas
- Los mapas están basados en OpenStreetMap (licencia ODbL)
- El PDF se genera completamente en el cliente (no se envía información a servidores)

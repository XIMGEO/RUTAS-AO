# Copilot Instructions for Geoportal AO

## Project Overview
Geoportal AO is a Leaflet-based web mapping application for the Álvaro Obregón municipality. It visualizes routes (matutino, tarde, vespertino), points of interest (CACI, CAM, CDC), infrastructure (Cablebus Line 5), and demographic data by neighborhood (colonias). The app enables real-time route monitoring with statistics and spatial search by neighborhood name.

## Architecture

### Script Execution Order (Critical)
Files load in this sequence—**order matters** for global variable dependencies:
1. `mapabase.js` — Initializes Leaflet `map` object globally
2. `Capa_Colonia.js` — Loads neighborhood boundaries, defines `zoomAColonia()` 
3. `capas.js` — Loads point-of-interest layers (CACI, CAM, CDC, etc.)
4. `Capa_pol.js` — Loads IDS_AO thematic layer with category-based coloring
5. `buscador.js` — Neighborhood search; calls `zoomAColonia()`
6. `estadisticas.js` — Modal statistics; populates from GeoJSON properties
7. `script.js` — UI toggles (sidebar collapse)

**Pattern**: Each module checks for `L` (Leaflet) and `map` before executing. Missing dependencies log errors—verify load order if features break.

### Data Flow
```
User Search (buscador.js)
  ↓ zoomAColonia()
  ↓
Capa_Colonia.js (highlights neighborhood polygon)
  ↓ Click polygon → popup → "Ver Estadísticas" button
  ↓
estadisticas.js (verEstadisticas)
  ↓ Fetches GeoJSON properties
  ↓ Renders modal with demographics, Chart.js visualizations
```

## Key Conventions

### Global Functions Exposed to Window
- `zoomAColonia(nombreColonia)` — Pans/zooms to neighborhood; called from search
- `verEstadisticas(nombreColonia)` — Opens modal with demographic data and charts
- `window.estadisticasChart` — Chart.js instance; destroyed and recreated per view

### Data Files
- **Neighborhoods**: `archivos/vectores/colonias_wgs84_geojson_renombrado.geojson` — Properties: `NOMBRE`, population counts (`pob_tot_p`, `_0_2_p`, etc.), gender breakdowns (`xPOBMAS`, `xPOBFEM`)
- **Routes**: `data/rutas_[matutino|tarde|vespertino].geojson` — GeoJSON LineStrings; linked to checkbox controls
- **POI Icons**: `img/icono/[CACI|CAM|CDC|CC|CAO].png` — 40×40px; referenced in `capas.js`
- **Neighborhoods List**: `archivos/json/NOMGEO.json` — Array of neighborhood names; frozen to prevent mutation

### Styling & Layout
- **Panes** (z-index layering): `coloniasPane` (500), `capasPuntosPane` (450) — Ensures proper feature stacking
- **Modal Styling**: Bootstrap 5 classes + inline Montserrat font-family assignments in `estadisticas.js` for labels
- **Color Scheme** (IDS_AO): "Muy alto"→green (#08810C), "Alto"→light green, "Medio"→orange, "Bajo"→red, "Muy bajo"→dark red
- **Sidebar Toggle**: Class `oculto` hides sidebar; controlled via `#toggleBtn`

### Fetch Patterns
- **Cache Busting**: `Capa_pol.js` appends `?v=${Date.now()}` to prevent stale data
- **Error Handling**: `.then(response => response.ok ? response.json() : Promise.reject(...))` — chains checks; some files use `alert()` for user-facing errors
- **No Try-Catch**: Errors flow through Promise chains to `.catch(error => console.error(...))`

## Common Tasks

### Add a New Route Layer
1. Create checkbox in HTML with id `chk[Name]`
2. In `capas.js`, define icon in `iconosCapas` object
3. Add fetch logic to load `data/rutas_[name].geojson`
4. Use same L.geoJSON(), pane, and popup pattern

### Update Demographic Statistics
- Edit `estadisticas.js` → `gruposEdad` array to add/remove Chart.js datasets
- Add properties from GeoJSON to `estadisticas` array (e.g., `{ label: "...", value: props.new_field }`)
- Chart auto-updates on neighborhood click; modal shows table first, then chart

### Fix Missing Data Display
- Check `feature.properties` key names match exactly (case-sensitive)
- If undefined, condition shows nothing: `if (stat.value !== undefined && stat.value !== null)`
- Verify GeoJSON file path and cache busting not interfering

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Map doesn't load | `mapabase.js` load failed | Verify Leaflet CDN is accessible; check console errors |
| Search doesn't work | `buscador.js` runs before `Capa_Colonia.js` | Check script load order in HTML; `zoomAColonia` undefined |
| Popup missing button | Feature missing `NOMBRE` property | Verify GeoJSON structure; add property if absent |
| Chart won't render | `Chart.js` CDN missing or prop keys wrong | Include chart CDN; inspect GeoJSON properties |
| Sidebar collapse broken | CSS class `oculto` not defined in style.css | Ensure `style.css` has `.oculto { display: none; }` or similar |

## File Responsibilities

- **mapabase.js** — Map initialization, base layers (satellite/street), zoom bounds
- **Capa_Colonia.js** — Neighborhood GeoJSON, polygons, zoom function, selection styling
- **capas.js** — Point layers (CACI, CAM, CDC, etc.), checkbox toggles, popup templates
- **Capa_pol.js** — Thematic IDS_AO layer, category-to-color mapping, cache busting
- **buscador.js** — Autocomplete search; loads and freezes neighborhood name list
- **estadisticas.js** — Modal display, Chart.js population pyramid, demographic table
- **script.js** — Sidebar toggle animation
- **style.css** — Layout, colors, navbar, sidebar, modal tweaks

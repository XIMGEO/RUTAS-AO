#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de PDF de Rutas - Geoportal AO
Genera un PDF con mapas de rutas mostrando nodos con sus popups abiertos
y datos de tiempo y velocidades promedio
"""

import json
import os
from datetime import datetime
from pathlib import Path

# Intentar importar las librerías necesarias
try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch, cm
    from reportlab.lib.colors import HexColor, grey, white, black, blue
    from reportlab.pdfgen import canvas
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
    from reportlab.platypus import KeepTogether
    from reportlab.lib import colors
except ImportError:
    print("Error: Necesitas instalar reportlab")
    print("Instala con: pip install reportlab")
    exit(1)

try:
    from PIL import Image as PILImage, ImageDraw
    import io
except ImportError:
    print("Error: Necesitas instalar Pillow")
    print("Instala con: pip install Pillow")
    exit(1)

try:
    import folium
    from folium import plugins
except ImportError:
    print("Error: Necesitas instalar folium")
    print("Instala con: pip install folium")
    exit(1)


class GeneradorPDFRutas:
    """Clase para generar PDFs de rutas con mapas y datos"""
    
    def __init__(self, carpeta_base="."):
        self.carpeta_base = Path(carpeta_base)
        self.datos_rutas = {
            'Matutino': {
                'tiempoTransporte': 61.33,
                'tiempoVehiculo': 35.50,
                'velocidadTransporte': 9.8,
                'velocidadVehiculo': 15.6
            },
            'Tarde': {
                'tiempoTransporte': 58.67,
                'tiempoVehiculo': 33.85,
                'velocidadTransporte': 10.2,
                'velocidadVehiculo': 16.0
            }
        }
        self.colores_rutas = {
            '1': '#FF0000', '2': '#0000FF', '4': '#FFA500',
            '5': '#00AA00', '7': '#9900FF', '8': '#00FFFF',
            '9': '#FF00FF', '10': '#00AA00', '11': '#00BB00', '12': '#00CC00'
        }
    
    def cargar_geojson(self, ruta_archivo):
        """Carga un archivo GeoJSON"""
        try:
            with open(ruta_archivo, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Advertencia: No se encontró {ruta_archivo}")
            return None
        except json.JSONDecodeError:
            print(f"Error: {ruta_archivo} no es un JSON válido")
            return None
    
    def crear_mapa(self, turno):
        """Crea un mapa Folium con rutas y nodos"""
        print(f"Creando mapa para {turno}...")
        
        # Centrado en Álvaro Obregón
        centro = [19.360, -99.235]
        mapa = folium.Map(location=centro, zoom_start=12, tiles='OpenStreetMap')
        
        # Cargar y agregar rutas
        archivo_rutas = self.carpeta_base / f"data/rutas_{turno.lower()}.geojson"
        rutas = self.cargar_geojson(archivo_rutas)
        
        if rutas:
            for feature in rutas.get('features', []):
                ruta_id = feature.get('properties', {}).get('IDENTIFICA', '1')
                color = self.colores_rutas.get(ruta_id, '#FF7F00')
                
                folium.GeoJson(
                    feature,
                    style_function=lambda x, c=color: {
                        'color': c,
                        'weight': 3,
                        'opacity': 0.8
                    }
                ).add_to(mapa)
        
        # Cargar y agregar nodos
        archivo_nodos = self.carpeta_base / f"data/NODOS {turno.upper()}.geojson"
        nodos = self.cargar_geojson(archivo_nodos)
        
        if nodos:
            for feature in nodos.get('features', []):
                props = feature.get('properties', {})
                geom = feature.get('geometry', {})
                
                # Obtener coordenadas
                if geom.get('type') == 'MultiLineString':
                    coords = geom.get('coordinates', [[]])[0]
                elif geom.get('type') == 'LineString':
                    coords = geom.get('coordinates', [])
                else:
                    continue
                
                if coords:
                    mid_idx = len(coords) // 2
                    lat, lon = coords[mid_idx][1], coords[mid_idx][0]
                    
                    # Crear popup con información
                    popup_text = f"""
                    <b>{props.get('Amplitud', 'Nodo')}</b><br>
                    <b>Ruta:</b> {props.get('Ruta', 'N/A')}<br>
                    <b>Turno:</b> {props.get('Turno', 'N/A')}<br>
                    <b>Motivo:</b> {props.get('Motivo_Pri', 'N/A')}
                    """
                    
                    folium.CircleMarker(
                        location=[lat, lon],
                        radius=6,
                        popup=folium.Popup(popup_text, max_width=300),
                        color='#FF0000',
                        fill=True,
                        fillColor='#FF6B6B',
                        fillOpacity=0.8,
                        weight=2
                    ).add_to(mapa)
        
        return mapa
    
    def mapa_a_imagen(self, mapa, archivo_salida):
        """Convierte un mapa Folium a imagen PNG"""
        print(f"Convirtiendo mapa a imagen: {archivo_salida}")
        
        try:
            # Guardar mapa como HTML temporal
            archivo_html = archivo_salida.replace('.png', '.html')
            mapa.save(archivo_html)
            
            # Usar selenium para capturar pantalla (si está disponible)
            try:
                from selenium import webdriver
                from selenium.webdriver.common.by import By
                
                options = webdriver.ChromeOptions()
                options.add_argument('--headless')
                options.add_argument('--start-maximized')
                
                driver = webdriver.Chrome(options=options)
                driver.get(f'file://{os.path.abspath(archivo_html)}')
                driver.set_window_size(1200, 600)
                
                # Esperar a que cargue el mapa
                import time
                time.sleep(3)
                
                driver.save_screenshot(archivo_salida)
                driver.quit()
                
                print(f"Imagen guardada: {archivo_salida}")
                return True
            except:
                # Si Selenium no funciona, generar imagen simple
                print("Usando método alternativo para generar imagen...")
                return self.crear_imagen_placeholder(archivo_salida)
        
        except Exception as e:
            print(f"Error al generar imagen: {e}")
            return False
    
    def crear_imagen_placeholder(self, archivo_salida):
        """Crea una imagen placeholder si no se puede capturar el mapa"""
        img = PILImage.new('RGB', (1200, 600), color='white')
        draw = ImageDraw.Draw(img)
        
        draw.text((50, 250), "Mapa no disponible. Abre generar_pdf_rutas.html en navegador", fill='black')
        
        img.save(archivo_salida)
        return True
    
    def generar_pdf(self, archivo_salida="Rutas_Geoportal_AO.pdf"):
        """Genera el PDF final"""
        print(f"Generando PDF: {archivo_salida}")
        
        doc = SimpleDocTemplate(archivo_salida, pagesize=letter)
        story = []
        styles = getSampleStyleSheet()
        
        # Estilo personalizado
        estilo_titulo = ParagraphStyle(
            'TituloRuta',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=HexColor('#333333'),
            spaceAfter=12,
            alignment=1  # Centro
        )
        
        # Procesar cada turno
        turnos = ['Matutino', 'Tarde']
        
        for idx, turno in enumerate(turnos):
            # Título
            titulo = Paragraph(f"🚌 Ruta {turno}", estilo_titulo)
            story.append(titulo)
            story.append(Spacer(1, 0.2*inch))
            
            # Nota sobre el mapa
            nota = Paragraph(
                f"Para ver el mapa interactivo con todos los nodos, abre <b>generar_pdf_rutas.html</b> en tu navegador web.",
                styles['Normal']
            )
            story.append(nota)
            story.append(Spacer(1, 0.3*inch))
            
            # Datos de tiempo
            datos = self.datos_rutas[turno]
            
            # Tabla de tiempos
            datos_tabla = [
                ['Ruta Transporte', f"{datos['tiempoTransporte']} min"],
                ['Ruta Vehículo', f"{datos['tiempoVehiculo']} min"]
            ]
            
            tabla_tiempos = Table(datos_tabla, colWidths=[3*inch, 2*inch])
            tabla_tiempos.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), HexColor('#F0F0F0')),
                ('TEXTCOLOR', (0, 0), (-1, -1), black),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 12),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, black)
            ]))
            
            story.append(Paragraph("<b>Tiempos Promedio</b>", styles['Heading2']))
            story.append(tabla_tiempos)
            story.append(Spacer(1, 0.2*inch))
            
            # Tabla de velocidades
            velocidades_tabla = [
                ['Ruta Transporte', f"{datos['velocidadTransporte']} km/h"],
                ['Ruta Vehículo', f"{datos['velocidadVehiculo']} km/h"]
            ]
            
            tabla_velocidades = Table(velocidades_tabla, colWidths=[3*inch, 2*inch])
            tabla_velocidades.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), HexColor('#E3F2FD')),
                ('TEXTCOLOR', (0, 0), (-1, -1), HexColor('#1976D2')),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 12),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, black)
            ]))
            
            story.append(Paragraph("<b>Velocidades Promedio</b>", styles['Heading2']))
            story.append(tabla_velocidades)
            
            # Agregar salto de página si no es el último turno
            if idx < len(turnos) - 1:
                story.append(PageBreak())
        
        # Generar PDF
        try:
            doc.build(story)
            print(f"✓ PDF generado exitosamente: {archivo_salida}")
            return True
        except Exception as e:
            print(f"Error al generar PDF: {e}")
            return False


def main():
    """Función principal"""
    print("=" * 60)
    print("Generador de PDF de Rutas - Geoportal AO")
    print("=" * 60)
    print()
    
    # Obtener directorio actual
    directorio_actual = Path(__file__).parent
    
    # Crear generador
    generador = GeneradorPDFRutas(directorio_actual)
    
    # Generar PDF
    archivo_salida = directorio_actual / "Rutas_Geoportal_AO.pdf"
    exito = generador.generar_pdf(str(archivo_salida))
    
    if exito:
        print()
        print("=" * 60)
        print("✓ Proceso completado")
        print(f"  Archivo guardado: {archivo_salida}")
        print()
        print("NOTA IMPORTANTE:")
        print("Para ver los mapas con nodos y popups abiertos, abre:")
        print("  generar_pdf_rutas.html")
        print("en tu navegador web y haz click en 'Descargar PDF'")
        print("=" * 60)
    else:
        print("Error: No se pudo generar el PDF")
        exit(1)


if __name__ == '__main__':
    main()

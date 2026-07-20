from PIL import Image, ImageDraw, ImageFont
import os

# Crear carpeta si no existe
output_dir = "tablas_generadas"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Dimensiones
ancho = 1200
alto = 700
padding = 40

# Colores (mismos que en las estadísticas)
color_header = (146, 43, 33)  # #922B21 - Vino
color_data = (212, 186, 138)  # #D4BA8A - Arena
color_blanco = (255, 255, 255)
color_negro = (0, 0, 0)
color_borde = (24, 0, 0)  # #180000

# Crear imagen
img = Image.new('RGB', (ancho, alto), color_blanco)
draw = ImageDraw.Draw(img)

# Intentar cargar fuente (fallback a default si no existe)
try:
    font_titulo = ImageFont.truetype("arial.ttf", 48)
    font_header = ImageFont.truetype("arial.ttf", 22)
    font_datos = ImageFont.truetype("arial.ttf", 18)
except:
    font_titulo = ImageFont.load_default()
    font_header = ImageFont.load_default()
    font_datos = ImageFont.load_default()

# Título
titulo = "ESTADÍSTICAS GENERAL DE RUTAS"
bbox_titulo = draw.textbbox((0, 0), titulo, font=font_titulo)
titulo_ancho = bbox_titulo[2] - bbox_titulo[0]
x_titulo = (ancho - titulo_ancho) // 2
draw.text((x_titulo, padding), titulo, font=font_titulo, fill=color_header)

# Tabla
y_inicio = padding + 80
x_columna1 = padding
x_columna2 = padding + 400
x_columna3 = padding + 650
x_columna4 = padding + 900

y_fila_header = y_inicio

# Encabezados
encabezados = ["CONCEPTO", "MATUTINO", "TARDE", "VESPERTINO"]
columnas = [x_columna1, x_columna2, x_columna3, x_columna4]

# Dibujar fondo y texto de encabezados
alto_header = 50
rect_header = [(x_columna1 - 10, y_fila_header), (ancho - padding, y_fila_header + alto_header)]
draw.rectangle(rect_header, fill=color_header, outline=color_borde, width=2)

for i, encabezado in enumerate(encabezados):
    bbox_text = draw.textbbox((0, 0), encabezado, font=font_header)
    text_ancho = bbox_text[2] - bbox_text[0]
    x_text = columnas[i] + 30 - text_ancho // 2
    draw.text((x_text, y_fila_header + 12), encabezado, font=font_header, fill=color_blanco)

# Datos
y_fila_actual = y_fila_header + alto_header + 10
datos = [
    ["Rutas Activas", "12", "15", "14"],
    ["Conflictos Viales", "8", "6", "5"],
    ["Velocidad Promedio", "35 km/h", "32 km/h", "38 km/h"],
    ["Monitoreo", "100%", "100%", "98%"],
]

alto_fila = 45
for fila_idx, fila_datos in enumerate(datos):
    y_fila = y_fila_actual + (fila_idx * alto_fila)
    
    # Alternancia de colores (más sutil)
    if fila_idx % 2 == 0:
        color_fondo = (255, 255, 255)  # Blanco
    else:
        color_fondo = (245, 240, 235)  # Gris muy claro
    
    rect_fila = [(x_columna1 - 10, y_fila), (ancho - padding, y_fila + alto_fila)]
    draw.rectangle(rect_fila, fill=color_fondo, outline=color_borde, width=1)
    
    # Primera columna con fondo arena
    rect_primera = [(x_columna1 - 10, y_fila), (x_columna2 - 20, y_fila + alto_fila)]
    draw.rectangle(rect_primera, fill=color_data, outline=color_borde, width=1)
    
    # Texto
    for col_idx, texto in enumerate(fila_datos):
        x_text = columnas[col_idx] + 30
        y_text = y_fila + 12
        
        if col_idx == 0:  # Primera columna - texto blanco sobre arena
            color_texto = color_blanco
        else:
            color_texto = color_negro
        
        draw.text((x_text, y_text), texto, font=font_datos, fill=color_texto)

# Pie de página
y_pie = alto - padding - 20
pie_texto = "Fuente: Sistema de Monitoreo de Rutas - Álvaro Obregón"
draw.text((padding, y_pie), pie_texto, font=font_datos, fill=(100, 100, 100))

# Guardar imagen
ruta_salida = os.path.join(output_dir, "tabla_general_estadisticas.png")
img.save(ruta_salida)
print(f"✓ Imagen guardada en: {ruta_salida}")
print(f"  Dimensiones: {ancho}x{alto} px")
print(f"  Colores usados: Vino #922B21, Arena #D4BA8A")

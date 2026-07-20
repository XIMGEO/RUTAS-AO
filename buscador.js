// Espera a que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", function() {

    // Obtener referencias al campo de búsqueda (input) y al contenedor de sugerencias
    const input = document.getElementById("floatingInput");
    const suggestionsBox = document.getElementById("suggestions");

    // Arreglo para guardar los nombres de colonias una vez que se cargue el JSON
    let colonias = [];

    // Cargar archivo JSON con los nombres de colonias
    fetch("archivos/json/NOMGEO.json")
        .then(response => {
            // Verifica que la respuesta sea exitosa
            if (!response.ok) {
                throw new Error("Error al cargar el archivo JSON: " + response.statusText);
            }
            return response.json(); // Convierte la respuesta en objeto JSON
        })
        .then(data => {
            // Asegura que el JSON sea un array
            if (!Array.isArray(data)) {
                throw new Error("El JSON no tiene el formato esperado.");
            }

            // Convierte cada entrada a string y congela el array para evitar cambios posteriores
            colonias = Object.freeze(data.map(c => String(c)));
            console.log("Datos cargados desde el JSON:", colonias);
        })
        .catch(error => console.error("Error al cargar JSON:", error));

    // Función para mostrar sugerencias basadas en lo que escribe el usuario
    function mostrarSugerencias(filtro) {
        // Limpia las sugerencias anteriores
        suggestionsBox.innerHTML = "";

        // Si no hay texto en el input o el arreglo de colonias está vacío, no se muestra nada
        if (filtro.trim() === "" || colonias.length === 0) {
            suggestionsBox.style.display = "none";
            return;
        }

        // Filtra las colonias que coincidan con el texto ingresado (ignorando mayúsculas)
        const coincidencias = colonias
            .filter(colonia => colonia.toLowerCase().includes(filtro.toLowerCase()))
            .slice(0, 5); // Limita el número de sugerencias a 5

        console.log("Filtrando con el término:", filtro, "Coincidencias encontradas:", coincidencias);

        // Si no hay coincidencias, oculta el contenedor
        if (coincidencias.length === 0) {
            suggestionsBox.style.display = "none";
            return;
        }

        // Crear un elemento div para cada coincidencia y mostrarla como sugerencia
        coincidencias.forEach(colonia => {
            const div = document.createElement("div");
            div.textContent = String(colonia); // Asegura que sea texto
            div.classList.add("suggestion-item"); // Agrega clase CSS para estilos

            // Cuando el usuario hace clic en una sugerencia
            div.onclick = function() {
                input.value = colonia; // Llena el campo con la colonia seleccionada
                suggestionsBox.style.display = "none"; // Oculta el panel de sugerencias

                // Ejecuta la función para hacer zoom en la colonia seleccionada (si existe)
                if (typeof zoomAColonia === "function") {
                    console.log("Haciendo zoom en la colonia:", colonia);
                    zoomAColonia(colonia);
                } else {
                    console.warn("La función zoomAColonia no está definida.");
                }
            };

            // Agrega el elemento al contenedor de sugerencias
            suggestionsBox.appendChild(div);
        });

        // Muestra el contenedor con las sugerencias
        suggestionsBox.style.display = "block";
    }

    // Detecta cuando el usuario escribe algo en el campo de búsqueda
    input.addEventListener("input", function() {
        mostrarSugerencias(this.value); // Llama a la función con el valor actual del input
    });

    // Cierra el panel de sugerencias si se hace clic fuera del input o del contenedor
    document.addEventListener("click", function(event) {
        if (!input.contains(event.target) && !suggestionsBox.contains(event.target)) {
            suggestionsBox.style.display = "none";
        }
    });

});

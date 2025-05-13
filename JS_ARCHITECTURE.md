# Arquitectura JavaScript Modular

El objetivo principal de esta modularización es mejorar la mantenibilidad, testabilidad y escalabilidad del código JavaScript.

## Principios de Diseño

La arquitectura JavaScript modular de SubTranslator se basa en los siguientes principios:

1. **Responsabilidad Única:** Cada módulo debe tener una única responsabilidad bien definida.
2. **Separación de Preocupaciones:** Separar la funcionalidad en módulos lógicos que se encarguen de aspectos específicos.
3. **Dependencias Explícitas:** Cada módulo declara explícitamente sus dependencias.
4. **Interoperabilidad:** Los módulos se comunican a través de interfaces bien definidas.
5. **Reutilización:** Promover la creación de componentes reutilizables.

## Estructura de directorios

La estructura de directorios de JavaScript sigue un patrón modular similar al de CSS:

```
js/
├── main.js                # Punto de entrada principal
├── script.js              # (Obsoleto) Archivo original monolítico
├── modules/
│   ├── fileUpload.js      # Módulo para carga de archivos
│   ├── formSubmission.js  # Módulo para envío de formularios
│   ├── languageSelectors.js # Módulo para selección de idiomas
│   └── previewer.js       # Módulo para previsualización de subtítulos
└── utils/
    ├── clipboard.js       # Utilidad para el portapapeles
    └── toast.js           # Utilidad para notificaciones toast
```

## Módulos y Responsabilidades

### main.js

El punto de entrada principal de la aplicación. Es responsable de:

- Importar todos los módulos necesarios
- Inicializar los componentes cuando el DOM está cargado
- Establecer listeners para funcionalidades globales
- Exportar funciones que necesitan ser accesibles globalmente

### Módulos Funcionales

#### fileUpload.js

Maneja todo lo relacionado con la carga de archivos:

- Inicializa la funcionalidad de carga de archivos
- Implementa drag & drop para archivos
- Valida los tipos de archivo (sólo .srt)
- Muestra el nombre del archivo seleccionado

#### languageSelectors.js

Gestiona la selección de idiomas:

- Inicializa los selectores de idioma
- Previene la selección del mismo idioma para origen y destino
- Actualiza las opciones disponibles según la selección

#### formSubmission.js

Maneja la validación y envío del formulario:

- Valida que se haya seleccionado un archivo
- Valida que se hayan seleccionado idiomas diferentes
- Muestra mensajes de error según corresponda
- Actualiza el estado de carga durante el envío

#### previewer.js

Proporciona funcionalidad de previsualización:

- Muestra una vista previa del archivo de subtítulos seleccionado

### Utilidades

#### clipboard.js

Funcionalidad para copiar texto al portapapeles:

- Copia el contenido traducido al portapapeles
- Admite API de portapapeles moderna con fallback

#### toast.js

Utilidad para mostrar mensajes emergentes:

- Muestra notificaciones temporales
- Gestiona la animación y el ciclo de vida de los mensajes

## Integración con Maven

La compilación y distribución de JavaScript están integradas con Maven:

- Los archivos JS se copian automáticamente al directorio target durante la compilación
- Hay scripts npm dedicados para entornos de desarrollo y producción
- La configuración está en package.json y pom.xml

## Uso de Módulos ES

Este proyecto utiliza módulos ES nativos (import/export) para:

- Mejor organización del código
- Clara separación de responsabilidades
- Dependencias explícitas

## Ejecutando el Proyecto

Para ejecutar el proyecto con los módulos JavaScript:

1. Compilar con Maven: `mvn clean package`
2. Ejecutar la aplicación: `java -jar target/subtranslator-0.0.1-SNAPSHOT.jar`

## Extendiendo la Arquitectura

### Añadir un Nuevo Módulo Funcional

1. Crear un nuevo archivo JavaScript en la carpeta `js/modules/` con nombre descriptivo (ej: `myNewFeature.js`).
2. Implementar la funcionalidad usando módulos ES6 con `export`:

   ```javascript
   /**
    * My New Feature Module
    * Description of what this module does
    */

   /**
    * Initialize the new feature
    */
   export function initializeMyFeature() {
     // Implementation...
   }

   // Helper functions that are not exported (module-private)
   function helperFunction() {
     // Implementation...
   }
   ```

3. Importar y usar el nuevo módulo en `main.js`:

   ```javascript
   import { initializeMyFeature } from "./modules/myNewFeature.js";

   document.addEventListener("DOMContentLoaded", function () {
     // Existing initializations...
     initializeMyFeature();
   });
   ```

### Añadir una Nueva Utilidad

1. Crear un nuevo archivo JavaScript en la carpeta `js/utils/` con nombre descriptivo (ej: `formatter.js`).
2. Implementar las funciones de utilidad:

   ```javascript
   /**
    * String formatting utilities
    */

   /**
    * Formats a timestamp string from seconds
    * @param {number} seconds - Seconds to format
    * @return {string} Formatted timestamp (MM:SS)
    */
   export function formatTimestamp(seconds) {
     const minutes = Math.floor(seconds / 60);
     const remainingSeconds = Math.floor(seconds % 60);
     return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
       .toString()
       .padStart(2, "0")}`;
   }
   ```

3. Importar la utilidad donde sea necesaria:

   ```javascript
   import { formatTimestamp } from "../utils/formatter.js";

   // Use the utility
   const formattedTime = formatTimestamp(125); // "02:05"
   ```

## Buenas Prácticas

1. **Nomenclatura clara:** Usa nombres de funciones y variables descriptivos que indiquen claramente su propósito.
2. **Comentarios adecuados:** Documenta el propósito de cada módulo y función con comentarios JSDoc.
3. **Modularidad:** Mantén los módulos pequeños y centrados en una sola responsabilidad.
4. **Encapsulamiento:** Exporta solo las funciones que necesitan ser públicas, mantén las funciones auxiliares privadas.
5. **Coherencia:** Sigue un estilo consistente en todo el código JavaScript.
6. **Evita la dependencia circular:** Asegúrate de que los módulos no se dependan mutuamente de manera circular.
7. **Manejo de eventos:** Centraliza la suscripción a eventos en el módulo correspondiente.

## Depuración

Para depurar problemas con los módulos JavaScript:

1. Usa la consola del navegador (F12) para ver errores y mensajes.
2. Verifica que todos los módulos se cargan correctamente (sin errores 404).
3. Asegúrate de que las rutas de importación son correctas y relativas al archivo que está importando.
4. Recuerda que los módulos ES6 requieren navegadores modernos o transpilación para navegadores antiguos.

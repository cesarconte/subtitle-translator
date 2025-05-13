# Guía de Mantenimiento CSS para SubTranslator

## 1. Mejores Prácticas para Mantener el Código

### Organización de Archivos

- Cada archivo debe estar enfocado en un propósito específico
- Mantén la estructura de directorios actual:
  - `/base`: Variables globales, estilos de reseteo y tipografía
  - `/components`: Elementos reutilizables de la interfaz (botones, formularios, etc.)
  - `/layout`: Estructuras principales (header, footer, grid)
  - `/pages`: Estilos específicos para cada página
  - `/utilities`: Clases utilitarias (flexbox, espaciado, etc.)

### Documentación

- Documenta los componentes con comentarios que expliquen su uso y opciones
- Añade ejemplos de código HTML cuando sea necesario
- Mantén las secciones bien delimitadas con comentarios descriptivos

### Variables CSS

- Usa las variables CSS definidas en `_variables.css` para mantener la consistencia
- Si necesitas añadir nuevas variables, hazlo en este archivo
- Agrupa las variables por categoría (colores, espaciado, tipografía).
- Uso de variables semánticas.

### Evitar el uso de !important

- **Nunca uses `!important`** para resolver problemas de especificidad
- En su lugar, mejora la especificidad con:
  - Selectores más específicos
  - Organización adecuada del orden de los estilos (cascada CSS)
  - Uso de clases utilitarias al final de la cascada CSS
  - Empleo de la metodología BEM para evitar conflictos

### Evitar el uso de estilos en línea
- Por ejemplo aquí:
  - <label
            for="autoDetectSwitch"
            class="language-selection__label"
            style="margin-bottom: 0; cursor: pointer"
          >
            Automatic language detection
          </label>

### Convenciones de Nomenclatura: BEM

- **Utiliza BEM (Block, Element, Modifier)** para todos los nuevos componentes:

  ```css
  /* Bloque: Entidad independiente, componente principal */
  .card {
  }

  /* Elemento: Parte de un bloque sin significado independiente */
  .card__title {
  }
  .card__body {
  }

  /* Modificador: Variación o estado de un bloque o elemento */
  .card--featured {
  }
  .card--compact {
  }
  .card__title--large {
  }
  ```

- **Reglas para nombres BEM:**
  - **Bloques:** Usar sustantivos descriptivos (`button`, `form`, `card`)
  - **Elementos:** Separar con doble guión bajo (`card__title`, `form__input`)
  - **Modificadores:** Separar con doble guión (`button--primary`, `input--disabled`)
  - Usar kebab-case para nombres compuestos (`file-upload`, `user-profile`)
- **Cuando crear un nuevo bloque vs. un elemento:**
  - Crea un elemento cuando forma parte integral de su bloque padre y no tiene sentido por sí solo
  - Crea un nuevo bloque cuando el componente podría usarse de forma independiente
  - Ejemplo: `.button-icon` es un bloque independiente, no `.button__icon-wrapper`

## 2. Material Design 3

La implementación actual sigue las directrices de Material Design 3 en cuanto a:

- Bordes redondeados (`--border-radius-*`)
- Botones estándar con forma de "pill"
- Botones FAB circulares
- Botones de icono circulares
- Esquema de colores con variantes claras y oscuras

Al añadir nuevos componentes, consulta la [documentación de Material Design 3](https://m3.material.io/) para seguir las mejores prácticas.

## 3. Rendimiento

- Evita selectores complejos que puedan afectar el rendimiento del navegador
- No se usarán los `!important`
- Considera cargar estilos específicos de página solo cuando sean necesarios
- Utiliza la minificación y compresión de archivos CSS para producción

---

Este documento fue creado el 11 de mayo de 2025 y puede ser actualizado según evolucionen las necesidades del proyecto.

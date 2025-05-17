# SubTranslator

SubTranslator es una aplicación web que permite a los usuarios traducir archivos de subtítulos (.srt) entre varios idiomas europeos, preservando la información de tiempo y formato original.

## Características principales

- Carga de archivos de subtítulos .srt mediante arrastrar y soltar o selección manual
- Traducción de subtítulos entre diversos idiomas europeos utilizando la API de DeepL
- Preservación de los códigos de tiempo y formato de los subtítulos
- Sistema de puntuación de confianza para identificar traducciones potencialmente problemáticas
- Visualización de indicadores de confianza para cada bloque de subtítulos
- Interfaz de usuario moderna con diseño Material Design 3
- Diseño responsive con enfoque mobile-first
- Vista previa del contenido original y traducido
- Descarga del archivo de subtítulos traducido
- Copia al portapapeles con un solo clic
- **Opciones avanzadas de traducción:**
  - Control de formalidad (más formal, menos formal)
  - Preservación de etiquetas HTML/XML en subtítulos
  - Preservación del formato original
  - Soporte para glosarios personalizados

## Opciones Avanzadas de Traducción

SubTranslator proporciona opciones avanzadas para mejorar la calidad de la traducción:

### Formalidad

- **Default:** Usa la configuración predeterminada de DeepL
- **More formal:** Genera una traducción con lenguaje más formal
- **Less formal:** Genera una traducción con lenguaje más coloquial
- **Prefer more formal:** Preferencia por lenguaje formal, pero no tan estricto
- **Prefer less formal:** Preferencia por lenguaje informal, pero no tan coloquial

### Manejo de etiquetas HTML

Activa esta opción para preservar etiquetas HTML comunes en subtítulos como:

- `<i>texto en cursiva</i>`
- `<b>texto en negrita</b>`
- `<u>texto subrayado</u>`
- `<font color="red">texto coloreado</font>`

### Preservación de formato

Mantiene la puntuación, espacios y saltos de línea del texto original en la traducción.

### Glosarios (próximamente)

Permite el uso de glosarios personalizados para asegurar que ciertos términos se traduzcan de manera consistente.

## Idiomas soportados

- Español
- Inglés
- Francés
- Alemán
- Italiano
- Portugués
- Holandés
- Polaco
- Ruso
- Checo
- Búlgaro
- Danés
- Estonio
- Finlandés
- Griego
- Húngaro
- Letón
- Lituano
- Rumano
- Eslovaco
- Esloveno
- Sueco
- Chino
- Japonés

## Tecnologías utilizadas

### Backend

- Java 21
- Spring Boot 3.4.5
- Spring Web para RESTful APIs
- Thymeleaf para templates del servidor
- DeepL API para traducciones

### Frontend

- HTML5 semántico y accesible
- CSS3 con metodología BEM
- Material Design 3 para estilos visuales
- JavaScript modular siguiendo arquitectura orientada a componentes
- Diseño responsive (mobile-first)

## Requisitos

- Java 21 o superior
- Maven 3.8 o superior
- Clave API de DeepL (gratuita o de pago)

## Configuración

1. Clona el repositorio

```bash
git clone https://github.com/cesarconte/subtitle-translator.git
cd subtitle-translator
```

2. Configura tu clave API de DeepL

   - Obtén una clave API gratuita en [DeepL Developer Console](https://www.deepl.com/pro-api)
   - Configura la clave API en el archivo `application.properties`:

   ```properties
   deepl.api.key=your-api-key-here
   ```

3. Compila la aplicación

```bash
mvn clean install
```

4. Ejecuta la aplicación

```bash
mvn spring-boot:run
```

5. Accede a la aplicación en tu navegador en `http://localhost:8080/subtitle-translator`

## Uso

1. Abre la aplicación en tu navegador
2. Sube un archivo de subtítulos .srt (arrástralo y suéltalo o haz clic para seleccionarlo)
3. Selecciona el idioma de origen de los subtítulos (o utiliza detección automática)
4. Selecciona el idioma de destino para la traducción
5. Haz clic en el botón "Traducir subtítulos"
6. Previsualiza los subtítulos traducidos
7. Descarga el archivo .srt traducido o cópialo al portapapeles

## Configuración avanzada

Las siguientes propiedades pueden ser configuradas en `application.properties`:

- `deepl.api.key` - Tu clave API de DeepL
- `deepl.api.url` - URL base de la API de DeepL (por defecto: https://api-free.deepl.com/v2)
- `deepl.confidence.enabled` - Activar sistema de confianza de traducción (por defecto: true)
- `server.port` - Puerto del servidor (por defecto: 8080)
- `server.servlet.context-path` - Ruta de contexto de la aplicación (por defecto: /subtitle-translator)
- `spring.servlet.multipart.max-file-size` - Tamaño máximo de archivo (por defecto: 10MB)

## Arquitectura del proyecto

El proyecto está organizado siguiendo una arquitectura de capas:

```
subtitle-translator/
├── src/
│   ├── main/
│   │   ├── java/                          # Código Java (backend)
│   │   │   └── io.github.cesarconte.subtitle_translator/
│   │   │       ├── config/                # Configuraciones
│   │   │       ├── controller/            # Controladores REST
│   │   │       ├── exception/             # Manejadores de excepciones
│   │   │       ├── model/                 # Modelos y DTOs
│   │   │       ├── service/               # Servicios
│   │   │       └── util/                  # Utilidades
│   │   └── resources/
│   │       ├── static/                    # Recursos estáticos (frontend)
│   │       │   ├── css/                   # Estilos CSS
│   │       │   │   ├── base/              # Estilos base
│   │       │   │   ├── components/        # Componentes UI
│   │       │   │   ├── layout/            # Estructuras layout
│   │       │   │   ├── pages/             # Estilos específicos por página
│   │       │   │   └── utils/             # Utilidades CSS
│   │       │   ├── js/                    # JavaScript modular
│   │       │   │   ├── api/               # Servicios API
│   │       │   │   ├── modules/           # Módulos funcionales
│   │       │   │   └── utils/             # Utilidades JS
│   │       │   └── assets/                # Otros recursos
│   │       └── templates/                 # Plantillas HTML
│   └── test/                              # Pruebas unitarias
```

## Arquitectura CSS

SubTranslator implementa una arquitectura CSS modular basada en la metodología BEM (Block, Element, Modifier):

- **Estructura modular**: CSS dividido en archivos por funcionalidad
- **Metodología BEM**: Para nombres de clases consistentes y predecibles
- **Material Design 3**: Sistemas de diseño con variables CSS personalizables
- **Mobile-first**: Diseño responsive que prioriza la experiencia móvil

Para más información sobre la arquitectura CSS, consulta:

- [CSS_GUIDELINES.md](./CSS_GUIDELINES.md) - Guía completa de mejores prácticas CSS

## Arquitectura JavaScript

La arquitectura JavaScript sigue un enfoque modular con responsabilidades bien definidas:

- **Módulos funcionales**: Cada archivo tiene una única responsabilidad
- **Dependencias explícitas**: Importación/exportación de módulos ES6
- **Componentes reutilizables**: Organización orientada a componentes
- **APIs claras**: Interfaces bien definidas entre módulos

Para más detalles sobre la arquitectura JavaScript, consulta:

- [JS_ARCHITECTURE.md](./JS_ARCHITECTURE.md) - Documentación de arquitectura JS

## Sistema de confianza de traducción

SubTranslator incluye un avanzado sistema de puntuación de confianza para traducciones que:

- Evalúa la calidad de cada bloque de subtítulos traducido
- Proporciona indicadores visuales para identificar posibles problemas
- Muestra estadísticas globales de confianza para todo el archivo
- Ayuda a los usuarios a identificar qué partes podrían necesitar revisión manual

Para más información sobre el sistema de confianza, consulta:

- [CONFIDENCE_SYSTEM.md](./CONFIDENCE_SYSTEM.md) - Documentación completa del sistema de confianza

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## Agradecimientos

- [DeepL API](https://www.deepl.com/pro-api) por proporcionar el servicio de traducción
- [Spring Boot](https://spring.io/projects/spring-boot) como framework de aplicación
- [Material Design](https://m3.material.io/) por la inspiración de diseño
- [Metodología BEM](https://getbem.com/) para la arquitectura CSS

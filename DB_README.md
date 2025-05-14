# Funcionalidad de Base de Datos en SubTranslator

Este documento describe la implementación de la base de datos MongoDB para almacenar y reutilizar traducciones en la aplicación SubTranslator.

## Descripción General

La funcionalidad permite:

- Almacenar traducciones realizadas en la base de datos
- Recuperar traducciones existentes sin necesidad de volver a traducir
- Mantener un historial de traducciones accesible mediante una API

## Estructura de Datos

Cada traducción se almacena con los siguientes datos:

- **ID**: Identificador único generado por MongoDB
- **contentHash**: Hash MD5 del contenido original para identificar archivos idénticos
- **fileName**: Nombre del archivo original
- **originalContent**: Contenido original del archivo
- **sourceLanguage**: Idioma de origen
- **targetLanguage**: Idioma de destino
- **translatedContent**: Contenido traducido
- **confidenceData**: Datos de confianza de la traducción (en formato JSON)
- **averageConfidence**: Confianza promedio (0-1)
- **confidenceLevel**: Nivel de confianza (high, medium, low)
- **createdAt**: Fecha de creación
- **lastAccessedAt**: Fecha de último acceso
- **accessCount**: Contador de accesos
- **fileSize**: Tamaño del archivo original en bytes

## Flujo de Trabajo

1. Un usuario sube un archivo de subtítulos para traducir
2. El sistema calcula un hash MD5 del contenido
3. El sistema busca en la base de datos si existe una traducción con el mismo hash, idioma origen e idioma destino
4. Si existe, se devuelve la traducción almacenada sin necesidad de realizar una nueva traducción
5. Si no existe, se realiza la traducción y se almacena en la base de datos para futuras consultas

## API Endpoints

### Historial de Traducciones

- `GET /api/history?page=0&size=10`: Obtiene una lista paginada de traducciones
- `GET /api/history/{id}`: Obtiene una traducción específica por su ID
- `DELETE /api/history/{id}`: Elimina una traducción específica

## Configuración de MongoDB

La aplicación está configurada para usar MongoDB con las siguientes propiedades:

```properties
spring.data.mongodb.uri=${MONGODB_URI:mongodb://localhost:27017/subtitle_translator}
spring.data.mongodb.database=subtitle_translator
spring.data.mongodb.auto-index-creation=true
```

Donde:

- **MONGODB_URI**: URL de conexión a MongoDB (valor por defecto: mongodb://localhost:27017/subtitle_translator)
- **spring.data.mongodb.database**: Nombre de la base de datos
- **spring.data.mongodb.auto-index-creation**: Habilita la creación automática de índices

## Uso en Entorno de Producción

Para un entorno de producción, es recomendable configurar MongoDB usando variables de entorno:

```bash
export MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/subtitle_translator
```

## Próximos Pasos

- Implementar una interfaz de usuario para visualizar y gestionar el historial de traducciones
- Añadir funcionalidades de búsqueda y filtrado en el historial
- Implementar gestión de usuarios para mantener traducciones privadas

## Contribuciones

Las contribuciones son bienvenidas. Por favor, asegúrate de seguir las convenciones de código y documentar adecuadamente las nuevas funcionalidades.

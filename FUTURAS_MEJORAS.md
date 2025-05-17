# Futuras Mejoras para SubTranslator

Este documento recopila todas las posibles mejoras y nuevas funcionalidades para implementar en SubTranslator, organizadas por categorías y prioridad.

## Mejoras de Experiencia de Usuario (UX)

### Prioridad Alta

- [ ] **Vista previa en tiempo real**: Visualización dividida que muestre texto original y traducción lado a lado mientras se realiza la traducción
- [x] **Mensajes de estado mejorados**: Mostrar progreso detallado durante la traducción
- [x] **Autodetección de idioma**: Identificar automáticamente el idioma del archivo subido (Implementado: 13 de mayo de 2025)
- [x] **Mejora de autodetección**: Agregar opción para habilitar/deshabilitar la detección automática (Implementado: 13 de mayo de 2025)

### Prioridad Media

- [ ] **Personalización de la interfaz**:
  - [ ] Ajustes más extensos de tema (colores personalizables)
  - [ ] Preferencias de fuente (tamaño, tipo, espaciado)
- [ ] **Accesibilidad mejorada**:
  - [ ] Compatibilidad completa con lectores de pantalla
  - [ ] Atajos de teclado para acciones comunes
  - [ ] Mayor contraste y opciones de legibilidad

### Prioridad Baja

- [ ] **Animaciones y transiciones**: Mejorar las interacciones visuales
- [ ] **Feedback háptico**: Para dispositivos móviles/táctiles
- [ ] **Tour guiado**: Introducción para nuevos usuarios

## Nuevas Funcionalidades

### Prioridad Alta

- [x] **Historial de traducciones**:
  - [x] Guardar traducciones previas (Implementado: 14 de mayo de 2025)
  - [x] Acceso rápido a trabajos recientes
- [x] **Edición post-traducción**: Permitir ajustar manualmente el texto traducido (Implementado: 14 de mayo de 2025)

### Prioridad Media

- [ ] **Gestión de proyectos**:
  - [ ] Organizar traducciones por proyectos
  - [ ] Etiquetas y búsqueda
- [ ] **Glosario personalizado**: Términos específicos y sus traducciones preferidas
- [ ] **Previsualización de subtítulos**:
  - [ ] Reproductor de video simple para archivos locales
  - [ ] Sincronización de subtítulos con el video

### Prioridad Baja

- [ ] **Almacenamiento en la nube**: Sincronizar traducciones entre dispositivos
- [ ] **Traducción offline**: Para archivos pequeños sin necesidad de conexión
- [x] **Estimación de tiempo**: Calcular tiempo aproximado para completar traducción
- [ ] **Opciones de estilo**: Personalizar la apariencia de los subtítulos exportados

## Integraciones y Exportación

### Prioridad Alta

- [ ] **Compartir traducciones**: Generar enlaces para compartir resultados

### Prioridad Media

- [ ] **Integración con APIs alternativas**: Ofrecer más opciones además de DeepL
- [ ] **Exportación a servicios de video**: YouTube, Vimeo, etc.

### Prioridad Baja

- [ ] **Integración con software de edición de video**: Marcadores de tiempo, etc.

## Herramientas de Revisión y Calidad

### Prioridad Alta

- [ ] **Corrector ortográfico/gramatical**: Verificar errores en el texto traducido
- [x] **Detector de sincronización**: Alertar sobre subtítulos potencialmente mal sincronizados (Implementado: 12 de mayo de 2025)
- [x] **Validación de formato**: Asegurar que los subtítulos cumplen con estándares (caracteres por línea, etc.) (Implementado: 17 de mayo de 2025)

### Prioridad Media

- [ ] **Sugerencias de mejora**: Recomendaciones para hacer el texto más natural
- [ ] **Análisis de legibilidad**: Verificar que los subtítulos sean fáciles de leer

### Prioridad Baja

- [ ] **Detección de jerga/argot**: Identificar expresiones difíciles de traducir

## Mejoras Técnicas

### Prioridad Alta

- [ ] **Optimización de rendimiento**: Mejorar tiempos de carga y procesamiento
- [ ] **Soporte multidispositivo mejorado**: Optimizar para móviles y tabletas

### Prioridad Media

- [ ] **Caché y procesamiento en segundo plano**: Reducir tiempos de espera

### Prioridad Baja

- [ ] **Instalación como PWA (Progressive Web App)**: Usar offline en dispositivos móviles
- [ ] **Soporte para archivos de gran tamaño**: Mejorar manejo de subtítulos largos

## Mejoras técnicas y de desarrollo

### Prioridad Alta

- [x] Refactorizar y limpiar el código para eliminar referencias a campos no utilizados (por ejemplo, eliminar referencias a `subtitles` en `TranslationService.java`). (Implementado: 17 de mayo de 2025)
- [ ] Añadir tests automáticos para los flujos de traducción y detección de idioma.

### Prioridad Media

- [ ] Añadir soporte para variables de entorno personalizadas en el arranque.

### Prioridad Baja

- [ ] Documentar mejor los scripts y utilidades de desarrollo.

---

## Notas de Implementación

Este documento es un work-in-progress. Al implementar cada característica:

1. Mover la tarea de "por hacer" a "completada" cambiando `[ ]` a `[x]`
2. Añadir fecha de implementación
3. Documentar cualquier decisión importante de diseño o implementación

**Última actualización**: 14 de mayo de 2025

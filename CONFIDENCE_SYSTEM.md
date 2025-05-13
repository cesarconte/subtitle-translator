# Sistema de Confianza de Traducción

## Introducción

El _Sistema de Confianza de Traducción_ es una característica que evalúa la calidad de las traducciones de subtítulos y proporciona indicadores visuales para que los usuarios identifiquen posibles problemas en la traducción automática.

## Características principales

1. **Puntuación de confianza**: Cada bloque de subtítulo recibe una puntuación entre 0.0 y 1.0
2. **Indicadores visuales**: Los subtítulos se muestran con codificación de colores según su nivel de confianza
3. **Estadísticas generales**: Se muestra un resumen de la calidad general de la traducción
4. **Identificación de problemas**: El sistema detecta automáticamente posibles problemas de traducción

## Niveles de confianza

El sistema clasifica las traducciones en tres niveles de confianza:

| Nivel | Puntuación | Color   | Significado                                        |
| ----- | ---------- | ------- | -------------------------------------------------- |
| Alta  | 0.8 - 1.0  | Verde   | Traducción fiable, no requiere revisión            |
| Media | 0.5 - 0.79 | Naranja | Posibles problemas, se recomienda revisión         |
| Baja  | 0.0 - 0.49 | Rojo    | Problemas significativos, requiere revisión manual |

## Factores que afectan la confianza

El sistema analiza diversos factores para determinar la confianza de una traducción:

1. **Proporción de longitud**: Una diferencia significativa entre la longitud del texto original y el traducido puede indicar problemas.
2. **Palabras repetidas**: La repetición inusual de palabras en el texto traducido reduce la puntuación.
3. **Puntuación excesiva**: Un uso excesivo de signos de exclamación o interrogación puede indicar problemas.
4. **Caracteres sospechosos**: La presencia de ciertos caracteres especiales que no suelen aparecer en subtítulos normales.
5. **Palabras sin traducir**: Palabras que podrían no haberse traducido correctamente (especialmente términos en mayúsculas).

## Implementación técnica

### Backend

El sistema utiliza una clase `ConfidenceCalculator` que implementa diversos algoritmos para analizar la calidad de la traducción:

```java
public class ConfidenceCalculator {
    // Métodos para calcular la confianza de una traducción
    public static double calculateConfidence(String original, String translated) {
        // Implementación de los algoritmos de evaluación
    }
}
```

### Frontend

El frontend visualiza los datos de confianza mediante:

1. **Indicadores de color**: Cada subtítulo se muestra con un borde izquierdo del color correspondiente a su nivel de confianza.
2. **Iconos de confianza**: Cada bloque incluye un icono que representa visualmente el nivel de confianza.
3. **Medidor global**: Se muestra un medidor que indica la confianza general de toda la traducción.
4. **Tooltips informativos**: Al pasar el cursor sobre los indicadores, se muestra más información.

## Uso en la aplicación

1. El usuario carga un archivo de subtítulos y selecciona los idiomas
2. Al traducir, se calcula la confianza para cada bloque de subtítulos
3. Los resultados se muestran con indicadores visuales de confianza
4. El usuario puede identificar rápidamente qué partes de la traducción podrían necesitar revisión manual

## Limitaciones actuales

- El sistema se basa en heurísticas y no utiliza inteligencia artificial avanzada para la evaluación
- No puede detectar errores semánticos sutiles (traducciones gramaticalmente correctas pero con significado alterado)
- La evaluación no tiene en cuenta el contexto completo del vídeo

## Futuras mejoras

- Integración con modelos de IA para análisis semántico más profundo
- Sugerencias automáticas de corrección para problemas detectados
- Sistema de aprendizaje que mejore con el tiempo basado en correcciones manuales
- Análisis contextual entre subtítulos consecutivos

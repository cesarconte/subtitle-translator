/**
 * Utilidad para analizar y manipular archivos SRT
 * @module utils/srtParser
 */

/**
 * Representa un bloque de subtítulo
 * @typedef {Object} SubtitleBlock
 * @property {number} id - Número de identificación del subtítulo
 * @property {string} timeCode - Código de tiempo (ej: "00:01:23,456 --> 00:01:26,789")
 * @property {string[]} text - Líneas de texto del subtítulo
 */

/**
 * Analiza un archivo SRT y lo convierte en un array de bloques de subtítulos
 *
 * @param {string} content - Contenido del archivo SRT
 * @returns {SubtitleBlock[]} Array de bloques de subtítulos
 */
export function parseSRT(content) {
  // Normalizar saltos de línea
  const normalizedContent = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Separar en bloques (doble salto de línea)
  const blocks = normalizedContent.split("\n\n");

  return blocks
    .filter((block) => block.trim() !== "")
    .map((block) => {
      const lines = block.split("\n");

      // Extraer el ID
      const id = parseInt(lines[0].trim(), 10);

      // Extraer el código de tiempo
      const timeCode = lines[1].trim();

      // Extraer las líneas de texto
      const text = lines.slice(2).filter((line) => line.trim() !== "");

      return { id, timeCode, text };
    });
}

/**
 * Convierte un array de bloques de subtítulos en formato SRT
 *
 * @param {SubtitleBlock[]} subtitles - Array de bloques de subtítulos
 * @returns {string} Contenido en formato SRT
 */
export function generateSRT(subtitles) {
  return subtitles
    .map((subtitle) => {
      return [
        subtitle.id,
        subtitle.timeCode,
        ...subtitle.text,
        "", // Línea vacía final
      ].join("\n");
    })
    .join("\n");
}

/**
 * Valida si el contenido tiene formato SRT válido
 *
 * @param {string} content - Contenido del archivo a validar
 * @returns {boolean} true si es válido, false en caso contrario
 */
export function isValidSRT(content) {
  try {
    // Intenta parsear el contenido
    const subtitles = parseSRT(content);

    // Verifica que tenga al menos un bloque
    if (subtitles.length === 0) {
      return false;
    }

    // Verifica que cada bloque tenga el formato correcto
    return subtitles.every((subtitle) => {
      // Debe tener un ID numérico
      if (isNaN(subtitle.id)) {
        return false;
      }

      // Debe tener un código de tiempo con formato "00:00:00,000 --> 00:00:00,000"
      const timeCodeRegex =
        /^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/;
      if (!timeCodeRegex.test(subtitle.timeCode)) {
        return false;
      }

      // Debe tener al menos una línea de texto
      if (subtitle.text.length === 0) {
        return false;
      }

      return true;
    });
  } catch (error) {
    return false;
  }
}

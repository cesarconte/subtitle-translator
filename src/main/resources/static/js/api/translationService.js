/**
 * Servicio para traducir textos usando DeepL API
 * @module api/translationService
 */

import { parseSRT } from "../utils/srtParser.js";

/**
 * URL base de la API de DeepL
 * @constant {string}
 */
const API_BASE_URL = "https://api-free.deepl.com/v2";

/**
 * Clave de API para DeepL (debe ser reemplazada por la clave real)
 * @constant {string}
 */
let API_KEY = "";

/**
 * Options for configuring the DeepL API
 * @typedef {Object} DeepLOptions
 * @property {string} authKey - API key
 */

// Variable para almacenar el nombre del archivo seleccionado
let currentFileName = "subtitle.srt";

// Translation session management
let currentSessionId = null;
let progressCheckInterval = null;

/**
 * Establece el nombre del archivo actual
 *
 * @param {string} fileName - Nombre del archivo
 */
export function setFileName(fileName) {
  currentFileName = fileName || "subtitle.srt";
}

/**
 * Obtiene el nombre del archivo actual
 *
 * @returns {string} Nombre del archivo
 */
function getFileName() {
  return currentFileName;
}

/**
 * Configures the translation service
 *
 * @param {DeepLOptions} options - Configuration options
 */
export function configureTranslationService(options) {
  if (options.authKey) {
    API_KEY = options.authKey;
  }
}

/**
 * Traduce un texto usando la API de DeepL
 *
 * @param {string} text - Texto a traducir
 * @param {string} targetLang - Código de idioma destino (ej: ES, EN, FR)
 * @param {string} [sourceLang=null] - Código de idioma origen (o null para detección automática)
 * @returns {Promise<string>} Texto traducido
 * @throws {Error} If there's an error in the translation
 */
export async function translateText(text, targetLang, sourceLang = null) {
  if (!API_KEY) {
    throw new Error("The DeepL API key is not configured");
  }

  // Preparar los datos para la petición
  const formData = new URLSearchParams();
  formData.append("text", text);
  formData.append("target_lang", targetLang);

  if (sourceLang && sourceLang !== "auto") {
    formData.append("source_lang", sourceLang);
  }

  try {
    // Realizar la petición a la API
    const response = await fetch(`${API_BASE_URL}/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Error de DeepL (${response.status}): ${
          errorData.message || "Error desconocido"
        }`
      );
    }

    const data = await response.json();

    if (data.translations && data.translations.length > 0) {
      return data.translations[0].text;
    } else {
      throw new Error("No translation received");
    }
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}

/**
 * Traduce un array de bloques de subtítulos
 *
 * @param {SubtitleBlock[]} subtitles - Array de bloques de subtítulos
 * @param {string} targetLang - Código de idioma destino
 * @param {string} [sourceLang=null] - Código de idioma origen (o null para detección)
 * @returns {Promise<SubtitleBlock[]>} Array de subtítulos traducidos
 */
export async function translateSubtitles(
  subtitles,
  targetLang,
  sourceLang = null
) {
  // Traducir cada subtítulo individualmente para mantener mejor la estructura
  // Esto garantiza que cada subtítulo mantenga su formato y estructura
  const translatedSubtitles = [];

  // Crear grupos más pequeños para minimizar el número de llamadas a la API
  // pero manteniendo mejor la correlación entre original y traducción
  const groupSize = 10; // Reducimos el tamaño del grupo para mejor precisión
  const groups = [];

  for (let i = 0; i < subtitles.length; i += groupSize) {
    groups.push(subtitles.slice(i, i + groupSize));
  }

  // Procesar cada grupo
  for (const group of groups) {
    // Preparamos un texto donde cada subtítulo tiene marcadores especiales
    // que incluyen su ID y estructura de líneas para preservar el formato
    const textsWithMarkers = group.map((subtitle) => {
      // Usamos un formato especial que incluye metadatos sobre la estructura
      const lines = subtitle.text;
      const linesWithMarkers = lines
        .map((line, idx) => `<LINE:${idx + 1}>${line}</LINE:${idx + 1}>`)
        .join("\n");

      return `<SUBT:${subtitle.id}>\n${linesWithMarkers}\n</SUBT:${subtitle.id}>`;
    });

    // Unimos todos los textos con marcadores
    const combinedText = textsWithMarkers.join("\n\n");

    // Traducimos el texto combinado
    const translatedCombined = await translateText(
      combinedText,
      targetLang,
      sourceLang
    );

    // Procesamos la respuesta para extraer cada subtítulo traducido
    const subtitleMatches =
      translatedCombined.match(/<SUBT:\d+>[\s\S]*?<\/SUBT:\d+>/g) || [];

    for (const subtitleMatch of subtitleMatches) {
      // Extraemos el ID del subtítulo
      const idMatch = subtitleMatch.match(/<SUBT:(\d+)>/);
      if (!idMatch) continue;

      const id = parseInt(idMatch[1], 10);

      // Encontramos el subtítulo original correspondiente
      const originalSubtitle = group.find((s) => s.id === id);
      if (!originalSubtitle) continue;

      // Extraemos las líneas traducidas
      const lineMatches =
        subtitleMatch.match(/<LINE:\d+>([\s\S]*?)<\/LINE:\d+>/g) || [];
      const translatedLines = lineMatches.map((lineMatch) => {
        const textMatch = lineMatch.match(/<LINE:\d+>([\s\S]*?)<\/LINE:\d+>/);
        return textMatch ? textMatch[1].trim() : "";
      });

      // Si no se encontraron líneas con el formato esperado, extraemos el texto entre tags SUBT
      let textToUse = translatedLines;
      if (translatedLines.length === 0) {
        const rawText = subtitleMatch
          .replace(/<SUBT:\d+>\n?/, "")
          .replace(/\n?<\/SUBT:\d+>/, "")
          .trim();
        textToUse = rawText.split("\n");
      }

      // Creamos el subtítulo traducido manteniendo el ID y timeCode originales
      translatedSubtitles.push({
        id: originalSubtitle.id,
        timeCode: originalSubtitle.timeCode,
        text: textToUse,
      });
    }
  }

  // Ordenamos los subtítulos por ID para mantener el orden original
  translatedSubtitles.sort((a, b) => a.id - b.id);

  // Verificamos si hay subtítulos que no se tradujeron correctamente
  if (translatedSubtitles.length < subtitles.length) {
    // Para los subtítulos faltantes, usamos el enfoque anterior como fallback
    const missingIds = subtitles
      .filter((s) => !translatedSubtitles.some((ts) => ts.id === s.id))
      .map((s) => s.id);

    if (missingIds.length > 0) {
      console.warn(
        `Algunos subtítulos (IDs: ${missingIds.join(
          ", "
        )}) no se pudieron procesar con el nuevo método. Usando método alternativo.`
      );

      // Extraer todos los textos de subtítulos faltantes
      const missingSubtitles = subtitles.filter((s) =>
        missingIds.includes(s.id)
      );
      const textsToTranslate = missingSubtitles.map((sub) =>
        sub.text.join("\n")
      );

      // Traducir los textos faltantes
      const translatedTexts = await Promise.all(
        textsToTranslate.map((text) =>
          translateText(text, targetLang, sourceLang)
        )
      );

      // Añadir los subtítulos faltantes con sus traducciones
      missingSubtitles.forEach((subtitle, idx) => {
        translatedSubtitles.push({
          id: subtitle.id,
          timeCode: subtitle.timeCode,
          text: translatedTexts[idx].trim().split("\n"),
        });
      });

      // Reordenar nuevamente
      translatedSubtitles.sort((a, b) => a.id - b.id);
    }
  }

  return translatedSubtitles;
}

/**
 * Result of a subtitle translation
 * @typedef {Object} TranslationResult
 * @property {string} translatedContent - Contenido SRT traducido
 * @property {Array<SubtitleConfidence>} confidenceData - Datos de confianza por subtítulo
 * @property {number} averageConfidence - Average translation confidence (0-1)
 * @property {string} averageConfidenceLevel - Nivel de confianza: "high", "medium" o "low"
 */

/**
 * Datos de confianza de un subtítulo
 * @typedef {Object} SubtitleConfidence
 * @property {number} id - ID del bloque de subtítulo
 * @property {number} confidence - Puntuación de confianza (0-1)
 * @property {string} level - Nivel de confianza: "high", "medium" o "low"
 */

/**
 * Initialize a translation session for progress tracking
 *
 * @param {string} srtContent - SRT content to translate
 * @returns {Promise<string>} - Session ID for progress tracking
 */
async function initTranslationSession(srtContent) {
  try {
    const response = await fetch("/api/translate/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ srtContent }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.sessionId;
  } catch (error) {
    console.error("Error initializing translation session:", error);
    throw error;
  }
}

/**
 * Check translation progress for a session
 *
 * @param {string} sessionId - Session ID for translation
 * @returns {Promise<Object>} - Progress information
 */
async function checkTranslationProgress(sessionId) {
  try {
    const response = await fetch(`/api/translate/progress/${sessionId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Session not found");
      }
      throw new Error(`Error HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking translation progress:", error);
    throw error;
  }
}

/**
 * Traduce un archivo de subtítulos SRT usando la API del backend con seguimiento de progreso
 *
 * @param {string} srtContent - Contenido del archivo SRT
 * @param {string} targetLang - Código de idioma destino
 * @param {string} sourceLang - Código de idioma origen (puede ser "auto")
 * @param {function} [progressCallback] - Optional callback for progress updates
 * @returns {Promise<TranslationResult>} Translation result
 */
export async function translateSRT(
  srtContent,
  targetLang,
  sourceLang,
  progressCallback
) {
  try {
    // Clear any existing progress check interval
    if (progressCheckInterval) {
      clearInterval(progressCheckInterval);
      progressCheckInterval = null;
    }

    // Initialize a translation session
    const sessionId = await initTranslationSession(srtContent);
    currentSessionId = sessionId;

    // Set up progress checking interval if a callback is provided
    if (typeof progressCallback === "function") {
      // Check progress every 500ms
      progressCheckInterval = setInterval(async () => {
        try {
          // If we don't have a current session, stop checking
          if (!currentSessionId) {
            clearInterval(progressCheckInterval);
            progressCheckInterval = null;
            return;
          }

          const progress = await checkTranslationProgress(currentSessionId);
          progressCallback(progress);

          // If the translation is complete or has an error, stop checking
          if (progress.phase === "completed" || progress.phase === "error") {
            clearInterval(progressCheckInterval);
            progressCheckInterval = null;
          }
        } catch (err) {
          console.error("Error checking progress:", err);
        }
      }, 500);
    }

    // Call the API to translate with the session ID
    const response = await fetch(`/api/translate/subtitle/${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        srtContent,
        targetLanguage: targetLang,
        sourceLanguage: sourceLang,
        fileName: getFileName(), // Get the file name from the currently selected file
      }),
    });

    // Stop progress checking now that translation is complete
    if (progressCheckInterval) {
      clearInterval(progressCheckInterval);
      progressCheckInterval = null;
    }
    currentSessionId = null;

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `Error HTTP ${response.status}` };
      }

      throw new Error(errorData.message || "Error translating the file");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Translation error");
    }

    return {
      translatedContent: data.translatedContent,
      confidenceData: data.confidenceData || [],
      averageConfidence: data.averageConfidence || 1.0,
      averageConfidenceLevel: data.averageConfidenceLevel || "high",
    };
  } catch (error) {
    console.error("Error traduciendo subtítulos:", error);

    // Ensure progress checking is stopped
    if (progressCheckInterval) {
      clearInterval(progressCheckInterval);
      progressCheckInterval = null;
    }
    currentSessionId = null;

    // Notify error in progress
    if (typeof progressCallback === "function") {
      progressCallback({
        phase: "error",
        message: `Error: ${error.message}`,
        error,
      });
    }

    throw error;
  }
}

/**
 * Parse SRT content to get block count and character count
 * This helps with progress tracking
 *
 * @param {string} srtContent - The SRT content to parse
 * @returns {Object} Object containing blocks and character count
 */
function parseSrtContent(srtContent) {
  // Simple parsing of SRT blocks and character counting
  // Note: This is a simplified implementation that doesn't do full parsing
  const blocks = srtContent
    .split(/\r?\n\r?\n/)
    .filter((block) => block.trim() !== "");

  let charCount = 0;
  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    // Skip the first two lines (index and timing)
    for (let i = 2; i < lines.length; i++) {
      charCount += lines[i].length;
    }
  }

  return { blocks, charCount };
}

/**
 * Detects the language of an SRT file using the backend
 * @param {string} srtContent - SRT file content
 * @returns {Promise<{success: boolean, language?: string, confidence?: number, message?: string}>}
 */
export async function detectLanguage(srtContent) {
  const response = await fetch("/api/translate/detect-language", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ srtContent }),
  });
  const data = await response.json();
  return data;
}

/**
 * Cancel the current translation if one is in progress
 */
export function cancelTranslation() {
  if (currentSessionId) {
    if (progressCheckInterval) {
      clearInterval(progressCheckInterval);
      progressCheckInterval = null;
    }
    currentSessionId = null;
    return true;
  }
  return false;
}

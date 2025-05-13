/**
 * Servicio para traducir textos usando DeepL API
 * @module api/translationService
 */

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
  // Extraer todos los textos de subtítulos en un array
  const textsToTranslate = subtitles.map((sub) => sub.text.join("\n"));

  // Agrupar textos para minimizar el número de llamadas a la API
  // DeepL tiene un límite de caracteres por petición, así que agrupamos varios subtítulos
  const groupSize = 20; // Número de subtítulos por petición
  const groups = [];

  for (let i = 0; i < textsToTranslate.length; i += groupSize) {
    groups.push(textsToTranslate.slice(i, i + groupSize));
  }

  // Traducir cada grupo
  const translatedGroups = await Promise.all(
    groups.map((group) => {
      const text = group.join("\n<SUBT_DIV>\n"); // Separador especial entre subtítulos
      return translateText(text, targetLang, sourceLang);
    })
  );

  // Procesar las respuestas y reconstruir los subtítulos
  let allTranslatedTexts = [];
  for (const translatedGroup of translatedGroups) {
    const translatedTextsInGroup = translatedGroup.split("<SUBT_DIV>");
    allTranslatedTexts = allTranslatedTexts.concat(translatedTextsInGroup);
  }

  // Crear nuevos subtítulos con el texto traducido
  return subtitles.map((subtitle, index) => {
    const translatedText = allTranslatedTexts[index] || "";
    return {
      id: subtitle.id,
      timeCode: subtitle.timeCode,
      text: translatedText.trim().split("\n"),
    };
  });
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
 * Traduce un archivo de subtítulos SRT usando la API del backend
 *
 * @param {string} srtContent - Contenido del archivo SRT
 * @param {string} targetLang - Código de idioma destino
 * @param {string} sourceLang - Código de idioma origen (puede ser "auto")
 * @returns {Promise<TranslationResult>} Translation result
 */
export async function translateSRT(srtContent, targetLang, sourceLang) {
  try {
    // Llamar a la API del backend
    const response = await fetch("/api/translate/subtitle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        srtContent,
        targetLanguage: targetLang,
        sourceLanguage: sourceLang,
      }),
    });

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
    throw error;
  }
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

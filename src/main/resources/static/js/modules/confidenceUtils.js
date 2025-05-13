/**
 * Utilities for handling confidence indicators
 * @module modules/confidenceUtils
 */

/**
 * Renders translated text with confidence indicators
 *
 * @param {string} text - Complete translated text
 * @param {Array} confidenceData - Confidence data per subtitle
 * @param {HTMLElement} container - Container element where to show the result
 */
export function renderTranslatedTextWithConfidenceIndicators(
  text,
  confidenceData,
  container
) {
  // Split text into subtitle blocks
  const blocks = text.split("\n\n").filter((block) => block.trim() !== "");

  blocks.forEach((block, index) => {
    const lines = block.split("\n");
    if (lines.length < 3) return; // Ignore incomplete blocks

    try {
      // Extraer el ID del subtítulo para encontrar sus datos de confianza
      const id = parseInt(lines[0].trim(), 10);
      const confidenceInfo = confidenceData.find((item) => item.id === id);

      // Crear el elemento para el bloque
      const blockEl = document.createElement("div");
      blockEl.className = `subtitle-block subtitle-block--${
        confidenceInfo?.level || "high"
      }`;

      // Número de subtítulo
      const numberEl = document.createElement("div");
      numberEl.className = "subtitle-block__number";
      numberEl.textContent = lines[0];

      // Código de tiempo
      const timeCodeEl = document.createElement("div");
      timeCodeEl.className = "subtitle-block__timecode";
      timeCodeEl.textContent = lines[1];

      // Texto del subtítulo
      const textEl = document.createElement("div");
      textEl.className = "subtitle-block__text";
      lines.slice(2).forEach((line) => {
        if (line.trim()) {
          const lineEl = document.createElement("p");
          lineEl.textContent = line;
          textEl.appendChild(lineEl);
        }
      });

      // Indicador de confianza si está disponible
      if (confidenceInfo) {
        const indicatorEl = document.createElement("div");
        indicatorEl.className = `confidence-indicator confidence-indicator--${confidenceInfo.level}`;
        indicatorEl.classList.add("confidence-tooltip");
        indicatorEl.setAttribute(
          "data-tooltip",
          `Confidence: ${Math.round(confidenceInfo.confidence * 100)}%`
        );

        // Icono
        const iconEl = document.createElement("span");
        iconEl.className = "confidence-indicator__icon";
        iconEl.innerHTML = getConfidenceIcon(confidenceInfo.level);

        // Texto
        const textLabelEl = document.createElement("span");
        textLabelEl.className = "confidence-indicator__text";
        textLabelEl.textContent = getConfidenceLevelText(confidenceInfo.level);

        indicatorEl.appendChild(iconEl);
        indicatorEl.appendChild(textLabelEl);
        blockEl.appendChild(indicatorEl);
      }

      // Añadir todos los elementos al bloque
      blockEl.appendChild(numberEl);
      blockEl.appendChild(timeCodeEl);
      blockEl.appendChild(textEl);

      // Añadir el bloque al contenedor
      container.appendChild(blockEl);

      // Añadir separador excepto para el último bloque
      if (index < blocks.length - 1) {
        container.appendChild(document.createElement("hr"));
      }
    } catch (e) {
      // En caso de error, mostrar el bloque sin formato
      const plainBlock = document.createElement("pre");
      plainBlock.textContent = block;
      container.appendChild(plainBlock);
      container.appendChild(document.createElement("hr"));
    }
  });
}

/**
 * Renders confidence statistics
 *
 * @param {HTMLElement} container - Container element
 * @param {number} averageConfidence - Average confidence (0-1)
 * @param {string} confidenceLevel - Confidence level ('high', 'medium', 'low')
 */
export function renderConfidenceStats(
  container,
  averageConfidence,
  confidenceLevel
) {
  container.innerHTML = "";
  container.className = "confidence-stats";

  // Título
  const title = document.createElement("h3");
  title.className = "confidence-stats__title";
  title.textContent = "Translation Quality";

  // Medidor de confianza
  const meter = document.createElement("div");
  meter.className = "confidence-stats__meter";

  const fill = document.createElement("div");
  fill.className = `confidence-stats__meter-fill confidence-stats__meter-fill--${confidenceLevel}`;
  fill.style.width = `${Math.round(averageConfidence * 100)}%`;
  meter.appendChild(fill);

  // Descripción
  const description = document.createElement("p");
  description.className = "confidence-stats__description";
  description.innerHTML = getConfidenceDescription(confidenceLevel);

  container.appendChild(title);
  container.appendChild(meter);
  container.appendChild(description);
}

/**
 * Returns the SVG icon corresponding to the confidence level
 *
 * @param {string} level - Confidence level ('high', 'medium', 'low')
 * @return {string} - SVG code of the icon
 */
export function getConfidenceIcon(level) {
  switch (level) {
    case "high":
      return '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>';
    case "medium":
      return '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>';
    case "low":
      return '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>';
    default:
      return "";
  }
}

/**
 * Returns the text corresponding to the confidence level
 *
 * @param {string} level - Confidence level ('high', 'medium', 'low')
 * @return {string} - Descriptive text
 */
export function getConfidenceLevelText(level) {
  switch (level) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return "";
  }
}

/**
 * Returns the detailed description for the confidence level
 *
 * @param {string} level - Confidence level ('high', 'medium', 'low')
 * @return {string} - HTML description
 */
export function getConfidenceDescription(level) {
  switch (level) {
    case "high":
      return "The translation has <strong>high confidence</strong>. No significant issues detected.";
    case "medium":
      return "The translation has <strong>medium confidence</strong>. Review of marked subtitles is recommended.";
    case "low":
      return "The translation has <strong>low confidence</strong>. Manual review of marked subtitles is recommended.";
    default:
      return "No confidence information available.";
  }
}

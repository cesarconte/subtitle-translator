/**
 * Module for subtitle previewing
 * @module modules/previewer
 */

/**
 * Options for the preview module
 * @typedef {Object} PreviewerOptions
 * @property {string} originalPreviewId - ID of the element to display original content
 * @property {string} translatedPreviewId - ID of the element to display translated content
 * @property {string} previewContainerId - ID of the main preview container
 * @property {string} downloadButtonId - ID of the download button
 * @property {string} confidenceStatsId - ID of the element for confidence statistics
 * @property {Function} [onDownload] - Callback function to execute when the user downloads the translated file
 * @property {Object} [subtitleEditor] - Reference to the subtitle editor instance
 */

import { showSuccessToast, showErrorToast } from "../utils/toast.js";
import {
  renderTranslatedTextWithConfidenceIndicators,
  renderConfidenceStats,
} from "./confidenceUtils.js";

/**
 * Initializes subtitle preview functionality
 *
 * @param {PreviewerOptions} options - Configuration options
 */
export function initPreviewer(options) {
  const originalPreview = document.getElementById(options.originalPreviewId);
  const translatedPreview = document.getElementById(
    options.translatedPreviewId
  );
  const previewContainer = document.getElementById(options.previewContainerId);
  const downloadButton = document.getElementById(options.downloadButtonId);

  let originalContent = null;
  let translatedContent = null;
  let fileName = "translated.srt";

  /**
   * Shows original and translated contents
   *
   * @param {Object} params - Parameters to display the preview
   * @param {string} params.original - Original content
   * @param {string} params.translated - Translated content
   * @param {string} [params.fileName=null] - File name (optional)
   * @param {Array} [params.confidenceData=[]] - Translation confidence data
   * @param {number} [params.averageConfidence=1.0] - Average confidence (0-1)
   * @param {string} [params.confidenceLevel='high'] - Confidence level ('high', 'medium', 'low')
   */
  const showPreview = (params) => {
    const {
      original,
      translated,
      fileName: displayFileName = null,
      confidenceData = [],
      averageConfidence = 1.0,
      confidenceLevel = "high",
    } = params;

    originalContent = original;
    translatedContent = translated;

    if (displayFileName) {
      fileName = displayFileName.replace(".srt", "_translated.srt");
    }

    // Mostrar el contenido original formateado
    if (originalPreview && translatedPreview) {
      // Parsear los subtítulos para mejor visualización
      const parsedOriginal = parseSRTForPreview(original);
      const parsedTranslated = parseSRTForPreview(translated);

      // Mostrar el contenido original formateado
      originalPreview.innerHTML = formatSubtitlesForPreview(parsedOriginal);

      // Mostrar el contenido traducido formateado con indicadores de confianza
      if (confidenceData.length > 0) {
        // Create preview with confidence indicators
        renderTranslatedTextWithConfidenceIndicators(
          translated,
          confidenceData,
          translatedPreview,
          parsedTranslated
        );
      } else {
        // Simple preview with better formatting
        translatedPreview.innerHTML =
          formatSubtitlesForPreview(parsedTranslated);
      }

      // Aumentar la correlación visual entre subtítulos originales y traducidos
      setTimeout(() => {
        // Añadir data-attributes para facilitar la correlación visual
        const originalBlocks =
          originalPreview.querySelectorAll(".subtitle-block");
        originalBlocks.forEach((block) => {
          const subtitleId = block
            .querySelector(".subtitle-id")
            ?.textContent.trim();
          if (subtitleId) {
            block.dataset.subtitleId = subtitleId;
          }
        });

        // Añadir efecto de hover sincronizado entre bloques correspondientes
        originalBlocks.forEach((block) => {
          const subtitleId = block.dataset.subtitleId;
          if (subtitleId) {
            // Al pasar el ratón sobre un bloque original, destacar el traducido correspondiente
            block.addEventListener("mouseenter", () => {
              const correspondingBlock = translatedPreview.querySelector(
                `.subtitle-block[data-subtitle-id="${subtitleId}"]`
              );
              if (correspondingBlock) {
                correspondingBlock.classList.add("subtitle-block--highlighted");
              }
            });

            // Al quitar el ratón, eliminar el destacado
            block.addEventListener("mouseleave", () => {
              const correspondingBlock = translatedPreview.querySelector(
                `.subtitle-block[data-subtitle-id="${subtitleId}"]`
              );
              if (correspondingBlock) {
                correspondingBlock.classList.remove(
                  "subtitle-block--highlighted"
                );
              }
            });
          }
        });

        // Hacer lo mismo para los bloques traducidos
        const translatedBlocks =
          translatedPreview.querySelectorAll(".subtitle-block");
        translatedBlocks.forEach((block) => {
          const subtitleId = block.dataset.subtitleId;
          if (subtitleId) {
            block.addEventListener("mouseenter", () => {
              const correspondingBlock = originalPreview.querySelector(
                `.subtitle-block[data-subtitle-id="${subtitleId}"]`
              );
              if (correspondingBlock) {
                correspondingBlock.classList.add("subtitle-block--highlighted");
              }
            });

            block.addEventListener("mouseleave", () => {
              const correspondingBlock = originalPreview.querySelector(
                `.subtitle-block[data-subtitle-id="${subtitleId}"]`
              );
              if (correspondingBlock) {
                correspondingBlock.classList.remove(
                  "subtitle-block--highlighted"
                );
              }
            });
          }
        });
      }, 300); // Pequeño retraso para asegurar que los elementos ya están en el DOM
    } else {
      // Fallback al comportamiento anterior si algún elemento falta
      if (originalPreview) {
        originalPreview.textContent = original;
      }

      if (translatedPreview) {
        // Show translated content with confidence indicators
        translatedPreview.innerHTML = ""; // Clear previous content

        if (confidenceData.length > 0) {
          // Create preview with confidence indicators
          renderTranslatedTextWithConfidenceIndicators(
            translated,
            confidenceData,
            translatedPreview
          );
        } else {
          // Simple preview without indicators
          translatedPreview.textContent = translated;
        }
      }
    }

    // Función interna para parsear un texto SRT para mejor visualización
    function parseSRTForPreview(srtText) {
      const blocks = [];
      const parts = srtText.split(/\n\s*\n/);

      for (const part of parts) {
        const lines = part.trim().split("\n");
        if (lines.length >= 2) {
          const id = lines[0].trim();
          const timeCode = lines[1].trim();
          const text = lines.slice(2).join("<br>");
          blocks.push({ id, timeCode, text });
        }
      }

      return blocks;
    }

    // Función interna para formatear los subtítulos para visualización
    function formatSubtitlesForPreview(blocks) {
      // Helper to render each line with char count and marking
      function renderLine(line) {
        const charCount = line.length;
        const overLimit = charCount > 40;
        return `<div class="subtitle-line${
          overLimit ? " subtitle-line--over" : " subtitle-line--ok"
        }">
          <span class="subtitle-line__text">${line}</span>
          <span class="subtitle-line__count${
            overLimit
              ? " subtitle-line__count--over"
              : " subtitle-line__count--ok"
          }" title="${overLimit ? "Exceeds 40 characters" : "OK"}">
            ${charCount} ${
          overLimit
            ? '<span class="subtitle-line__icon" aria-label="Over limit" title="Over 40 characters">⚠️</span>'
            : '<span class="subtitle-line__icon subtitle-line__icon--ok" aria-label="OK" title="Within limit">✔️</span>'
        }
          </span>
        </div>`;
      }
      return blocks
        .map(
          (block) => `
        <div class="subtitle-block" data-subtitle-id="${block.id}">
          <div class="subtitle-id">${block.id}</div>
          <div class="subtitle-time">${block.timeCode}</div>
          <div class="subtitle-text">
            ${block.text
              .split("<br>")
              .map((line) => renderLine(line))
              .join("")}
          </div>
        </div>
      `
        )
        .join("");
    }

    // Show confidence statistics if available
    const confidenceStatsElement = document.getElementById(
      options.confidenceStatsId
    );
    if (confidenceStatsElement && averageConfidence !== undefined) {
      renderConfidenceStats(
        confidenceStatsElement,
        averageConfidence,
        confidenceLevel
      );
    }

    // Update subtitle editor content if available
    if (options.subtitleEditor) {
      options.subtitleEditor.setContent(translated, confidenceData);
    }

    if (previewContainer) {
      previewContainer.hidden = false;
    }
  };

  /**
   * Hides the preview
   */
  const hidePreview = () => {
    originalContent = null;
    translatedContent = null;

    if (originalPreview) {
      originalPreview.textContent = "";
    }

    if (translatedPreview) {
      translatedPreview.textContent = "";
    }

    // Reset subtitle editor if available
    if (options.subtitleEditor) {
      // If in edit mode, cancel editing
      if (
        document.getElementById("editButton").getAttribute("aria-pressed") ===
        "true"
      ) {
        options.subtitleEditor.cancelEditing();
      }
    }

    if (previewContainer) {
      previewContainer.hidden = true;
    }
  };

  // Event listener for download button
  if (downloadButton) {
    downloadButton.addEventListener("click", () => {
      if (!translatedContent) {
        showErrorToast("No content to download");
        return;
      }

      // Create a blob and a download link
      const blob = new Blob([translatedContent], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = fileName;

      // Temporarily add to DOM, click, and remove
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Release the URL
      setTimeout(() => URL.revokeObjectURL(url), 100);

      // Trigger the onDownload callback if provided
      if (typeof options.onDownload === "function") {
        options.onDownload();
      }

      showSuccessToast("Download started");
    });
  }

  // Event listener for copy button - Removed

  // Initially hide the preview
  hidePreview();

  /**
   * Gets the current preview data
   * @returns {Object|null} Current preview data or null if no preview is visible
   */
  const getCurrentPreviewData = () => {
    if (!originalContent || !translatedContent) {
      return null;
    }

    // Return the current preview data
    return {
      original: originalContent,
      translated: translatedContent,
      fileName: fileName,
      // Include other data if available through a closure variable
    };
  };

  /**
   * Updates the translated content (used when edited)
   * @param {string} newContent - The new translated content
   */
  const updateTranslatedContent = (newContent) => {
    if (!newContent) return;

    translatedContent = newContent;

    // Update the display
    if (translatedPreview) {
      translatedPreview.textContent = newContent;
    }
  };

  // Return public API
  return {
    showPreview,
    hidePreview,
    getCurrentPreviewData,
    updateTranslatedContent,
  };
}

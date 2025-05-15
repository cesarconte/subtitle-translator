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
 * @property {string} copyButtonId - ID of the copy to clipboard button
 * @property {string} confidenceStatsId - ID of the element for confidence statistics
 * @property {Function} [onDownload] - Callback function to execute when the user downloads the translated file
 * @property {Object} [subtitleEditor] - Reference to the subtitle editor instance
 */

import { copyToClipboard } from "../utils/clipboard.js";
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
  const copyButton = document.getElementById(options.copyButtonId);

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

  // Event listener for copy button
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      if (!translatedContent) {
        showErrorToast("No content to copy");
        return;
      }

      try {
        const copied = await copyToClipboard(translatedContent);
        if (copied) {
          showSuccessToast("Content copied to clipboard");
        } else {
          showErrorToast("Could not copy to clipboard");
        }
      } catch (error) {
        console.error("Error copying:", error);
        showErrorToast("Error copying to clipboard");
      }
    });
  }

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

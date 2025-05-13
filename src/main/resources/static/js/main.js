/**
 * Main entry point for the SubTranslator application
 */

import { initFileUpload } from "./modules/fileUpload.js";
import { initLanguageSelectors } from "./modules/languageSelectors.js";
import { initPreviewer } from "./modules/previewer.js";
import { initFormSubmission } from "./modules/formSubmission.js";
import { configureTranslationService } from "./api/translationService.js";
import { showErrorToast, showSuccessToast } from "./utils/toast.js";
import navAnimation from "./modules/navAnimation.js";

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  // Variables to store module instances
  let fileUploader;
  let languageSelector;
  let previewer;
  let formSubmitter;

  // Loaded file content
  let fileContent = null;
  let fileName = null;

  // Element to show/hide loader
  const loader = document.getElementById("loader");

  // Make sure the loader is hidden at startup
  if (loader) {
    loader.hidden = true;
    loader.setAttribute("hidden", "");
  }

  // Configure the translation service (in production, this should be managed by the server)
  // NOTE: In a real environment, NEVER expose your API key in the frontend
  // For this example, we use an empty key, which should be replaced with a real one
  configureTranslationService({
    authKey: "", // En producción, esto debería venir del servidor
  });

  // Inicializar módulo de carga de archivos
  fileUploader = initFileUpload({
    dropZoneId: "dropZone",
    fileInputId: "subtitleFile",
    fileSelectedId: "fileSelected",
    onFileLoaded: (content, file) => {
      fileContent = content;
      fileName = file.name;

      // Update translation button state
      if (formSubmitter) {
        formSubmitter.updateButtonState();
      }

      // Hide previous preview if it exists
      if (previewer) {
        previewer.hidePreview();
      }

      showSuccessToast("File loaded successfully");

      // Optionally: auto-select detected language if confidence is high (future improvement)
    },
  });

  // Initialize language selectors
  languageSelector = initLanguageSelectors({
    sourceSelectId: "sourceLanguage",
    targetSelectId: "targetLanguage",
    onChange: () => {
      // Update translation button state
      if (formSubmitter) {
        formSubmitter.updateButtonState();
      }
    },
  });

  // Initialize previewer
  previewer = initPreviewer({
    originalPreviewId: "originalPreview",
    translatedPreviewId: "translatedPreview",
    previewContainerId: "preview",
    downloadButtonId: "downloadButton",
    copyButtonId: "copyButton",
    confidenceStatsId: "confidenceStats",
  });

  // Initialize form submission module
  formSubmitter = initFormSubmission({
    formId: "translationForm",
    submitButtonId: "translateButton",
    loaderId: "loader",
    getFileContent: () => fileContent,
    getFileName: () => fileName,
    getLanguages: () => languageSelector.getSelectedLanguages(),
    onTranslationStart: () => {
      // Actions when translation starts
      if (loader) loader.hidden = false;

      // Hide previous preview if it exists
      if (previewer) {
        previewer.hidePreview();
      }
    },
    onTranslationSuccess: (result) => {
      // Actions when translation completes successfully
      // result contains: original, translated, fileName, confidenceData, averageConfidence, confidenceLevel
      if (loader) loader.hidden = true;

      // Show preview with confidence information
      if (previewer) {
        previewer.showPreview({
          original: result.original,
          translated: result.translated,
          fileName: result.fileName,
          confidenceData: result.confidenceData,
          averageConfidence: result.averageConfidence,
          confidenceLevel: result.confidenceLevel,
        });
      }

      const confidenceMessage =
        result.averageConfidence >= 0.8
          ? "high"
          : result.averageConfidence >= 0.5
          ? "medium"
          : "low";
      showSuccessToast(
        `Translation completed with ${confidenceMessage} confidence!`
      );
    },
    onTranslationError: (error) => {
      // Actions in case of error
      if (loader) loader.hidden = true;
      showErrorToast(`Translation error: ${error.message}`);
    },
  });

  // Initially disable the translation button
  document.getElementById("translateButton").disabled = true;

  // Hide preview and loader at startup
  document.getElementById("preview").hidden = true;
  if (loader) loader.hidden = true;
});

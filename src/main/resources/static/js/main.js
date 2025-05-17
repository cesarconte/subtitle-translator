/**
 * Main entry point for the SubTranslator application
 */

import { initFileUpload } from "./modules/fileUpload.js";
import { initLanguageSelectors } from "./modules/languageSelectors.js";
import { initPreviewer } from "./modules/previewer.js";
import { initFormSubmission } from "./modules/formSubmission.js";
import { initProgressTracker } from "./modules/progressTracker.js";
import { initSubtitleEditor } from "./modules/subtitleEditor.js";
import {
  configureTranslationService,
  setFileName,
  fetchAvailableGlossaries,
} from "./api/translationService.js";
import { showErrorToast, showSuccessToast } from "./utils/toast.js";
import navAnimation from "./modules/navAnimation.js";

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");

  // Verificar elementos críticos
  console.group("Critical Elements Check");
  console.log("subtitleEditor:", !!document.getElementById("subtitleEditor"));
  console.log("editButton:", !!document.getElementById("editButton"));
  console.log(
    "saveChangesButton:",
    !!document.getElementById("saveChangesButton")
  );
  console.log(
    "cancelEditsButton:",
    !!document.getElementById("cancelEditsButton")
  );
  console.log(
    "translatedPreview:",
    !!document.getElementById("translatedPreview")
  );
  console.log("originalPreview:", !!document.getElementById("originalPreview"));
  console.groupEnd();

  // Función para resetear todos los formularios y valores cuando se carga la página
  function resetAllForms() {
    // Resetear todos los formularios
    document.querySelectorAll("form").forEach((form) => {
      form.reset();
    });

    // Asegurarse de que los select tengan su primer valor
    document.querySelectorAll("select").forEach((select) => {
      select.selectedIndex = 0;
    });

    // Asegurarse de que el contenido del archivo se limpie
    const fileSelectedElement = document.getElementById("fileSelected");
    if (fileSelectedElement) {
      fileSelectedElement.innerHTML = "";
      fileSelectedElement.setAttribute("aria-hidden", "true");
    }

    // Resetear el estado de detección de idioma
    const detectionInfo = document.getElementById("languageDetectionInfo");
    if (detectionInfo) {
      detectionInfo.textContent = "";
      detectionInfo.className = "file-upload__detection";
    }

    // Resetear el contenido de la vista previa
    const preview = document.getElementById("preview");
    if (preview) {
      preview.hidden = true;
    }
  }

  // Llamar a la función de reseteo al cargar la página
  resetAllForms();

  // Variables to store module instances
  let fileUploader;
  let languageSelector;
  let previewer;
  let formSubmitter;
  let progressTracker;
  let subtitleEditor;

  // Loaded file content
  let fileContent = null;
  let fileName = null;

  // Element to show/hide loader
  const loader = document.getElementById("loader");
  const progressTrackerElement = document.getElementById("progressTracker");

  // Make sure the loader is hidden at startup
  if (loader) {
    loader.hidden = true;
    loader.setAttribute("hidden", "");
  }

  // Make sure the progress tracker is hidden at startup
  if (progressTrackerElement) {
    progressTrackerElement.hidden = true;
    progressTrackerElement.setAttribute("hidden", "");
  }

  // Configure the translation service (in production, this should be managed by the server)
  // NOTE: In a real environment, NEVER expose your API key in the frontend
  // For this example, we use an empty key, which should be replaced with a real one
  configureTranslationService({
    authKey: "", // En producción, esto debería venir del servidor
  });

  // Initialize progress tracker module
  progressTracker = initProgressTracker({
    progressTrackerId: "progressTracker",
    progressBarId: "progressBar",
    progressPercentageId: "progressPercentage",
    progressStatusId: "progressStatus",
    translatedCharsId: "translatedChars",
    totalCharsId: "totalChars",
    remainingTimeId: "remainingTime",
    totalTimeId: "totalTime",
  });

  // Inicializar módulo de carga de archivos
  fileUploader = initFileUpload({
    dropZoneId: "dropZone",
    fileInputId: "subtitleFile",
    fileSelectedId: "fileSelected",
    onClearSelection: () => {
      // Reset language selectors when file selection is cleared
      if (languageSelector) {
        languageSelector.resetLanguages();
      }
    },
    onFileLoaded: (content, file) => {
      // If content is null, it means the file was removed
      if (content === null) {
        fileContent = null;
        fileName = null;

        // Update translation button state
        if (formSubmitter) {
          formSubmitter.updateButtonState();
        }

        // Hide previous preview if it exists
        if (previewer) {
          previewer.hidePreview();
        }

        // Hide progress tracker if it's visible
        if (progressTracker) {
          progressTracker.hide();
        }

        // Reset language selectors to their default values when a file is removed
        if (languageSelector) {
          languageSelector.resetLanguages();
        }

        return;
      }

      fileContent = content;
      fileName = file.name;

      // Actualizar el nombre del archivo en el servicio de traducción
      setFileName(file.name);

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

  // Glossary selector logic
  async function setupGlossarySelector() {
    const glossaryInput = document.getElementById("glossaryId");
    if (!glossaryInput) return;
    // Try to fetch glossaries from backend
    const glossaries = await fetchAvailableGlossaries();
    if (glossaries && glossaries.length > 0) {
      // Create a select element
      const select = document.createElement("select");
      select.id = "glossaryId";
      select.name = "glossaryId";
      select.className = glossaryInput.className;
      select.innerHTML =
        '<option value="">No glossary</option>' +
        glossaries
          .map(
            (g) =>
              `<option value="${g.id}">${g.name} (${g.source_lang}→${g.target_lang})</option>`
          )
          .join("");
      glossaryInput.parentNode.replaceChild(select, glossaryInput);
    } else {
      // No glossaries: keep as text input, but update placeholder
      glossaryInput.placeholder =
        "No glossaries found. Enter ID manually (optional)";
    }
  }
  setupGlossarySelector();

  // Initialize subtitle editor
  subtitleEditor = initSubtitleEditor({
    editorContainerId: "subtitleEditor",
    editButtonId: "editButton",
    saveButtonId: "saveChangesButton",
    cancelButtonId: "cancelEditsButton",
    translatedPreviewId: "translatedPreview",
    onSave: (updatedContent) => {
      console.log("main.js: onSave callback executed with updated content");
      // Update the translated content with the edited content
      if (previewer) {
        // Update the preview with the edited content
        const currentPreviewData = previewer.getCurrentPreviewData();
        console.log(
          "main.js: Got current preview data",
          currentPreviewData ? "successfully" : "failed"
        );

        if (currentPreviewData) {
          currentPreviewData.translated = updatedContent;
          console.log("main.js: Updating preview with edited content");
          previewer.showPreview(currentPreviewData);
        }
      }
    },
  });

  console.log("main.js: Subtitle editor initialized:", !!subtitleEditor);

  // Initialize previewer
  previewer = initPreviewer({
    originalPreviewId: "originalPreview",
    translatedPreviewId: "translatedPreview",
    previewContainerId: "preview",
    downloadButtonId: "downloadButton",
    confidenceStatsId: "confidenceStats",
    subtitleEditor: subtitleEditor, // Pass the subtitle editor instance
    onDownload: () => {
      // Reset language selectors after download completes
      if (languageSelector) {
        languageSelector.resetLanguages();
      }

      // Clear file content and name since the task is complete
      fileContent = null;
      fileName = null;

      // Also clear the file input and selection display
      if (fileUploader) {
        fileUploader.clearFileSelection(false); // Don't show the "File removed" toast
      }

      // Hide the preview after a delay to give feedback to the user
      setTimeout(() => {
        if (previewer) {
          previewer.hidePreview();
        }
      }, 2000);
    },
  });

  // Initialize form submission module
  formSubmitter = initFormSubmission({
    formId: "translationForm",
    submitButtonId: "translateButton",
    loaderId: "loader",
    progressTracker: progressTracker, // Pass the progress tracker instance
    getFileContent: () => fileContent,
    getFileName: () => fileName,
    getLanguages: () => languageSelector.getSelectedLanguages(),
    onTranslationStart: () => {
      // Actions when translation starts
      // Show the loader immediately for instant feedback
      if (loader) loader.hidden = false;

      // Initially hide the progress tracker - it will be shown on first progress update
      if (progressTracker) progressTracker.hide();

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

      // Update subtitle editor with translated content
      if (subtitleEditor) {
        subtitleEditor.setContent(result.translated, result.confidenceData);
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

      // The progress tracker will still be visible in the background
      // Let's keep it for a moment so the user can see the completion stats
      // Alternatively, we could hide it immediately if that's the preferred behavior
      setTimeout(() => {
        if (progressTracker) progressTracker.hide();
      }, 5000); // Hide after 5 seconds

      // No reseteamos los idiomas aquí para permitir que el usuario vea la traducción,
      // los selectores se resetearán cuando el usuario descargue el archivo o elimine el archivo cargado
    },
    onTranslationError: (error) => {
      // Actions in case of error
      if (loader) loader.hidden = true;
      showErrorToast(`Translation error: ${error.message}`);

      // Progress tracker will show the error state
      // We'll leave it visible so the user can see what went wrong

      // Después de un error, permitimos al usuario corregir y volver a intentar,
      // por lo que no reseteamos los idiomas aquí
    },
  });

  // Initially disable the translation button
  document.getElementById("translateButton").disabled = true;

  // Hide preview and loader at startup
  document.getElementById("preview").hidden = true;
  if (loader) loader.hidden = true;
});

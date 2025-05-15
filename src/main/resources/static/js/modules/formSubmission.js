/**
 * Module for translation form submission
 * @module modules/formSubmission
 */

import { parseSRT, generateSRT } from "../utils/srtParser.js";
import { translateSRT } from "../api/translationService.js";
import { showErrorToast } from "../utils/toast.js";

/**
 * Options for the form submission module
 * @typedef {Object} FormSubmissionOptions
 * @property {string} formId - ID of the form
 * @property {string} submitButtonId - ID of the submit button
 * @property {string} loaderId - ID of the loader element
 * @property {Object} [progressTracker] - Progress tracker instance
 * @property {Function} onTranslationStart - Callback when translation starts
 * @property {Function} onTranslationSuccess - Callback when translation is successful
 * @property {Function} onTranslationError - Callback when there's an error in translation
 * @property {Function} getFileContent - Function to get the file content
 * @property {Function} getLanguages - Function to get the selected languages
 */

/**
 * Initializes form submission functionality
 *
 * @param {FormSubmissionOptions} options - Configuration options
 */
export function initFormSubmission(options) {
  const form = document.getElementById(options.formId);
  const submitButton = document.getElementById(options.submitButtonId);
  const loader = document.getElementById(options.loaderId);

  if (!form || !submitButton) {
    console.error("Form elements not found");
    return;
  }

  let isSubmitting = false;

  /**
   * Updates the state of form elements during submission
   * @param {boolean} submitting - Indicates if the form is being submitted
   */
  const updateSubmitState = (submitting) => {
    isSubmitting = submitting;

    submitButton.disabled = submitting;
    submitButton.classList.toggle("button--loading", submitting);

    if (loader) {
      loader.hidden = !submitting;
    }
  };

  /**
   * Validates the form before submission
   * @returns {boolean} true if the form is valid
   */
  const validateForm = () => {
    // Check that a file is present
    if (
      typeof options.getFileContent !== "function" ||
      !options.getFileContent()
    ) {
      showErrorToast("Please select an SRT file first.");
      return false;
    }

    // Check that languages are selected
    if (typeof options.getLanguages !== "function") {
      return false;
    }

    const languages = options.getLanguages();

    if (!languages.targetLanguage) {
      showErrorToast("Please select a target language.");
      return false;
    }

    // If source and target languages are the same
    if (
      languages.sourceLanguage !== "auto" &&
      languages.sourceLanguage === languages.targetLanguage
    ) {
      showErrorToast("Source and target languages cannot be the same.");
      return false;
    }

    return true;
  };

  // Event listener for the form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Get form data
    const fileContent = options.getFileContent();
    const languages = options.getLanguages();
    let fileName = "";

    if (options.getFileName && typeof options.getFileName === "function") {
      fileName = options.getFileName();
    }

    // Start translation
    updateSubmitState(true);

    if (typeof options.onTranslationStart === "function") {
      options.onTranslationStart();
    }

    // We'll start with the loader for immediate feedback
    // The progress tracker will be shown when we get the first progress update

    try {
      // Define a progress callback if we have a progress tracker
      const progressCallback = options.progressTracker
        ? (progressData) => {
            // Pass the loader to coordinate the transition
            options.progressTracker.handleProgressUpdate(progressData, {
              loader: loader,
            });
          }
        : null;

      // Call the API to translate the SRT file with progress callback
      const result = await translateSRT(
        fileContent,
        languages.targetLanguage,
        languages.sourceLanguage,
        progressCallback
      );

      // Call the success callback with the full response (including confidence information)
      if (typeof options.onTranslationSuccess === "function") {
        options.onTranslationSuccess({
          original: fileContent,
          translated: result.translatedContent,
          fileName: fileName,
          confidenceData: result.confidenceData,
          averageConfidence: result.averageConfidence,
          confidenceLevel: result.averageConfidenceLevel,
        });
      }
    } catch (error) {
      console.error("Translation error:", error);

      // Show error in progress tracker if available
      if (options.progressTracker) {
        options.progressTracker.complete(false, `Error: ${error.message}`);
      }

      // Call error callback
      if (typeof options.onTranslationError === "function") {
        options.onTranslationError(error);
      } else {
        showErrorToast(`Translation error: ${error.message}`);
      }
    } finally {
      updateSubmitState(false);
    }
  });

  /**
   * Updates the submit button state according to form validity
   */
  const updateButtonState = () => {
    let isValid = false;

    // Debug: log current file and language state
    let fileContent =
      typeof options.getFileContent === "function"
        ? options.getFileContent()
        : null;
    let languages =
      typeof options.getLanguages === "function" ? options.getLanguages() : {};
    console.log("[updateButtonState] fileContent exists:", !!fileContent);
    console.log("[updateButtonState] languages:", languages);

    // Check that a file is present
    if (fileContent) {
      // Check that languages are selected
      if (languages) {
        if (
          languages.targetLanguage &&
          (languages.sourceLanguage === "auto" ||
            languages.sourceLanguage !== languages.targetLanguage)
        ) {
          isValid = true;
        }
      }
    }

    console.log("[updateButtonState] isValid:", isValid);
    submitButton.disabled = !isValid;
  };

  // Expose the function to update the button state
  return {
    updateButtonState,
  };
}

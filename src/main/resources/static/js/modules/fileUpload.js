/**
 * Module for managing file uploads
 * @module modules/file      fileSelectedElement.innerHTML = `
        <div class="file-upload__selected-content">
          <span class="file-upload__selected-text file-upload__tooltip" title="${file.name}">Selected file: ${file.name}</span>
          <button type="button" class="button button--icon button--small file-upload__remove-btn" 
                  id="removeFileButton" aria-label="Remove selected file" title="Remove file">`d
 */

import { isValidSRT } from "../utils/srtParser.js";
import { showErrorToast } from "../utils/toast.js";
import { detectLanguage } from "../api/translationService.js";

/**
 * Represents configuration options for the file upload module
 * @typedef {Object} FileUploadOptions
 * @property {string} dropZoneId - ID of the element that will serve as the drop zone
 * @property {string} fileInputId - ID of the file input
 * @property {string} fileSelectedId - ID of the element to display the file name
 * @property {Function} onFileLoaded - Callback when a file is loaded
 * @property {Function} onClearSelection - Callback when file selection is cleared
 */

/**
 * Initializes the file upload functionality
 *
 * @param {FileUploadOptions} options - Configuration options
 */
export function initFileUpload(options) {
  const dropZone = document.getElementById(options.dropZoneId);
  const fileInput = document.getElementById(options.fileInputId);
  const fileSelectedElement = document.getElementById(options.fileSelectedId);

  let selectedFile = null;

  // Validate elements
  if (!dropZone || !fileInput) {
    console.error("File upload DOM elements not found");
    return;
  }

  // Get the auto-detect switch
  const autoDetectSwitch = document.getElementById("autoDetectSwitch");
  let autoDetectEnabled = true;
  if (autoDetectSwitch) {
    autoDetectEnabled = autoDetectSwitch.checked;
    autoDetectSwitch.addEventListener("change", () => {
      autoDetectEnabled = autoDetectSwitch.checked;
    });
  }

  /**
   * Handles file selection event
   * @param {File} file - Selected file
   */
  const handleFileSelection = (file) => {
    // Validate that it is a .srt file
    if (!file.name.endsWith(".srt")) {
      showErrorToast("Only files with .srt extension are allowed");
      fileInput.value = ""; // Clear input
      return;
    }

    selectedFile = file;

    // Show the selected file name with a remove button
    if (fileSelectedElement) {
      fileSelectedElement.innerHTML = `
      <div class="file-upload__selected-content">
        <span class="file-upload__selected-text" title="${file.name}" aria-label="Selected file: ${file.name}">
          <span>Selected file: ${file.name}</span>
          <svg class="file-upload__info-icon" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
            <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"></path>
          </svg>
        </span>
        <button type="button" class="button button--icon button--small file-upload__remove-btn" 
                id="removeFileButton" aria-label="Remove selected file" title="Remove file">
          <span class="button__icon">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg>
          </span>
        </button>
      </div>
      `;
      fileSelectedElement.setAttribute("aria-hidden", "false");
    }

    // Add click event to the remove button
    const removeButton = document.getElementById("removeFileButton");
    if (removeButton) {
      removeButton.addEventListener("click", (e) => {
        e.preventDefault();
        clearFileSelection();

        // Reset language detection info
        const detectionInfo = document.getElementById("languageDetectionInfo");
        if (detectionInfo) {
          detectionInfo.textContent = "";
          detectionInfo.className = "file-upload__detection";
        }

        // Call the file loaded callback with null to indicate file removal
        if (typeof options.onFileLoaded === "function") {
          options.onFileLoaded(null, null);
        }
      });
    }

    // Read the file content
    const reader = new FileReader();

    reader.onload = async (e) => {
      const content = e.target.result;

      // Validate SRT format
      if (!isValidSRT(content)) {
        showErrorToast("The file does not appear to have a valid SRT format");
        return;
      }

      // Call the file loaded callback
      if (typeof options.onFileLoaded === "function") {
        options.onFileLoaded(content, file);
      }

      // Language detection
      const detectionInfo = document.getElementById("languageDetectionInfo");
      if (detectionInfo) {
        detectionInfo.textContent = "";
        detectionInfo.className = "file-upload__detection";
      }
      if (autoDetectEnabled) {
        if (detectionInfo) {
          detectionInfo.textContent = "Detecting language...";
          detectionInfo.className =
            "file-upload__detection file-upload__detection--loading";
        }
        try {
          const result = await detectLanguage(content);
          if (result.success && result.language) {
            const percent = Math.round((result.confidence || 0) * 100);
            detectionInfo.innerHTML = `<span class='file-upload__badge'>Detected language: <b>${result.language.toUpperCase()}</b> (${percent}%)</span>`;
            detectionInfo.className =
              "file-upload__detection file-upload__detection--success";

            // Suggest detected language if confidence is high (>=85%)
            if (percent >= 85) {
              const sourceSelect = document.getElementById("sourceLanguage");
              if (sourceSelect) {
                // Only suggest auto-selection if user hasn't already picked a language (other than auto)
                if (sourceSelect.value === "auto" || !sourceSelect.value) {
                  const option = Array.from(sourceSelect.options).find(
                    (opt) =>
                      opt.value.toLowerCase() === result.language.toLowerCase()
                  );
                  if (option) {
                    // Immediately select the detected language in the dropdown
                    sourceSelect.value = option.value;
                    sourceSelect.dispatchEvent(
                      new Event("change", { bubbles: true })
                    );
                    // Show suggestion UI with badge and message
                    detectionInfo.innerHTML = `<span class='file-upload__badge'>Detected language: <b>${result.language.toUpperCase()}</b> (${percent}%)</span><span class='file-upload__autoselect' tabindex='0' title='The source language was set to the detected language.'>✔️</span>`;
                    detectionInfo.innerHTML += `<div class="file-upload__autoselect-confirm" style="justify-content:center;text-align:center;">\n  <span class="file-upload__autoselect-msg">The language was detected automatically and selected for you. You can change it if it is not correct.</span>\n</div>`;
                    // Move warning below the source language select, styled as a discrete helper text
                    let warningElem =
                      document.getElementById("overrideWarning");
                    if (!warningElem) {
                      warningElem = document.createElement("div");
                      warningElem.id = "overrideWarning";
                      warningElem.className = "file-upload__override-warning";
                      warningElem.style.display = "none";
                      warningElem.innerHTML = `<span style='font-size:1.1em;vertical-align:middle;margin-right:0.3em;'>⚠️</span> You have changed the source language. Make sure it matches the subtitle file.`;
                      // Insert after the source language select (not the group, but the select itself)
                      const sourceSelectEl =
                        document.getElementById("sourceLanguage");
                      if (sourceSelectEl && sourceSelectEl.parentNode) {
                        sourceSelectEl.parentNode.insertBefore(
                          warningElem,
                          sourceSelectEl.nextSibling
                        );
                      }
                    }
                    // Add warning logic if user overrides
                    sourceSelect.addEventListener(
                      "change",
                      function onChange() {
                        if (
                          sourceSelect.value.toLowerCase() !==
                          result.language.toLowerCase()
                        ) {
                          warningElem.style.display = "block";
                        } else {
                          warningElem.style.display = "none";
                        }
                      }
                    );
                  }
                }
              }
            }
          } else {
            detectionInfo.textContent =
              result.message || "Could not detect language.";
            detectionInfo.className =
              "file-upload__detection file-upload__detection--error";
          }
        } catch (err) {
          if (detectionInfo) {
            detectionInfo.textContent = "Error detecting language.";
            detectionInfo.className =
              "file-upload__detection file-upload__detection--error";
          }
        }
      } else {
        // If auto-detect is disabled, clear detection info
        if (detectionInfo) {
          detectionInfo.textContent =
            "Automatic language detection is disabled.";
          detectionInfo.className =
            "file-upload__detection file-upload__detection--loading";
        }
      }
    };

    reader.onerror = () => {
      showErrorToast("Error reading the file. Please try again.");
    };

    reader.readAsText(file);
  };

  // Event listeners for the file input
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelection(file);
    }
  });

  // Event listeners for drag and drop
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add("file-upload__dropzone--hover");
  });

  dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove("file-upload__dropzone--hover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove("file-upload__dropzone--hover");
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelection(file);
    }
  });

  /**
   * Clears the current file selection
   * @param {boolean} [showFeedback=true] - Whether to show feedback toast
   */
  function clearFileSelection(showFeedback = true) {
    selectedFile = null;
    fileInput.value = "";
    if (fileSelectedElement) {
      fileSelectedElement.innerHTML = "";
      fileSelectedElement.setAttribute("aria-hidden", "true");
    }

    // Reset language detection info
    const detectionInfo = document.getElementById("languageDetectionInfo");
    if (detectionInfo) {
      detectionInfo.textContent = "";
      detectionInfo.className = "file-upload__detection";
    }

    // Show feedback to the user
    if (showFeedback) {
      showErrorToast("File removed");
    }

    // Call the onClearSelection callback
    if (typeof options.onClearSelection === "function") {
      options.onClearSelection();
    }
  }

  /**
   * Returns the currently selected file
   * @returns {File|null} Selected file or null if none
   */
  function getSelectedFile() {
    return selectedFile;
  }

  // Return public API
  return {
    getSelectedFile,
    clearFileSelection,
  };
}

/**
 * Module for subtitle editing
 * @module modules/subtitleEditor
 */

import { parseSRT, generateSRT } from "../utils/srtParser.js";
import { showSuccessToast, showErrorToast } from "../utils/toast.js";

/**
 * Options for the subtitle editor module
 * @typedef {Object} SubtitleEditorOptions
 * @property {string} editorContainerId - ID of the container element for the editor
 * @property {string} editButtonId - ID of the button to toggle edit mode
 * @property {string} saveButtonId - ID of the button to save changes
 * @property {string} cancelButtonId - ID of the button to cancel editing
 * @property {string} translatedPreviewId - ID of the element displaying translated content
 * @property {Function} onSave - Callback function when changes are saved
 */

/**
 * Initializes subtitle editor functionality
 *
 * @param {SubtitleEditorOptions} options - Configuration options
 * @returns {Object} Public editor API
 */
export function initSubtitleEditor(options) {
  const editorContainer = document.getElementById(options.editorContainerId);
  const editButton = document.getElementById(options.editButtonId);
  const saveButton = document.getElementById(options.saveButtonId);
  const cancelButton = document.getElementById(options.cancelButtonId);
  const translatedPreview = document.getElementById(
    options.translatedPreviewId
  );

  // State variables
  let originalContent = null;
  let translatedContent = null;
  let subtitleBlocks = [];
  let isEditing = false;
  let confidenceData = [];

  /**
   * Toggles edit mode on/off
   */
  const toggleEditMode = () => {
    if (!translatedContent) {
      showErrorToast("No content to edit");
      return;
    }

    isEditing = !isEditing;

    if (isEditing) {
      // Enter edit mode
      // Parse the current translated content into editable blocks
      subtitleBlocks = parseSRT(translatedContent);
      renderEditor();
      editButton.setAttribute("aria-pressed", "true");
      editButton.classList.add("button--active");

      // Show the editor controls
      saveButton.hidden = false;
      cancelButton.hidden = false;
    } else {
      // Exit edit mode
      translatedPreview.hidden = false;
      if (editorContainer) {
        editorContainer.innerHTML = "";
        editorContainer.hidden = true;
      }

      editButton.setAttribute("aria-pressed", "false");
      editButton.classList.remove("button--active");

      // Hide the editor controls
      saveButton.hidden = true;
      cancelButton.hidden = true;
    }
  };

  /**
   * Renders the subtitle editor UI
   */
  const renderEditor = () => {
    if (!editorContainer) return;

    // Hide the regular preview while editing
    translatedPreview.hidden = true;
    editorContainer.hidden = false;

    // Create the editor content
    editorContainer.innerHTML = "";

    // Create subtitle block editors
    subtitleBlocks.forEach((block, index) => {
      const blockElement = document.createElement("div");
      blockElement.className = "subtitle-editor__block";
      blockElement.dataset.index = index;

      // Get confidence data if available
      let confidenceLevel = "high";
      if (confidenceData && confidenceData[index]) {
        confidenceLevel = confidenceData[index].level || "high";
      }

      blockElement.classList.add(`confidence--${confidenceLevel}`);

      // Create header with ID and time code (non-editable)
      const header = document.createElement("div");
      header.className = "subtitle-editor__header";
      header.innerHTML = `
        <div class="subtitle-editor__id">${block.id}</div>
        <div class="subtitle-editor__timecode">${block.timeCode}</div>
      `;

      // Create text editor (editable)
      const textEditor = document.createElement("div");
      textEditor.className = "subtitle-editor__text";
      textEditor.contentEditable = true;
      textEditor.textContent = block.text.join("\n");
      textEditor.setAttribute("aria-label", `Edit subtitle ${block.id}`);

      // Add confidence indicator if available
      if (confidenceData && confidenceData[index]) {
        const confidenceBadge = document.createElement("div");
        confidenceBadge.className = `subtitle-editor__confidence confidence-badge confidence-badge--${confidenceLevel}`;
        confidenceBadge.textContent =
          confidenceLevel.charAt(0).toUpperCase() + confidenceLevel.slice(1);
        header.appendChild(confidenceBadge);
      }

      // Assemble the block
      blockElement.appendChild(header);
      blockElement.appendChild(textEditor);
      editorContainer.appendChild(blockElement);
    });
  };

  /**
   * Saves the edited subtitles
   */
  const saveChanges = () => {
    // Get all editable blocks and update the subtitleBlocks array
    const textEditors = editorContainer.querySelectorAll(
      ".subtitle-editor__text"
    );

    textEditors.forEach((editor, index) => {
      if (index < subtitleBlocks.length) {
        // Split the content by newline to get text lines
        const textContent = editor.textContent.trim();
        subtitleBlocks[index].text = textContent.split("\n");
      }
    });

    // Generate new SRT content
    translatedContent = generateSRT(subtitleBlocks);

    // Call onSave callback if provided
    if (typeof options.onSave === "function") {
      options.onSave(translatedContent);
    }

    showSuccessToast("Changes saved successfully");

    // Exit edit mode
    toggleEditMode();
  };

  /**
   * Cancels editing and reverts to the original content
   */
  const cancelEditing = () => {
    isEditing = false;

    // Exit edit mode without saving
    translatedPreview.hidden = false;
    if (editorContainer) {
      editorContainer.innerHTML = "";
      editorContainer.hidden = true;
    }

    editButton.setAttribute("aria-pressed", "false");
    editButton.classList.remove("button--active");

    // Hide the editor controls
    saveButton.hidden = true;
    cancelButton.hidden = true;

    showSuccessToast("Editing cancelled");
  };

  /**
   * Set content for editing
   *
   * @param {string} content - Translated SRT content
   * @param {Array} confidence - Confidence data for the subtitles
   */
  const setContent = (content, confidence = []) => {
    translatedContent = content;
    confidenceData = confidence;
  };

  // Event listeners
  if (editButton) {
    editButton.addEventListener("click", toggleEditMode);
  }

  if (saveButton) {
    saveButton.addEventListener("click", saveChanges);
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", cancelEditing);
  }

  // Initial state - hide editor controls
  if (saveButton) saveButton.hidden = true;
  if (cancelButton) cancelButton.hidden = true;
  if (editorContainer) editorContainer.hidden = true;

  // Return public API
  return {
    toggleEditMode,
    setContent,
    saveChanges,
    cancelEditing,
  };
}

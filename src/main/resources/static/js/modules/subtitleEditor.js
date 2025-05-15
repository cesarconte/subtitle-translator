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

  // Verify that all required elements exist
  console.log("initSubtitleEditor: Verifying elements");
  console.log({
    editorContainer: !!editorContainer,
    editButton: !!editButton,
    saveButton: !!saveButton,
    cancelButton: !!cancelButton,
    translatedPreview: !!translatedPreview,
  });

  if (!editorContainer) {
    console.error(
      `Editor container with ID '${options.editorContainerId}' not found!`
    );
  }

  if (!editButton) {
    console.error(`Edit button with ID '${options.editButtonId}' not found!`);
  }

  if (!saveButton) {
    console.error(`Save button with ID '${options.saveButtonId}' not found!`);
  }

  if (!cancelButton) {
    console.error(
      `Cancel button with ID '${options.cancelButtonId}' not found!`
    );
  }

  if (!translatedPreview) {
    console.error(
      `Translated preview with ID '${options.translatedPreviewId}' not found!`
    );
  }

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
      console.error("toggleEditMode: No content to edit");
      return;
    }

    console.log("toggleEditMode: Before toggle, isEditing =", isEditing);
    isEditing = !isEditing;
    console.log("toggleEditMode: After toggle, isEditing =", isEditing);

    if (isEditing) {
      console.log("toggleEditMode: Entering edit mode");

      // Parse the content into editable blocks
      subtitleBlocks = parseSRT(translatedContent);
      console.log(
        "toggleEditMode: Parsed",
        subtitleBlocks.length,
        "subtitle blocks"
      );

      // Update UI to show editing mode
      editButton.setAttribute("aria-pressed", "true");
      editButton.classList.add("button--active");

      // Show editor controls
      if (saveButton) {
        saveButton.hidden = false;
        saveButton.style.display = "";
        console.log("toggleEditMode: Made save button visible");
      }

      if (cancelButton) {
        cancelButton.hidden = false;
        cancelButton.style.display = "";
        console.log("toggleEditMode: Made cancel button visible");
      }

      // El contenido traducido debe permanecer siempre visible, no necesitamos hacer nada especial
      if (!translatedPreview) {
        console.error("toggleEditMode: translatedPreview element not found");
      }

      // Set up and show editor
      if (editorContainer) {
        // Clear any existing content, but preserve the static title if present
        const title = editorContainer.querySelector(".subtitle-editor__title");
        editorContainer.innerHTML = "";
        if (title) editorContainer.appendChild(title);

        // Make editor visible through CSS classes
        editorContainer.classList.add("subtitle-editor--visible");

        // Añadir clase al contenedor principal para mejor layout
        const previewSection = document.getElementById("preview");
        if (previewSection) {
          previewSection.classList.add("editor-active");
        }

        console.log("toggleEditMode: Made editor container visible");

        // Create and add editor blocks
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
            confidenceBadge.className = `subtitle-editor__confidence confidence-badge--${confidenceLevel}`;
            confidenceBadge.textContent =
              confidenceLevel.charAt(0).toUpperCase() +
              confidenceLevel.slice(1);
            header.appendChild(confidenceBadge);
          }

          // Assemble the block
          blockElement.appendChild(header);
          blockElement.appendChild(textEditor);
          editorContainer.appendChild(blockElement);
        });

        console.log(
          "toggleEditMode: Added",
          subtitleBlocks.length,
          "subtitle blocks to editor"
        );
      } else {
        console.error("toggleEditMode: editorContainer element not found");
      }
    } else {
      console.log("toggleEditMode: Exiting edit mode");

      // Update UI to show normal mode
      editButton.setAttribute("aria-pressed", "false");
      editButton.classList.remove("button--active");

      // Hide editor controls
      if (saveButton) {
        saveButton.hidden = true;
        console.log("toggleEditMode: Hid save button");
      }

      if (cancelButton) {
        cancelButton.hidden = true;
        console.log("toggleEditMode: Hid cancel button");
      }

      // Show translated preview
      if (translatedPreview) {
        translatedPreview.hidden = false;
        translatedPreview.style.display = "";
        console.log("toggleEditMode: Made translated preview visible");
      }

      // Hide and clear editor
      if (editorContainer) {
        editorContainer.innerHTML = "";
        editorContainer.classList.remove("subtitle-editor--visible");

        // Quitar clase del contenedor principal
        const previewSection = document.getElementById("preview");
        if (previewSection) {
          previewSection.classList.remove("editor-active");
        }

        console.log("toggleEditMode: Hid and cleared editor container");
      }
    }
  };

  // renderEditor function has been merged into toggleEditMode for better control flow

  /**
   * Saves the edited subtitles
   */
  const saveChanges = () => {
    console.log("saveChanges: Starting save process");

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
    console.log("saveChanges: Generated new SRT content");

    // Call onSave callback if provided
    if (typeof options.onSave === "function") {
      console.log("saveChanges: Calling onSave callback");
      options.onSave(translatedContent);
    }

    // Exit edit mode - but set explicitly instead of toggling
    isEditing = false;
    console.log("saveChanges: Set isEditing to false");

    // El contenido traducido debe permanecer visible de forma predeterminada

    // Clear and hide editor container
    if (editorContainer) {
      editorContainer.innerHTML = "";
      editorContainer.classList.remove("subtitle-editor--visible");

      // Quitar clase del contenedor principal
      const previewSection = document.getElementById("preview");
      if (previewSection) {
        previewSection.classList.remove("editor-active");
      }

      console.log("saveChanges: Hidden and cleared editor container");
    }

    // Update button state
    editButton.setAttribute("aria-pressed", "false");
    editButton.classList.remove("button--active");
    console.log("saveChanges: Updated edit button state");

    // Hide the editor controls
    saveButton.hidden = true;
    cancelButton.hidden = true;
    console.log("saveChanges: Hidden editor controls");

    showSuccessToast("Changes saved successfully");
  };

  /**
   * Cancels editing and reverts to the original content
   */
  const cancelEditing = () => {
    console.log("cancelEditing: Starting cancel process");

    // Set editing state to false first
    isEditing = false;
    console.log("cancelEditing: Set isEditing to false");

    // El contenido traducido debe permanecer visible de forma predeterminada

    // Clear and hide editor container
    if (editorContainer) {
      editorContainer.innerHTML = "";
      editorContainer.classList.remove("subtitle-editor--visible");

      // Quitar clase del contenedor principal
      const previewSection = document.getElementById("preview");
      if (previewSection) {
        previewSection.classList.remove("editor-active");
      }

      console.log("cancelEditing: Hidden and cleared editor container");
    }

    // Update button state
    editButton.setAttribute("aria-pressed", "false");
    editButton.classList.remove("button--active");
    console.log("cancelEditing: Updated edit button state");

    // Hide the editor controls
    saveButton.hidden = true;
    cancelButton.hidden = true;
    console.log("cancelEditing: Hidden editor controls");

    showSuccessToast("Editing cancelled");
  };

  /**
   * Set content for editing
   *
   * @param {string} content - Translated SRT content
   * @param {Array} confidence - Confidence data for the subtitles
   */
  const setContent = (content, confidence = []) => {
    console.log(
      "setContent: Setting content",
      "content length:",
      content ? content.length : 0,
      "confidence items:",
      confidence ? confidence.length : 0
    );
    translatedContent = content;
    confidenceData = confidence;
  };

  /**
   * Debug helper to check element states
   * This can be called from the browser console using window.debugSubtitleEditor()
   */
  const debugEditorState = () => {
    console.group("Subtitle Editor Debug Info");
    console.log("isEditing:", isEditing);
    console.log("translatedContent exists:", !!translatedContent);
    console.log(
      "confidenceData items:",
      confidenceData ? confidenceData.length : 0
    );
    console.log("subtitleBlocks:", subtitleBlocks ? subtitleBlocks.length : 0);

    // Element visibility states
    console.log("editorContainer:", {
      exists: !!editorContainer,
      hidden: editorContainer ? editorContainer.hidden : "N/A",
      display: editorContainer
        ? getComputedStyle(editorContainer).display
        : "N/A",
      visibility: editorContainer
        ? getComputedStyle(editorContainer).visibility
        : "N/A",
      hasHiddenAttr: editorContainer
        ? editorContainer.hasAttribute("hidden")
        : "N/A",
      childCount: editorContainer ? editorContainer.children.length : 0,
    });

    console.log("translatedPreview:", {
      exists: !!translatedPreview,
      hidden: translatedPreview ? translatedPreview.hidden : "N/A",
      display: translatedPreview
        ? getComputedStyle(translatedPreview).display
        : "N/A",
      visibility: translatedPreview
        ? getComputedStyle(translatedPreview).visibility
        : "N/A",
    });

    console.log("Button states:", {
      editButton: {
        ariaPressed: editButton
          ? editButton.getAttribute("aria-pressed")
          : "N/A",
        hasActiveClass: editButton
          ? editButton.classList.contains("button--active")
          : "N/A",
      },
      saveButton: {
        hidden: saveButton ? saveButton.hidden : "N/A",
        display: saveButton ? getComputedStyle(saveButton).display : "N/A",
      },
      cancelButton: {
        hidden: cancelButton ? cancelButton.hidden : "N/A",
        display: cancelButton ? getComputedStyle(cancelButton).display : "N/A",
      },
    });
    console.groupEnd();
  };

  // Expose debug function to window for console access
  if (typeof window !== "undefined") {
    window.debugSubtitleEditor = debugEditorState;
  }

  // Event listeners
  if (editButton) {
    console.log("Setting up click event for edit button");
    // Remove any existing event listeners first to prevent duplicates
    editButton.removeEventListener("click", toggleEditMode);
    editButton.addEventListener("click", function () {
      console.log("Edit button clicked");
      debugEditorState(); // Log state before toggle
      toggleEditMode();
      // Small delay to allow DOM to update
      setTimeout(debugEditorState, 100); // Log state after toggle
    });
  }

  if (saveButton) {
    console.log("Setting up click event for save button");
    // Remove any existing event listeners first to prevent duplicates
    saveButton.removeEventListener("click", saveChanges);
    saveButton.addEventListener("click", function () {
      console.log("Save button clicked");
      saveChanges();
      setTimeout(debugEditorState, 100); // Log state after save
    });
  }

  if (cancelButton) {
    console.log("Setting up click event for cancel button");
    // Remove any existing event listeners first to prevent duplicates
    cancelButton.removeEventListener("click", cancelEditing);
    cancelButton.addEventListener("click", function () {
      console.log("Cancel button clicked");
      cancelEditing();
      setTimeout(debugEditorState, 100); // Log state after cancel
    });
  }

  // Initial state - hide editor controls
  if (saveButton) saveButton.hidden = true;
  if (cancelButton) cancelButton.hidden = true;
  // El editorContainer ya está oculto por CSS

  // Return public API
  return {
    toggleEditMode,
    setContent,
    saveChanges,
    cancelEditing,
  };
}

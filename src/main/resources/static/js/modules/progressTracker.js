/**
 * Module for tracking translation progress
 * @module modules/progressTracker
 */

/**
 * Options for the progress tracker module
 * @typedef {Object} ProgressTrackerOptions
 * @property {string} progressTrackerId - ID of the main progress tracker container
 * @property {string} progressBarId - ID of the progress bar element
 * @property {string} progressPercentageId - ID of the element showing the percentage
 * @property {string} progressStatusId - ID of the status message element
 * @property {string} translatedCharsId - ID of the translated characters count element
 * @property {string} totalCharsId - ID of the total characters count element
 * @property {string} remainingTimeId - ID of the remaining time element
 * @property {string} totalTimeId - ID of the total time element
 */

/**
 * Initializes the progress tracking functionality
 *
 * @param {ProgressTrackerOptions} options - Configuration options
 * @returns {Object} - Object with methods to control the progress tracker
 */
export function initProgressTracker(options) {
  // DOM elements
  const progressTracker = document.getElementById(options.progressTrackerId);
  const progressBar = document.getElementById(options.progressBarId);
  const progressPercentage = document.getElementById(
    options.progressPercentageId
  );
  const progressStatus = document.getElementById(options.progressStatusId);
  const translatedCharsElement = document.getElementById(
    options.translatedCharsId
  );
  const totalCharsElement = document.getElementById(options.totalCharsId);
  const remainingTimeElement = document.getElementById(options.remainingTimeId);
  const totalTimeElement = document.getElementById(options.totalTimeId);

  // Track state
  let isActive = false;

  /**
   * Format time as mm:ss or hh:mm:ss
   * @param {number} milliseconds - Time in milliseconds
   * @returns {string} - Formatted time string
   */
  const formatTime = (milliseconds) => {
    if (isNaN(milliseconds) || milliseconds <= 0) return "00:00";

    const seconds = Math.round(milliseconds / 1000);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    } else {
      return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
  };

  /**
   * Set appropriate status class based on the phase
   * @param {string} phase - Current phase of translation
   */
  const setStatusClass = (phase) => {
    if (!progressStatus) return;

    // Remove any existing status classes
    progressStatus.classList.remove(
      "progress-tracker__status--preparing",
      "progress-tracker__status--translating",
      "progress-tracker__status--finalizing",
      "progress-tracker__status--completed",
      "progress-tracker__status--error",
      "progress-tracker__status--active"
    );

    // Add appropriate class based on phase
    switch (phase) {
      case "starting":
      case "preparing":
        progressStatus.classList.add("progress-tracker__status--preparing");
        break;
      case "translating":
        progressStatus.classList.add("progress-tracker__status--translating");
        progressStatus.classList.add("progress-tracker__status--active");
        break;
      case "finalizing":
        progressStatus.classList.add("progress-tracker__status--finalizing");
        break;
      case "completed":
        progressStatus.classList.add("progress-tracker__status--completed");
        break;
      case "error":
        progressStatus.classList.add("progress-tracker__status--error");
        break;
    }
  };

  /**
   * Show the progress tracker with animation
   */
  const show = () => {
    if (progressTracker) {
      // Remove the hidden attribute
      progressTracker.hidden = false;

      // Force a reflow to ensure the CSS transition works
      progressTracker.offsetHeight;

      // Apply visible styles
      progressTracker.style.opacity = "1";
      progressTracker.style.transform = "translateY(0)";

      isActive = true;
    }
  };

  /**
   * Hide the progress tracker with smooth animation
   */
  const hide = () => {
    if (progressTracker) {
      // First fade out
      progressTracker.style.opacity = "0";
      progressTracker.style.transform = "translateY(10px)";

      // Then hide after transition completes
      setTimeout(() => {
        progressTracker.hidden = true;
        isActive = false;
      }, 300); // Must match the duration in CSS transition
    }
  };

  /**
   * Reset the progress tracker to initial state with animations
   */
  const reset = () => {
    // Reset progress bar with animation
    if (progressBar) {
      // Apply transition for smooth reset
      progressBar.style.transition = "width 0.3s ease-out";
      progressBar.style.width = "0%";
      // Reset transition after a brief delay (smoother animation on next update)
      setTimeout(() => {
        progressBar.style.transition = "width 0.5s ease";
      }, 300);
    }

    if (progressPercentage) progressPercentage.textContent = "0";
    if (progressStatus) {
      progressStatus.textContent = "Preparing translation...";
      setStatusClass("preparing");
    }
    if (translatedCharsElement) translatedCharsElement.textContent = "0";
    if (totalCharsElement) totalCharsElement.textContent = "0";
    if (remainingTimeElement)
      remainingTimeElement.textContent = "calculating...";
    if (totalTimeElement) totalTimeElement.textContent = "calculating...";
  };

  /**
   * Start progress tracking
   */
  const start = () => {
    reset();
    show();
  };

  /**
   * Handle progress updates from the backend
   * @param {Object} progressData - Progress data from backend
   * @param {Object} [options] - Additional options
   * @param {HTMLElement} [options.loader] - Loader element to coordinate with
   */
  const handleProgressUpdate = (progressData, options = {}) => {
    if (!progressData) return;

    // If progress data exists but tracker isn't active yet, activate it
    if (!isActive && progressData.phase !== "starting") {
      start();

      // Hide loader if provided when switching to progress tracker
      if (options.loader) {
        options.loader.hidden = true;
      }
    }

    if (!isActive) return;

    // Update progress bar and percentage
    const progress = progressData.progress || 0;
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    if (progressPercentage) {
      progressPercentage.textContent = Math.round(progress);
    }

    // Update status message
    if (progressStatus && progressData.message) {
      progressStatus.textContent = progressData.message;
      setStatusClass(progressData.phase || "translating");
    }

    // Update character counts
    if (translatedCharsElement) {
      translatedCharsElement.textContent = progressData.translatedChars || 0;
    }
    if (totalCharsElement && progressData.totalChars) {
      totalCharsElement.textContent = progressData.totalChars;
    }

    // Update time estimates if available
    if (progressData.estimatedTotalTimeMs && progressData.remainingTimeMs) {
      if (remainingTimeElement) {
        remainingTimeElement.textContent = formatTime(
          progressData.remainingTimeMs
        );
      }
      if (totalTimeElement) {
        totalTimeElement.textContent = formatTime(
          progressData.estimatedTotalTimeMs
        );
      }
    } else if (progress > 5) {
      // If no time estimates but we have some progress
      if (remainingTimeElement) {
        remainingTimeElement.textContent = "calculating...";
      }
      if (totalTimeElement) {
        totalTimeElement.textContent = "calculating...";
      }
    }

    // Handle completion or error states
    if (progressData.phase === "completed") {
      complete(true, progressData.message);
    } else if (progressData.phase === "error") {
      complete(false, progressData.message);
    }
  };

  /**
   * Complete the progress tracking
   * @param {boolean} [success=true] - Whether the translation completed successfully
   * @param {string} [message] - Optional completion message
   */
  const complete = (success = true, message) => {
    if (!isActive) return;

    const statusMessage =
      message ||
      (success ? "Translation completed successfully!" : "Translation failed.");
    const statusPhase = success ? "completed" : "error";

    if (progressBar && success) progressBar.style.width = "100%";
    if (progressPercentage && success) progressPercentage.textContent = "100";

    if (progressStatus) {
      progressStatus.textContent = statusMessage;
      setStatusClass(statusPhase);
    }

    if (success && totalCharsElement && translatedCharsElement) {
      const totalChars = parseInt(totalCharsElement.textContent || "0", 10);
      translatedCharsElement.textContent = totalChars.toString();
    }

    if (remainingTimeElement && success) {
      remainingTimeElement.textContent = "00:00";
    }
  };

  // Return public methods
  return {
    start,
    handleProgressUpdate,
    complete,
    reset,
    show,
    hide,
  };
}

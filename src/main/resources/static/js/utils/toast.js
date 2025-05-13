/**
 * Utility for displaying toast notifications
 * @module utils/toast
 */

/**
 * Class for managing toast notifications
 */
export class Toast {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.message - Mensaje a mostrar
   * @param {string} [options.type='default'] - Tipo de toast (default, success, error, warning)
   * @param {number} [options.duration=3000] - Duración en milisegundos
   */
  constructor(options) {
    this.message = options.message;
    this.type = options.type || "default";
    this.duration = options.duration || 3000;
    this.element = null;
    this.closeTimeout = null;
  }

  /**
   * Creates the HTML element for the toast
   * @private
   */
  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("toast", `toast--${this.type}`);

    this.element.setAttribute("role", "alert");
    this.element.setAttribute("aria-live", "polite");

    const message = document.createElement("p");
    message.classList.add("toast__message");
    message.textContent = this.message;

    this.element.appendChild(message);

    // Botón de cierre
    const closeButton = document.createElement("button");
    closeButton.classList.add("toast__close");
    closeButton.innerHTML = "&times;";
    closeButton.setAttribute("aria-label", "Close");
    closeButton.addEventListener("click", () => this.close());

    this.element.appendChild(closeButton);
  }

  /**
   * Shows the toast
   */
  show() {
    this.createElement();

    // Buscar el contenedor o crearlo si no existe
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.classList.add("toast-container");
      document.body.appendChild(container);
    }

    // Añadir al DOM
    container.appendChild(this.element);

    // Schedule automatic closure
    this.closeTimeout = setTimeout(() => {
      this.close();
    }, this.duration);
  }

  /**
   * Closes the toast
   */
  close() {
    if (!this.element) return;

    // Clear timeout if it exists
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }

    // Animate closing
    this.element.classList.add("toast--closing");

    // Remove the element after animation
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }, 300); // Duración de la animación
  }
}

/**
 * Shows a default type toast
 * @param {string} message - Message to display
 * @param {number} [duration=3000] - Duration in milliseconds
 */
export function showToast(message, duration = 3000) {
  const toast = new Toast({
    message,
    duration,
  });
  toast.show();
}

/**
 * Shows a success toast
 * @param {string} message - Message to display
 * @param {number} [duration=3000] - Duration in milliseconds
 */
export function showSuccessToast(message, duration = 3000) {
  const toast = new Toast({
    message,
    type: "success",
    duration,
  });
  toast.show();
}

/**
 * Shows an error toast
 * @param {string} message - Message to display
 * @param {number} [duration=4000] - Duration in milliseconds
 */
export function showErrorToast(message, duration = 4000) {
  const toast = new Toast({
    message,
    type: "error",
    duration,
  });
  toast.show();
}

/**
 * Shows a warning toast
 * @param {string} message - Message to display
 * @param {number} [duration=3500] - Duration in milliseconds
 */
export function showWarningToast(message, duration = 3500) {
  const toast = new Toast({
    message,
    type: "warning",
    duration,
  });
  toast.show();
}

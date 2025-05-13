/**
 * Utilidad para manejar la interfaz de portapapeles
 * @module utils/clipboard
 */

/**
 * Copia el texto al portapapeles
 *
 * @param {string} text - El texto a copiar
 * @returns {Promise<boolean>} - true si se copió correctamente, false en caso contrario
 */
export const copyToClipboard = async (text) => {
  try {
    // Intenta usar la API moderna de portapapeles
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback para contextos no seguros o navegadores que no soportan la API
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Hacer el textarea invisible
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    textArea.remove();

    return successful;
  } catch (err) {
    console.error("Error copying text:", err);
    return false;
  }
};

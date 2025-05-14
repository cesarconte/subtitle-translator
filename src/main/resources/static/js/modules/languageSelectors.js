/**
 * Módulo para manejar selectores de idioma
 * @module modules/languageSelectors
 */

/**
 * @typedef {Object} LanguageSelectorsOptions
 * @property {string} sourceSelectId - ID del selector de idioma origen
 * @property {string} targetSelectId - ID del selector de idioma destino
 * @property {Function} onChange - Callback cuando cambia algún selector
 */

/**
 * Inicializa los selectores de idioma
 *
 * @param {LanguageSelectorsOptions} options - Opciones de configuración
 * @returns {Object} API con métodos públicos
 */
export function initLanguageSelectors(options) {
  const sourceSelect = document.getElementById(options.sourceSelectId);
  const targetSelect = document.getElementById(options.targetSelectId);

  if (!sourceSelect || !targetSelect) {
    console.error("No se encontraron los selectores de idioma");
    return;
  }

  // Reset selectors to initial state on page load
  sourceSelect.selectedIndex = 0;
  targetSelect.selectedIndex = 0;

  /**
   * Previene que se seleccione el mismo idioma en ambos selectores
   */
  const preventDuplicateLanguage = () => {
    // Obtener valores actuales
    const sourceValue = sourceSelect.value;
    const targetValue = targetSelect.value;

    // Si ambos tienen valor y son el mismo (excepto para "auto")
    if (
      sourceValue &&
      targetValue &&
      sourceValue === targetValue &&
      sourceValue !== "auto"
    ) {
      // Activar todos los options en ambos selectores
      Array.from(sourceSelect.options).forEach((option) => {
        option.disabled = false;
      });

      Array.from(targetSelect.options).forEach((option) => {
        option.disabled = false;
      });

      // Desactivar la opción seleccionada en el otro select
      if (sourceValue !== "auto") {
        const sourceOption = targetSelect.querySelector(
          `option[value="${sourceValue}"]`
        );
        if (sourceOption) {
          sourceOption.disabled = true;
        }
      }

      const targetOption = sourceSelect.querySelector(
        `option[value="${targetValue}"]`
      );
      if (targetOption) {
        targetOption.disabled = true;
      }
    }
  };

  // Event listeners
  sourceSelect.addEventListener("change", () => {
    preventDuplicateLanguage();

    if (typeof options.onChange === "function") {
      options.onChange({
        sourceLanguage: sourceSelect.value,
        targetLanguage: targetSelect.value,
      });
    }
  });

  targetSelect.addEventListener("change", () => {
    preventDuplicateLanguage();

    if (typeof options.onChange === "function") {
      options.onChange({
        sourceLanguage: sourceSelect.value,
        targetLanguage: targetSelect.value,
      });
    }
  });

  /**
   * Obtiene los idiomas seleccionados actualmente
   * @returns {Object} Idiomas seleccionados (origen y destino)
   */
  const getSelectedLanguages = () => {
    return {
      sourceLanguage: sourceSelect.value,
      targetLanguage: targetSelect.value,
    };
  };

  /**
   * Establece los idiomas seleccionados
   * @param {string} sourceLanguage - Idioma origen
   * @param {string} targetLanguage - Idioma destino
   */
  const setSelectedLanguages = (sourceLanguage, targetLanguage) => {
    if (sourceLanguage) {
      sourceSelect.value = sourceLanguage;
    }

    if (targetLanguage) {
      targetSelect.value = targetLanguage;
    }

    preventDuplicateLanguage();

    if (typeof options.onChange === "function") {
      options.onChange({
        sourceLanguage: sourceSelect.value,
        targetLanguage: targetSelect.value,
      });
    }
  };

  /**
   * Verifica si ambos idiomas están seleccionados válidamente
   * @returns {boolean} true si ambos idiomas están seleccionados correctamente
   */
  const isValid = () => {
    const source = sourceSelect.value;
    const target = targetSelect.value;

    // El idioma destino debe estar seleccionado
    if (!target) {
      return false;
    }

    // Si el origen es igual al destino (excepto auto), no es válido
    if (source !== "auto" && source === target) {
      return false;
    }

    return true;
  };

  // Aplicar validación inicial
  preventDuplicateLanguage();

  /**
   * Restablece los selectores de idioma a sus valores iniciales/predeterminados
   */
  const resetLanguages = () => {
    // Seleccionar la primera opción desactivada (normalmente "Select a language")
    sourceSelect.selectedIndex = 0;
    targetSelect.selectedIndex = 0;

    // Reactivar todas las opciones
    Array.from(sourceSelect.options).forEach((option) => {
      option.disabled = false;
    });

    Array.from(targetSelect.options).forEach((option) => {
      option.disabled = false;
    });

    // Notificar el cambio
    if (typeof options.onChange === "function") {
      options.onChange({
        sourceLanguage: sourceSelect.value,
        targetLanguage: targetSelect.value,
      });
    }
  };

  // Retornar API pública
  return {
    getSelectedLanguages,
    setSelectedLanguages,
    isValid,
    resetLanguages,
  };
}

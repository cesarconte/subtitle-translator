package io.github.cesarconte.subtitle_translator.util;

import org.springframework.stereotype.Component;

/**
 * Utilidad para el portapapeles
 */
@Component
public class ClipboardUtils {

    /**
     * Copia texto al portapapeles
     * 
     * @param text Texto a copiar
     * @return true si la operación fue exitosa
     */
    public boolean copyToClipboard(String text) {
        // En realidad, esta operación se realiza en el frontend
        // Este método es solo un placeholder para la lógica del backend
        return true;
    }
}

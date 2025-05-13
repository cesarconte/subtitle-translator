package io.github.cesarconte.subtitle_translator.util;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

/**
 * Utilidad para copiar texto al portapapeles
 */
@Component
public class ClipboardUtil {

    // Caché para evitar copias duplicadas
    private final Map<String, Long> clipboardCache = new ConcurrentHashMap<>();
    private static final long CACHE_EXPIRY = 60000; // 1 minuto

    /**
     * Simula la copia al portapapeles. En realidad, esto tiene que ser manejado por
     * el frontend,
     * ya que el backend no tiene acceso al portapapeles del usuario.
     * 
     * @param text Texto a copiar
     * @return true si el texto es nuevo o ha expirado de la caché, false en caso
     *         contrario
     */
    public boolean copyToClipboard(String text) {
        if (text == null || text.isEmpty()) {
            return false;
        }

        String hash = String.valueOf(text.hashCode());
        long now = System.currentTimeMillis();

        // Comprobar si el texto ya está en la caché y no ha expirado
        if (clipboardCache.containsKey(hash)) {
            long timestamp = clipboardCache.get(hash);
            if (now - timestamp < CACHE_EXPIRY) {
                return false;
            }
        }

        // Actualizar la caché
        clipboardCache.put(hash, now);

        // Limpiar entradas antiguas
        clipboardCache.entrySet().removeIf(entry -> now - entry.getValue() > CACHE_EXPIRY);

        // En un entorno real, aquí se haría algo con el texto
        // pero como el portapapeles es del lado del cliente, solo simulamos la
        // operación
        return true;
    }
}

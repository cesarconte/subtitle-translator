package io.github.cesarconte.subtitle_translator.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import lombok.Data;

/**
 * Modelo para almacenar traducciones en MongoDB.
 * Utilizamos un índice compuesto para buscar traducciones rápidamente por hash,
 * sourceLanguage y targetLanguage.
 */
@Data
@Document(collection = "translations")
@CompoundIndex(name = "idx_hash_source_target", def = "{'contentHash': 1, 'sourceLanguage': 1, 'targetLanguage': 1}", unique = true)
public class Translation {

    @Id
    private String id;

    // Hash del contenido original del archivo
    private String contentHash;

    // Nombre del archivo original
    private String fileName;

    // Contenido original
    private String originalContent;

    // Idioma de origen
    private String sourceLanguage;

    // Idioma destino
    private String targetLanguage;

    // Contenido traducido
    private String translatedContent;

    // Datos de confianza de la traducción (formato JSON)
    private String confidenceData;

    // Confianza promedio (0-1)
    private Double averageConfidence;

    // Nivel de confianza (high, medium, low)
    private String confidenceLevel;

    // Fecha de creación
    private LocalDateTime createdAt;

    // Fecha de último acceso
    private LocalDateTime lastAccessedAt;

    // Contador de accesos
    private Integer accessCount;

    // Tamaño del archivo original en bytes
    private Long fileSize;

    // Constructor por defecto
    public Translation() {
        this.createdAt = LocalDateTime.now();
        this.lastAccessedAt = LocalDateTime.now();
        this.accessCount = 1;
    }

    /**
     * Actualiza el tiempo de último acceso e incrementa el contador
     */
    public void updateAccess() {
        this.lastAccessedAt = LocalDateTime.now();
        this.accessCount++;
    }
}

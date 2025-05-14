package io.github.cesarconte.subtitle_translator.service;

import io.github.cesarconte.subtitle_translator.model.Translation;
import io.github.cesarconte.subtitle_translator.repository.TranslationRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * Servicio para gestionar las traducciones almacenadas en MongoDB.
 */
@Service
public class TranslationStorageService {

    private final TranslationRepository translationRepository;

    public TranslationStorageService(TranslationRepository translationRepository) {
        this.translationRepository = translationRepository;
    }

    

    /**
     * Busca una traducción existente en la base de datos.
     *
     * @param content        Contenido original del archivo
     * @param sourceLanguage Idioma de origen
     * @param targetLanguage Idioma destino
     * @return Un Optional con la traducción si existe, o vacío si no existe
     */
    public Optional<Translation> findExistingTranslation(String content, String sourceLanguage, String targetLanguage) {
        String contentHash = generateContentHash(content);
        Optional<Translation> existingTranslation = translationRepository
                .findByContentHashAndSourceLanguageAndTargetLanguage(
                        contentHash, sourceLanguage, targetLanguage);

        // Si encontramos una traducción, actualizamos su fecha de acceso y contador
        existingTranslation.ifPresent(translation -> {
            translation.updateAccess();
            translationRepository.save(translation);
        });

        return existingTranslation;
    }

    /**
     * Guarda una nueva traducción en la base de datos.
     *
     * @param fileName          Nombre del archivo original
     * @param originalContent   Contenido original
     * @param sourceLanguage    Idioma de origen
     * @param targetLanguage    Idioma destino
     * @param translatedContent Contenido traducido
     * @param confidenceData    Datos de confianza (formato JSON)
     * @param averageConfidence Confianza promedio (0-1)
     * @param confidenceLevel   Nivel de confianza (high, medium, low)
     * @return La traducción guardada
     */
    public Translation saveTranslation(
            String fileName,
            String originalContent,
            String sourceLanguage,
            String targetLanguage,
            String translatedContent,
            String confidenceData,
            Double averageConfidence,
            String confidenceLevel) {

        String contentHash = generateContentHash(originalContent);

        // Comprobar si ya existe la traducción
        Optional<Translation> existingTranslation = translationRepository
                .findByContentHashAndSourceLanguageAndTargetLanguage(
                        contentHash, sourceLanguage, targetLanguage);

        if (existingTranslation.isPresent()) {
            // Actualizar la traducción existente
            Translation translation = existingTranslation.get();
            translation.setTranslatedContent(translatedContent);
            translation.setConfidenceData(confidenceData);
            translation.setAverageConfidence(averageConfidence);
            translation.setConfidenceLevel(confidenceLevel);
            translation.updateAccess();
            return translationRepository.save(translation);
        } else {
            // Crear una nueva traducción
            Translation translation = new Translation();
            translation.setFileName(fileName);
            translation.setContentHash(contentHash);
            translation.setOriginalContent(originalContent);
            translation.setSourceLanguage(sourceLanguage);
            translation.setTargetLanguage(targetLanguage);
            translation.setTranslatedContent(translatedContent);
            translation.setConfidenceData(confidenceData);
            translation.setAverageConfidence(averageConfidence);
            translation.setConfidenceLevel(confidenceLevel);
            translation.setFileSize((long) originalContent.getBytes(StandardCharsets.UTF_8).length);
            return translationRepository.save(translation);
        }
    }

    /**
     * Genera un hash MD5 del contenido para identificar archivos iguales.
     *
     * @param content Contenido a hashear
     * @return Hash MD5 del contenido
     */
    private String generateContentHash(String content) {
        return DigestUtils.md5DigestAsHex(content.getBytes(StandardCharsets.UTF_8));
    }
}

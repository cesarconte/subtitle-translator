package io.github.cesarconte.subtitle_translator.service;

import io.github.cesarconte.subtitle_translator.model.Translation;

/**
 * Interfaz para el servicio de almacenamiento de traducciones
 */
public interface ITranslationStorageService {

    /**
     * Guarda una traducción en el almacenamiento
     * 
     * @param originalText   Texto original
     * @param translatedText Texto traducido
     * @param sourceLanguage Idioma de origen
     * @param targetLanguage Idioma de destino
     * @param fileName       Nombre del archivo
     * @return Registro de traducción almacenado
     */
    Translation saveTranslation(String originalText, String translatedText,
            String sourceLanguage, String targetLanguage, String fileName);
}

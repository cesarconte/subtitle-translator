package io.github.cesarconte.subtitle_translator.service;

import io.github.cesarconte.subtitle_translator.model.Translation;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Implementación mock del servicio de almacenamiento de traducciones para uso
 * en desarrollo local
 * sin necesidad de MongoDB
 */
@Service
@Profile("localDev")
public class MockTranslationStorageService implements ITranslationStorageService {

    @Override
    public Translation saveTranslation(String originalText, String translatedText,
            String sourceLanguage, String targetLanguage, String fileName) {

        // Creamos un registro ficticio pero no lo almacenamos realmente
        Translation translation = new Translation();
        translation.setOriginalContent(originalText);
        translation.setTranslatedContent(translatedText);
        translation.setSourceLanguage(sourceLanguage);
        translation.setTargetLanguage(targetLanguage);
        translation.setFileName(fileName);
        translation.setId("mock_" + System.nanoTime());
        return translation;
    }
}

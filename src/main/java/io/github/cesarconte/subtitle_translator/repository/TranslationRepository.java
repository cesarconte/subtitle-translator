package io.github.cesarconte.subtitle_translator.repository;

import io.github.cesarconte.subtitle_translator.model.Translation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repositorio para acceder a las traducciones almacenadas en MongoDB.
 */
@Repository
public interface TranslationRepository extends MongoRepository<Translation, String> {

    /**
     * Busca una traducción por el hash del contenido y los idiomas de origen y
     * destino
     * 
     * @param contentHash    Hash del contenido original
     * @param sourceLanguage Idioma de origen
     * @param targetLanguage Idioma destino
     * @return La traducción encontrada (Optional)
     */
    Optional<Translation> findByContentHashAndSourceLanguageAndTargetLanguage(
            String contentHash, String sourceLanguage, String targetLanguage);
}

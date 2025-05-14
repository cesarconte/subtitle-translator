package io.github.cesarconte.subtitle_translator.controller;

import io.github.cesarconte.subtitle_translator.model.Translation;
import io.github.cesarconte.subtitle_translator.repository.TranslationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controlador REST para gestionar el historial de traducciones
 */
@RestController
@RequestMapping("/api/history")
public class TranslationHistoryController {

    private final TranslationRepository translationRepository;

    public TranslationHistoryController(TranslationRepository translationRepository) {
        this.translationRepository = translationRepository;
    }

    /**
     * Obtiene el historial de traducciones paginado
     * 
     * @param page Número de página (0-indexed)
     * @param size Tamaño de la página
     * @return Lista paginada de traducciones
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getTranslationHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        // Crear paginación y ordenamiento
        Pageable paging = PageRequest.of(page, size,
                Sort.by("lastAccessedAt").descending());
        Page<Translation> pageTranslations = translationRepository.findAll(paging);

        // Extraer contenido y metadatos
        List<Translation> translations = pageTranslations.getContent();

        Map<String, Object> response = new HashMap<>();
        response.put("translations", translations);
        response.put("currentPage", pageTranslations.getNumber());
        response.put("totalItems", pageTranslations.getTotalElements());
        response.put("totalPages", pageTranslations.getTotalPages());

        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene una traducción específica por su ID
     * 
     * @param id ID de la traducción
     * @return La traducción o 404 si no existe
     */
    @GetMapping("/{id}")
    public ResponseEntity<Translation> getTranslationById(@PathVariable String id) {
        Optional<Translation> translation = translationRepository.findById(id);

        if (translation.isPresent()) {
            Translation result = translation.get();
            // Actualizar stats de acceso
            result.updateAccess();
            translationRepository.save(result);
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Elimina una traducción específica por su ID
     * 
     * @param id ID de la traducción
     * @return 204 No Content si se eliminó correctamente
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTranslation(@PathVariable String id) {
        if (translationRepository.existsById(id)) {
            translationRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

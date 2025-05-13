package io.github.cesarconte.subtitle_translator.controller;

import io.github.cesarconte.subtitle_translator.model.SubtitleBlock;
import io.github.cesarconte.subtitle_translator.model.TranslationRequest;
import io.github.cesarconte.subtitle_translator.model.TranslationResponse;
import io.github.cesarconte.subtitle_translator.model.LanguageDetectionResponse;
import io.github.cesarconte.subtitle_translator.service.TranslationService;
import io.github.cesarconte.subtitle_translator.util.SrtParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

/**
 * REST controller to manage subtitle translations
 */
@RestController
@RequestMapping("/api/translate")
public class TranslationController {

    private static final Logger logger = LoggerFactory.getLogger(TranslationController.class);

    private final TranslationService translationService;
    private final SrtParser srtParser;

    public TranslationController(TranslationService translationService, SrtParser srtParser) {
        this.translationService = translationService;
        this.srtParser = srtParser;
    }

    /**
     * Endpoint to translate subtitle files
     *
     * @param request Translation request data
     * @return Response with translated content
     */
    @PostMapping("/subtitle")
    public ResponseEntity<TranslationResponse> translateSubtitle(@RequestBody TranslationRequest request) {
        try {
            // Validate SRT content
            if (!srtParser.isValid(request.getSrtContent())) {
                return ResponseEntity
                        .badRequest()
                        .body(new TranslationResponse(false, "The file does not have a valid SRT format"));
            }

            // Parse content
            List<SubtitleBlock> subtitles = srtParser.parse(request.getSrtContent());

            // Get source and target languages
            String sourceLang = "auto".equals(request.getSourceLanguage()) ? null : request.getSourceLanguage();
            String targetLang = request.getTargetLanguage();

            // Perform translation
            List<SubtitleBlock> translatedSubtitles = translationService.translateSubtitles(
                    subtitles, targetLang, sourceLang);

            // Generate translated SRT content
            String translatedContent = srtParser.generate(translatedSubtitles);

            // Prepare confidence data for the response
            List<TranslationResponse.SubtitleConfidence> confidenceData = new ArrayList<>();
            double totalConfidence = 0;

            for (SubtitleBlock subtitle : translatedSubtitles) {
                confidenceData.add(new TranslationResponse.SubtitleConfidence(
                        subtitle.getId(),
                        subtitle.getConfidenceScore(),
                        subtitle.getConfidenceLevel()));
                totalConfidence += subtitle.getConfidenceScore();
            }

            // Calculate average confidence
            double averageConfidence = translatedSubtitles.isEmpty() ? 1.0
                    : totalConfidence / translatedSubtitles.size();

            return ResponseEntity.ok(
                    new TranslationResponse(translatedContent, confidenceData, averageConfidence));

        } catch (Exception e) {
            logger.error("Error translating SRT file", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new TranslationResponse(false, "Error translating: " + e.getMessage()));
        }
    }

    /**
     * Endpoint to check the status of the translation service
     *
     * @return Service status
     */
    @GetMapping("/status")
    public ResponseEntity<String> getStatus() {
        return ResponseEntity.ok("Translation service available");
    }

    /**
     * Endpoint to translate a simple text for testing
     *
     * @param text       Text to translate
     * @param targetLang Target language
     * @param sourceLang Source language (optional)
     * @return Translated text
     */
    @GetMapping("/text")
    public ResponseEntity<String> translateText(
            @RequestParam String text,
            @RequestParam String targetLang,
            @RequestParam(required = false) String sourceLang) {

        try {
            String translatedText = translationService.translateText(text, targetLang, sourceLang);
            return ResponseEntity.ok(translatedText);
        } catch (Exception e) {
            logger.error("Error translating text", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error translating: " + e.getMessage());
        }
    }

    /**
     * Endpoint to detect the language of an SRT file
     * 
     * @param request TranslationRequest with srtContent
     * @return Detected language and confidence
     */
    @PostMapping("/detect-language")
    public ResponseEntity<LanguageDetectionResponse> detectLanguage(@RequestBody TranslationRequest request) {
        try {
            String srtContent = request.getSrtContent();
            if (srtContent == null || srtContent.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new LanguageDetectionResponse(false, "No SRT content provided"));
            }
            LanguageDetectionResponse result = translationService.detectLanguage(srtContent);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error detecting language", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new LanguageDetectionResponse(false, "Error detecting language: " + e.getMessage()));
        }
    }
}

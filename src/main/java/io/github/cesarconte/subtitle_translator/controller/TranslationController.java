package io.github.cesarconte.subtitle_translator.controller;

import io.github.cesarconte.subtitle_translator.model.SubtitleBlock;
import io.github.cesarconte.subtitle_translator.model.Translation;
import io.github.cesarconte.subtitle_translator.model.TranslationRequest;
import io.github.cesarconte.subtitle_translator.model.TranslationResponse;
import io.github.cesarconte.subtitle_translator.model.LanguageDetectionResponse;
import io.github.cesarconte.subtitle_translator.model.TranslationProgress;
import io.github.cesarconte.subtitle_translator.model.TranslationSession;
import io.github.cesarconte.subtitle_translator.service.TranslationService;
import io.github.cesarconte.subtitle_translator.service.TranslationStorageService;
import io.github.cesarconte.subtitle_translator.service.ProgressTrackingService;
import io.github.cesarconte.subtitle_translator.util.SrtParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * REST controller to manage subtitle translations
 */
@RestController
@RequestMapping("/api/translate")
public class TranslationController {

    private static final Logger logger = LoggerFactory.getLogger(TranslationController.class);

    private final TranslationService translationService;
    private final SrtParser srtParser;
    private final ProgressTrackingService progressTrackingService;
    private final TranslationStorageService translationStorageService;
    private final ObjectMapper objectMapper;

    public TranslationController(
            TranslationService translationService,
            SrtParser srtParser,
            ProgressTrackingService progressTrackingService,
            TranslationStorageService translationStorageService) {
        this.translationService = translationService;
        this.srtParser = srtParser;
        this.progressTrackingService = progressTrackingService;
        this.translationStorageService = translationStorageService;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Endpoint to initialize a translation session and return a session ID
     *
     * @param request Translation request data
     * @return Response with session ID for progress tracking
     */
    @PostMapping("/init")
    public ResponseEntity<TranslationSession> initTranslation(@RequestBody TranslationRequest request) {
        try {
            // Validate SRT content
            if (!srtParser.isValid(request.getSrtContent())) {
                return ResponseEntity.badRequest().body(null);
            }

            // Calculate total characters for progress tracking
            int totalChars = calculateTotalCharacters(request.getSrtContent());

            // Start progress tracking and get session ID
            String sessionId = progressTrackingService.startTracking(totalChars);

            return ResponseEntity.ok(new TranslationSession(sessionId));
        } catch (Exception e) {
            logger.error("Error initializing translation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Endpoint to check translation progress
     *
     * @param sessionId Translation session ID
     * @return Current progress information
     */
    @GetMapping("/progress/{sessionId}")
    public ResponseEntity<TranslationProgress> getProgress(@PathVariable String sessionId) {
        TranslationProgress progress = progressTrackingService.getProgress(sessionId);
        if (progress == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(progress);
    }

    /**
     * Endpoint to translate subtitle files with progress tracking
     *
     * @param request   Translation request data
     * @param sessionId Translation session ID for progress tracking
     * @return Response with translated content
     */
    @PostMapping("/subtitle/{sessionId}")
    public ResponseEntity<TranslationResponse> translateSubtitle(
            @RequestBody TranslationRequest request,
            @PathVariable String sessionId) {
        try {
            // Validate SRT content
            if (!srtParser.isValid(request.getSrtContent())) {
                progressTrackingService.completeTracking(sessionId, false, "Invalid SRT format");
                return ResponseEntity
                        .badRequest()
                        .body(new TranslationResponse(false, "The file does not have a valid SRT format"));
            }

            // Check if we already have this translation in the database
            Optional<Translation> existingTranslation = translationStorageService.findExistingTranslation(
                    request.getSrtContent(),
                    request.getSourceLanguage(),
                    request.getTargetLanguage());

            if (existingTranslation.isPresent()) {
                logger.info("Found existing translation in database. Returning cached result.");

                // Update progress to 100% immediately since we have the translation
                int totalChars = calculateTotalCharacters(request.getSrtContent());
                progressTrackingService.updateProgress(
                        sessionId, "cached", "Using cached translation...", 0);
                progressTrackingService.updateProgress(
                        sessionId, "cached", "Translation found in database", totalChars);

                Translation translation = existingTranslation.get();
                List<TranslationResponse.SubtitleConfidence> confidenceData = new ArrayList<>();

                try {
                    // Convert JSON string to list of SubtitleConfidence objects
                    if (translation.getConfidenceData() != null && !translation.getConfidenceData().isEmpty()) {
                        confidenceData = objectMapper.readValue(
                                translation.getConfidenceData(),
                                objectMapper.getTypeFactory().constructCollectionType(
                                        List.class,
                                        TranslationResponse.SubtitleConfidence.class));
                    }
                } catch (Exception e) {
                    logger.warn("Error parsing confidence data from database", e);
                    // Continue with empty confidence data if there's an error
                }

                // Mark translation as complete in progress tracking
                progressTrackingService.completeTracking(sessionId, true, "Cached translation retrieved");

                return ResponseEntity.ok(
                        new TranslationResponse(translation.getTranslatedContent(),
                                confidenceData,
                                translation.getAverageConfidence()));
            }

            // Parse content
            List<SubtitleBlock> subtitles = srtParser.parse(request.getSrtContent());

            // Format validation: max 40 characters per line
            List<io.github.cesarconte.subtitle_translator.util.SubtitleFormatValidator.ValidationResult> violations = io.github.cesarconte.subtitle_translator.util.SubtitleFormatValidator
                    .validateLineLength(subtitles, 40);
            String formatWarning = null;
            if (!violations.isEmpty()) {
                StringBuilder warningMsg = new StringBuilder(
                        "Warning: The following lines exceed 40 characters per line:\n");
                for (io.github.cesarconte.subtitle_translator.util.SubtitleFormatValidator.ValidationResult v : violations) {
                    warningMsg.append(String.format("Subtitle #%d, line %d (%d chars): %s\n", v.subtitleId,
                            v.lineNumber, v.length, v.lineContent));
                }
                formatWarning = warningMsg.toString();
                logger.warn(formatWarning);
            }

            // Get source and target languages
            String sourceLang = "auto".equals(request.getSourceLanguage()) ? null : request.getSourceLanguage();
            String targetLang = request.getTargetLanguage();

            // Update progress to preparing phase
            progressTrackingService.updateProgress(
                    sessionId, "preparing", "Preparing content for translation...", 0);

            // Perform translation with progress tracking
            List<SubtitleBlock> translatedSubtitles = translationService.translateSubtitlesWithProgress(
                    subtitles, targetLang, sourceLang, sessionId, progressTrackingService);

            // Update progress to finalizing phase
            int totalChars = progressTrackingService.getProgress(sessionId).getTotalChars();
            progressTrackingService.updateProgress(
                    sessionId, "finalizing", "Finalizing translation...", totalChars);

            // Generate translated SRT content
            String translatedContent = srtParser.generate(translatedSubtitles);

            // If there was a format warning, append it to the translated content (or handle
            // as needed)
            if (formatWarning != null) {
                translatedContent = "WARNING: Some lines exceed 40 characters per line.\n" + formatWarning + "\n"
                        + translatedContent;
            }

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

            // Store translation in database
            String confidenceDataJson;
            try {
                confidenceDataJson = objectMapper.writeValueAsString(confidenceData);
            } catch (Exception e) {
                logger.warn("Error serializing confidence data", e);
                confidenceDataJson = "[]";
            }

            // Calculate confidence level
            String confidenceLevel;
            if (averageConfidence >= 0.8) {
                confidenceLevel = "high";
            } else if (averageConfidence >= 0.5) {
                confidenceLevel = "medium";
            } else {
                confidenceLevel = "low";
            }

            // Save the translation to the database
            translationStorageService.saveTranslation(
                    request.getFileName() != null ? request.getFileName() : "subtitle.srt",
                    request.getSrtContent(),
                    request.getSourceLanguage(),
                    request.getTargetLanguage(),
                    translatedContent,
                    confidenceDataJson,
                    averageConfidence,
                    confidenceLevel);

            // Mark translation as complete in progress tracking
            progressTrackingService.completeTracking(sessionId, true, "Translation completed");

            return ResponseEntity.ok(
                    new TranslationResponse(translatedContent, confidenceData, averageConfidence));

        } catch (Exception e) {
            logger.error("Error translating SRT file", e);
            // Update progress with error
            progressTrackingService.completeTracking(sessionId, false, e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new TranslationResponse(false, "Error translating: " + e.getMessage()));
        }
    }

    /**
     * Calculate total character count from SRT content for progress tracking
     */
    private int calculateTotalCharacters(String srtContent) {
        List<SubtitleBlock> blocks = srtParser.parse(srtContent);
        int totalChars = 0;
        for (SubtitleBlock block : blocks) {
            for (String line : block.getText()) {
                totalChars += line.length();
            }
        }
        return totalChars;
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

    /**
     * Endpoint to list available DeepL glossaries for the configured account
     * 
     * @return List of glossaries (id, name, source_lang, target_lang)
     */
    @GetMapping("/glossaries")
    public ResponseEntity<List<java.util.Map<String, Object>>> listGlossaries() {
        try {
            List<java.util.Map<String, Object>> glossaries = translationService.listAvailableGlossaries();
            return ResponseEntity.ok(glossaries);
        } catch (Exception e) {
            logger.error("Error listing DeepL glossaries", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }
}
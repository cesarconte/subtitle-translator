package io.github.cesarconte.subtitle_translator.service;

import io.github.cesarconte.subtitle_translator.model.SubtitleBlock;
import io.github.cesarconte.subtitle_translator.model.LanguageDetectionResponse;
import io.github.cesarconte.subtitle_translator.model.TranslationRequest;
import io.github.cesarconte.subtitle_translator.config.DeeplProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import com.optimaize.langdetect.LanguageDetector;
import com.optimaize.langdetect.LanguageDetectorBuilder;
import com.optimaize.langdetect.ngram.NgramExtractors;
import com.optimaize.langdetect.profiles.LanguageProfile;
import com.optimaize.langdetect.profiles.LanguageProfileReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service to perform translations using the DeepL API
 */
@Service
public class TranslationService {
    private static final Logger logger = LoggerFactory.getLogger(TranslationService.class);

    private final RestTemplate restTemplate;
    private final DeeplProperties deeplProperties;

    @Value("${deepl.api.key}")
    private String apiKey;

    @Value("${deepl.api.url:https://api-free.deepl.com/v2}")
    private String apiUrl;

    private static final String SUBTITLE_SEPARATOR = "<SUBT_DIV>";
    private static final int GROUP_SIZE = 5; // Reduced group size for better structure preservation

    private static LanguageDetector languageDetector;
    private static List<LanguageProfile> languageProfiles;

    static {
        try {
            languageProfiles = new LanguageProfileReader().readAllBuiltIn();
            languageDetector = LanguageDetectorBuilder.create(NgramExtractors.standard())
                    .withProfiles(languageProfiles)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize language detector", e);
        }
    }

    public TranslationService(DeeplProperties deeplProperties) {
        this.restTemplate = new RestTemplate();
        this.deeplProperties = deeplProperties;
    }

    @jakarta.annotation.PostConstruct
    private void init() {
        // Log para mostrar qué API key se está usando (parcialmente oculta por
        // seguridad)
        if (apiKey != null && apiKey.length() > 8) {
            String firstFour = apiKey.substring(0, 4);
            String lastFour = apiKey.substring(apiKey.length() - 4);
            logger.info("Usando DeepL API key: " + firstFour + "..." + lastFour);
            logger.debug("Configuración de traducción cargada: formality={}, tagHandling={}, preserveFormatting={}",
                    deeplProperties.getTranslation().getFormality(),
                    deeplProperties.getTranslation().isTagHandlingEnabled(),
                    deeplProperties.getTranslation().isPreserveFormatting());
        } else {
            logger.warn("¡ADVERTENCIA! API key de DeepL no encontrada o inválida");
        }
    }

    /**
     * Translates text using the DeepL API with advanced options
     *
     * @param text       Text to translate
     * @param targetLang Target language code
     * @param sourceLang Source language code (null for automatic detection)
     * @param options    Additional translation options (can be null for defaults)
     * @return Translated text
     */
    public String translateText(String text, String targetLang, String sourceLang, TranslationOptions options) {
        if (options == null) {
            options = new TranslationOptions();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("Authorization", "DeepL-Auth-Key " + apiKey);

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("text", text);
        formData.add("target_lang", targetLang);

        // Añadir parámetros opcionales si están disponibles
        if (sourceLang != null && !sourceLang.equals("auto")) {
            formData.add("source_lang", sourceLang);
        }

        // Opciones avanzadas de traducción
        if (options.getFormality() != null && !options.getFormality().equals("default")) {
            formData.add("formality", options.getFormality());
        }

        if (options.isTagHandlingEnabled()) {
            formData.add("tag_handling", "xml");
        }

        if (options.getGlossaryId() != null && !options.getGlossaryId().isEmpty()) {
            formData.add("glossary_id", options.getGlossaryId());
        }

        // Preservar formato
        if (options.isPreserveFormatting()) {
            formData.add("preserve_formatting", "1");
        }

        // Control de división de oraciones
        formData.add("split_sentences", options.isSplitSentences() ? "1" : "0");

        logger.debug("Enviando solicitud a DeepL con opciones avanzadas: {}", options);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formData, headers);
        String url = apiUrl + "/translate";

        // Using raw type with suppressed warnings
        @SuppressWarnings("rawtypes")
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Error from DeepL API: " + response.getStatusCode());
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
        if (responseBody == null) {
            throw new RuntimeException("Empty response from DeepL server");
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> translations = (List<Map<String, Object>>) responseBody.get("translations");

        if (translations == null || translations.isEmpty()) {
            throw new RuntimeException("No translations received");
        }

        return (String) translations.get(0).get("text");
    }

    /**
     * Translates text using the DeepL API with default options
     *
     * @param text       Text to translate
     * @param targetLang Target language code
     * @param sourceLang Source language code (null for automatic detection)
     * @return Translated text
     */
    public String translateText(String text, String targetLang, String sourceLang) {
        TranslationOptions options = new TranslationOptions();
        options.setFormality(deeplProperties.getTranslation().getFormality());
        options.setTagHandlingEnabled(deeplProperties.getTranslation().isTagHandlingEnabled());
        options.setGlossaryId(deeplProperties.getTranslation().getGlossaryId());
        options.setPreserveFormatting(deeplProperties.getTranslation().isPreserveFormatting());
        options.setSplitSentences(deeplProperties.getTranslation().isSplitSentences());

        return translateText(text, targetLang, sourceLang, options);
    }

    /**
     * Translates text using DeepL API with options from a TranslationRequest
     * 
     * @param text    Text to translate
     * @param request The translation request with options
     * @return Translated text
     */
    public String translateText(String text, TranslationRequest request) {
        TranslationOptions options = new TranslationOptions();
        options.setFormality(request.getFormality());
        options.setTagHandlingEnabled(request.isTagHandlingEnabled());
        options.setGlossaryId(request.getGlossaryId());
        options.setPreserveFormatting(request.isPreserveFormatting());

        return translateText(text, request.getTargetLanguage(), request.getSourceLanguage(), options);
    }

    /**
     * Translates a list of subtitle blocks with progress tracking
     * 
     * @param subtitles       List of subtitle blocks
     * @param targetLang      Target language code
     * @param sourceLang      Source language code (can be "auto" for automatic
     *                        detection)
     * @param sessionId       Session ID for progress tracking
     * @param progressService Progress tracking service
     * @return List of translated subtitle blocks with confidence scores
     */
    public List<SubtitleBlock> translateSubtitlesWithProgress(
            List<SubtitleBlock> subtitles,
            String targetLang,
            String sourceLang,
            String sessionId,
            ProgressTrackingService progressService) {
        // Calculate total characters for progress tracking
        int totalChars = 0;
        for (SubtitleBlock subtitle : subtitles) {
            String text = String.join("\n", subtitle.getText());
            totalChars += text.length();
        }

        // Update progress tracking with total characters
        progressService.setTotalChars(sessionId, totalChars);

        progressService.updateProgress(sessionId, "preparing",
                "Preparing content for translation...", 0);

        // Save original texts to calculate confidence later
        List<String> originalTexts = new ArrayList<>();
        for (SubtitleBlock subtitle : subtitles) {
            originalTexts.add(String.join("\n", subtitle.getText()));
        }

        // Group subtitles to minimize API calls
        List<List<SubtitleBlock>> groups = new ArrayList<>();

        for (int i = 0; i < subtitles.size(); i += GROUP_SIZE) {
            groups.add(subtitles.subList(
                    i,
                    Math.min(i + GROUP_SIZE, subtitles.size())));
        }

        // Translate using our improved approach that preserves structure
        List<SubtitleBlock> translatedSubtitles = new ArrayList<>();
        int translatedChars = 0;
        int groupIndex = 0;

        for (List<SubtitleBlock> group : groups) {
            // Update progress tracker
            int groupTotalChars = 0;
            for (SubtitleBlock subtitle : group) {
                groupTotalChars += String.join("\n", subtitle.getText()).length();
            }

            progressService.updateProgress(sessionId,
                    "translating",
                    String.format("Translating block %d of %d...", groupIndex + 1,
                            groups.size()),
                    translatedChars);

            // Prepare text with special markers for structure preservation
            StringBuilder textWithMarkers = new StringBuilder();

            for (int i = 0; i < group.size(); i++) {
                SubtitleBlock subtitle = group.get(i);

                // Add subtitle identifier marker with ID
                textWithMarkers.append("<SUBT:").append(subtitle.getId()).append(">\n");

                // Add lines with markers to identify each line position
                String[] lines = subtitle.getText();
                for (int lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    textWithMarkers.append("<LINE:").append(lineIndex + 1).append(">")
                            .append(lines[lineIndex])
                            .append("</LINE:").append(lineIndex + 1).append(">\n");
                }

                // Close subtitle marker
                textWithMarkers.append("</SUBT:").append(subtitle.getId()).append(">");

                // Add separator between subtitles, except the last one
                if (i < group.size() - 1) {
                    textWithMarkers.append("\n").append(SUBTITLE_SEPARATOR).append("\n");
                }
            }

            // Translate the marked text
            String translatedMarkedText = translateText(textWithMarkers.toString(),
                    targetLang, sourceLang);
            try {
                Thread.sleep(1000); // Añadimos pausa para evitar error 429
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            processTranslatedMarkedText(translatedMarkedText, group, translatedSubtitles,
                    originalTexts);

            // Update translated character count for progress
            translatedChars += groupTotalChars;
            groupIndex++;
        }

        // Sort subtitles by ID to maintain original order
        translatedSubtitles.sort((a, b) -> Integer.compare(a.getId(), b.getId()));

        // Final progress update
        progressService.updateProgress(sessionId, "finalizing", "Finalizing translation...", totalChars);

        return translatedSubtitles;
    }

    /**
     * Translates a list of subtitle blocks
     *
     * @param subtitles  List of subtitle blocks
     * @param targetLang Target language code
     * @param sourceLang Source language code (can be "auto" for automatic
     *                   detection)
     * @return List of translated subtitle blocks with confidence scores
     */
    public List<SubtitleBlock> translateSubtitles(List<SubtitleBlock> subtitles, String targetLang, String sourceLang) {
        // Mejorado: Preservar mejor la estructura del texto usando marcadores
        // especiales para cada línea

        // Group subtitles to minimize API calls
        List<List<SubtitleBlock>> groups = new ArrayList<>();
        for (int i = 0; i < subtitles.size(); i += GROUP_SIZE) {
            groups.add(subtitles.subList(
                    i,
                    Math.min(i + GROUP_SIZE, subtitles.size())));
        }

        // Save original texts to calculate confidence later
        List<String> originalTexts = new ArrayList<>();
        for (SubtitleBlock subtitle : subtitles) {
            originalTexts.add(String.join("\n", subtitle.getText()));
        }

        // Translate each group with structure preservation
        List<SubtitleBlock> translatedSubtitles = new ArrayList<>();

        for (List<SubtitleBlock> group : groups) {
            // Prepare text with special markers for structure preservation
            StringBuilder textWithMarkers = new StringBuilder();

            for (int i = 0; i < group.size(); i++) {
                SubtitleBlock subtitle = group.get(i);

                // Add subtitle identifier marker with ID
                textWithMarkers.append("<SUBT:").append(subtitle.getId()).append(">\n");

                // Add lines with markers to identify each line position
                String[] lines = subtitle.getText();
                for (int lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    textWithMarkers.append("<LINE:").append(lineIndex + 1).append(">")
                            .append(lines[lineIndex])
                            .append("</LINE:").append(lineIndex + 1).append(">\n");
                }

                // Close subtitle marker
                textWithMarkers.append("</SUBT:").append(subtitle.getId()).append(">");

                // Add separator between subtitles, except the last one
                if (i < group.size() - 1) {
                    textWithMarkers.append("\n").append(SUBTITLE_SEPARATOR).append("\n");
                }
            }

            // Translate the marked text
            String translatedMarkedText = translateText(textWithMarkers.toString(), targetLang, sourceLang);
            try {
                Thread.sleep(1000); // Añadimos pausa para evitar error 429
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            processTranslatedMarkedText(translatedMarkedText, group, translatedSubtitles, originalTexts);
        }

        // Sort subtitles by ID to maintain original order
        translatedSubtitles.sort((a, b) -> Integer.compare(a.getId(), b.getId()));

        return translatedSubtitles;
    }

    /**
     * Process translated text with markers and extract structured subtitles
     *
     * @param translatedText      The translated text with structure markers
     * @param originalGroup       The original subtitle blocks for reference
     * @param translatedSubtitles List to add the translated subtitles to
     * @param originalTexts       List of original texts for confidence calculation
     */
    private void processTranslatedMarkedText(String translatedText, List<SubtitleBlock> originalGroup,
            List<SubtitleBlock> translatedSubtitles, List<String> originalTexts) {
        // Separate by subtitle markers
        String[] subtitleBlocks = translatedText.split(SUBTITLE_SEPARATOR);
        for (String block : subtitleBlocks) {
            // Extract subtitle ID
            java.util.regex.Pattern idPattern = java.util.regex.Pattern.compile("<SUBT:(\\d+)>");
            java.util.regex.Matcher idMatcher = idPattern.matcher(block);
            if (idMatcher.find()) {
                int id = Integer.parseInt(idMatcher.group(1));
                // Find original subtitle for this ID
                SubtitleBlock originalSubtitle = originalGroup.stream()
                        .filter(s -> s.getId() == id)
                        .findFirst()
                        .orElse(null);
                if (originalSubtitle != null) {
                    // Extract lines with markers
                    java.util.regex.Pattern linePattern = java.util.regex.Pattern
                            .compile("<LINE:\\d+>(.*?)</LINE:\\d+>");
                    java.util.regex.Matcher lineMatcher = linePattern.matcher(block);
                    List<String> translatedLines = new ArrayList<>();
                    while (lineMatcher.find()) {
                        // Restore any protected tags in the translated text
                        String translatedLine = restoreProtectedTags(lineMatcher.group(1).trim());
                        translatedLines.add(translatedLine);
                    }
                    // If no lines were found with markers, extract text between SUBT tags
                    if (translatedLines.isEmpty()) {
                        String extractedText = block.replaceAll("<SUBT:\\d+>\\s*", "")
                                .replaceAll("\\s*</SUBT:\\d+>", "")
                                .trim();
                        if (!extractedText.isEmpty()) {
                            translatedLines = List.of(extractedText.split("\n"));
                        } else {
                            // Fallback to original structure but with empty text
                            translatedLines = new ArrayList<>();
                            for (int i = 0; i < originalSubtitle.getText().length; i++) {
                                translatedLines.add("");
                            }
                        }
                    }
                    // Convert list to array
                    String[] translatedLineArray = translatedLines.toArray(new String[0]);
                    // Find the original text for confidence calculation
                    int originalIndex = -1;
                    for (int i = 0; i < originalGroup.size(); i++) {
                        if (originalGroup.get(i).getId() == id) {
                            originalIndex = i;
                            break;
                        }
                    }
                    String originalText = originalIndex >= 0 ? originalTexts.get(originalIndex)
                            : String.join("\n", originalSubtitle.getText());
                    String joinedTranslatedText = String.join("\n", translatedLines);
                    // Calculate confidence
                    double confidenceScore = ConfidenceCalculator.calculateConfidence(originalText,
                            joinedTranslatedText);
                    // Create translated subtitle block with original time code
                    SubtitleBlock translatedSubtitle = new SubtitleBlock(
                            id,
                            originalSubtitle.getTimeCode(),
                            translatedLineArray,
                            confidenceScore);
                    translatedSubtitles.add(translatedSubtitle);
                }
            }
        }
    }

    /**
     * Restores original tags in the translated text
     *
     * @param text Translated text with protected tags
     * @return Text with original tags restored
     */

    private String restoreProtectedTags(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        // Pattern to find protected tags
        Pattern protectedPattern = Pattern.compile("<x id=\"\\d+\">([^<]+)</x>");
        // If no protected tags, return text unchanged
        if (!protectedPattern.matcher(text).find()) {
            return text;
        }
        Matcher matcher = protectedPattern.matcher(text);
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            String originalTag = matcher.group(1);
            matcher.appendReplacement(sb, Matcher.quoteReplacement(originalTag));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    /**
     * Detects the language of the provided SRT content
     * 
     * @param srtContent SRT file content
     * @return LanguageDetectionResponse with detected language and confidence
     */
    public LanguageDetectionResponse detectLanguage(String srtContent) {
        // Remove timecodes and SRT numbers, leave only text
        String text = srtContent.replaceAll("(?m)^\\d+$", "")
                .replaceAll("(?m)^\\d{2}:\\d{2}:\\d{2},\\d{3} --> \\d{2}:\\d{2}:\\d{2},\\d{3}$", "")
                .replaceAll("[\r\n]+", " ").trim();
        Optional<com.optimaize.langdetect.DetectedLanguage> best = languageDetector.getProbabilities(text).stream()
                .findFirst();
        if (best.isPresent()) {
            com.optimaize.langdetect.DetectedLanguage detected = best.get();
            String lang = detected.getLocale().getLanguage();
            double confidence = detected.getProbability();
            return new LanguageDetectionResponse(true, lang, confidence);
        } else {
            return new LanguageDetectionResponse(false, "Could not detect language");
        }
    }

    /**
     * Fetches available DeepL glossaries for the configured account
     * 
     * @return List of glossaries (each as a Map with id, name, source_lang,
     *         target_lang)
     */
    public List<Map<String, Object>> listAvailableGlossaries() {
        String url = apiUrl + "/glossaries";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "DeepL-Auth-Key " + apiKey);
        HttpEntity<Void> request = new HttpEntity<>(headers);
        try {
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Error from DeepL API: " + response.getStatusCode());
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
            if (responseBody == null || !responseBody.containsKey("glossaries")) {
                return List.of();
            }
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> glossaries = (List<Map<String, Object>>) responseBody.get("glossaries");
            return glossaries;
        } catch (Exception e) {
            logger.error("Error fetching DeepL glossaries", e);
            return List.of();
        }
    }
}
package io.github.cesarconte.subtitle_translator.service;

import io.github.cesarconte.subtitle_translator.model.SubtitleBlock;
import io.github.cesarconte.subtitle_translator.model.LanguageDetectionResponse;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service to perform translations using the DeepL API
 */
@Service
public class TranslationService {

    private final RestTemplate restTemplate;

    @Value("${deepl.api.key}")
    private String apiKey;

    @Value("${deepl.api.url:https://api-free.deepl.com/v2}")
    private String apiUrl;

    private static final String SUBTITLE_SEPARATOR = "<SUBT_DIV>";
    private static final int GROUP_SIZE = 10; // Reduced group size for more frequent progress updates

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

    public TranslationService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Translates text using the DeepL API
     *
     * @param text       Text to translate
     * @param targetLang Target language code
     * @param sourceLang Source language code (null for automatic detection)
     * @return Translated text
     */
    public String translateText(String text, String targetLang, String sourceLang) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("Authorization", "DeepL-Auth-Key " + apiKey);

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("text", text);
        formData.add("target_lang", targetLang);

        if (sourceLang != null && !sourceLang.equals("auto")) {
            formData.add("source_lang", sourceLang);
        }

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
        // Extract all subtitle texts and calculate total characters
        List<String> textsToTranslate = new ArrayList<>();
        int totalChars = 0;

        for (SubtitleBlock subtitle : subtitles) {
            String text = String.join("\n", subtitle.getText());
            textsToTranslate.add(text);
            totalChars += text.length();
        }

        // Update progress tracking with total characters
        progressService.updateProgress(sessionId, "preparing",
                "Preparing content for translation...", 0);

        // Save original texts to calculate confidence later
        List<String> originalTexts = new ArrayList<>(textsToTranslate);

        // Group texts to minimize the number of API calls but still provide regular
        // updates
        List<List<String>> groups = new ArrayList<>();
        for (int i = 0; i < textsToTranslate.size(); i += GROUP_SIZE) {
            groups.add(textsToTranslate.subList(
                    i,
                    Math.min(i + GROUP_SIZE, textsToTranslate.size())));
        }

        // Translate each group with progress updates
        List<String> allTranslatedTexts = new ArrayList<>();
        int translatedChars = 0;
        int groupIndex = 0;

        for (List<String> group : groups) {
            // Update progress tracker
            int groupTotalChars = group.stream().mapToInt(String::length).sum();

            progressService.updateProgress(sessionId, "translating",
                    String.format("Translating block %d of %d...", groupIndex + 1, groups.size()),
                    translatedChars);

            // Translate the group
            String text = String.join(SUBTITLE_SEPARATOR, group);
            String translatedText = translateText(text, targetLang, sourceLang);
            String[] translatedTextsInGroup = translatedText.split(SUBTITLE_SEPARATOR);

            // Process responses
            for (String translated : translatedTextsInGroup) {
                allTranslatedTexts.add(translated);
            }

            // Update translated character count for progress
            translatedChars += groupTotalChars;
            groupIndex++;
        }

        // Create new subtitles with translated text and calculate confidence
        List<SubtitleBlock> translatedSubtitles = new ArrayList<>();
        for (int i = 0; i < subtitles.size(); i++) {
            SubtitleBlock original = subtitles.get(i);
            String translatedText = i < allTranslatedTexts.size() ? allTranslatedTexts.get(i) : "";

            // Calculate confidence score
            String originalText = i < originalTexts.size() ? originalTexts.get(i) : "";
            double confidenceScore = ConfidenceCalculator.calculateConfidence(originalText, translatedText);

            // Create subtitle block with confidence score
            SubtitleBlock translated = new SubtitleBlock(
                    original.getId(),
                    original.getTimeCode(),
                    translatedText.trim().split("\n"),
                    confidenceScore);

            translatedSubtitles.add(translated);
        }

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
        // Extract all subtitle texts into a list
        List<String> textsToTranslate = new ArrayList<>();
        for (SubtitleBlock subtitle : subtitles) {
            textsToTranslate.add(String.join("\n", subtitle.getText()));
        }

        // Save original texts to calculate confidence later
        List<String> originalTexts = new ArrayList<>(textsToTranslate);

        // Group texts to minimize the number of API calls
        List<List<String>> groups = new ArrayList<>();
        for (int i = 0; i < textsToTranslate.size(); i += GROUP_SIZE) {
            groups.add(textsToTranslate.subList(
                    i,
                    Math.min(i + GROUP_SIZE, textsToTranslate.size())));
        }

        // Translate each group
        List<String> translatedGroups = new ArrayList<>();
        for (List<String> group : groups) {
            String text = String.join(SUBTITLE_SEPARATOR, group);
            String translatedText = translateText(text, targetLang, sourceLang);
            translatedGroups.add(translatedText);
        }

        // Process responses and reconstruct subtitles
        List<String> allTranslatedTexts = new ArrayList<>();
        for (String translatedGroup : translatedGroups) {
            String[] translatedTextsInGroup = translatedGroup.split(SUBTITLE_SEPARATOR);
            for (String translatedText : translatedTextsInGroup) {
                allTranslatedTexts.add(translatedText);
            }
        }

        // Create new subtitles with translated text and calculate confidence
        List<SubtitleBlock> translatedSubtitles = new ArrayList<>();
        for (int i = 0; i < subtitles.size(); i++) {
            SubtitleBlock original = subtitles.get(i);
            String translatedText = i < allTranslatedTexts.size() ? allTranslatedTexts.get(i) : "";

            // Calculate confidence score
            String originalText = i < originalTexts.size() ? originalTexts.get(i) : "";
            double confidenceScore = ConfidenceCalculator.calculateConfidence(originalText, translatedText);

            // Create subtitle block with confidence score
            SubtitleBlock translated = new SubtitleBlock(
                    original.getId(),
                    original.getTimeCode(),
                    translatedText.trim().split("\n"),
                    confidenceScore);

            translatedSubtitles.add(translated);
        }

        return translatedSubtitles;
    }

    /**
     * Detects the language of the given SRT content
     * 
     * @param srtContent SRT file content
     * @return LanguageDetectionResponse with detected language and confidence
     */
    public LanguageDetectionResponse detectLanguage(String srtContent) {
        // Remove SRT timecodes and numbers, keep only text
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
}

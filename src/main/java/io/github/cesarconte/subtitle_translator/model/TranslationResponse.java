package io.github.cesarconte.subtitle_translator.model;

import java.util.Collections;
import java.util.List;

/**
 * DTO for subtitle translation response
 */
public class TranslationResponse {
    private String translatedContent;
    private boolean success;
    private String message;
    private double averageConfidence; // Average confidence of the translation
    private List<SubtitleConfidence> confidenceData; // Confidence data per subtitle

    /**
     * Inner class to represent translation confidence per subtitle
     */
    public static class SubtitleConfidence {
        private int id;
        private double confidence;
        private String level; // "high", "medium", "low"

        public SubtitleConfidence() {
        }

        public SubtitleConfidence(int id, double confidence, String level) {
            this.id = id;
            this.confidence = confidence;
            this.level = level;
        }

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public double getConfidence() {
            return confidence;
        }

        public void setConfidence(double confidence) {
            this.confidence = confidence;
        }

        public String getLevel() {
            return level;
        }

        public void setLevel(String level) {
            this.level = level;
        }
    }

    /**
     * Default constructor
     */
    public TranslationResponse() {
        this.confidenceData = Collections.emptyList();
    }

    /**
     * Constructor for successful response
     * 
     * @param translatedContent Translated content
     */
    public TranslationResponse(String translatedContent) {
        this.translatedContent = translatedContent;
        this.success = true;
        this.message = "Translation completed successfully";
        this.confidenceData = Collections.emptyList();
        this.averageConfidence = 1.0;
    }

    /**
     * Constructor for successful response with confidence data
     * 
     * @param translatedContent Translated content
     * @param confidenceData    Confidence data per subtitle
     * @param averageConfidence Average confidence
     */
    public TranslationResponse(String translatedContent, List<SubtitleConfidence> confidenceData,
            double averageConfidence) {
        this.translatedContent = translatedContent;
        this.success = true;
        this.message = "Translation completed successfully";
        this.confidenceData = confidenceData;
        this.averageConfidence = averageConfidence;
    }

    /**
     * Constructor for error response
     * 
     * @param errorMessage Error message
     */
    public TranslationResponse(boolean success, String errorMessage) {
        this.success = success;
        this.message = errorMessage;
        this.translatedContent = "";
    }

    // Getters and Setters
    public String getTranslatedContent() {
        return translatedContent;
    }

    public void setTranslatedContent(String translatedContent) {
        this.translatedContent = translatedContent;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public double getAverageConfidence() {
        return averageConfidence;
    }

    public void setAverageConfidence(double averageConfidence) {
        this.averageConfidence = averageConfidence;
    }

    public List<SubtitleConfidence> getConfidenceData() {
        return confidenceData;
    }

    public void setConfidenceData(List<SubtitleConfidence> confidenceData) {
        this.confidenceData = confidenceData;
    }

    /**
     * Gets the average confidence level as a category
     * 
     * @return Confidence category: "high", "medium" or "low"
     */
    public String getAverageConfidenceLevel() {
        if (averageConfidence >= 0.8) {
            return "high";
        } else if (averageConfidence >= 0.5) {
            return "medium";
        } else {
            return "low";
        }
    }
}

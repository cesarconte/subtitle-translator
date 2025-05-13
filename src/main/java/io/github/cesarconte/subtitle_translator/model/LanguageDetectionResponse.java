package io.github.cesarconte.subtitle_translator.model;

/**
 * DTO for language detection response
 */
public class LanguageDetectionResponse {
    private boolean success;
    private String language;
    private double confidence;
    private String message;

    public LanguageDetectionResponse() {
    }

    public LanguageDetectionResponse(boolean success, String language, double confidence) {
        this.success = success;
        this.language = language;
        this.confidence = confidence;
        this.message = null;
    }

    public LanguageDetectionResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.language = null;
        this.confidence = 0.0;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

package io.github.cesarconte.subtitle_translator.model;

/**
 * DTO for subtitle translation request
 */
public class TranslationRequest {
    private String srtContent;
    private String sourceLanguage;
    private String targetLanguage;

    /**
     * Default constructor
     */
    public TranslationRequest() {
    }

    /**
     * Constructor with all fields
     *
     * @param srtContent     SRT file content
     * @param sourceLanguage Source language code (or "auto" for automatic
     *                       detection)
     * @param targetLanguage Target language code
     */
    public TranslationRequest(String srtContent, String sourceLanguage, String targetLanguage) {
        this.srtContent = srtContent;
        this.sourceLanguage = sourceLanguage;
        this.targetLanguage = targetLanguage;
    }

    // Getters and Setters
    /**
     * Gets the SRT file content
     * @return SRT file content as a String
     */
    public String getSrtContent() {
        return srtContent;
    }

    
    public void setSrtContent(String srtContent) {
        this.srtContent = srtContent;
    }

    public String getSourceLanguage() {
        return sourceLanguage;
    }

    public void setSourceLanguage(String sourceLanguage) {
        this.sourceLanguage = sourceLanguage;
    }

    public String getTargetLanguage() {
        return targetLanguage;
    }

    public void setTargetLanguage(String targetLanguage) {
        this.targetLanguage = targetLanguage;
    }
}

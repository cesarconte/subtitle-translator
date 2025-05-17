package io.github.cesarconte.subtitle_translator.model;

/**
 * DTO for subtitle translation request
 */
public class TranslationRequest {
    private String srtContent;
    private String sourceLanguage;
    private String targetLanguage;
    private String fileName;
    // Nuevos campos para las opciones avanzadas de DeepL
    private String formality = "default"; // default, more, less
    private boolean tagHandlingEnabled = true;
    private String glossaryId;
    private boolean preserveFormatting = true;

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
     * @param fileName       Original file name
     */
    public TranslationRequest(String srtContent, String sourceLanguage, String targetLanguage, String fileName) {
        this.srtContent = srtContent;
        this.sourceLanguage = sourceLanguage;
        this.targetLanguage = targetLanguage;
        this.fileName = fileName;
    }

    // Getters and Setters
    /**
     * Gets the SRT file content
     * 
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

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFormality() {
        return formality;
    }

    public void setFormality(String formality) {
        this.formality = formality;
    }

    public boolean isTagHandlingEnabled() {
        return tagHandlingEnabled;
    }

    public void setTagHandlingEnabled(boolean tagHandlingEnabled) {
        this.tagHandlingEnabled = tagHandlingEnabled;
    }

    public String getGlossaryId() {
        return glossaryId;
    }

    public void setGlossaryId(String glossaryId) {
        this.glossaryId = glossaryId;
    }

    public boolean isPreserveFormatting() {
        return preserveFormatting;
    }

    public void setPreserveFormatting(boolean preserveFormatting) {
        this.preserveFormatting = preserveFormatting;
    }
}

package io.github.cesarconte.subtitle_translator.service;

/**
 * Opciones avanzadas para las traducciones de DeepL
 */
public class TranslationOptions {

    private String formality = "default"; // default, more, less, prefer_more, prefer_less
    private boolean tagHandlingEnabled = true;
    private String glossaryId;
    private boolean preserveFormatting = true;
    private boolean splitSentences = true;

    /**
     * Constructor con valores predeterminados
     */
    public TranslationOptions() {
    }

    /**
     * Constructor con opciones específicas
     * 
     * @param formality          Nivel de formalidad a usar
     * @param tagHandlingEnabled Si debe habilitarse el manejo de etiquetas XML
     * @param glossaryId         ID del glosario a utilizar
     * @param preserveFormatting Si debe preservarse el formato
     * @param splitSentences     Si deben dividirse las oraciones
     */
    public TranslationOptions(String formality, boolean tagHandlingEnabled, String glossaryId,
            boolean preserveFormatting, boolean splitSentences) {
        this.formality = formality;
        this.tagHandlingEnabled = tagHandlingEnabled;
        this.glossaryId = glossaryId;
        this.preserveFormatting = preserveFormatting;
        this.splitSentences = splitSentences;
    }

    // Getters y setters

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

    public boolean isSplitSentences() {
        return splitSentences;
    }

    public void setSplitSentences(boolean splitSentences) {
        this.splitSentences = splitSentences;
    }

    @Override
    public String toString() {
        return "TranslationOptions{" +
                "formality='" + formality + '\'' +
                ", tagHandlingEnabled=" + tagHandlingEnabled +
                ", glossaryId='" + glossaryId + '\'' +
                ", preserveFormatting=" + preserveFormatting +
                ", splitSentences=" + splitSentences +
                '}';
    }
}

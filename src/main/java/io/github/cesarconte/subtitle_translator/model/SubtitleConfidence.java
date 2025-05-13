package io.github.cesarconte.subtitle_translator.model;

/**
 * Clase que representa la confianza de traducción de un bloque de subtítulos
 */
public class SubtitleConfidence {
    private final int id;
    private final double confidenceScore;
    private final String confidenceLevel;

    public SubtitleConfidence(int id, double confidenceScore, String confidenceLevel) {
        this.id = id;
        this.confidenceScore = confidenceScore;
        this.confidenceLevel = confidenceLevel;
    }

    public int getId() {
        return id;
    }

    public double getConfidenceScore() {
        return confidenceScore;
    }

    public String getConfidenceLevel() {
        return confidenceLevel;
    }
}

package io.github.cesarconte.subtitle_translator.model;

/**
 * Model for translation progress information
 */
public class TranslationProgress {
    private String phase;
    private String message;
    private int totalChars;
    private int translatedChars;
    private double progress;
    private long estimatedTotalTimeMs;
    private long remainingTimeMs;

    // Default constructor needed for JSON serialization
    public TranslationProgress() {
    }

    public TranslationProgress(String phase, String message, int totalChars, int translatedChars, double progress) {
        this.phase = phase;
        this.message = message;
        this.totalChars = totalChars;
        this.translatedChars = translatedChars;
        this.progress = progress;
    }

    /**
     * Creates a progress object with time estimates
     */
    public TranslationProgress(String phase, String message, int totalChars, int translatedChars,
            double progress, long estimatedTotalTimeMs, long remainingTimeMs) {
        this(phase, message, totalChars, translatedChars, progress);
        this.estimatedTotalTimeMs = estimatedTotalTimeMs;
        this.remainingTimeMs = remainingTimeMs;
    }

    // Static factory methods for common progress states

    public static TranslationProgress starting(int totalChars) {
        return new TranslationProgress("starting", "Starting translation...", totalChars, 0, 0);
    }

    public static TranslationProgress preparing(int totalChars) {
        return new TranslationProgress("preparing", "Preparing content for translation...", totalChars, 0, 5);
    }

    public static TranslationProgress translating(int totalChars, int translatedChars, double progress,
            long estimatedTotalTimeMs, long remainingTimeMs) {
        return new TranslationProgress("translating", "Translating content...",
                totalChars, translatedChars, progress, estimatedTotalTimeMs, remainingTimeMs);
    }

    public static TranslationProgress finalizing(int totalChars) {
        return new TranslationProgress("finalizing", "Finalizing translation...", totalChars, totalChars, 95);
    }

    public static TranslationProgress completed(int totalChars) {
        return new TranslationProgress("completed", "Translation completed!", totalChars, totalChars, 100);
    }

    public static TranslationProgress error(String errorMessage) {
        return new TranslationProgress("error", "Error: " + errorMessage, 0, 0, 0);
    }

    // Getters and setters

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getTotalChars() {
        return totalChars;
    }

    public void setTotalChars(int totalChars) {
        this.totalChars = totalChars;
    }

    public int getTranslatedChars() {
        return translatedChars;
    }

    public void setTranslatedChars(int translatedChars) {
        this.translatedChars = translatedChars;
    }

    public double getProgress() {
        return progress;
    }

    public void setProgress(double progress) {
        this.progress = progress;
    }

    public long getEstimatedTotalTimeMs() {
        return estimatedTotalTimeMs;
    }

    public void setEstimatedTotalTimeMs(long estimatedTotalTimeMs) {
        this.estimatedTotalTimeMs = estimatedTotalTimeMs;
    }

    public long getRemainingTimeMs() {
        return remainingTimeMs;
    }

    public void setRemainingTimeMs(long remainingTimeMs) {
        this.remainingTimeMs = remainingTimeMs;
    }
}

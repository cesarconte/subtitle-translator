package io.github.cesarconte.subtitle_translator.model;

/**
 * Model representing a subtitle block
 */
public class SubtitleBlock {
    private int id;
    private String timeCode;
    private String[] text;
    private double confidenceScore; // Translation confidence score (0.0 - 1.0)

    /**
     * Default constructor
     */
    public SubtitleBlock() {
        this.confidenceScore = 1.0; // Default: maximum confidence
    }

    /**
     * Constructor with all fields
     *
     * @param id       Block identification number
     * @param timeCode Subtitle time code (format: "00:01:23,456 --> 00:01:26,789")
     * @param text     Subtitle text lines
     */
    public SubtitleBlock(int id, String timeCode, String[] text) {
        this.id = id;
        this.timeCode = timeCode;
        this.text = text;
        this.confidenceScore = 1.0; // Default: maximum confidence
    }

    /**
     * Constructor with custom confidence
     *
     * @param id              Block identification number
     * @param timeCode        Subtitle time code
     * @param text            Subtitle text lines
     * @param confidenceScore Translation confidence score (0.0 - 1.0)
     */
    public SubtitleBlock(int id, String timeCode, String[] text, double confidenceScore) {
        this.id = id;
        this.timeCode = timeCode;
        this.text = text;
        this.confidenceScore = confidenceScore;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTimeCode() {
        return timeCode;
    }

    public void setTimeCode(String timeCode) {
        this.timeCode = timeCode;
    }

    public String[] getText() {
        return text;
    }

    public void setText(String[] text) {
        this.text = text;
    }

    public double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    /**
     * Gets the confidence level as a category
     *
     * @return Confidence category: "high", "medium" or "low"
     */
    public String getConfidenceLevel() {
        if (confidenceScore >= 0.8) {
            return "high";
        } else if (confidenceScore >= 0.5) {
            return "medium";
        } else {
            return "low";
        }
    }
}

package io.github.cesarconte.subtitle_translator.model;

/**
 * Model for a translation session
 */
public class TranslationSession {
    private String sessionId;

    public TranslationSession() {
    }

    public TranslationSession(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}

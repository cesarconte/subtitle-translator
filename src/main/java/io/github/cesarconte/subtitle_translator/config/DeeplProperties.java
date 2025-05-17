package io.github.cesarconte.subtitle_translator.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Property configuration for the DeepL API
 */
@Configuration
@ConfigurationProperties(prefix = "deepl")
public class DeeplProperties {

    // Field names structured to match property names in application.properties
    // deepl.api.key -> api.key
    private Api api = new Api();
    private Confidence confidence = new Confidence();
    private Translation translation = new Translation();

    // Nested properties class for "api" properties (deepl.api.*)
    public static class Api {
        private String key;
        private String url;

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }

    // Nested properties class for "confidence" properties
    public static class Confidence {
        private boolean enabled;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
    }

    // Nested class for translation-specific properties
    public static class Translation {
        private boolean tagHandlingEnabled = true;
        private String formality = "default"; // default, more, less, prefer_more, prefer_less
        private String glossaryId;
        private boolean splitSentences = true;
        private boolean preserveFormatting = true;

        public boolean isTagHandlingEnabled() {
            return tagHandlingEnabled;
        }

        public void setTagHandlingEnabled(boolean tagHandlingEnabled) {
            this.tagHandlingEnabled = tagHandlingEnabled;
        }

        public String getFormality() {
            return formality;
        }

        public void setFormality(String formality) {
            this.formality = formality;
        }

        public String getGlossaryId() {
            return glossaryId;
        }

        public void setGlossaryId(String glossaryId) {
            this.glossaryId = glossaryId;
        }

        public boolean isSplitSentences() {
            return splitSentences;
        }

        public void setSplitSentences(boolean splitSentences) {
            this.splitSentences = splitSentences;
        }

        public boolean isPreserveFormatting() {
            return preserveFormatting;
        }

        public void setPreserveFormatting(boolean preserveFormatting) {
            this.preserveFormatting = preserveFormatting;
        }
    }

    // Getters and setters
    public Api getApi() {
        return api;
    }

    public void setApi(Api api) {
        this.api = api;
    }

    public Confidence getConfidence() {
        return confidence;
    }

    public void setConfidence(Confidence confidence) {
        this.confidence = confidence;
    }

    public Translation getTranslation() {
        return translation;
    }

    public void setTranslation(Translation translation) {
        this.translation = translation;
    }
}

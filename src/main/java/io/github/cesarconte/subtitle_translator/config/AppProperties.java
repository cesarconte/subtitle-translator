package io.github.cesarconte.subtitle_translator.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Property configuration for the application
 */
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String version;

    // Getters and setters
    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}

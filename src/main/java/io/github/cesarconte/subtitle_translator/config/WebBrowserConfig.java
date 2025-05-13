package io.github.cesarconte.subtitle_translator.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

import java.awt.Desktop;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Configuration to automatically open the browser
 * when the application is ready
 */
@Configuration
public class WebBrowserConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    /**
     * Method that runs when the application is ready
     * and automatically opens the browser
     */
    @EventListener(ApplicationReadyEvent.class)
    public void openBrowserWhenReady() {
        String url = "http://localhost:" + serverPort;

        try {
            // Detect the operating system
            String os = System.getProperty("os.name").toLowerCase();

            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                // Cross-platform method that should work in most cases
                Desktop.getDesktop().browse(new URI(url));
            } else if (os.contains("linux")) {
                // Linux-specific alternative
                new ProcessBuilder("xdg-open", url).start();
            } else if (os.contains("mac")) {
                Runtime.getRuntime().exec(new String[] { "open", url });
            } else if (os.contains("windows")) {
                Runtime.getRuntime().exec(new String[] { "rundll32", "url.dll,FileProtocolHandler", url });
            } else {
                System.out.println("Could not open browser automatically.");
                System.out.println("Please open manually: " + url);
            }

            System.out.println("Application is available at: " + url);
        } catch (IOException | URISyntaxException e) {
            System.err.println("Error trying to open browser: " + e.getMessage());
        }
    }
}

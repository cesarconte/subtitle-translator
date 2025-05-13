package io.github.cesarconte.subtitle_translator.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import io.github.cesarconte.subtitle_translator.model.TranslationResponse;

import java.net.ConnectException;

/**
 * Global exception handler for the API
 */
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    /**
     * Handles connection errors with the external API
     */
    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<TranslationResponse> handleConnectionException(ResourceAccessException ex) {
        String errorMessage = "Could not connect to the translation service. Please try again later.";

        if (ex.getCause() instanceof ConnectException) {
            errorMessage = "Connection error with the translation service. Please check your internet connection.";
        }

        TranslationResponse response = new TranslationResponse(false, errorMessage);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    /**
     * Handles HTTP client errors when communicating with the external API
     */
    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<TranslationResponse> handleHttpClientError(HttpClientErrorException ex) {
        String errorMessage = "Error in the translation service: ";

        switch (ex.getStatusCode().value()) {
            case 401:
                errorMessage += "Invalid API key";
                break;
            case 403:
                errorMessage += "Access denied";
                break;
            case 429:
                errorMessage += "Usage limit exceeded. Please try again later";
                break;
            default:
                errorMessage += ex.getStatusText();
        }

        TranslationResponse response = new TranslationResponse(false, errorMessage);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(response);
    }

    /**
     * Handles generic exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<TranslationResponse> handleGenericException(Exception ex) {
        TranslationResponse response = new TranslationResponse(false, "Server error: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}

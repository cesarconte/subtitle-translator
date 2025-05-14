package io.github.cesarconte.subtitle_translator.service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import io.github.cesarconte.subtitle_translator.model.TranslationProgress;
import org.springframework.stereotype.Service;

/**
 * Service for tracking translation progress
 */
@Service
public class ProgressTrackingService {

    // Store translation progress by session ID
    private final Map<String, TranslationProgress> progressMap = new ConcurrentHashMap<>();

    // Time tracking for estimations
    private final Map<String, Long> startTimeMap = new ConcurrentHashMap<>();
    private final Map<String, Double> translationRateMap = new ConcurrentHashMap<>();

    /**
     * Starts tracking a new translation session
     * 
     * @param totalChars Total characters to translate
     * @return Session ID for progress tracking
     */
    public String startTracking(int totalChars) {
        String sessionId = UUID.randomUUID().toString();
        progressMap.put(sessionId, TranslationProgress.starting(totalChars));
        startTimeMap.put(sessionId, System.currentTimeMillis());
        return sessionId;
    }

    /**
     * Updates the progress for a translation session
     * 
     * @param sessionId       Translation session ID
     * @param phase           Current translation phase
     * @param message         Status message
     * @param translatedChars Number of characters translated so far
     */
    public void updateProgress(String sessionId, String phase, String message, int translatedChars) {
        TranslationProgress currentProgress = progressMap.get(sessionId);
        if (currentProgress == null) {
            return;
        }

        // Get total characters from existing progress
        int totalChars = currentProgress.getTotalChars();

        // Calculate progress percentage
        double progressPercentage = totalChars > 0 ? (double) translatedChars / totalChars * 100 : 0;

        // Calculate time estimates
        Long startTime = startTimeMap.get(sessionId);
        long currentTime = System.currentTimeMillis();
        long elapsedTimeMs = startTime != null ? currentTime - startTime : 0;

        // Only update translation rate after 5% progress for more accurate calculation
        if (progressPercentage > 5 && translatedChars > 0 && elapsedTimeMs > 0) {
            // Calculate characters per millisecond
            double currentRate = (double) translatedChars / elapsedTimeMs;

            // Get existing rate, or default to current rate
            Double existingRate = translationRateMap.getOrDefault(sessionId, currentRate);

            // Apply weighted average: 70% previous rate + 30% new rate
            double updatedRate = existingRate * 0.7 + currentRate * 0.3;
            translationRateMap.put(sessionId, updatedRate);

            // Estimate times
            long estimatedTotalTimeMs = updatedRate > 0 ? (long) (totalChars / updatedRate) : 0;
            long remainingTimeMs = updatedRate > 0 ? (long) ((totalChars - translatedChars) / updatedRate) : 0;

            // Create new progress with time estimates
            TranslationProgress updatedProgress = new TranslationProgress(
                    phase, message, totalChars, translatedChars,
                    progressPercentage, estimatedTotalTimeMs, remainingTimeMs);

            progressMap.put(sessionId, updatedProgress);
        } else {
            // Create new progress without time estimates
            TranslationProgress updatedProgress = new TranslationProgress(
                    phase, message, totalChars, translatedChars, progressPercentage);

            progressMap.put(sessionId, updatedProgress);
        }
    }

    /**
     * Completes tracking for a translation session
     * 
     * @param sessionId Translation session ID
     * @param success   Whether translation completed successfully
     * @param message   Optional completion message
     */
    public void completeTracking(String sessionId, boolean success, String message) {
        TranslationProgress currentProgress = progressMap.get(sessionId);
        if (currentProgress == null) {
            return;
        }

        if (success) {
            TranslationProgress completedProgress = TranslationProgress.completed(currentProgress.getTotalChars());
            progressMap.put(sessionId, completedProgress);
        } else {
            TranslationProgress errorProgress = TranslationProgress.error(message);
            progressMap.put(sessionId, errorProgress);
        }
    }

    /**
     * Gets the current progress for a translation session
     * 
     * @param sessionId Translation session ID
     * @return Current progress or null if not found
     */
    public TranslationProgress getProgress(String sessionId) {
        return progressMap.get(sessionId);
    }

    /**
     * Cleans up tracking data for a translation session
     * 
     * @param sessionId Translation session ID
     */
    public void removeTracking(String sessionId) {
        progressMap.remove(sessionId);
        startTimeMap.remove(sessionId);
        translationRateMap.remove(sessionId);
    }
}

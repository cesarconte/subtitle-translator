package io.github.cesarconte.subtitle_translator.util;

import io.github.cesarconte.subtitle_translator.model.SubtitleBlock;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Utility to parse and manipulate SRT files
 */
@Component
public class SrtParser {

    /**
     * Parses an SRT file and converts it into a list of subtitle blocks
     *
     * @param content SRT file content
     * @return List of subtitle blocks
     */
    public List<SubtitleBlock> parse(String content) {
        List<SubtitleBlock> subtitles = new ArrayList<>();

        // Normalize line breaks
        String normalizedContent = content.replace("\r\n", "\n").replace("\r", "\n");

        // Split into blocks (double line break)
        String[] blocks = normalizedContent.split("\n\n");

        for (String block : blocks) {
            if (block.trim().isEmpty()) {
                continue;
            }

            String[] lines = block.split("\n");

            if (lines.length < 3) {
                // Incomplete block, skip
                continue;
            }

            try {
                // Extract the ID
                int id = Integer.parseInt(lines[0].trim());

                // Extract the time code
                String timeCode = lines[1].trim();

                // Extract the text
                String[] textLines = new String[lines.length - 2];
                System.arraycopy(lines, 2, textLines, 0, lines.length - 2);

                // Filter empty lines
                List<String> filteredLines = new ArrayList<>();
                for (String line : textLines) {
                    if (!line.trim().isEmpty()) {
                        filteredLines.add(line);
                    }
                }

                SubtitleBlock subtitle = new SubtitleBlock(
                        id,
                        timeCode,
                        filteredLines.toArray(new String[0]));

                subtitles.add(subtitle);

            } catch (NumberFormatException e) {
                // If the ID cannot be parsed, skip this block
                continue;
            }
        }

        return subtitles;
    }

    /**
     * Converts a list of subtitle blocks to SRT format
     *
     * @param subtitles List of subtitle blocks
     * @return SRT format content
     */
    public String generate(List<SubtitleBlock> subtitles) {
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < subtitles.size(); i++) {
            SubtitleBlock subtitle = subtitles.get(i);

            // ID
            sb.append(subtitle.getId()).append("\n");

            // Time code
            sb.append(subtitle.getTimeCode()).append("\n");

            // Text
            for (String line : subtitle.getText()) {
                sb.append(line).append("\n");
            }

            // Blank line between subtitles (except after the last one)
            if (i < subtitles.size() - 1) {
                sb.append("\n");
            }
        }

        return sb.toString();
    }

    /**
     * Validates if the content has a valid SRT format
     *
     * @param content Content to validate
     * @return true if valid, false otherwise
     */
    public boolean isValid(String content) {
        if (content == null || content.trim().isEmpty()) {
            return false;
        }

        // Normalize line breaks
        String normalizedContent = content.replace("\r\n", "\n").replace("\r", "\n");

        // Split into blocks
        String[] blocks = normalizedContent.split("\n\n");

        if (blocks.length == 0) {
            return false;
        }

        // Pattern to validate the time code (00:00:00,000 --> 00:00:00,000)
        Pattern timeCodePattern = Pattern.compile(
                "\\d{2}:\\d{2}:\\d{2},\\d{3}\\s-->\\s\\d{2}:\\d{2}:\\d{2},\\d{3}");

        // Verify each block
        for (String block : blocks) {
            if (block.trim().isEmpty()) {
                continue;
            }

            String[] lines = block.split("\n");

            if (lines.length < 3) {
                return false;
            }

            try {
                // Verify ID
                Integer.parseInt(lines[0].trim());

                // Verify time code
                if (!timeCodePattern.matcher(lines[1].trim()).matches()) {
                    return false;
                }

                // Verify that there is at least one line of text
                boolean hasText = false;
                for (int i = 2; i < lines.length; i++) {
                    if (!lines[i].trim().isEmpty()) {
                        hasText = true;
                        break;
                    }
                }

                if (!hasText) {
                    return false;
                }

            } catch (NumberFormatException e) {
                return false;
            }
        }

        return true;
    }
}

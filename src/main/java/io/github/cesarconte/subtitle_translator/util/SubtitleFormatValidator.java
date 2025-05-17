package io.github.cesarconte.subtitle_translator.util;

import io.github.cesarconte.subtitle_translator.model.SubtitleBlock;
import java.util.ArrayList;
import java.util.List;

/**
 * Utilidad para validar el formato de los subtítulos según estándares comunes.
 */
public class SubtitleFormatValidator {
    public static class ValidationResult {
        public final int subtitleId;
        public final int lineNumber;
        public final String lineContent;
        public final int length;

        public ValidationResult(int subtitleId, int lineNumber, String lineContent, int length) {
            this.subtitleId = subtitleId;
            this.lineNumber = lineNumber;
            this.lineContent = lineContent;
            this.length = length;
        }
    }

    /**
     * Valida que cada línea de los subtítulos no exceda el máximo de caracteres
     * permitido.
     * 
     * @param subtitles       Lista de bloques de subtítulos
     * @param maxCharsPerLine Máximo de caracteres por línea
     * @return Lista de resultados con las líneas que exceden el límite
     */
    public static List<ValidationResult> validateLineLength(List<SubtitleBlock> subtitles, int maxCharsPerLine) {
        List<ValidationResult> violations = new ArrayList<>();
        for (SubtitleBlock block : subtitles) {
            String[] lines = block.getText();
            for (int i = 0; i < lines.length; i++) {
                String line = lines[i];
                if (line != null && line.length() > maxCharsPerLine) {
                    violations.add(new ValidationResult(block.getId(), i + 1, line, line.length()));
                }
            }
        }
        return violations;
    }
}

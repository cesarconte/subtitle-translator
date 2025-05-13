package io.github.cesarconte.subtitle_translator;

import io.github.cesarconte.subtitle_translator.service.ConfidenceCalculator;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ConfidenceCalculatorTests {

    @Test
    public void testHighConfidenceTranslation() {
        String original = "This is a simple text that should be easy to translate.";
        String translated = "Este es un texto simple que debería ser fácil de traducir.";

        double confidence = ConfidenceCalculator.calculateConfidence(original, translated);

        assertTrue(confidence >= 0.8,
                "Una traducción simple debería tener una confianza alta (>= 0.8), pero fue " + confidence);
    }

    @Test
    public void testMediumConfidenceTranslation() {
        String original = "This is a text with some complex terminology.";
        String translated = "Este es un texto con terminología COMPLEX y palabras repetidas palabras.";

        double confidence = ConfidenceCalculator.calculateConfidence(original, translated);

        assertTrue(confidence >= 0.5 && confidence < 0.8,
                "Una traducción con problemas menores debería tener confianza media (0.5-0.8), pero fue " + confidence);
    }

    @Test
    public void testLowConfidenceTranslation() {
        String original = "This is a perfectly normal text.";
        String translated = "Esto es un texto con caracteres extraños {[]}\\^ y puntuación excesiva!!!!! y palabras repetidas palabras repetidas.";

        double confidence = ConfidenceCalculator.calculateConfidence(original, translated);

        assertTrue(confidence < 0.5,
                "Una traducción con problemas graves debería tener confianza baja (< 0.5), pero fue " + confidence);
    }

    @Test
    public void testLengthRatioPenalty() {
        String original = "This is a relatively short text.";
        String translated = "Este es un texto extremadamente largo con mucho contenido extra que no estaba en el original y contiene información completamente innecesaria.";

        double confidence = ConfidenceCalculator.calculateConfidence(original, translated);

        assertTrue(confidence < 0.8,
                "Una traducción con una diferencia significativa de longitud debería tener confianza reducida, pero fue "
                        + confidence);
    }

    @Test
    public void testNullHandling() {
        double confidence = ConfidenceCalculator.calculateConfidence(null, "Algún texto");
        assertEquals(0.5, confidence,
                "Cuando el texto original es nulo, la confianza debería ser intermedia (0.5)");

        confidence = ConfidenceCalculator.calculateConfidence("Some text", null);
        assertEquals(0.5, confidence,
                "Cuando el texto traducido es nulo, la confianza debería ser intermedia (0.5)");

        confidence = ConfidenceCalculator.calculateConfidence(null, null);
        assertEquals(0.5, confidence,
                "Cuando ambos textos son nulos, la confianza debería ser intermedia (0.5)");
    }

    @Test
    public void testEmptyStrings() {
        double confidence = ConfidenceCalculator.calculateConfidence("", "");
        assertTrue(confidence > 0.9,
                "Textos vacíos deberían tener confianza alta (sin penalizaciones)");

        confidence = ConfidenceCalculator.calculateConfidence("Some text", "");
        assertTrue(confidence < 0.5,
                "Un texto traducido vacío debería tener confianza baja");
    }

    @Test
    public void testBoundaryValues() {
        // Verificar que nunca vaya por debajo de 0.0
        String original = "Short text";
        String translated = "Texto extremadamente largo con muchísimo contenido adicional que hace que la proporción de longitud sea completamente fuera de lo normal [[[{{{]]]}}}, además tiene muchos caracteres extraños y palabras repetidas palabras repetidas palabras repetidas!!!!!!!!!";

        double confidence = ConfidenceCalculator.calculateConfidence(original, translated);

        assertTrue(confidence >= 0.0 && confidence <= 1.0,
                "La confianza siempre debe estar entre 0.0 y 1.0, pero fue " + confidence);
    }
}

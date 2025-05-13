package io.github.cesarconte.subtitle_translator;

import io.github.cesarconte.subtitle_translator.model.SubtitleBlock;
import io.github.cesarconte.subtitle_translator.util.SrtParser;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pruebas para la clase SrtParser
 */
@SpringBootTest
public class SrtParserTests {

    @Autowired
    private SrtParser srtParser;

    @Test
    public void testParseValidSrt() {
        String content = "1\n" +
                "00:00:01,000 --> 00:00:04,000\n" +
                "Línea de texto 1\n" +
                "Línea de texto 2\n" +
                "\n" +
                "2\n" +
                "00:00:05,000 --> 00:00:09,000\n" +
                "Otra línea de texto\n";

        List<SubtitleBlock> subtitles = srtParser.parse(content);

        assertNotNull(subtitles);
        assertEquals(2, subtitles.size());
        assertEquals(1, subtitles.get(0).getId());
        assertEquals("00:00:01,000 --> 00:00:04,000", subtitles.get(0).getTimeCode());
        assertEquals(2, subtitles.get(0).getText().length);
        assertEquals("Línea de texto 1", subtitles.get(0).getText()[0]);
        assertEquals("Línea de texto 2", subtitles.get(0).getText()[1]);
    }

    @Test
    public void testGenerateSrt() {
        SubtitleBlock subtitle1 = new SubtitleBlock(
                1,
                "00:00:01,000 --> 00:00:04,000",
                new String[] { "Línea de texto 1", "Línea de texto 2" });

        SubtitleBlock subtitle2 = new SubtitleBlock(
                2,
                "00:00:05,000 --> 00:00:09,000",
                new String[] { "Otra línea de texto" });

        List<SubtitleBlock> subtitles = List.of(subtitle1, subtitle2);

        String generated = srtParser.generate(subtitles);

        assertTrue(generated.contains("1"));
        assertTrue(generated.contains("00:00:01,000 --> 00:00:04,000"));
        assertTrue(generated.contains("Línea de texto 1"));
        assertTrue(generated.contains("Línea de texto 2"));
        assertTrue(generated.contains("2"));
        assertTrue(generated.contains("00:00:05,000 --> 00:00:09,000"));
        assertTrue(generated.contains("Otra línea de texto"));
    }

    @Test
    public void testIsValidSrt() {
        String validContent = "1\n" +
                "00:00:01,000 --> 00:00:04,000\n" +
                "Línea de texto\n";

        String invalidContent1 = "No es un archivo SRT";
        String invalidContent2 = "1\nEsto no tiene código de tiempo\nLínea de texto";

        assertTrue(srtParser.isValid(validContent));
        assertFalse(srtParser.isValid(invalidContent1));
        assertFalse(srtParser.isValid(invalidContent2));
    }
}

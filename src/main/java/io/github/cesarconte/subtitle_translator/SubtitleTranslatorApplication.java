package io.github.cesarconte.subtitle_translator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

import io.github.cesarconte.subtitle_translator.config.AppProperties;
import io.github.cesarconte.subtitle_translator.config.DeeplProperties;

/**
 * Aplicación principal para traducción de subtítulos
 */
@SpringBootApplication
@EnableConfigurationProperties({ DeeplProperties.class, AppProperties.class })
public class SubtitleTranslatorApplication {

	public static void main(String[] args) {
		SpringApplication.run(SubtitleTranslatorApplication.class, args);
	}

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}
}

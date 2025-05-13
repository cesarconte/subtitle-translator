package io.github.cesarconte.subtitle_translator.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration for CORS and other web application options
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

        /**
         * Configures CORS to allow requests from the frontend
         */
        @Override
        public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/api/**")
                                .allowedOrigins("*") // In production, specify the allowed origins
                                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                                .allowedHeaders("*")
                                .maxAge(3600);
        }

        /**
         * Configuration for static resources
         */
        @Override
        public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/css/**")
                                .addResourceLocations("classpath:/static/css/");
                registry.addResourceHandler("/js/**")
                                .addResourceLocations("classpath:/static/js/");
                registry.addResourceHandler("/assets/**")
                                .addResourceLocations("classpath:/static/assets/");
        }
}

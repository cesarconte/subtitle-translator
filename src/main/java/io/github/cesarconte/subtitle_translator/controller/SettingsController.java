package io.github.cesarconte.subtitle_translator.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller to serve the Settings page
 */
@Controller
public class SettingsController {
    @GetMapping("/settings")
    public String settings() {
        return "settings";
    }
}

package io.github.cesarconte.subtitle_translator.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller to manage navigation to the main page
 */
@Controller
public class IndexController {

    /**
     * Returns the main page view
     * 
     * @return name of the home.html template
     */
    @GetMapping("/")
    public String index() {
        return "home";
    }
}

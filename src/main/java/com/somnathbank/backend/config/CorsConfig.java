package com.somnathbank.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // React frontend ka URL (port 3000)
        config.setAllowedOriginPatterns(List.of("http://localhost:*"));

        // Saare HTTP methods allow karo
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));

        // Saare headers allow karo
        config.setAllowedHeaders(List.of("*"));

        // JWT token header allow karo
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}

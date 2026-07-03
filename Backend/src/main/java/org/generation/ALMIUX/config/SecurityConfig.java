package org.generation.ALMIUX.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration; // ** Modelo que define las reglas de CORS
import org.springframework.web.cors.CorsConfigurationSource; // ** Interfaz que Spring Security usa para obtener la config de CORS
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // ** Implementación que mapea rutas a configuraciones CORS

import java.util.List;

// ** Clase de configuración de Spring Security: CORS global, PasswordEncoder y permisos HTTP
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // ** Bean que provee el PasswordEncoder (BCrypt) que UserService necesita para encriptar contraseñas
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ** Configura las reglas de acceso HTTP con CORS habilitado globalmente
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ** Aplica la configuración de CORS definida en corsConfigurationSource()
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // ** Deshabilita CSRF porque la API es stateless (sin sesiones de formulario)
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // ** Permite todas las rutas sin autenticación (adecuado para desarrollo)
                .anyRequest().permitAll()
            );
        return http.build();
    }

    // ** Define qué orígenes, métodos y cabeceras están permitidos en peticiones cross-origin
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // ** Permite peticiones desde cualquier origen (en producción restringir al dominio del frontend)
        config.setAllowedOriginPatterns(List.of("*"));

        // ** Métodos HTTP que el frontend puede usar
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // ** Cabeceras que el frontend puede enviar en sus peticiones
        config.setAllowedHeaders(List.of("*"));

        // ** Permite enviar cookies o cabeceras de autorización en las peticiones
        config.setAllowCredentials(true);

        // ** Aplica esta configuración a todas las rutas de la API
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

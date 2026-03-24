package io.github.jhipster.sample.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

/**
 * Registers the {@link CorrelationIdFilter} with the servlet container.
 *
 * <p>The filter runs at order {@code 0}, after Spring Security's filter chain
 * (order {@code -100}), so that the authenticated principal is available in
 * {@code SecurityContextHolder} when the filter resolves {@code userId}.</p>
 */
@Configuration
public class CorrelationIdFilterConfiguration {

    @Bean
    public FilterRegistrationBean<CorrelationIdFilter> correlationIdFilterRegistration() {
        FilterRegistrationBean<CorrelationIdFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new CorrelationIdFilter());
        registration.addUrlPatterns("/*");
        registration.setOrder(0);
        registration.setName("correlationIdFilter");
        return registration;
    }
}

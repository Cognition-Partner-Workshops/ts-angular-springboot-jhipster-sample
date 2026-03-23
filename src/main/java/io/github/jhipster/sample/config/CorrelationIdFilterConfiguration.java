package io.github.jhipster.sample.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

/**
 * Registers the {@link CorrelationIdFilter} with the servlet container.
 *
 * <p>The filter is given the highest feasible precedence so that MDC context
 * is available to every downstream filter and servlet, including Spring
 * Security's filter chain.</p>
 */
@Configuration
public class CorrelationIdFilterConfiguration {

    @Bean
    public FilterRegistrationBean<CorrelationIdFilter> correlationIdFilterRegistration() {
        FilterRegistrationBean<CorrelationIdFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new CorrelationIdFilter());
        registration.addUrlPatterns("/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 1);
        registration.setName("correlationIdFilter");
        return registration;
    }
}

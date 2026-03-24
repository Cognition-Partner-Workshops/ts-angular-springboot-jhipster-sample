package io.github.jhipster.sample.config;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.sdk.resources.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for distributed tracing via OpenTelemetry.
 *
 * <p>Spring Boot auto-configures Micrometer Tracing with the OTel bridge when
 * {@code micrometer-tracing-bridge-otel} and {@code opentelemetry-exporter-otlp} are on the
 * classpath. This configuration class supplements the auto-configuration by providing an
 * OTel {@link Resource} bean that tags every span with the application's service name.</p>
 *
 * <p>The OTLP exporter endpoint defaults to {@code http://localhost:4318} (HTTP/protobuf)
 * and can be overridden via {@code management.otlp.tracing.endpoint}.</p>
 *
 * <p>Sampling probability is controlled by {@code management.tracing.sampling.probability}
 * (1.0 in dev, 0.1 in prod).</p>
 */
@Configuration
@ConditionalOnClass(OpenTelemetry.class)
@ConditionalOnProperty(name = "management.tracing.sampling.probability")
public class TracingConfiguration {

    private static final Logger log = LoggerFactory.getLogger(TracingConfiguration.class);

    private static final AttributeKey<String> SERVICE_NAME = AttributeKey.stringKey("service.name");

    private final String applicationName;

    public TracingConfiguration(@Value("${spring.application.name}") String applicationName) {
        this.applicationName = applicationName;
    }

    /**
     * Provides an OpenTelemetry {@link Resource} that sets the {@code service.name}
     * attribute on all exported spans, making them identifiable in backends like Grafana Tempo.
     */
    @Bean
    public Resource otelResource() {
        log.info("Configuring OpenTelemetry tracing resource for service '{}'", applicationName);
        return Resource.getDefault().merge(Resource.create(Attributes.of(SERVICE_NAME, applicationName)));
    }
}

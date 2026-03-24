package io.github.jhipster.sample.config;

import io.micrometer.tracing.Tracer;
import io.micrometer.tracing.otel.bridge.OtelCurrentTraceContext;
import io.micrometer.tracing.otel.bridge.OtelTracer;
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;
import io.opentelemetry.sdk.trace.samplers.Sampler;
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
 * <p>In Spring Boot 4.x, the tracing bridge auto-configuration does not automatically
 * create an OTel-backed {@link Tracer}. This class explicitly wires up the full
 * tracing pipeline: OTLP exporter → SdkTracerProvider → OpenTelemetry SDK → OtelTracer.</p>
 *
 * <p>The OTLP exporter endpoint is configured via {@code management.otlp.tracing.endpoint}
 * (defaults to {@code http://localhost:4318/v1/traces}).</p>
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
    private final String otlpEndpoint;
    private final double samplingProbability;

    public TracingConfiguration(
        @Value("${spring.application.name}") String applicationName,
        @Value("${management.otlp.tracing.endpoint:http://localhost:4318/v1/traces}") String otlpEndpoint,
        @Value("${management.tracing.sampling.probability:1.0}") double samplingProbability
    ) {
        this.applicationName = applicationName;
        this.otlpEndpoint = otlpEndpoint;
        this.samplingProbability = samplingProbability;
    }

    @Bean
    public OtlpHttpSpanExporter otlpHttpSpanExporter() {
        log.info("Configuring OTLP span exporter with endpoint '{}'", otlpEndpoint);
        return OtlpHttpSpanExporter.builder().setEndpoint(otlpEndpoint).build();
    }

    @Bean
    public SdkTracerProvider sdkTracerProvider(OtlpHttpSpanExporter spanExporter) {
        Resource resource = Resource.getDefault().merge(Resource.create(Attributes.of(SERVICE_NAME, applicationName)));
        return SdkTracerProvider.builder()
            .setResource(resource)
            .setSampler(Sampler.traceIdRatioBased(samplingProbability))
            .addSpanProcessor(BatchSpanProcessor.builder(spanExporter).build())
            .build();
    }

    @Bean
    public OpenTelemetrySdk openTelemetrySdk(SdkTracerProvider tracerProvider) {
        log.info("Configuring OpenTelemetry SDK for service '{}' with sampling probability {}", applicationName, samplingProbability);
        return OpenTelemetrySdk.builder()
            .setTracerProvider(tracerProvider)
            .setPropagators(ContextPropagators.create(W3CTraceContextPropagator.getInstance()))
            .build();
    }

    @Bean
    public OtelCurrentTraceContext otelCurrentTraceContext() {
        return new OtelCurrentTraceContext();
    }

    @Bean
    public Tracer micrometerTracer(OpenTelemetrySdk openTelemetrySdk, OtelCurrentTraceContext otelCurrentTraceContext) {
        io.opentelemetry.api.trace.Tracer otelTracer = openTelemetrySdk.getTracer(applicationName);
        return new OtelTracer(otelTracer, otelCurrentTraceContext, event -> {});
    }
}

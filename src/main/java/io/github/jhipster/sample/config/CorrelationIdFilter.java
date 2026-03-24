package io.github.jhipster.sample.config;

import io.micrometer.tracing.Span;
import io.micrometer.tracing.TraceContext;
import io.micrometer.tracing.Tracer;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Servlet filter that populates SLF4J MDC with correlation and identity fields
 * for structured logging.
 *
 * <p>Reads the {@code X-Request-ID} header from the incoming request (or generates
 * a new UUID when absent), extracts the authenticated principal from the Spring
 * Security context, and places both values into MDC so that every log statement
 * emitted while processing the request carries them automatically.</p>
 *
 * <p>The filter runs at order {@code 0}, which is after Spring Security's filter
 * chain (order {@code -100}), ensuring that the {@code SecurityContextHolder}
 * is populated before {@code userId} is resolved.</p>
 *
 * <p>The filter also populates {@code traceId} and {@code spanId} from the
 * Micrometer {@link Tracer} if a trace is active, and echoes the request ID back
 * on the response via the {@code X-Request-ID} header so that callers can
 * correlate their client-side logs with server-side traces.</p>
 */
public class CorrelationIdFilter extends OncePerRequestFilter implements Ordered {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String MDC_REQUEST_ID = "requestId";
    private static final String MDC_USER_ID = "userId";
    private static final String MDC_TRACE_ID = "traceId";
    private static final String MDC_SPAN_ID = "spanId";

    private final Tracer tracer;

    public CorrelationIdFilter(Tracer tracer) {
        this.tracer = tracer;
    }

    @Override
    public int getOrder() {
        return 0;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        Span span = tracer.nextSpan().name("http " + request.getMethod());
        try (Tracer.SpanInScope scope = tracer.withSpan(span.start())) {
            String requestId = request.getHeader(REQUEST_ID_HEADER);
            if (requestId == null || requestId.isBlank()) {
                requestId = UUID.randomUUID().toString();
            }

            MDC.put(MDC_REQUEST_ID, requestId);
            MDC.put(MDC_USER_ID, resolveUserId());
            populateTraceMdc();

            response.setHeader(REQUEST_ID_HEADER, requestId);

            filterChain.doFilter(request, response);
        } finally {
            span.end();
            MDC.remove(MDC_REQUEST_ID);
            MDC.remove(MDC_USER_ID);
            MDC.remove(MDC_TRACE_ID);
            MDC.remove(MDC_SPAN_ID);
        }
    }

    private void populateTraceMdc() {
        Span currentSpan = tracer.currentSpan();
        if (currentSpan != null) {
            TraceContext context = currentSpan.context();
            if (context != null) {
                MDC.put(MDC_TRACE_ID, context.traceId());
                MDC.put(MDC_SPAN_ID, context.spanId());
            }
        }
    }

    private String resolveUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            return authentication.getName();
        }
        return "anonymous";
    }
}

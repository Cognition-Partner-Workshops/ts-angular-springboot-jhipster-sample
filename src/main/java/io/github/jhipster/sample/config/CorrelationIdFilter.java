package io.github.jhipster.sample.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Servlet filter that populates MDC with correlation IDs for structured logging.
 * Reads X-Request-ID header or generates a UUID, and extracts the authenticated user.
 *
 * Ordered after the Spring Security filter chain (which runs at order -100) so that
 * the SecurityContext is populated and userId can be extracted during request processing.
 */
@Component
@Order(0)
public class CorrelationIdFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String MDC_REQUEST_ID = "requestId";
    private static final String MDC_USER_ID = "userId";
    private static final int MAX_REQUEST_ID_LENGTH = 200;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        try {
            String requestId = request.getHeader(REQUEST_ID_HEADER);
            if (requestId == null || requestId.isBlank()) {
                requestId = UUID.randomUUID().toString();
            } else {
                // Sanitize to prevent log injection - only allow alphanumeric, hyphens, underscores, and dots
                requestId = requestId.replaceAll("[^a-zA-Z0-9\\-_.]", "");
                if (requestId.isEmpty() || requestId.length() > MAX_REQUEST_ID_LENGTH) {
                    requestId = UUID.randomUUID().toString();
                }
            }
            MDC.put(MDC_REQUEST_ID, requestId);
            response.setHeader(REQUEST_ID_HEADER, requestId);

            // Extract userId from security context (available because this filter runs after Spring Security)
            populateUserId();

            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_REQUEST_ID);
            MDC.remove(MDC_USER_ID);
        }
    }

    private void populateUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String userId = authentication.getName();
            if (userId != null && !"anonymousUser".equals(userId)) {
                MDC.put(MDC_USER_ID, userId);
            }
        }
    }
}

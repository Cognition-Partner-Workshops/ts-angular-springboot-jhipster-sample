package io.github.jhipster.sample.service;

import io.github.jhipster.sample.repository.OperationRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;

/**
 * Service for tracking operation business metrics via Micrometer.
 */
@Service
public class OperationMetricsService {

    private final Counter createdCounter;
    private final Counter deletedCounter;
    private final DistributionSummary amountSummary;

    public OperationMetricsService(MeterRegistry meterRegistry, OperationRepository operationRepository) {
        this.createdCounter = Counter.builder("operation.created")
            .description("Total number of operations created")
            .register(meterRegistry);

        this.deletedCounter = Counter.builder("operation.deleted")
            .description("Total number of operations deleted")
            .register(meterRegistry);

        this.amountSummary = DistributionSummary.builder("operation.amount")
            .description("Distribution of operation amounts")
            .publishPercentileHistogram(true)
            .register(meterRegistry);

        Gauge.builder("operation.count", operationRepository::count).description("Current number of operations").register(meterRegistry);
    }

    public void recordOperation(BigDecimal amount) {
        createdCounter.increment();
        amountSummary.record(amount.doubleValue());
    }

    public void incrementDeleted() {
        deletedCounter.increment();
    }
}

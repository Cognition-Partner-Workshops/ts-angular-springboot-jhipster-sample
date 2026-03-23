package io.github.jhipster.sample.config;

import io.github.jhipster.sample.repository.BankAccountRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Configuration;

/**
 * Registers custom Micrometer metrics for business observability.
 *
 * <ul>
 *   <li>Counters for account and operation creation</li>
 *   <li>Distribution summary for operation amounts</li>
 *   <li>Gauge for total balance across all bank accounts</li>
 * </ul>
 */
@Configuration
public class ObservabilityConfiguration {

    private final Counter accountCreationCounter;
    private final Counter operationCreationCounter;
    private final DistributionSummary operationAmountSummary;

    public ObservabilityConfiguration(MeterRegistry registry, BankAccountRepository bankAccountRepository) {
        this.accountCreationCounter = Counter.builder("business.accounts.created")
            .description("Total number of bank accounts created")
            .tag("entity", "bankAccount")
            .register(registry);

        this.operationCreationCounter = Counter.builder("business.operations.created")
            .description("Total number of operations (transactions) created")
            .tag("entity", "operation")
            .register(registry);

        this.operationAmountSummary = DistributionSummary.builder("business.operations.amount")
            .description("Distribution of operation amounts")
            .baseUnit("currency")
            .publishPercentiles(0.5, 0.75, 0.95, 0.99)
            .register(registry);

        Gauge.builder("business.accounts.total_balance", bankAccountRepository, repo -> repo.sumAllBalances().doubleValue())
            .description("Total balance across all bank accounts")
            .baseUnit("currency")
            .register(registry);

        Gauge.builder("business.accounts.count", bankAccountRepository, repo -> repo.count())
            .description("Current number of bank accounts")
            .register(registry);
    }

    public Counter getAccountCreationCounter() {
        return accountCreationCounter;
    }

    public Counter getOperationCreationCounter() {
        return operationCreationCounter;
    }

    public DistributionSummary getOperationAmountSummary() {
        return operationAmountSummary;
    }
}

package io.github.jhipster.sample.service;

import io.github.jhipster.sample.repository.BankAccountRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

/**
 * Service for tracking bank account business metrics via Micrometer.
 */
@Service
public class BankAccountMetricsService {

    private final Counter createdCounter;
    private final Counter updatedCounter;
    private final Counter deletedCounter;

    public BankAccountMetricsService(MeterRegistry meterRegistry, BankAccountRepository bankAccountRepository) {
        this.createdCounter = Counter.builder("bank.account.created")
            .description("Total number of bank accounts created")
            .register(meterRegistry);

        this.updatedCounter = Counter.builder("bank.account.updated")
            .description("Total number of bank account updates")
            .register(meterRegistry);

        this.deletedCounter = Counter.builder("bank.account.deleted")
            .description("Total number of bank accounts deleted")
            .register(meterRegistry);

        Gauge.builder("bank.account.count", bankAccountRepository, repo -> (double) repo.count())
            .description("Current number of bank accounts")
            .register(meterRegistry);

        Gauge.builder("bank.account.total.balance", bankAccountRepository, repo -> repo.sumAllBalances().doubleValue())
            .description("Sum of all bank account balances")
            .register(meterRegistry);
    }

    public void incrementCreated() {
        createdCounter.increment();
    }

    public void incrementUpdated() {
        updatedCounter.increment();
    }

    public void incrementDeleted() {
        deletedCounter.increment();
    }
}

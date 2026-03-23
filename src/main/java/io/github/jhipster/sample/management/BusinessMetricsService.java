package io.github.jhipster.sample.management;

import io.github.jhipster.sample.repository.BankAccountRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import java.math.BigDecimal;
import java.util.function.Supplier;
import org.springframework.stereotype.Service;

@Service
public class BusinessMetricsService {

    public static final String ACCOUNT_CREATED_METRIC = "bank_account.created";
    public static final String ACCOUNT_DELETED_METRIC = "bank_account.deleted";
    public static final String OPERATION_EXECUTED_METRIC = "operation.executed";
    public static final String OPERATION_AMOUNT_METRIC = "operation.amount";
    public static final String ACCOUNT_ACTIVE_COUNT_METRIC = "bank_account.active.count";
    public static final String ACCOUNT_CREATION_TIMER_METRIC = "bank_account.creation.duration";

    private final Counter accountCreatedCounter;
    private final Counter accountDeletedCounter;
    private final Counter operationDebitCounter;
    private final Counter operationCreditCounter;
    private final DistributionSummary operationDebitSummary;
    private final DistributionSummary operationCreditSummary;
    private final Timer accountCreationTimer;

    public BusinessMetricsService(MeterRegistry registry, BankAccountRepository bankAccountRepository) {
        this.accountCreatedCounter = Counter.builder(ACCOUNT_CREATED_METRIC)
            .description("Total number of bank accounts created")
            .register(registry);

        this.accountDeletedCounter = Counter.builder(ACCOUNT_DELETED_METRIC)
            .description("Total number of bank accounts deleted")
            .register(registry);

        this.operationDebitCounter = Counter.builder(OPERATION_EXECUTED_METRIC)
            .description("Total number of operations executed")
            .tag("type", "DEBIT")
            .register(registry);

        this.operationCreditCounter = Counter.builder(OPERATION_EXECUTED_METRIC)
            .description("Total number of operations executed")
            .tag("type", "CREDIT")
            .register(registry);

        this.operationDebitSummary = DistributionSummary.builder(OPERATION_AMOUNT_METRIC)
            .description("Distribution of operation amounts")
            .tag("type", "DEBIT")
            .register(registry);

        this.operationCreditSummary = DistributionSummary.builder(OPERATION_AMOUNT_METRIC)
            .description("Distribution of operation amounts")
            .tag("type", "CREDIT")
            .register(registry);

        this.accountCreationTimer = Timer.builder(ACCOUNT_CREATION_TIMER_METRIC)
            .description("Time taken to create a bank account")
            .register(registry);

        registry.gauge(ACCOUNT_ACTIVE_COUNT_METRIC, bankAccountRepository, repo -> repo.count());
    }

    public void incrementAccountCreated() {
        this.accountCreatedCounter.increment();
    }

    public void incrementAccountDeleted() {
        this.accountDeletedCounter.increment();
    }

    public void recordOperation(BigDecimal amount) {
        if (amount == null) {
            return;
        }
        if (amount.signum() < 0) {
            this.operationDebitCounter.increment();
            this.operationDebitSummary.record(amount.abs().doubleValue());
        } else {
            this.operationCreditCounter.increment();
            this.operationCreditSummary.record(amount.doubleValue());
        }
    }

    public <T> T timeAccountCreation(Supplier<T> creationLogic) {
        return this.accountCreationTimer.record(creationLogic);
    }
}

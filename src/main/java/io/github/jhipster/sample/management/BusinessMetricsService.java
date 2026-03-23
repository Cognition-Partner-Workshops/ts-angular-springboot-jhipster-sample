package io.github.jhipster.sample.management;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.MeterRegistry;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;

/**
 * Service that registers and exposes custom business metrics via Micrometer.
 */
@Service
public class BusinessMetricsService {

    private final Counter bankAccountCreated;
    private final Counter bankAccountUpdated;
    private final Counter bankAccountDeleted;
    private final Counter operationCreated;
    private final DistributionSummary operationAmount;
    private final Counter userRegistered;
    private final Counter userActivated;
    private final Counter loginSuccess;
    private final Counter loginFailure;

    public BusinessMetricsService(MeterRegistry registry) {
        this.bankAccountCreated = Counter.builder("business.bank_account.created")
            .description("Number of bank accounts created")
            .register(registry);
        this.bankAccountUpdated = Counter.builder("business.bank_account.updated")
            .description("Number of bank accounts updated")
            .register(registry);
        this.bankAccountDeleted = Counter.builder("business.bank_account.deleted")
            .description("Number of bank accounts deleted")
            .register(registry);
        this.operationCreated = Counter.builder("business.operation.created")
            .description("Number of operations created")
            .register(registry);
        this.operationAmount = DistributionSummary.builder("business.operation.amount")
            .description("Distribution of operation amounts")
            .register(registry);
        this.userRegistered = Counter.builder("business.user.registered").description("Number of user registrations").register(registry);
        this.userActivated = Counter.builder("business.user.activated").description("Number of user activations").register(registry);
        this.loginSuccess = Counter.builder("business.user.login.success").description("Number of successful logins").register(registry);
        this.loginFailure = Counter.builder("business.user.login.failure").description("Number of failed logins").register(registry);
    }

    public void incrementBankAccountCreated() {
        this.bankAccountCreated.increment();
    }

    public void incrementBankAccountUpdated() {
        this.bankAccountUpdated.increment();
    }

    public void incrementBankAccountDeleted() {
        this.bankAccountDeleted.increment();
    }

    public void incrementOperationCreated() {
        this.operationCreated.increment();
    }

    public void recordOperationAmount(BigDecimal amount) {
        if (amount != null) {
            this.operationAmount.record(amount.doubleValue());
        }
    }

    public void incrementUserRegistered() {
        this.userRegistered.increment();
    }

    public void incrementUserActivated() {
        this.userActivated.increment();
    }

    public void incrementLoginSuccess() {
        this.loginSuccess.increment();
    }

    public void incrementLoginFailure() {
        this.loginFailure.increment();
    }
}

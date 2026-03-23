package io.github.jhipster.sample.management;

import static org.assertj.core.api.Assertions.assertThat;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BusinessMetricsServiceTest {

    private MeterRegistry registry;
    private BusinessMetricsService service;

    @BeforeEach
    void setUp() {
        registry = new SimpleMeterRegistry();
        service = new BusinessMetricsService(registry);
    }

    @Test
    void shouldIncrementBankAccountCreated() {
        service.incrementBankAccountCreated();
        service.incrementBankAccountCreated();
        assertThat(registry.counter("business.bank_account.created").count()).isEqualTo(2.0);
    }

    @Test
    void shouldIncrementBankAccountUpdated() {
        service.incrementBankAccountUpdated();
        assertThat(registry.counter("business.bank_account.updated").count()).isEqualTo(1.0);
    }

    @Test
    void shouldIncrementBankAccountDeleted() {
        service.incrementBankAccountDeleted();
        assertThat(registry.counter("business.bank_account.deleted").count()).isEqualTo(1.0);
    }

    @Test
    void shouldIncrementOperationCreated() {
        service.incrementOperationCreated();
        service.incrementOperationCreated();
        service.incrementOperationCreated();
        assertThat(registry.counter("business.operation.created").count()).isEqualTo(3.0);
    }

    @Test
    void shouldRecordOperationAmount() {
        service.recordOperationAmount(BigDecimal.valueOf(100.50));
        service.recordOperationAmount(BigDecimal.valueOf(200.25));
        var summary = registry.summary("business.operation.amount");
        assertThat(summary.count()).isEqualTo(2);
        assertThat(summary.totalAmount()).isEqualTo(300.75);
    }

    @Test
    void shouldHandleNullOperationAmount() {
        service.recordOperationAmount(null);
        var summary = registry.summary("business.operation.amount");
        assertThat(summary.count()).isEqualTo(0);
    }

    @Test
    void shouldIncrementUserRegistered() {
        service.incrementUserRegistered();
        assertThat(registry.counter("business.user.registered").count()).isEqualTo(1.0);
    }

    @Test
    void shouldIncrementUserActivated() {
        service.incrementUserActivated();
        assertThat(registry.counter("business.user.activated").count()).isEqualTo(1.0);
    }

    @Test
    void shouldIncrementLoginSuccess() {
        service.incrementLoginSuccess();
        service.incrementLoginSuccess();
        assertThat(registry.counter("business.user.login.success").count()).isEqualTo(2.0);
    }

    @Test
    void shouldIncrementLoginFailure() {
        service.incrementLoginFailure();
        assertThat(registry.counter("business.user.login.failure").count()).isEqualTo(1.0);
    }
}

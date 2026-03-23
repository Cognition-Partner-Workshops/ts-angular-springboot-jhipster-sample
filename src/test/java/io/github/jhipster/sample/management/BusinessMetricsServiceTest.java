package io.github.jhipster.sample.management;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import io.github.jhipster.sample.repository.BankAccountRepository;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BusinessMetricsServiceTest {

    private MeterRegistry registry;
    private BusinessMetricsService service;
    private BankAccountRepository bankAccountRepository;

    @BeforeEach
    void setUp() {
        registry = new SimpleMeterRegistry();
        bankAccountRepository = mock(BankAccountRepository.class);
        when(bankAccountRepository.count()).thenReturn(5L);
        service = new BusinessMetricsService(registry, bankAccountRepository);
    }

    @Test
    void shouldIncrementAccountCreatedCounter() {
        service.incrementAccountCreated();
        service.incrementAccountCreated();

        assertThat(registry.counter(BusinessMetricsService.ACCOUNT_CREATED_METRIC).count()).isEqualTo(2.0);
    }

    @Test
    void shouldIncrementAccountDeletedCounter() {
        service.incrementAccountDeleted();

        assertThat(registry.counter(BusinessMetricsService.ACCOUNT_DELETED_METRIC).count()).isEqualTo(1.0);
    }

    @Test
    void shouldRecordCreditOperation() {
        service.recordOperation(new BigDecimal("100.50"));

        assertThat(registry.counter(BusinessMetricsService.OPERATION_EXECUTED_METRIC, "type", "CREDIT").count()).isEqualTo(1.0);
        assertThat(registry.summary(BusinessMetricsService.OPERATION_AMOUNT_METRIC, "type", "CREDIT").count()).isEqualTo(1);
        assertThat(registry.summary(BusinessMetricsService.OPERATION_AMOUNT_METRIC, "type", "CREDIT").totalAmount()).isEqualTo(100.50);
    }

    @Test
    void shouldRecordDebitOperation() {
        service.recordOperation(new BigDecimal("-50.25"));

        assertThat(registry.counter(BusinessMetricsService.OPERATION_EXECUTED_METRIC, "type", "DEBIT").count()).isEqualTo(1.0);
        assertThat(registry.summary(BusinessMetricsService.OPERATION_AMOUNT_METRIC, "type", "DEBIT").count()).isEqualTo(1);
        assertThat(registry.summary(BusinessMetricsService.OPERATION_AMOUNT_METRIC, "type", "DEBIT").totalAmount()).isEqualTo(50.25);
    }

    @Test
    void shouldHandleNullAmount() {
        service.recordOperation(null);

        assertThat(registry.counter(BusinessMetricsService.OPERATION_EXECUTED_METRIC, "type", "CREDIT").count()).isEqualTo(0.0);
        assertThat(registry.counter(BusinessMetricsService.OPERATION_EXECUTED_METRIC, "type", "DEBIT").count()).isEqualTo(0.0);
    }

    @Test
    void shouldTrackActiveAccountCount() {
        assertThat(registry.get(BusinessMetricsService.ACCOUNT_ACTIVE_COUNT_METRIC).gauge().value()).isEqualTo(5.0);
    }

    @Test
    void shouldTimeAccountCreation() {
        String result = service.timeAccountCreation(() -> "created");
        assertThat(result).isEqualTo("created");
        assertThat(registry.timer(BusinessMetricsService.ACCOUNT_CREATION_TIMER_METRIC).count()).isEqualTo(1);
    }
}

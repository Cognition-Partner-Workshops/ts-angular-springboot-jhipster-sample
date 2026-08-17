package io.github.jhipster.sample.web.rest;

import static io.github.jhipster.sample.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import io.github.jhipster.sample.IntegrationTest;
import io.github.jhipster.sample.domain.BankAccount;
import io.github.jhipster.sample.domain.Operation;
import io.github.jhipster.sample.repository.BankAccountRepository;
import io.github.jhipster.sample.repository.OperationRepository;
import java.math.BigDecimal;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link AccountSummaryResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class AccountSummaryResourceIT {

    private static final String ENTITY_API_URL = "/api/account-summary";

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private OperationRepository operationRepository;

    @Autowired
    private MockMvc restAccountSummaryMockMvc;

    @BeforeEach
    void emptyDatabase() {
        operationRepository.deleteAll();
        bankAccountRepository.deleteAll();
    }

    @Test
    @Transactional
    void getAccountSummary() throws Exception {
        BankAccount current = bankAccountRepository.save(new BankAccount().name("Current account").balance(new BigDecimal("4200.00")));
        BankAccount savings = bankAccountRepository.save(new BankAccount().name("Savings account").balance(new BigDecimal("8145.67")));

        operationRepository.save(
            new Operation()
                .date(Instant.parse("2026-07-01T08:00:00Z"))
                .description("Salary")
                .amount(new BigDecimal("2500.00"))
                .bankAccount(current)
        );
        Operation groceries = operationRepository.save(
            new Operation()
                .date(Instant.parse("2026-08-01T10:15:30Z"))
                .description("Groceries")
                .amount(new BigDecimal("-54.20"))
                .bankAccount(current)
        );
        Operation interest = operationRepository.save(
            new Operation()
                .date(Instant.parse("2026-07-15T12:30:00Z"))
                .description("Interest")
                .amount(new BigDecimal("12.34"))
                .bankAccount(savings)
        );

        restAccountSummaryMockMvc
            .perform(get(ENTITY_API_URL))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.totalBalance").value(sameNumber(new BigDecimal("12345.67"))))
            .andExpect(jsonPath("$.accountCount").value(2))
            .andExpect(jsonPath("$.operationCount").value(3))
            .andExpect(jsonPath("$.accounts.length()").value(2))
            .andExpect(jsonPath("$.accounts[0].id").value(current.getId().intValue()))
            .andExpect(jsonPath("$.accounts[0].name").value("Current account"))
            .andExpect(jsonPath("$.accounts[0].balance").value(sameNumber(new BigDecimal("4200.00"))))
            .andExpect(jsonPath("$.accounts[0].operationCount").value(2))
            .andExpect(jsonPath("$.accounts[1].id").value(savings.getId().intValue()))
            .andExpect(jsonPath("$.accounts[1].name").value("Savings account"))
            .andExpect(jsonPath("$.accounts[1].balance").value(sameNumber(new BigDecimal("8145.67"))))
            .andExpect(jsonPath("$.accounts[1].operationCount").value(1))
            .andExpect(jsonPath("$.recentOperations.length()").value(3))
            .andExpect(jsonPath("$.recentOperations[0].id").value(groceries.getId().intValue()))
            .andExpect(jsonPath("$.recentOperations[0].date").value("2026-08-01T10:15:30Z"))
            .andExpect(jsonPath("$.recentOperations[0].description").value("Groceries"))
            .andExpect(jsonPath("$.recentOperations[0].amount").value(sameNumber(new BigDecimal("-54.20"))))
            .andExpect(jsonPath("$.recentOperations[0].bankAccountName").value("Current account"))
            .andExpect(jsonPath("$.recentOperations[1].id").value(interest.getId().intValue()))
            .andExpect(jsonPath("$.recentOperations[1].bankAccountName").value("Savings account"));
    }

    @Test
    @Transactional
    void getAccountSummaryMonetaryValuesUseTwoDecimals() throws Exception {
        BankAccount current = bankAccountRepository.save(new BankAccount().name("Current account").balance(new BigDecimal("10.00")));
        operationRepository.save(
            new Operation()
                .date(Instant.parse("2026-08-01T10:15:30Z"))
                .description("Groceries")
                .amount(new BigDecimal("-2.50"))
                .bankAccount(current)
        );

        String json = restAccountSummaryMockMvc
            .perform(get(ENTITY_API_URL))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

        assertThat(json).contains("\"totalBalance\":10.00").contains("\"balance\":10.00").contains("\"amount\":-2.50");
        assertThat(json).contains("\"date\":\"2026-08-01T10:15:30Z\"");
    }

    @Test
    @Transactional
    void getAccountSummaryKeepsOnlyTheTenMostRecentOperations() throws Exception {
        BankAccount current = bankAccountRepository.save(new BankAccount().name("Current account").balance(new BigDecimal("100.00")));
        for (int i = 0; i < 12; i++) {
            operationRepository.save(
                new Operation()
                    .date(Instant.parse("2026-08-01T00:00:00Z").plusSeconds(i * 60L))
                    .description("Operation " + i)
                    .amount(new BigDecimal("1.00"))
                    .bankAccount(current)
            );
        }

        restAccountSummaryMockMvc
            .perform(get(ENTITY_API_URL))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.operationCount").value(12))
            .andExpect(jsonPath("$.accounts[0].operationCount").value(12))
            .andExpect(jsonPath("$.recentOperations.length()").value(10))
            .andExpect(jsonPath("$.recentOperations[0].description").value("Operation 11"))
            .andExpect(jsonPath("$.recentOperations[9].description").value("Operation 2"));
    }

    @Test
    @Transactional
    void getAccountSummaryWithEmptyDatabase() throws Exception {
        restAccountSummaryMockMvc
            .perform(get(ENTITY_API_URL))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.totalBalance").value(sameNumber(new BigDecimal("0.00"))))
            .andExpect(jsonPath("$.accountCount").value(0))
            .andExpect(jsonPath("$.operationCount").value(0))
            .andExpect(jsonPath("$.accounts").isArray())
            .andExpect(jsonPath("$.accounts").isEmpty())
            .andExpect(jsonPath("$.recentOperations").isArray())
            .andExpect(jsonPath("$.recentOperations").isEmpty());
    }

    @Test
    @WithUnauthenticatedMockUser
    void getAccountSummaryAsAnonymousUser() throws Exception {
        restAccountSummaryMockMvc.perform(get(ENTITY_API_URL)).andExpect(status().isUnauthorized());
    }
}

package io.github.jhipster.sample.web.rest;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import io.github.jhipster.sample.IntegrationTest;
import io.github.jhipster.sample.domain.BankAccount;
import io.github.jhipster.sample.domain.Operation;
import io.github.jhipster.sample.repository.BankAccountRepository;
import io.github.jhipster.sample.repository.OperationRepository;
import java.math.BigDecimal;
import java.time.Instant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class AccountSummaryResourceIT {

    private static final String API_URL = "/api/account-summary";

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private OperationRepository operationRepository;

    @Autowired
    private MockMvc restAccountSummaryMockMvc;

    @BeforeEach
    @AfterEach
    void clearData() {
        operationRepository.deleteAll();
        bankAccountRepository.deleteAll();
    }

    @Test
    @Transactional
    void getSummaryWithAggregatedDataAndRecentOperationLimit() throws Exception {
        BankAccount current = bankAccountRepository.save(new BankAccount().name("Current account").balance(new BigDecimal("4200.00")));
        BankAccount savings = bankAccountRepository.save(new BankAccount().name("Savings account").balance(new BigDecimal("1000.50")));
        Instant start = Instant.parse("2026-08-01T10:00:00Z");
        for (int i = 0; i < 12; i++) {
            Operation operation = new Operation()
                .date(start.plusSeconds(i * 60L))
                .description("Operation " + i)
                .amount(new BigDecimal(i % 2 == 0 ? "10.00" : "-5.00"))
                .bankAccount(i < 5 ? current : savings);
            operationRepository.save(operation);
        }
        operationRepository.flush();

        restAccountSummaryMockMvc
            .perform(get(API_URL))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.totalBalance").value(5200.50))
            .andExpect(jsonPath("$.accountCount").value(2))
            .andExpect(jsonPath("$.operationCount").value(12))
            .andExpect(jsonPath("$.accounts", hasSize(2)))
            .andExpect(jsonPath("$.accounts[0].name").value("Current account"))
            .andExpect(jsonPath("$.accounts[0].balance").value(4200.00))
            .andExpect(jsonPath("$.accounts[0].operationCount").value(5))
            .andExpect(jsonPath("$.accounts[1].name").value("Savings account"))
            .andExpect(jsonPath("$.accounts[1].balance").value(1000.50))
            .andExpect(jsonPath("$.accounts[1].operationCount").value(7))
            .andExpect(jsonPath("$.recentOperations", hasSize(10)))
            .andExpect(jsonPath("$.recentOperations[0].description").value("Operation 11"))
            .andExpect(jsonPath("$.recentOperations[0].date").value("2026-08-01T10:11:00Z"))
            .andExpect(jsonPath("$.recentOperations[9].description").value("Operation 2"));
    }

    @Test
    @Transactional
    void getSummaryWithEmptyDatabase() throws Exception {
        restAccountSummaryMockMvc
            .perform(get(API_URL))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalBalance").value(0.00))
            .andExpect(jsonPath("$.accountCount").value(0))
            .andExpect(jsonPath("$.operationCount").value(0))
            .andExpect(jsonPath("$.accounts", hasSize(0)))
            .andExpect(jsonPath("$.recentOperations", hasSize(0)));
    }

    @Test
    @WithUnauthenticatedMockUser
    void getSummaryWhenAnonymous() throws Exception {
        restAccountSummaryMockMvc.perform(get(API_URL)).andExpect(status().isUnauthorized());
    }
}

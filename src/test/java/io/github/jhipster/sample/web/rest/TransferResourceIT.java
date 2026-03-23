package io.github.jhipster.sample.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.jhipster.sample.IntegrationTest;
import io.github.jhipster.sample.domain.BankAccount;
import io.github.jhipster.sample.domain.Transfer;
import io.github.jhipster.sample.domain.User;
import io.github.jhipster.sample.repository.BankAccountRepository;
import io.github.jhipster.sample.repository.TransferRepository;
import io.github.jhipster.sample.repository.UserRepository;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link TransferResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class TransferResourceIT {

    private static final String ENTITY_API_URL = "/api/transfers";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final BigDecimal SOURCE_BALANCE = new BigDecimal("1000.00");
    private static final BigDecimal DEST_BALANCE = new BigDecimal("500.00");
    private static final BigDecimal TRANSFER_AMOUNT = new BigDecimal("200.00");

    @Autowired
    private ObjectMapper om;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private TransferRepository transferRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTransferMockMvc;

    private BankAccount sourceAccount;
    private BankAccount destinationAccount;
    private User testUser;

    @BeforeEach
    void initTest() {
        testUser = userRepository.findOneByLogin("user").orElseThrow();

        sourceAccount = new BankAccount().name("Source Account").balance(SOURCE_BALANCE).user(testUser);
        sourceAccount = bankAccountRepository.saveAndFlush(sourceAccount);

        destinationAccount = new BankAccount().name("Destination Account").balance(DEST_BALANCE).user(testUser);
        destinationAccount = bankAccountRepository.saveAndFlush(destinationAccount);
    }

    @AfterEach
    void cleanup() {
        transferRepository.deleteAll();
        if (sourceAccount != null && sourceAccount.getId() != null) {
            bankAccountRepository.deleteById(sourceAccount.getId());
        }
        if (destinationAccount != null && destinationAccount.getId() != null) {
            bankAccountRepository.deleteById(destinationAccount.getId());
        }
    }

    @Test
    @Transactional
    @WithMockUser(username = "user")
    void successfulTransfer() throws Exception {
        long transferCountBefore = transferRepository.count();

        Transfer transfer = new Transfer()
            .amount(TRANSFER_AMOUNT)
            .description("Test transfer")
            .sourceAccount(new BankAccount().id(sourceAccount.getId()))
            .destinationAccount(new BankAccount().id(destinationAccount.getId()));

        restTransferMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(transfer)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.amount").value(200.00))
            .andExpect(jsonPath("$.description").value("Test transfer"))
            .andExpect(jsonPath("$.sourceAccount.id").value(sourceAccount.getId().intValue()))
            .andExpect(jsonPath("$.destinationAccount.id").value(destinationAccount.getId().intValue()));

        assertThat(transferRepository.count()).isEqualTo(transferCountBefore + 1);

        // Verify balances updated
        BankAccount updatedSource = bankAccountRepository.findById(sourceAccount.getId()).orElseThrow();
        BankAccount updatedDest = bankAccountRepository.findById(destinationAccount.getId()).orElseThrow();
        assertThat(updatedSource.getBalance()).isEqualByComparingTo(SOURCE_BALANCE.subtract(TRANSFER_AMOUNT));
        assertThat(updatedDest.getBalance()).isEqualByComparingTo(DEST_BALANCE.add(TRANSFER_AMOUNT));
    }

    @Test
    @Transactional
    @WithMockUser(username = "user")
    void transferWithInsufficientFunds() throws Exception {
        Transfer transfer = new Transfer()
            .amount(new BigDecimal("99999.00"))
            .sourceAccount(new BankAccount().id(sourceAccount.getId()))
            .destinationAccount(new BankAccount().id(destinationAccount.getId()));

        restTransferMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(transfer)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @Transactional
    @WithMockUser(username = "user")
    void transferToSameAccount() throws Exception {
        Transfer transfer = new Transfer()
            .amount(TRANSFER_AMOUNT)
            .sourceAccount(new BankAccount().id(sourceAccount.getId()))
            .destinationAccount(new BankAccount().id(sourceAccount.getId()));

        restTransferMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(transfer)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @Transactional
    @WithMockUser(username = "admin")
    void transferFromAccountNotOwnedByUser() throws Exception {
        Transfer transfer = new Transfer()
            .amount(TRANSFER_AMOUNT)
            .sourceAccount(new BankAccount().id(sourceAccount.getId()))
            .destinationAccount(new BankAccount().id(destinationAccount.getId()));

        restTransferMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(transfer)))
            .andExpect(status().isForbidden());
    }

    @Test
    @Transactional
    @WithMockUser(username = "user")
    void transferWithNonExistentSourceAccount() throws Exception {
        Transfer transfer = new Transfer()
            .amount(TRANSFER_AMOUNT)
            .sourceAccount(new BankAccount().id(99999L))
            .destinationAccount(new BankAccount().id(destinationAccount.getId()));

        restTransferMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(transfer)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @Transactional
    @WithMockUser(username = "user")
    void getTransferList() throws Exception {
        // Create a transfer first
        Transfer transfer = new Transfer()
            .amount(TRANSFER_AMOUNT)
            .description("Test transfer")
            .sourceAccount(new BankAccount().id(sourceAccount.getId()))
            .destinationAccount(new BankAccount().id(destinationAccount.getId()));

        restTransferMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(transfer)))
            .andExpect(status().isCreated());

        // Get the list
        restTransferMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[0].amount").value(200.00));
    }

    @Test
    @Transactional
    @WithMockUser(username = "user")
    void getTransferById() throws Exception {
        // Create a transfer first
        Transfer transfer = new Transfer()
            .amount(TRANSFER_AMOUNT)
            .description("Test transfer for detail")
            .sourceAccount(new BankAccount().id(sourceAccount.getId()))
            .destinationAccount(new BankAccount().id(destinationAccount.getId()));

        String response = restTransferMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(transfer)))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();

        Transfer createdTransfer = om.readValue(response, Transfer.class);

        restTransferMockMvc
            .perform(get(ENTITY_API_URL_ID, createdTransfer.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(createdTransfer.getId().intValue()))
            .andExpect(jsonPath("$.description").value("Test transfer for detail"));
    }

    @Test
    @Transactional
    @WithMockUser(username = "user")
    void getNonExistingTransfer() throws Exception {
        restTransferMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }
}

package io.github.jhipster.sample.service;

import io.github.jhipster.sample.domain.BankAccount;
import io.github.jhipster.sample.domain.Transfer;
import io.github.jhipster.sample.repository.BankAccountRepository;
import io.github.jhipster.sample.repository.TransferRepository;
import io.github.jhipster.sample.security.SecurityUtils;
import io.github.jhipster.sample.web.rest.errors.BadRequestAlertException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.ErrorResponseException;
import tech.jhipster.web.rest.errors.ProblemDetailWithCause;

/**
 * Service class for managing transfers between bank accounts.
 */
@Service
@Transactional
public class TransferService {

    private static final Logger LOG = LoggerFactory.getLogger(TransferService.class);

    private static final String ENTITY_NAME = "transfer";

    private final TransferRepository transferRepository;
    private final BankAccountRepository bankAccountRepository;

    public TransferService(TransferRepository transferRepository, BankAccountRepository bankAccountRepository) {
        this.transferRepository = transferRepository;
        this.bankAccountRepository = bankAccountRepository;
    }

    /**
     * Execute a transfer between two bank accounts.
     *
     * @param transfer the transfer to execute.
     * @return the persisted transfer.
     */
    public Transfer executeTransfer(Transfer transfer) {
        LOG.debug("Request to execute Transfer : {}", transfer);

        if (transfer.getSourceAccount() == null || transfer.getSourceAccount().getId() == null) {
            throw new BadRequestAlertException("Source account is required", ENTITY_NAME, "idnotfound");
        }

        if (transfer.getDestinationAccount() == null || transfer.getDestinationAccount().getId() == null) {
            throw new BadRequestAlertException("Destination account is required", ENTITY_NAME, "idnotfound");
        }

        BankAccount sourceAccount = bankAccountRepository
            .findOneWithToOneRelationships(transfer.getSourceAccount().getId())
            .orElseThrow(() -> new BadRequestAlertException("Source account not found", ENTITY_NAME, "idnotfound"));

        BankAccount destinationAccount = bankAccountRepository
            .findOneWithToOneRelationships(transfer.getDestinationAccount().getId())
            .orElseThrow(() -> new BadRequestAlertException("Destination account not found", ENTITY_NAME, "idnotfound"));

        // Validate source != destination
        if (Objects.equals(sourceAccount.getId(), destinationAccount.getId())) {
            throw new BadRequestAlertException("Source and destination accounts must be different", ENTITY_NAME, "sameaccount");
        }

        // Validate ownership
        String currentUserLogin = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new ErrorResponseException(
                HttpStatus.FORBIDDEN,
                ProblemDetailWithCause.ProblemDetailWithCauseBuilder.instance()
                    .withStatus(HttpStatus.FORBIDDEN.value())
                    .withTitle("Forbidden")
                    .withDetail("User is not authenticated")
                    .build(),
                null
            )
        );

        if (sourceAccount.getUser() == null || !currentUserLogin.equals(sourceAccount.getUser().getLogin())) {
            throw new ErrorResponseException(
                HttpStatus.FORBIDDEN,
                ProblemDetailWithCause.ProblemDetailWithCauseBuilder.instance()
                    .withStatus(HttpStatus.FORBIDDEN.value())
                    .withTitle("Forbidden")
                    .withDetail("You can only transfer from your own accounts")
                    .build(),
                null
            );
        }

        // Validate sufficient funds
        if (sourceAccount.getBalance().compareTo(transfer.getAmount()) < 0) {
            throw new BadRequestAlertException("Insufficient funds", ENTITY_NAME, "insufficientfunds");
        }

        // Execute transfer atomically
        sourceAccount.setBalance(sourceAccount.getBalance().subtract(transfer.getAmount()));
        destinationAccount.setBalance(destinationAccount.getBalance().add(transfer.getAmount()));

        bankAccountRepository.save(sourceAccount);
        bankAccountRepository.save(destinationAccount);

        transfer.setSourceAccount(sourceAccount);
        transfer.setDestinationAccount(destinationAccount);
        transfer.setDate(Instant.now());

        return transferRepository.save(transfer);
    }
}

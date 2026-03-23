package io.github.jhipster.sample.service;

import io.github.jhipster.sample.domain.BankAccount;
import io.github.jhipster.sample.domain.Transfer;
import io.github.jhipster.sample.repository.BankAccountRepository;
import io.github.jhipster.sample.repository.TransferRepository;
import io.github.jhipster.sample.security.SecurityUtils;
import io.github.jhipster.sample.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.ErrorResponseException;
import tech.jhipster.web.rest.errors.ProblemDetailWithCause;
import tech.jhipster.web.rest.errors.ProblemDetailWithCause.ProblemDetailWithCauseBuilder;

/**
 * Service for executing account-to-account transfers.
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

        String currentUserLogin = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new BadRequestAlertException("Current user login not found", ENTITY_NAME, "loginnotfound")
        );

        if (transfer.getSourceAccount() == null || transfer.getSourceAccount().getId() == null) {
            throw new BadRequestAlertException("Source account is required", ENTITY_NAME, "idnotfound");
        }
        if (transfer.getDestinationAccount() == null || transfer.getDestinationAccount().getId() == null) {
            throw new BadRequestAlertException("Destination account is required", ENTITY_NAME, "idnotfound");
        }

        Long sourceId = transfer.getSourceAccount().getId();
        Long destinationId = transfer.getDestinationAccount().getId();

        if (sourceId.equals(destinationId)) {
            throw new BadRequestAlertException("Source and destination accounts must be different", ENTITY_NAME, "sameaccount");
        }

        BankAccount sourceAccount = bankAccountRepository
            .findOneWithEagerRelationships(sourceId)
            .orElseThrow(() -> new BadRequestAlertException("Source account not found", ENTITY_NAME, "idnotfound"));

        BankAccount destinationAccount = bankAccountRepository
            .findOneWithEagerRelationships(destinationId)
            .orElseThrow(() -> new BadRequestAlertException("Destination account not found", ENTITY_NAME, "idnotfound"));

        // Verify ownership
        if (sourceAccount.getUser() == null || !currentUserLogin.equals(sourceAccount.getUser().getLogin())) {
            throw new ErrorResponseException(
                HttpStatus.FORBIDDEN,
                ProblemDetailWithCauseBuilder.instance()
                    .withStatus(HttpStatus.FORBIDDEN.value())
                    .withTitle("Forbidden")
                    .withProperty("message", "error.forbidden")
                    .withProperty("params", ENTITY_NAME)
                    .build(),
                null
            );
        }

        // Validate sufficient funds
        if (sourceAccount.getBalance().compareTo(transfer.getAmount()) < 0) {
            throw new BadRequestAlertException(
                "Source account balance (" + sourceAccount.getBalance() + ") is less than transfer amount (" + transfer.getAmount() + ")",
                ENTITY_NAME,
                "insufficientfunds"
            );
        }

        // Execute transfer atomically
        sourceAccount.setBalance(sourceAccount.getBalance().subtract(transfer.getAmount()));
        destinationAccount.setBalance(destinationAccount.getBalance().add(transfer.getAmount()));

        bankAccountRepository.save(sourceAccount);
        bankAccountRepository.save(destinationAccount);

        transfer.setDate(Instant.now());
        transfer.setSourceAccount(sourceAccount);
        transfer.setDestinationAccount(destinationAccount);

        return transferRepository.save(transfer);
    }
}

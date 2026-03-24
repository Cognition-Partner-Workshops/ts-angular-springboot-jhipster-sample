package io.github.jhipster.sample.service;

import io.github.jhipster.sample.domain.BankAccount;
import io.github.jhipster.sample.domain.Transfer;
import io.github.jhipster.sample.repository.BankAccountRepository;
import io.github.jhipster.sample.repository.TransferRepository;
import io.github.jhipster.sample.security.SecurityUtils;
import io.github.jhipster.sample.web.rest.errors.BadRequestAlertException;
import java.math.BigDecimal;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.ErrorResponseException;
import tech.jhipster.web.rest.errors.ProblemDetailWithCause;

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
     * @param transfer the transfer to execute (must have sourceAccount.id, destinationAccount.id, amount set).
     * @return the persisted transfer with updated account balances.
     */
    public Transfer executeTransfer(Transfer transfer) {
        LOG.debug("Request to execute Transfer : {}", transfer);

        Long sourceId = transfer.getSourceAccount().getId();
        Long destId = transfer.getDestinationAccount().getId();

        // Validate source != destination
        if (sourceId.equals(destId)) {
            throw new BadRequestAlertException("Source and destination accounts must be different", ENTITY_NAME, "sameaccount");
        }

        // Load source account
        BankAccount source = bankAccountRepository
            .findOneWithEagerRelationships(sourceId)
            .orElseThrow(() -> new BadRequestAlertException("Source account not found", ENTITY_NAME, "idnotfound"));

        // Load destination account
        BankAccount destination = bankAccountRepository
            .findOneWithEagerRelationships(destId)
            .orElseThrow(() -> new BadRequestAlertException("Destination account not found", ENTITY_NAME, "idnotfound"));

        // Verify ownership — current user must own the source account
        String currentUserLogin = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new ErrorResponseException(
                HttpStatus.FORBIDDEN,
                ProblemDetailWithCause.ProblemDetailWithCauseBuilder.instance()
                    .withStatus(HttpStatus.FORBIDDEN.value())
                    .withTitle("Forbidden")
                    .withDetail("You must be authenticated to perform transfers")
                    .build(),
                null
            )
        );

        if (source.getUser() == null || !currentUserLogin.equals(source.getUser().getLogin())) {
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

        BigDecimal amount = transfer.getAmount();

        // Validate sufficient balance
        if (source.getBalance().compareTo(amount) < 0) {
            throw new BadRequestAlertException(
                "Source account balance (" + source.getBalance() + ") is less than transfer amount (" + amount + ")",
                ENTITY_NAME,
                "insufficientfunds"
            );
        }

        // Execute transfer atomically
        source.setBalance(source.getBalance().subtract(amount));
        destination.setBalance(destination.getBalance().add(amount));

        bankAccountRepository.save(source);
        bankAccountRepository.save(destination);

        transfer.setDate(Instant.now());
        transfer.setSourceAccount(source);
        transfer.setDestinationAccount(destination);

        return transferRepository.save(transfer);
    }
}

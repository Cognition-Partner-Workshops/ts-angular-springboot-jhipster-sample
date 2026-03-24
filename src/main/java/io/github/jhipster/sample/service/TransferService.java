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
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.ErrorResponseException;
import tech.jhipster.web.rest.errors.ProblemDetailWithCause;

/**
 * Service for executing transfers between bank accounts.
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

        // Validate source and destination accounts are provided
        if (transfer.getSourceAccount() == null || transfer.getSourceAccount().getId() == null) {
            throw new BadRequestAlertException("Source account is required", ENTITY_NAME, "sourceaccountrequired");
        }
        if (transfer.getDestinationAccount() == null || transfer.getDestinationAccount().getId() == null) {
            throw new BadRequestAlertException("Destination account is required", ENTITY_NAME, "destinationaccountrequired");
        }

        Long sourceId = transfer.getSourceAccount().getId();
        Long destId = transfer.getDestinationAccount().getId();

        // Validate source != destination
        if (Objects.equals(sourceId, destId)) {
            throw new BadRequestAlertException("Source and destination accounts must be different", ENTITY_NAME, "sameaccount");
        }

        // Load accounts with pessimistic locking (ordered by ID to prevent deadlocks)
        BankAccount firstAccount;
        BankAccount secondAccount;
        if (sourceId < destId) {
            firstAccount = bankAccountRepository
                .findOneForUpdate(sourceId)
                .orElseThrow(() -> new BadRequestAlertException("Source account not found", ENTITY_NAME, "idnotfound"));
            secondAccount = bankAccountRepository
                .findOneForUpdate(destId)
                .orElseThrow(() -> new BadRequestAlertException("Destination account not found", ENTITY_NAME, "idnotfound"));
        } else {
            secondAccount = bankAccountRepository
                .findOneForUpdate(destId)
                .orElseThrow(() -> new BadRequestAlertException("Destination account not found", ENTITY_NAME, "idnotfound"));
            firstAccount = bankAccountRepository
                .findOneForUpdate(sourceId)
                .orElseThrow(() -> new BadRequestAlertException("Source account not found", ENTITY_NAME, "idnotfound"));
        }
        BankAccount sourceAccount = sourceId.equals(firstAccount.getId()) ? firstAccount : secondAccount;
        BankAccount destAccount = destId.equals(firstAccount.getId()) ? firstAccount : secondAccount;

        // Verify ownership - current user must own the source account
        String currentUserLogin = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new ErrorResponseException(HttpStatus.FORBIDDEN));

        if (sourceAccount.getUser() == null || !currentUserLogin.equals(sourceAccount.getUser().getLogin())) {
            throw new ErrorResponseException(
                HttpStatus.FORBIDDEN,
                ProblemDetailWithCause.ProblemDetailWithCauseBuilder.instance()
                    .withStatus(HttpStatus.FORBIDDEN.value())
                    .withTitle("Forbidden")
                    .withDetail("You do not own the source account")
                    .build(),
                null
            );
        }

        // Validate sufficient balance
        BigDecimal amount = transfer.getAmount();
        if (sourceAccount.getBalance().compareTo(amount) < 0) {
            throw new BadRequestAlertException(
                "Source account balance (" + sourceAccount.getBalance() + ") is less than transfer amount (" + amount + ")",
                ENTITY_NAME,
                "insufficientfunds"
            );
        }

        // Execute the transfer atomically
        sourceAccount.setBalance(sourceAccount.getBalance().subtract(amount));
        destAccount.setBalance(destAccount.getBalance().add(amount));

        bankAccountRepository.save(sourceAccount);
        bankAccountRepository.save(destAccount);

        // Set date and persist transfer
        transfer.setDate(Instant.now());
        transfer.setSourceAccount(sourceAccount);
        transfer.setDestinationAccount(destAccount);

        return transferRepository.save(transfer);
    }

    /**
     * Get all transfers for the current user, paginated.
     *
     * @param pageable the pagination information.
     * @return the list of transfers.
     */
    @Transactional(readOnly = true)
    public Page<Transfer> findAllForCurrentUser(Pageable pageable) {
        LOG.debug("Request to get all Transfers for current user");
        return transferRepository.findAllForCurrentUser(pageable);
    }

    /**
     * Get one transfer by id.
     *
     * @param id the id of the transfer.
     * @return the transfer.
     */
    @Transactional(readOnly = true)
    public Optional<Transfer> findOne(Long id) {
        LOG.debug("Request to get Transfer : {}", id);
        Optional<Transfer> transfer = transferRepository.findOneWithEagerRelationships(id);

        // Verify the current user has access
        if (transfer.isPresent()) {
            String currentUserLogin = SecurityUtils.getCurrentUserLogin().orElse("");
            Transfer t = transfer.get();
            boolean ownsSource =
                t.getSourceAccount() != null &&
                t.getSourceAccount().getUser() != null &&
                currentUserLogin.equals(t.getSourceAccount().getUser().getLogin());
            boolean ownsDest =
                t.getDestinationAccount() != null &&
                t.getDestinationAccount().getUser() != null &&
                currentUserLogin.equals(t.getDestinationAccount().getUser().getLogin());
            if (!ownsSource && !ownsDest) {
                return Optional.empty();
            }
        }

        return transfer;
    }
}

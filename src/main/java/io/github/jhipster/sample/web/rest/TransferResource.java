package io.github.jhipster.sample.web.rest;

import io.github.jhipster.sample.domain.BankAccount;
import io.github.jhipster.sample.domain.Transfer;
import io.github.jhipster.sample.repository.BankAccountRepository;
import io.github.jhipster.sample.repository.TransferRepository;
import io.github.jhipster.sample.security.SecurityUtils;
import io.github.jhipster.sample.service.TransferService;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link io.github.jhipster.sample.domain.Transfer}.
 */
@RestController
@RequestMapping("/api/transfers")
public class TransferResource {

    private static final Logger LOG = LoggerFactory.getLogger(TransferResource.class);

    private static final String ENTITY_NAME = "transfer";

    @Value("${jhipster.clientApp.name:jhipsterSampleApplication}")
    private String applicationName;

    private final TransferService transferService;
    private final TransferRepository transferRepository;
    private final BankAccountRepository bankAccountRepository;

    public TransferResource(
        TransferService transferService,
        TransferRepository transferRepository,
        BankAccountRepository bankAccountRepository
    ) {
        this.transferService = transferService;
        this.transferRepository = transferRepository;
        this.bankAccountRepository = bankAccountRepository;
    }

    /**
     * {@code POST  /transfers} : Execute a new transfer.
     *
     * @param transfer the transfer to execute.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new transfer.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Transfer> createTransfer(@Valid @RequestBody Transfer transfer) throws URISyntaxException {
        LOG.debug("REST request to execute Transfer : {}", transfer);
        Transfer result = transferService.executeTransfer(transfer);
        return ResponseEntity.created(new URI("/api/transfers/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /transfers} : get all transfers for the current user.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of transfers in body.
     */
    @GetMapping("")
    public ResponseEntity<?> getAllTransfers(Pageable pageable) {
        LOG.debug("REST request to get a page of Transfers");
        String login = SecurityUtils.getCurrentUserLogin().orElse("");
        Page<Transfer> page = transferRepository.findAllByUserLogin(login, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /transfers/:id} : get the "id" transfer.
     *
     * @param id the id of the transfer to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the transfer, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Transfer> getTransfer(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Transfer : {}", id);
        String login = SecurityUtils.getCurrentUserLogin().orElse("");
        Optional<Transfer> transfer = transferRepository
            .findOneWithEagerRelationships(id)
            .filter(t -> {
                String sourceLogin =
                    t.getSourceAccount() != null && t.getSourceAccount().getUser() != null
                        ? t.getSourceAccount().getUser().getLogin()
                        : null;
                String destLogin =
                    t.getDestinationAccount() != null && t.getDestinationAccount().getUser() != null
                        ? t.getDestinationAccount().getUser().getLogin()
                        : null;
                return login.equals(sourceLogin) || login.equals(destLogin);
            });
        return ResponseUtil.wrapOrNotFound(transfer);
    }

    /**
     * {@code GET  /transfers/by-account/:accountId} : get transfers for a specific account.
     *
     * @param accountId the id of the bank account.
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of transfers in body.
     */
    @GetMapping("/by-account/{accountId}")
    public ResponseEntity<?> getTransfersByAccount(@PathVariable("accountId") Long accountId, Pageable pageable) {
        LOG.debug("REST request to get Transfers for account : {}", accountId);
        // Verify current user owns the account
        String login = SecurityUtils.getCurrentUserLogin().orElse("");
        BankAccount account = bankAccountRepository.findOneWithEagerRelationships(accountId).orElse(null);
        if (account == null || account.getUser() == null || !login.equals(account.getUser().getLogin())) {
            return ResponseEntity.ok().body(Collections.emptyList());
        }
        Page<Transfer> page = transferRepository.findAllByAccountId(accountId, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}

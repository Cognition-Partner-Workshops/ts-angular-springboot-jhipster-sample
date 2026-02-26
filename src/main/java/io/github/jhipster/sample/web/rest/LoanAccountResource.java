package io.github.jhipster.sample.web.rest;

import io.github.jhipster.sample.domain.LoanAccount;
import io.github.jhipster.sample.repository.LoanAccountRepository;
import io.github.jhipster.sample.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Consumer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link io.github.jhipster.sample.domain.LoanAccount}.
 */
@RestController
@RequestMapping("/api/loan-accounts")
@Transactional
public class LoanAccountResource {

    private static final Logger LOG = LoggerFactory.getLogger(LoanAccountResource.class);

    private static final String ENTITY_NAME = "loanAccount";

    @Value("${jhipster.clientApp.name:jhipsterSampleApplication}")
    private String applicationName;

    private final LoanAccountRepository loanAccountRepository;

    public LoanAccountResource(LoanAccountRepository loanAccountRepository) {
        this.loanAccountRepository = loanAccountRepository;
    }

    /**
     * {@code POST  /loan-accounts} : Create a new loanAccount.
     *
     * @param loanAccount the loanAccount to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new loanAccount, or with status {@code 400 (Bad Request)} if the loanAccount has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<LoanAccount> createLoanAccount(@Valid @RequestBody LoanAccount loanAccount) throws URISyntaxException {
        LOG.debug("REST request to save LoanAccount : {}", loanAccount);
        if (loanAccount.getId() != null) {
            throw new BadRequestAlertException("A new loanAccount cannot already have an ID", ENTITY_NAME, "idexists");
        }
        loanAccount.computeAndSetMonthlyPayment();
        loanAccount = loanAccountRepository.save(loanAccount);
        return ResponseEntity.created(new URI("/api/loan-accounts/" + loanAccount.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, loanAccount.getId().toString()))
            .body(loanAccount);
    }

    /**
     * {@code PUT  /loan-accounts/:id} : Updates an existing loanAccount.
     *
     * @param id the id of the loanAccount to save.
     * @param loanAccount the loanAccount to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated loanAccount,
     * or with status {@code 400 (Bad Request)} if the loanAccount is not valid,
     * or with status {@code 500 (Internal Server Error)} if the loanAccount couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<LoanAccount> updateLoanAccount(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody LoanAccount loanAccount
    ) throws URISyntaxException {
        LOG.debug("REST request to update LoanAccount : {}, {}", id, loanAccount);
        if (loanAccount.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, loanAccount.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!loanAccountRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        loanAccount.computeAndSetMonthlyPayment();
        loanAccount = loanAccountRepository.save(loanAccount);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, loanAccount.getId().toString()))
            .body(loanAccount);
    }

    /**
     * {@code PATCH  /loan-accounts/:id} : Partial updates given fields of an existing loanAccount, field will ignore if it is null
     *
     * @param id the id of the loanAccount to save.
     * @param loanAccount the loanAccount to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated loanAccount,
     * or with status {@code 400 (Bad Request)} if the loanAccount is not valid,
     * or with status {@code 404 (Not Found)} if the loanAccount is not found,
     * or with status {@code 500 (Internal Server Error)} if the loanAccount couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<LoanAccount> partialUpdateLoanAccount(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody LoanAccount loanAccount
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update LoanAccount partially : {}, {}", id, loanAccount);
        if (loanAccount.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, loanAccount.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!loanAccountRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<LoanAccount> result = loanAccountRepository
            .findById(loanAccount.getId())
            .map(existingLoanAccount -> {
                updateIfPresent(existingLoanAccount::setAccountName, loanAccount.getAccountName());
                updateIfPresent(existingLoanAccount::setLoanAmount, loanAccount.getLoanAmount());
                updateIfPresent(existingLoanAccount::setInterestRate, loanAccount.getInterestRate());
                updateIfPresent(existingLoanAccount::setTermMonths, loanAccount.getTermMonths());
                updateIfPresent(existingLoanAccount::setMonthlyPayment, loanAccount.getMonthlyPayment());
                updateIfPresent(existingLoanAccount::setRemainingBalance, loanAccount.getRemainingBalance());

                return existingLoanAccount;
            })
            .map(updated -> {
                updated.computeAndSetMonthlyPayment();
                return updated;
            })
            .map(loanAccountRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, loanAccount.getId().toString())
        );
    }

    /**
     * {@code GET  /loan-accounts} : get all the loanAccounts.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of loanAccounts in body.
     */
    @GetMapping("")
    public List<LoanAccount> getAllLoanAccounts(
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get all LoanAccounts");
        if (eagerload) {
            return loanAccountRepository.findAllWithEagerRelationships();
        } else {
            return loanAccountRepository.findAll();
        }
    }

    /**
     * {@code GET  /loan-accounts/:id} : get the "id" loanAccount.
     *
     * @param id the id of the loanAccount to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the loanAccount, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LoanAccount> getLoanAccount(@PathVariable("id") Long id) {
        LOG.debug("REST request to get LoanAccount : {}", id);
        Optional<LoanAccount> loanAccount = loanAccountRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(loanAccount);
    }

    /**
     * {@code DELETE  /loan-accounts/:id} : delete the "id" loanAccount.
     *
     * @param id the id of the loanAccount to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLoanAccount(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete LoanAccount : {}", id);
        loanAccountRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code GET  /loan-accounts/:id/amortization} : get the amortization schedule for the "id" loanAccount.
     *
     * @param id the id of the loanAccount.
     * @return the amortization schedule as a list of payment details.
     */
    @GetMapping("/{id}/amortization")
    public ResponseEntity<List<Map<String, Object>>> getAmortizationSchedule(@PathVariable("id") Long id) {
        LOG.debug("REST request to get amortization schedule for LoanAccount : {}", id);
        Optional<LoanAccount> optionalLoan = loanAccountRepository.findById(id);
        if (optionalLoan.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        LoanAccount loan = optionalLoan.get();
        List<Map<String, Object>> schedule = computeAmortizationSchedule(loan);
        return ResponseEntity.ok(schedule);
    }

    private List<Map<String, Object>> computeAmortizationSchedule(LoanAccount loan) {
        List<Map<String, Object>> schedule = new ArrayList<>();
        BigDecimal balance = loan.getLoanAmount();
        BigDecimal monthlyPayment = loan.getMonthlyPayment();
        BigDecimal annualRate = loan.getInterestRate().divide(BigDecimal.valueOf(100), 10, java.math.RoundingMode.HALF_UP);
        BigDecimal monthlyRate = annualRate.divide(BigDecimal.valueOf(12), 10, java.math.RoundingMode.HALF_UP);
        int n = loan.getTermMonths();

        for (int month = 1; month <= n; month++) {
            BigDecimal interestPayment = balance.multiply(monthlyRate).setScale(2, java.math.RoundingMode.HALF_UP);
            BigDecimal principalPayment = monthlyPayment.subtract(interestPayment);

            // Ensure last payment clears the balance exactly
            if (month == n) {
                principalPayment = balance;
                monthlyPayment = principalPayment.add(interestPayment);
            }

            balance = balance.subtract(principalPayment);
            if (balance.compareTo(BigDecimal.ZERO) < 0) {
                balance = BigDecimal.ZERO;
            }

            Map<String, Object> entry = new HashMap<>();
            entry.put("month", month);
            entry.put("payment", monthlyPayment.setScale(2, java.math.RoundingMode.HALF_UP));
            entry.put("principal", principalPayment.setScale(2, java.math.RoundingMode.HALF_UP));
            entry.put("interest", interestPayment.setScale(2, java.math.RoundingMode.HALF_UP));
            entry.put("remainingBalance", balance.setScale(2, java.math.RoundingMode.HALF_UP));
            schedule.add(entry);
        }

        return schedule;
    }

    private <T> void updateIfPresent(Consumer<T> setter, T value) {
        if (value != null) {
            setter.accept(value);
        }
    }
}

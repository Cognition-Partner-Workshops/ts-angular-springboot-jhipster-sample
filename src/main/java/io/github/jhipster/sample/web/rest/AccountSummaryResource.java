package io.github.jhipster.sample.web.rest;

import io.github.jhipster.sample.service.AccountSummaryService;
import io.github.jhipster.sample.service.dto.AccountSummaryDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for the account summary dashboard.
 */
@RestController
@RequestMapping("/api")
public class AccountSummaryResource {

    private static final Logger LOG = LoggerFactory.getLogger(AccountSummaryResource.class);

    private final AccountSummaryService accountSummaryService;

    public AccountSummaryResource(AccountSummaryService accountSummaryService) {
        this.accountSummaryService = accountSummaryService;
    }

    /**
     * {@code GET  /account-summary} : get the aggregated summary of all bank accounts and operations.
     *
     * @return the {@link AccountSummaryDTO} with status {@code 200 (OK)}.
     */
    @GetMapping("/account-summary")
    public AccountSummaryDTO getAccountSummary() {
        LOG.debug("REST request to get the account summary");
        return accountSummaryService.getAccountSummary();
    }
}

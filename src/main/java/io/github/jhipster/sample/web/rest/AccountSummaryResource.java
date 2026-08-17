package io.github.jhipster.sample.web.rest;

import io.github.jhipster.sample.service.AccountSummaryService;
import io.github.jhipster.sample.service.dto.AccountSummaryDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account-summary")
public class AccountSummaryResource {

    private final AccountSummaryService accountSummaryService;

    public AccountSummaryResource(AccountSummaryService accountSummaryService) {
        this.accountSummaryService = accountSummaryService;
    }

    @GetMapping("")
    public AccountSummaryDTO getSummary() {
        return accountSummaryService.getSummary();
    }
}

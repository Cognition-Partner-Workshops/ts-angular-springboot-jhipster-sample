package io.github.jhipster.sample.service;

import io.github.jhipster.sample.repository.BankAccountRepository;
import io.github.jhipster.sample.repository.OperationRepository;
import io.github.jhipster.sample.service.dto.AccountBalanceDTO;
import io.github.jhipster.sample.service.dto.AccountSummaryDTO;
import io.github.jhipster.sample.service.dto.RecentOperationDTO;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountSummaryService {

    private final BankAccountRepository bankAccountRepository;
    private final OperationRepository operationRepository;

    public AccountSummaryService(BankAccountRepository bankAccountRepository, OperationRepository operationRepository) {
        this.bankAccountRepository = bankAccountRepository;
        this.operationRepository = operationRepository;
    }

    @Transactional(readOnly = true)
    public AccountSummaryDTO getSummary() {
        List<Object[]> accountRows = bankAccountRepository.findSummaryData();
        Map<Long, Long> operationCounts = operationRepository
            .countByBankAccount()
            .stream()
            .collect(Collectors.toMap(row -> (Long) row[0], row -> (Long) row[1]));
        List<AccountBalanceDTO> accounts = accountRows
            .stream()
            .map(row ->
                new AccountBalanceDTO((Long) row[0], (String) row[1], (BigDecimal) row[2], operationCounts.getOrDefault((Long) row[0], 0L))
            )
            .toList();

        AccountSummaryDTO summary = new AccountSummaryDTO();
        summary.setTotalBalance(
            accountRows
                .stream()
                .map(row -> (BigDecimal) row[2])
                .reduce(BigDecimal.ZERO, BigDecimal::add)
        );
        summary.setAccountCount(accounts.size());
        summary.setOperationCount(operationRepository.countAllOperations());
        summary.setAccounts(accounts);
        summary.setRecentOperations(
            operationRepository.findRecentOperations(PageRequest.of(0, 10)).stream().map(RecentOperationDTO::new).toList()
        );
        return summary;
    }
}

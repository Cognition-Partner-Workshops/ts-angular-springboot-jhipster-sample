package io.github.jhipster.sample.service;

import io.github.jhipster.sample.repository.BankAccountRepository;
import io.github.jhipster.sample.repository.BankAccountRepository.AccountBalanceProjection;
import io.github.jhipster.sample.repository.OperationRepository;
import io.github.jhipster.sample.repository.OperationRepository.RecentOperationProjection;
import io.github.jhipster.sample.service.dto.AccountBalanceDTO;
import io.github.jhipster.sample.service.dto.AccountSummaryDTO;
import io.github.jhipster.sample.service.dto.RecentOperationDTO;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service computing the aggregated account summary of the dashboard.
 */
@Service
@Transactional(readOnly = true)
public class AccountSummaryService {

    private static final int RECENT_OPERATIONS_LIMIT = 10;

    private static final Logger LOG = LoggerFactory.getLogger(AccountSummaryService.class);

    private final BankAccountRepository bankAccountRepository;

    private final OperationRepository operationRepository;

    public AccountSummaryService(BankAccountRepository bankAccountRepository, OperationRepository operationRepository) {
        this.bankAccountRepository = bankAccountRepository;
        this.operationRepository = operationRepository;
    }

    /**
     * Aggregate balances and operations over all bank accounts.
     *
     * @return the account summary.
     */
    public AccountSummaryDTO getAccountSummary() {
        LOG.debug("Computing the account summary");
        List<AccountBalanceDTO> accounts = bankAccountRepository.findBalancesWithOperationCount().stream().map(this::toDto).toList();
        List<RecentOperationDTO> recentOperations = operationRepository
            .findRecentOperations(PageRequest.of(0, RECENT_OPERATIONS_LIMIT))
            .stream()
            .map(this::toDto)
            .toList();

        AccountSummaryDTO summary = new AccountSummaryDTO();
        summary.setTotalBalance(bankAccountRepository.sumBalances());
        summary.setAccountCount(accounts.size());
        summary.setOperationCount(operationRepository.count());
        summary.setAccounts(accounts);
        summary.setRecentOperations(recentOperations);
        return summary;
    }

    private AccountBalanceDTO toDto(AccountBalanceProjection projection) {
        return new AccountBalanceDTO(projection.getId(), projection.getName(), projection.getBalance(), projection.getOperationCount());
    }

    private RecentOperationDTO toDto(RecentOperationProjection projection) {
        return new RecentOperationDTO(
            projection.getId(),
            projection.getDate(),
            projection.getDescription(),
            projection.getAmount(),
            projection.getBankAccountName()
        );
    }
}

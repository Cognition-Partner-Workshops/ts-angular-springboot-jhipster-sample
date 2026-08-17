package io.github.jhipster.sample.service.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class AccountSummaryDTO {

    private BigDecimal totalBalance = BigDecimal.ZERO.setScale(2);
    private long accountCount;
    private long operationCount;
    private List<AccountBalanceDTO> accounts = new ArrayList<>();
    private List<RecentOperationDTO> recentOperations = new ArrayList<>();

    public BigDecimal getTotalBalance() {
        return totalBalance;
    }

    public void setTotalBalance(BigDecimal totalBalance) {
        this.totalBalance = totalBalance == null ? BigDecimal.ZERO.setScale(2) : totalBalance.setScale(2);
    }

    public long getAccountCount() {
        return accountCount;
    }

    public void setAccountCount(long accountCount) {
        this.accountCount = accountCount;
    }

    public long getOperationCount() {
        return operationCount;
    }

    public void setOperationCount(long operationCount) {
        this.operationCount = operationCount;
    }

    public List<AccountBalanceDTO> getAccounts() {
        return accounts;
    }

    public void setAccounts(List<AccountBalanceDTO> accounts) {
        this.accounts = accounts == null ? new ArrayList<>() : accounts;
    }

    public List<RecentOperationDTO> getRecentOperations() {
        return recentOperations;
    }

    public void setRecentOperations(List<RecentOperationDTO> recentOperations) {
        this.recentOperations = recentOperations == null ? new ArrayList<>() : recentOperations;
    }
}

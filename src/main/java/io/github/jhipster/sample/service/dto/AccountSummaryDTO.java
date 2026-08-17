package io.github.jhipster.sample.service.dto;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * A DTO representing the aggregated account summary of the dashboard.
 */
public class AccountSummaryDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private BigDecimal totalBalance = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

    private long accountCount;

    private long operationCount;

    private List<AccountBalanceDTO> accounts = new ArrayList<>();

    private List<RecentOperationDTO> recentOperations = new ArrayList<>();

    public BigDecimal getTotalBalance() {
        return totalBalance;
    }

    public void setTotalBalance(BigDecimal totalBalance) {
        this.totalBalance = (totalBalance == null ? BigDecimal.ZERO : totalBalance).setScale(2, RoundingMode.HALF_UP);
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

    // prettier-ignore
    @Override
    public String toString() {
        return "AccountSummaryDTO{" +
            "totalBalance=" + totalBalance +
            ", accountCount=" + accountCount +
            ", operationCount=" + operationCount +
            ", accounts=" + accounts +
            ", recentOperations=" + recentOperations +
            "}";
    }
}

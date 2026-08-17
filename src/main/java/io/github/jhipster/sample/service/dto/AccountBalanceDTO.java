package io.github.jhipster.sample.service.dto;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * A DTO representing a bank account balance with its operation count.
 */
public class AccountBalanceDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String name;

    private BigDecimal balance;

    private long operationCount;

    public AccountBalanceDTO() {
        // Empty constructor needed for Jackson.
    }

    public AccountBalanceDTO(Long id, String name, BigDecimal balance, Long operationCount) {
        this.id = id;
        this.name = name;
        this.setBalance(balance);
        this.operationCount = operationCount == null ? 0 : operationCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance == null ? null : balance.setScale(2, RoundingMode.HALF_UP);
    }

    public long getOperationCount() {
        return operationCount;
    }

    public void setOperationCount(long operationCount) {
        this.operationCount = operationCount;
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AccountBalanceDTO{" +
            "id=" + id +
            ", name='" + name + "'" +
            ", balance=" + balance +
            ", operationCount=" + operationCount +
            "}";
    }
}

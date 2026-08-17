package io.github.jhipster.sample.service.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class AccountBalanceDTO {

    private Long id;
    private String name;
    private BigDecimal balance;
    private long operationCount;

    public AccountBalanceDTO() {}

    public AccountBalanceDTO(Long id, String name, BigDecimal balance, long operationCount) {
        this.id = id;
        this.name = name;
        this.balance = balance.setScale(2, RoundingMode.HALF_UP);
        this.operationCount = operationCount;
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
}

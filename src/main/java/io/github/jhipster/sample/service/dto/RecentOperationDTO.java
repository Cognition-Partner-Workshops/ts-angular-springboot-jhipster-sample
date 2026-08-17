package io.github.jhipster.sample.service.dto;

import io.github.jhipster.sample.domain.Operation;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

public class RecentOperationDTO {

    private Long id;
    private Instant date;
    private String description;
    private BigDecimal amount;
    private String bankAccountName;

    public RecentOperationDTO() {}

    public RecentOperationDTO(Operation operation) {
        this.id = operation.getId();
        this.date = operation.getDate();
        this.description = operation.getDescription();
        this.amount = operation.getAmount().setScale(2, RoundingMode.HALF_UP);
        this.bankAccountName = operation.getBankAccount() == null ? null : operation.getBankAccount().getName();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount == null ? null : amount.setScale(2, RoundingMode.HALF_UP);
    }

    public String getBankAccountName() {
        return bankAccountName;
    }

    public void setBankAccountName(String bankAccountName) {
        this.bankAccountName = bankAccountName;
    }
}

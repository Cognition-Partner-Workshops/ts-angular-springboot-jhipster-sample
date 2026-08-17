package io.github.jhipster.sample.service.dto;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

/**
 * A DTO representing a recent operation shown on the account summary dashboard.
 */
public class RecentOperationDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private Instant date;

    private String description;

    private BigDecimal amount;

    private String bankAccountName;

    public RecentOperationDTO() {
        // Empty constructor needed for Jackson.
    }

    public RecentOperationDTO(Long id, Instant date, String description, BigDecimal amount, String bankAccountName) {
        this.id = id;
        this.date = date;
        this.description = description;
        this.setAmount(amount);
        this.bankAccountName = bankAccountName;
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

    // prettier-ignore
    @Override
    public String toString() {
        return "RecentOperationDTO{" +
            "id=" + id +
            ", date='" + date + "'" +
            ", description='" + description + "'" +
            ", amount=" + amount +
            ", bankAccountName='" + bankAccountName + "'" +
            "}";
    }
}

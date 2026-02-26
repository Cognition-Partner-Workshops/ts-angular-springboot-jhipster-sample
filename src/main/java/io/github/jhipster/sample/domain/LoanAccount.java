package io.github.jhipster.sample.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A LoanAccount.
 */
@Entity
@Table(name = "loan_account")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class LoanAccount implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "account_name", nullable = false)
    private String accountName;

    @NotNull
    @DecimalMin(value = "0")
    @Column(name = "loan_amount", precision = 21, scale = 2, nullable = false)
    private BigDecimal loanAmount;

    @NotNull
    @DecimalMin(value = "0")
    @Column(name = "interest_rate", precision = 10, scale = 6, nullable = false)
    private BigDecimal interestRate;

    @NotNull
    @Min(value = 1)
    @Column(name = "term_months", nullable = false)
    private Integer termMonths;

    @Column(name = "monthly_payment", precision = 21, scale = 2)
    private BigDecimal monthlyPayment;

    @Column(name = "remaining_balance", precision = 21, scale = 2)
    private BigDecimal remainingBalance;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public LoanAccount id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAccountName() {
        return this.accountName;
    }

    public LoanAccount accountName(String accountName) {
        this.setAccountName(accountName);
        return this;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public BigDecimal getLoanAmount() {
        return this.loanAmount;
    }

    public LoanAccount loanAmount(BigDecimal loanAmount) {
        this.setLoanAmount(loanAmount);
        return this;
    }

    public void setLoanAmount(BigDecimal loanAmount) {
        this.loanAmount = loanAmount;
    }

    public BigDecimal getInterestRate() {
        return this.interestRate;
    }

    public LoanAccount interestRate(BigDecimal interestRate) {
        this.setInterestRate(interestRate);
        return this;
    }

    public void setInterestRate(BigDecimal interestRate) {
        this.interestRate = interestRate;
    }

    public Integer getTermMonths() {
        return this.termMonths;
    }

    public LoanAccount termMonths(Integer termMonths) {
        this.setTermMonths(termMonths);
        return this;
    }

    public void setTermMonths(Integer termMonths) {
        this.termMonths = termMonths;
    }

    public BigDecimal getMonthlyPayment() {
        return this.monthlyPayment;
    }

    public LoanAccount monthlyPayment(BigDecimal monthlyPayment) {
        this.setMonthlyPayment(monthlyPayment);
        return this;
    }

    public void setMonthlyPayment(BigDecimal monthlyPayment) {
        this.monthlyPayment = monthlyPayment;
    }

    public BigDecimal getRemainingBalance() {
        return this.remainingBalance;
    }

    public LoanAccount remainingBalance(BigDecimal remainingBalance) {
        this.setRemainingBalance(remainingBalance);
        return this;
    }

    public void setRemainingBalance(BigDecimal remainingBalance) {
        this.remainingBalance = remainingBalance;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LoanAccount user(User user) {
        this.setUser(user);
        return this;
    }

    /**
     * Calculates the monthly payment using the standard amortization formula:
     * monthlyPayment = P * [r(1+r)^n] / [(1+r)^n - 1]
     * where P = principal (loanAmount), r = monthly interest rate, n = term in months.
     *
     * If the interest rate is zero, the monthly payment is simply P / n.
     *
     * @return the calculated monthly payment, rounded to 2 decimal places
     */
    public BigDecimal calculateMonthlyPayment() {
        if (this.loanAmount == null || this.interestRate == null || this.termMonths == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal principal = this.loanAmount;
        int n = this.termMonths;

        // Annual rate as a decimal (e.g. 5.0 means 5%)
        BigDecimal annualRate = this.interestRate.divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP);

        if (annualRate.compareTo(BigDecimal.ZERO) == 0) {
            // Zero-interest loan
            return principal.divide(BigDecimal.valueOf(n), 2, RoundingMode.HALF_UP);
        }

        BigDecimal monthlyRate = annualRate.divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP);

        // (1 + r)^n
        MathContext mc = new MathContext(20);
        BigDecimal onePlusR = BigDecimal.ONE.add(monthlyRate);
        BigDecimal onePlusRPowerN = onePlusR.pow(n, mc);

        // numerator = P * r * (1+r)^n
        BigDecimal numerator = principal.multiply(monthlyRate).multiply(onePlusRPowerN);

        // denominator = (1+r)^n - 1
        BigDecimal denominator = onePlusRPowerN.subtract(BigDecimal.ONE);

        return numerator.divide(denominator, 2, RoundingMode.HALF_UP);
    }

    /**
     * Computes the monthly payment and sets it on this entity, also initializes remaining balance.
     */
    public void computeAndSetMonthlyPayment() {
        this.monthlyPayment = calculateMonthlyPayment();
        if (this.remainingBalance == null) {
            this.remainingBalance = this.loanAmount;
        }
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof LoanAccount)) {
            return false;
        }
        return getId() != null && getId().equals(((LoanAccount) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "LoanAccount{" +
            "id=" + getId() +
            ", accountName='" + getAccountName() + "'" +
            ", loanAmount=" + getLoanAmount() +
            ", interestRate=" + getInterestRate() +
            ", termMonths=" + getTermMonths() +
            ", monthlyPayment=" + getMonthlyPayment() +
            ", remainingBalance=" + getRemainingBalance() +
            "}";
    }
}

package io.github.jhipster.sample.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import java.math.BigDecimal;
import java.math.RoundingMode;
import org.junit.jupiter.api.Test;

/**
 * Unit tests for {@link LoanAccount} interest calculation logic.
 */
class LoanAccountTest {

    /**
     * Test case 1: Standard 30-year mortgage at 6% interest.
     * P = 200,000, r = 6% annual (0.5% monthly), n = 360 months
     * Expected monthly payment: $1,199.10 (well-known result)
     */
    @Test
    void testCalculateMonthlyPayment_standardMortgage() {
        LoanAccount loan = new LoanAccount();
        loan.setLoanAmount(new BigDecimal("200000.00"));
        loan.setInterestRate(new BigDecimal("6.0"));
        loan.setTermMonths(360);

        BigDecimal payment = loan.calculateMonthlyPayment();

        assertThat(payment).isEqualByComparingTo(new BigDecimal("1199.10"));
    }

    /**
     * Test case 2: 5-year car loan at 5% interest.
     * P = 25,000, r = 5% annual, n = 60 months
     * Expected monthly payment: $471.78
     */
    @Test
    void testCalculateMonthlyPayment_carLoan() {
        LoanAccount loan = new LoanAccount();
        loan.setLoanAmount(new BigDecimal("25000.00"));
        loan.setInterestRate(new BigDecimal("5.0"));
        loan.setTermMonths(60);

        BigDecimal payment = loan.calculateMonthlyPayment();

        assertThat(payment).isEqualByComparingTo(new BigDecimal("471.78"));
    }

    /**
     * Test case 3: Zero interest loan.
     * P = 12,000, r = 0%, n = 12 months
     * Expected monthly payment: $1,000.00
     */
    @Test
    void testCalculateMonthlyPayment_zeroInterest() {
        LoanAccount loan = new LoanAccount();
        loan.setLoanAmount(new BigDecimal("12000.00"));
        loan.setInterestRate(BigDecimal.ZERO);
        loan.setTermMonths(12);

        BigDecimal payment = loan.calculateMonthlyPayment();

        assertThat(payment).isEqualByComparingTo(new BigDecimal("1000.00"));
    }

    /**
     * Test case 4: Short-term high-interest personal loan.
     * P = 10,000, r = 12% annual (1% monthly), n = 24 months
     * Expected monthly payment: $470.73
     */
    @Test
    void testCalculateMonthlyPayment_highInterestShortTerm() {
        LoanAccount loan = new LoanAccount();
        loan.setLoanAmount(new BigDecimal("10000.00"));
        loan.setInterestRate(new BigDecimal("12.0"));
        loan.setTermMonths(24);

        BigDecimal payment = loan.calculateMonthlyPayment();

        assertThat(payment).isEqualByComparingTo(new BigDecimal("470.73"));
    }

    /**
     * Test case 5: 15-year mortgage at 3.5%.
     * P = 300,000, r = 3.5% annual, n = 180 months
     * Expected monthly payment: $2,145.22
     */
    @Test
    void testCalculateMonthlyPayment_15yearMortgage() {
        LoanAccount loan = new LoanAccount();
        loan.setLoanAmount(new BigDecimal("300000.00"));
        loan.setInterestRate(new BigDecimal("3.5"));
        loan.setTermMonths(180);

        BigDecimal payment = loan.calculateMonthlyPayment();

        assertThat(payment).isEqualByComparingTo(new BigDecimal("2145.22"));
    }

    /**
     * Test case 6: Null fields should return zero.
     */
    @Test
    void testCalculateMonthlyPayment_nullFields() {
        LoanAccount loan = new LoanAccount();

        BigDecimal payment = loan.calculateMonthlyPayment();

        assertThat(payment).isEqualByComparingTo(BigDecimal.ZERO);
    }

    /**
     * Test that computeAndSetMonthlyPayment sets the monthly payment and remaining balance.
     */
    @Test
    void testComputeAndSetMonthlyPayment() {
        LoanAccount loan = new LoanAccount();
        loan.setLoanAmount(new BigDecimal("200000.00"));
        loan.setInterestRate(new BigDecimal("6.0"));
        loan.setTermMonths(360);

        loan.computeAndSetMonthlyPayment();

        assertThat(loan.getMonthlyPayment()).isEqualByComparingTo(new BigDecimal("1199.10"));
        assertThat(loan.getRemainingBalance()).isEqualByComparingTo(new BigDecimal("200000.00"));
    }

    /**
     * Test that computeAndSetMonthlyPayment preserves existing remaining balance.
     */
    @Test
    void testComputeAndSetMonthlyPayment_preservesExistingBalance() {
        LoanAccount loan = new LoanAccount();
        loan.setLoanAmount(new BigDecimal("200000.00"));
        loan.setInterestRate(new BigDecimal("6.0"));
        loan.setTermMonths(360);
        loan.setRemainingBalance(new BigDecimal("150000.00"));

        loan.computeAndSetMonthlyPayment();

        assertThat(loan.getMonthlyPayment()).isEqualByComparingTo(new BigDecimal("1199.10"));
        // Existing remaining balance should be preserved
        assertThat(loan.getRemainingBalance()).isEqualByComparingTo(new BigDecimal("150000.00"));
    }

    @Test
    void equalsVerifier() throws Exception {
        LoanAccount loanAccount1 = new LoanAccount();
        loanAccount1.setId(1L);
        LoanAccount loanAccount2 = new LoanAccount();
        loanAccount2.setId(loanAccount1.getId());
        assertThat(loanAccount1).isEqualTo(loanAccount2);
        loanAccount2.setId(2L);
        assertThat(loanAccount1).isNotEqualTo(loanAccount2);
        loanAccount1.setId(null);
        assertThat(loanAccount1).isNotEqualTo(loanAccount2);
    }
}

package io.github.jhipster.sample.repository;

import io.github.jhipster.sample.domain.LoanAccount;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the LoanAccount entity.
 */
@Repository
public interface LoanAccountRepository extends JpaRepository<LoanAccount, Long> {
    @Query("select loanAccount from LoanAccount loanAccount where loanAccount.user.login = ?#{authentication.name}")
    List<LoanAccount> findByUserIsCurrentUser();

    default Optional<LoanAccount> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<LoanAccount> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<LoanAccount> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select loanAccount from LoanAccount loanAccount left join fetch loanAccount.user",
        countQuery = "select count(loanAccount) from LoanAccount loanAccount"
    )
    Page<LoanAccount> findAllWithToOneRelationships(Pageable pageable);

    @Query("select loanAccount from LoanAccount loanAccount left join fetch loanAccount.user")
    List<LoanAccount> findAllWithToOneRelationships();

    @Query("select loanAccount from LoanAccount loanAccount left join fetch loanAccount.user where loanAccount.id =:id")
    Optional<LoanAccount> findOneWithToOneRelationships(@Param("id") Long id);
}

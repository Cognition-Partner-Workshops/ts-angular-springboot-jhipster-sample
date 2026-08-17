package io.github.jhipster.sample.repository;

import io.github.jhipster.sample.domain.Operation;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Operation entity.
 *
 * When extending this class, extend OperationRepositoryWithBagRelationships too.
 * For more information refer to https://github.com/jhipster/generator-jhipster/issues/17990.
 */
@Repository
public interface OperationRepository extends OperationRepositoryWithBagRelationships, JpaRepository<Operation, Long> {
    default Optional<Operation> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findOneWithToOneRelationships(id));
    }

    default List<Operation> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAllWithToOneRelationships());
    }

    default Page<Operation> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAllWithToOneRelationships(pageable));
    }

    @Query(
        value = "select operation from Operation operation left join fetch operation.bankAccount",
        countQuery = "select count(operation) from Operation operation"
    )
    Page<Operation> findAllWithToOneRelationships(Pageable pageable);

    @Query("select operation from Operation operation left join fetch operation.bankAccount")
    List<Operation> findAllWithToOneRelationships();

    @Query("select operation from Operation operation left join fetch operation.bankAccount where operation.id =:id")
    Optional<Operation> findOneWithToOneRelationships(@Param("id") Long id);

    /**
     * Projection of an operation together with the name of its owning bank account.
     */
    interface RecentOperationProjection {
        Long getId();

        Instant getDate();

        String getDescription();

        BigDecimal getAmount();

        String getBankAccountName();
    }

    @Query(
        """
        select operation.id as id, operation.date as date, operation.description as description, operation.amount as amount,
            bankAccount.name as bankAccountName
        from Operation operation
        left join operation.bankAccount bankAccount
        order by operation.date desc, operation.id desc
        """
    )
    List<RecentOperationProjection> findRecentOperations(Pageable pageable);
}

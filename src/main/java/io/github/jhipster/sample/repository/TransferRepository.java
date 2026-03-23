package io.github.jhipster.sample.repository;

import io.github.jhipster.sample.domain.Transfer;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Transfer entity.
 */
@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {
    @Query(
        "select t from Transfer t left join fetch t.sourceAccount sa left join fetch t.destinationAccount da " +
            "where sa.user.login = ?#{authentication.name} or da.user.login = ?#{authentication.name}"
    )
    List<Transfer> findAllForCurrentUser();

    @Query(
        value = "select t from Transfer t left join fetch t.sourceAccount sa left join fetch sa.user " +
            "left join fetch t.destinationAccount da left join fetch da.user " +
            "where sa.user.login = ?#{authentication.name} or da.user.login = ?#{authentication.name}",
        countQuery = "select count(t) from Transfer t " +
            "where t.sourceAccount.user.login = ?#{authentication.name} or t.destinationAccount.user.login = ?#{authentication.name}"
    )
    Page<Transfer> findAllForCurrentUser(Pageable pageable);

    @Query(
        "select t from Transfer t left join fetch t.sourceAccount sa left join fetch sa.user " +
            "left join fetch t.destinationAccount da left join fetch da.user " +
            "where t.id = :id"
    )
    Optional<Transfer> findOneWithEagerRelationships(@Param("id") Long id);

    @Query(
        value = "select t from Transfer t left join fetch t.sourceAccount sa left join fetch sa.user " +
            "left join fetch t.destinationAccount da left join fetch da.user " +
            "where (sa.id = :accountId or da.id = :accountId) " +
            "and (sa.user.login = ?#{authentication.name} or da.user.login = ?#{authentication.name})",
        countQuery = "select count(t) from Transfer t " +
            "where (t.sourceAccount.id = :accountId or t.destinationAccount.id = :accountId) " +
            "and (t.sourceAccount.user.login = ?#{authentication.name} or t.destinationAccount.user.login = ?#{authentication.name})"
    )
    Page<Transfer> findAllByAccountId(@Param("accountId") Long accountId, Pageable pageable);
}

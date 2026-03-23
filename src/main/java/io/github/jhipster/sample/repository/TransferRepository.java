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
        value = "select t from Transfer t " +
            "left join fetch t.sourceAccount sa " +
            "left join fetch t.destinationAccount da " +
            "left join fetch sa.user " +
            "left join fetch da.user " +
            "where sa.user.login = :login or da.user.login = :login",
        countQuery = "select count(t) from Transfer t " +
            "left join t.sourceAccount sa left join sa.user sau " +
            "left join t.destinationAccount da left join da.user dau " +
            "where sau.login = :login or dau.login = :login"
    )
    Page<Transfer> findAllByCurrentUser(@Param("login") String login, Pageable pageable);

    @Query(
        "select t from Transfer t " +
            "left join fetch t.sourceAccount sa " +
            "left join fetch t.destinationAccount da " +
            "left join fetch sa.user " +
            "left join fetch da.user " +
            "where t.id = :id"
    )
    Optional<Transfer> findOneWithEagerRelationships(@Param("id") Long id);

    @Query(
        value = "select t from Transfer t " +
            "left join fetch t.sourceAccount sa " +
            "left join fetch t.destinationAccount da " +
            "left join fetch sa.user " +
            "left join fetch da.user " +
            "where sa.id = :accountId or da.id = :accountId",
        countQuery = "select count(t) from Transfer t " + "where t.sourceAccount.id = :accountId or t.destinationAccount.id = :accountId"
    )
    Page<Transfer> findAllByAccountId(@Param("accountId") Long accountId, Pageable pageable);
}

package io.github.jhipster.sample.service;

import io.github.jhipster.sample.domain.Invoice;
import io.github.jhipster.sample.repository.InvoiceRepository;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Invoice}.
 */
@Service
@Transactional
public class InvoiceService {

    private static final Logger LOG = LoggerFactory.getLogger(InvoiceService.class);

    private final InvoiceRepository invoiceRepository;

    public InvoiceService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    /**
     * Save an invoice.
     *
     * @param invoice the entity to save.
     * @return the persisted entity.
     */
    public Invoice save(Invoice invoice) {
        LOG.debug("Request to save Invoice : {}", invoice);
        return invoiceRepository.save(invoice);
    }

    /**
     * Update an invoice.
     *
     * @param invoice the entity to save.
     * @return the persisted entity.
     */
    public Invoice update(Invoice invoice) {
        LOG.debug("Request to update Invoice : {}", invoice);
        return invoiceRepository.save(invoice);
    }

    /**
     * Partially update an invoice.
     *
     * @param invoice the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Invoice> partialUpdate(Invoice invoice) {
        LOG.debug("Request to partially update Invoice : {}", invoice);

        return invoiceRepository
            .findById(invoice.getId())
            .map(existingInvoice -> {
                if (invoice.getInvoiceNumber() != null) {
                    existingInvoice.setInvoiceNumber(invoice.getInvoiceNumber());
                }
                if (invoice.getInvoiceDate() != null) {
                    existingInvoice.setInvoiceDate(invoice.getInvoiceDate());
                }
                if (invoice.getDueDate() != null) {
                    existingInvoice.setDueDate(invoice.getDueDate());
                }
                if (invoice.getAmount() != null) {
                    existingInvoice.setAmount(invoice.getAmount());
                }
                if (invoice.getStatus() != null) {
                    existingInvoice.setStatus(invoice.getStatus());
                }

                return existingInvoice;
            })
            .map(invoiceRepository::save);
    }

    /**
     * Get all the invoices.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<Invoice> findAll() {
        LOG.debug("Request to get all Invoices");
        return invoiceRepository.findAllWithEagerRelationships();
    }

    /**
     * Get one invoice by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Invoice> findOne(Long id) {
        LOG.debug("Request to get Invoice : {}", id);
        return invoiceRepository.findOneWithEagerRelationships(id);
    }

    /**
     * Delete the invoice by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Invoice : {}", id);
        invoiceRepository.deleteById(id);
    }

    /**
     * Check if an invoice exists by id.
     *
     * @param id the id of the entity.
     * @return true if the entity exists, false otherwise.
     */
    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return invoiceRepository.existsById(id);
    }
}

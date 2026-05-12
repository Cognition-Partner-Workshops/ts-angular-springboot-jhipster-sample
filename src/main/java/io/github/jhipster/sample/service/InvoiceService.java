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

    public Invoice save(Invoice invoice) {
        LOG.debug("Request to save Invoice : {}", invoice);
        return invoiceRepository.save(invoice);
    }

    public Invoice update(Invoice invoice) {
        LOG.debug("Request to update Invoice : {}", invoice);
        return invoiceRepository.save(invoice);
    }

    public Optional<Invoice> partialUpdate(Invoice invoice) {
        LOG.debug("Request to partially update Invoice : {}", invoice);

        return invoiceRepository
            .findById(invoice.getId())
            .map(existingInvoice -> {
                if (invoice.getNumber() != null) {
                    existingInvoice.setNumber(invoice.getNumber());
                }
                if (invoice.getDate() != null) {
                    existingInvoice.setDate(invoice.getDate());
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

    @Transactional(readOnly = true)
    public List<Invoice> findAll() {
        LOG.debug("Request to get all Invoices");
        return invoiceRepository.findAllWithEagerRelationships();
    }

    @Transactional(readOnly = true)
    public Optional<Invoice> findOne(Long id) {
        LOG.debug("Request to get Invoice : {}", id);
        return invoiceRepository.findOneWithEagerRelationships(id);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Invoice : {}", id);
        invoiceRepository.deleteById(id);
    }
}

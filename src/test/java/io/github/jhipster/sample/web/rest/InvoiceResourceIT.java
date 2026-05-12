package io.github.jhipster.sample.web.rest;

import static io.github.jhipster.sample.domain.InvoiceAsserts.*;
import static io.github.jhipster.sample.web.rest.TestUtil.createUpdateProxyForBean;
import static io.github.jhipster.sample.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.jhipster.sample.IntegrationTest;
import io.github.jhipster.sample.domain.Invoice;
import io.github.jhipster.sample.domain.enumeration.InvoiceStatus;
import io.github.jhipster.sample.repository.InvoiceRepository;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link InvoiceResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class InvoiceResourceIT {

    private static final String DEFAULT_INVOICE_NUMBER = "INV-001";
    private static final String UPDATED_INVOICE_NUMBER = "INV-002";

    private static final LocalDate DEFAULT_INVOICE_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_INVOICE_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final LocalDate DEFAULT_DUE_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_DUE_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final BigDecimal DEFAULT_AMOUNT = new BigDecimal(1);
    private static final BigDecimal UPDATED_AMOUNT = new BigDecimal(2);

    private static final InvoiceStatus DEFAULT_STATUS = InvoiceStatus.DRAFT;
    private static final InvoiceStatus UPDATED_STATUS = InvoiceStatus.SENT;

    private static final String ENTITY_API_URL = "/api/invoices";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restInvoiceMockMvc;

    private Invoice invoice;

    private Invoice insertedInvoice;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Invoice createEntity() {
        return new Invoice()
            .invoiceNumber(DEFAULT_INVOICE_NUMBER)
            .invoiceDate(DEFAULT_INVOICE_DATE)
            .dueDate(DEFAULT_DUE_DATE)
            .amount(DEFAULT_AMOUNT)
            .status(DEFAULT_STATUS);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Invoice createUpdatedEntity() {
        return new Invoice()
            .invoiceNumber(UPDATED_INVOICE_NUMBER)
            .invoiceDate(UPDATED_INVOICE_DATE)
            .dueDate(UPDATED_DUE_DATE)
            .amount(UPDATED_AMOUNT)
            .status(UPDATED_STATUS);
    }

    @BeforeEach
    void initTest() {
        invoice = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedInvoice != null) {
            invoiceRepository.delete(insertedInvoice);
            insertedInvoice = null;
        }
    }

    @Test
    @Transactional
    void createInvoice() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Invoice
        var returnedInvoice = om.readValue(
            restInvoiceMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(invoice)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Invoice.class
        );

        // Validate the Invoice in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertInvoiceUpdatableFieldsEquals(returnedInvoice, getPersistedInvoice(returnedInvoice));

        insertedInvoice = returnedInvoice;
    }

    @Test
    @Transactional
    void createInvoiceWithExistingId() throws Exception {
        // Create the Invoice with an existing ID
        invoice.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restInvoiceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(invoice)))
            .andExpect(status().isBadRequest());

        // Validate the Invoice in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkInvoiceNumberIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        invoice.setInvoiceNumber(null);

        // Create the Invoice, which fails.
        restInvoiceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(invoice)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkInvoiceDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        invoice.setInvoiceDate(null);

        // Create the Invoice, which fails.
        restInvoiceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(invoice)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkDueDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        invoice.setDueDate(null);

        // Create the Invoice, which fails.
        restInvoiceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(invoice)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAmountIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        invoice.setAmount(null);

        // Create the Invoice, which fails.
        restInvoiceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(invoice)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        invoice.setStatus(null);

        // Create the Invoice, which fails.
        restInvoiceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(invoice)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllInvoices() throws Exception {
        // Initialize the database
        insertedInvoice = invoiceRepository.saveAndFlush(invoice);

        // Get all the invoiceList
        restInvoiceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(invoice.getId().intValue())))
            .andExpect(jsonPath("$.[*].invoiceNumber").value(hasItem(DEFAULT_INVOICE_NUMBER)))
            .andExpect(jsonPath("$.[*].invoiceDate").value(hasItem(DEFAULT_INVOICE_DATE.toString())))
            .andExpect(jsonPath("$.[*].dueDate").value(hasItem(DEFAULT_DUE_DATE.toString())))
            .andExpect(jsonPath("$.[*].amount").value(hasItem(sameNumber(DEFAULT_AMOUNT))))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())));
    }

    @Test
    @Transactional
    void getInvoice() throws Exception {
        // Initialize the database
        insertedInvoice = invoiceRepository.saveAndFlush(invoice);

        // Get the invoice
        restInvoiceMockMvc
            .perform(get(ENTITY_API_URL_ID, invoice.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(invoice.getId().intValue()))
            .andExpect(jsonPath("$.invoiceNumber").value(DEFAULT_INVOICE_NUMBER))
            .andExpect(jsonPath("$.invoiceDate").value(DEFAULT_INVOICE_DATE.toString()))
            .andExpect(jsonPath("$.dueDate").value(DEFAULT_DUE_DATE.toString()))
            .andExpect(jsonPath("$.amount").value(sameNumber(DEFAULT_AMOUNT)))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()));
    }

    @Test
    @Transactional
    void getNonExistingInvoice() throws Exception {
        // Get the invoice
        restInvoiceMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingInvoice() throws Exception {
        // Initialize the database
        insertedInvoice = invoiceRepository.saveAndFlush(invoice);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the invoice
        Invoice updatedInvoice = invoiceRepository.findById(invoice.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedInvoice are not directly saved in db
        em.detach(updatedInvoice);
        updatedInvoice
            .invoiceNumber(UPDATED_INVOICE_NUMBER)
            .invoiceDate(UPDATED_INVOICE_DATE)
            .dueDate(UPDATED_DUE_DATE)
            .amount(UPDATED_AMOUNT)
            .status(UPDATED_STATUS);

        restInvoiceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedInvoice.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedInvoice))
            )
            .andExpect(status().isOk());

        // Validate the Invoice in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedInvoiceToMatchAllProperties(updatedInvoice);
    }

    @Test
    @Transactional
    void putNonExistingInvoice() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        invoice.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restInvoiceMockMvc
            .perform(put(ENTITY_API_URL_ID, invoice.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(invoice)))
            .andExpect(status().isBadRequest());

        // Validate the Invoice in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchInvoice() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        invoice.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restInvoiceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(invoice))
            )
            .andExpect(status().isBadRequest());

        // Validate the Invoice in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamInvoice() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        invoice.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restInvoiceMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(invoice)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Invoice in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateInvoiceWithPatch() throws Exception {
        // Initialize the database
        insertedInvoice = invoiceRepository.saveAndFlush(invoice);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the invoice using partial update
        Invoice partialUpdatedInvoice = new Invoice();
        partialUpdatedInvoice.setId(invoice.getId());

        partialUpdatedInvoice.amount(UPDATED_AMOUNT).status(UPDATED_STATUS);

        restInvoiceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedInvoice.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedInvoice))
            )
            .andExpect(status().isOk());

        // Validate the Invoice in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertInvoiceUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedInvoice, invoice), getPersistedInvoice(invoice));
    }

    @Test
    @Transactional
    void fullUpdateInvoiceWithPatch() throws Exception {
        // Initialize the database
        insertedInvoice = invoiceRepository.saveAndFlush(invoice);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the invoice using partial update
        Invoice partialUpdatedInvoice = new Invoice();
        partialUpdatedInvoice.setId(invoice.getId());

        partialUpdatedInvoice
            .invoiceNumber(UPDATED_INVOICE_NUMBER)
            .invoiceDate(UPDATED_INVOICE_DATE)
            .dueDate(UPDATED_DUE_DATE)
            .amount(UPDATED_AMOUNT)
            .status(UPDATED_STATUS);

        restInvoiceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedInvoice.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedInvoice))
            )
            .andExpect(status().isOk());

        // Validate the Invoice in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertInvoiceUpdatableFieldsEquals(partialUpdatedInvoice, getPersistedInvoice(partialUpdatedInvoice));
    }

    @Test
    @Transactional
    void patchNonExistingInvoice() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        invoice.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restInvoiceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, invoice.getId()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(invoice))
            )
            .andExpect(status().isBadRequest());

        // Validate the Invoice in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchInvoice() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        invoice.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restInvoiceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(invoice))
            )
            .andExpect(status().isBadRequest());

        // Validate the Invoice in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamInvoice() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        invoice.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restInvoiceMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(invoice)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Invoice in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteInvoice() throws Exception {
        // Initialize the database
        insertedInvoice = invoiceRepository.saveAndFlush(invoice);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the invoice
        restInvoiceMockMvc
            .perform(delete(ENTITY_API_URL_ID, invoice.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return invoiceRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Invoice getPersistedInvoice(Invoice invoice) {
        return invoiceRepository.findById(invoice.getId()).orElseThrow();
    }

    protected void assertPersistedInvoiceToMatchAllProperties(Invoice expectedInvoice) {
        assertInvoiceAllPropertiesEquals(expectedInvoice, getPersistedInvoice(expectedInvoice));
    }

    protected void assertPersistedInvoiceToMatchUpdatableProperties(Invoice expectedInvoice) {
        assertInvoiceAllUpdatablePropertiesEquals(expectedInvoice, getPersistedInvoice(expectedInvoice));
    }
}

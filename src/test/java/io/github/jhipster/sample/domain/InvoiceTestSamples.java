package io.github.jhipster.sample.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class InvoiceTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static Invoice getInvoiceSample1() {
        return new Invoice().id(1L).invoiceNumber("invoiceNumber1");
    }

    public static Invoice getInvoiceSample2() {
        return new Invoice().id(2L).invoiceNumber("invoiceNumber2");
    }

    public static Invoice getInvoiceRandomSampleGenerator() {
        return new Invoice().id(longCount.incrementAndGet()).invoiceNumber(UUID.randomUUID().toString());
    }
}

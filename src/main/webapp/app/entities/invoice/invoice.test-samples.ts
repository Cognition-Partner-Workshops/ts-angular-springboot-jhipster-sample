import { IInvoice, NewInvoice } from './invoice.model';

export const sampleWithRequiredData: IInvoice = {
  id: 12345,
  invoiceNumber: 'INV-001',
  invoiceDate: '2025-01-15',
  dueDate: '2025-02-15',
  amount: 1500.0,
  status: 'DRAFT',
};

export const sampleWithPartialData: IInvoice = {
  id: 23456,
  invoiceNumber: 'INV-002',
  invoiceDate: '2025-02-20',
  dueDate: '2025-03-20',
  amount: 2750.5,
  status: 'SENT',
};

export const sampleWithFullData: IInvoice = {
  id: 34567,
  invoiceNumber: 'INV-003',
  invoiceDate: '2025-03-10',
  dueDate: '2025-04-10',
  amount: 890.25,
  status: 'PAID',
};

export const sampleWithNewData: NewInvoice = {
  invoiceNumber: 'INV-004',
  invoiceDate: '2025-04-01',
  dueDate: '2025-05-01',
  amount: 3200.0,
  status: 'DRAFT',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);

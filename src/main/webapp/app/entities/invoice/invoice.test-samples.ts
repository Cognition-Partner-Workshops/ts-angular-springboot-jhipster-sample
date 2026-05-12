import { IInvoice, NewInvoice } from './invoice.model';

export const sampleWithRequiredData: IInvoice = {
  id: 28764,
  number: 'INV-001',
  date: '2024-01-15',
  dueDate: '2024-02-15',
  amount: 1500.0,
  status: 'DRAFT',
};

export const sampleWithPartialData: IInvoice = {
  id: 15923,
  number: 'INV-002',
  date: '2024-03-10',
  dueDate: '2024-04-10',
  amount: 2500.5,
  status: 'SENT',
};

export const sampleWithFullData: IInvoice = {
  id: 31847,
  number: 'INV-003',
  date: '2024-06-20',
  dueDate: '2024-07-20',
  amount: 9999.99,
  status: 'PAID',
};

export const sampleWithNewData: NewInvoice = {
  number: 'INV-004',
  date: '2024-08-01',
  dueDate: '2024-09-01',
  amount: 750.25,
  status: 'OVERDUE',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);

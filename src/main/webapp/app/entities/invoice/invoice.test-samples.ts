import { IInvoice, NewInvoice } from './invoice.model';

export const sampleWithRequiredData: IInvoice = {
  id: 28743,
  number: 'INV-001',
  date: '2025-01-15',
  dueDate: '2025-02-15',
  amount: 1500.0,
  status: 'DRAFT',
};

export const sampleWithPartialData: IInvoice = {
  id: 19234,
  number: 'INV-002',
  date: '2025-02-10',
  dueDate: '2025-03-10',
  amount: 2750.5,
  status: 'SENT',
};

export const sampleWithFullData: IInvoice = {
  id: 13289,
  number: 'INV-003',
  date: '2025-03-05',
  dueDate: '2025-04-05',
  amount: 980.25,
  status: 'PAID',
};

export const sampleWithNewData: NewInvoice = {
  number: 'INV-004',
  date: '2025-04-20',
  dueDate: '2025-05-20',
  amount: 4200.0,
  status: 'OVERDUE',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);

import { IOperation } from 'app/entities/operation/operation.model';

/** Categorization tag that can be assigned to one or more operations. */
export interface ILabel {
  id: number;
  /** Display text of the label (minimum 3 characters). */
  label?: string | null;
  /** Operations tagged with this label (many-to-many). */
  operations?: IOperation[] | null;
}

/** Type used when creating a new label (id is null until persisted). */
export type NewLabel = Omit<ILabel, 'id'> & { id: null };

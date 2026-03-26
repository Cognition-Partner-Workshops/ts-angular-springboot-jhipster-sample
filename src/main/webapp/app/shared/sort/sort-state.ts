import { WritableSignal, signal } from '@angular/core';

/** Column sort direction. */
export type SortOrder = 'asc' | 'desc';

/** Current sort configuration: which column (predicate) and direction (order). */
export type SortState = { predicate?: string; order?: SortOrder };

/** Creates a writable signal for sort state with value-equality comparison. */
export const sortStateSignal = (state: SortState): WritableSignal<SortState> =>
  signal<SortState>(state, {
    equal: (a, b) => a.predicate === b.predicate && a.order === b.order,
  });

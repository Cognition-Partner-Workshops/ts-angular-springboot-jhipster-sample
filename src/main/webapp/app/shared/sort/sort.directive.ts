import { Directive, model, output } from '@angular/core';

import { SortOrder, SortState } from './sort-state';

@Directive({
  selector: '[jhiSort]',
})
/**
 * Host directive that manages column sort state for a table.
 * Toggles between ascending and descending order on repeated clicks.
 */
export class SortDirective {
  readonly sortState = model.required<SortState>();

  readonly sortChange = output<SortState>();

  /** Toggles sort order for the given field and emits the new state. */
  sort(field: string): void {
    const { predicate, order } = this.sortState();
    const toggle = (): SortOrder => (order === 'asc' ? 'desc' : 'asc');
    const newSortState = { predicate: field, order: field === predicate ? toggle() : 'asc' };
    this.sortState.update(() => newSortState);
    this.sortChange.emit(newSortState);
  }
}

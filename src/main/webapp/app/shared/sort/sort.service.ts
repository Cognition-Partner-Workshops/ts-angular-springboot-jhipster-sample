import { Injectable } from '@angular/core';

import { SortState } from './sort-state';

/** Utility service for client-side sorting with locale-aware string comparison. */
@Injectable({ providedIn: 'root' })
export class SortService {
  private readonly collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
  });

  /** Returns a comparator function for the given sort state, with an optional fallback sort. */
  startSort({ predicate, order }: Required<SortState>, fallback?: Required<SortState>): (a: any, b: any) => number {
    const multiply = order === 'desc' ? -1 : 1;
    return (a: any, b: any) => {
      const compare = this.collator.compare(a[predicate], b[predicate]);
      if (compare === 0 && fallback) {
        return this.startSort(fallback)(a, b);
      }
      return compare * multiply;
    };
  }

  /** Parses a 'field,order' sort parameter string into a SortState object. */
  parseSortParam(sortParam: string | undefined): SortState {
    if (sortParam?.includes(',')) {
      const split = sortParam.split(',');
      if (split[0]) {
        return { predicate: split[0], order: split[1] as any };
      }
    }
    return { predicate: sortParam?.length ? sortParam : undefined };
  }

  /** Serializes a SortState into query parameter strings (e.g. ['name,asc', 'id,asc']). */
  buildSortParam({ predicate, order }: SortState, fallback?: string): string[] {
    const sortParam = predicate && order ? [`${predicate},${order}`] : [];
    if (fallback && predicate !== fallback) {
      sortParam.push(`${fallback},asc`);
    }
    return sortParam;
  }
}

import { createAction, props } from '@ngrx/store';

export const searchRequest = createAction(
  '[Search] Search Request',
  props<{ query: string }>()
);
export const searchSuccess = createAction(
  '[Search] Search Success',
  props<{ results: any }>()
);
export const searchFailure = createAction(
  '[Search] Search Failure',
  props<{ error: any }>()
);
export const updateFilters = createAction(
  '[Search] Update Filters',
  props<{ filters: any }>()
);

import { createReducer, on } from '@ngrx/store';
import {
  searchFailure,
  searchRequest,
  searchSuccess,
  updateFilters,
} from '../actions/search.actions';

export const initialState = {
  results: [],
  filters: {},
  loading: false,
  error: null,
};

const _searchReducer = createReducer(
  initialState,
  on(searchRequest, (state: any) => ({ ...state, loading: true })),
  on(searchSuccess, (state: any, { results }: any) => ({
    ...state,
    results,
    loading: false,
  })),
  on(searchFailure, (state: any, { error }: any) => ({
    ...state,
    error,
    loading: false,
  })),
  on(updateFilters, (state: any, { filters }: any) => ({ ...state, filters }))
);

export function searchReducer(state: any, action: any) {
  return _searchReducer(state, action);
}

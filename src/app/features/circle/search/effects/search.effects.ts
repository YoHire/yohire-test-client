import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { switchMap, map, catchError, of } from 'rxjs';
import {
  searchRequest,
  searchSuccess,
  searchFailure,
} from '../actions/search.actions';
import { URL } from 'src/app/constants/constants';

@Injectable()
export class SearchEffects {
  search$ = createEffect(() =>
    this.actions$.pipe(
      ofType(searchRequest),
      switchMap((action) =>
        this.http
          .get(`${URL.CIRCLE}/qualifications?level=${action.query}`)
          .pipe(
            map((results) => searchSuccess({ results })),
            catchError((error) => of(searchFailure({ error })))
          )
      )
    )
  );

  constructor(private actions$: Actions, private http: HttpClient) {}
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/apiResponse';
import { CategoryResponse } from '../models/categoryResponse';
import { URL } from '../constants/constants';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private http: HttpClient) {}

  list(keyword?: string): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(
      `${URL.CATEGORY}?keyword=${keyword}`,
      httpOptions
    );
  }

  listBasedOnSearch(keyword: string): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(
      `${URL.CATEGORY}/${keyword}`,
      httpOptions
    );
  }
  fetch(catId: number): Observable<ApiResponse<CategoryResponse>> {
    return this.http.get<ApiResponse<CategoryResponse>>(
      `${URL.CATEGORY}/fetch/${catId}`,
      httpOptions
    );
  }

  create(
    name: string,
    tags?: string,
    filterTags?: string
  ): Observable<ApiResponse<CategoryResponse>> {
    return this.http.post<ApiResponse<CategoryResponse>>(
      URL.CATEGORY,
      { name: name, tags: tags, filterTags: filterTags },
      httpOptions
    );
  }

  update(
    catId: number,
    name: string,
    tags: string,
    filterTags: string
  ): Observable<ApiResponse<CategoryResponse>> {
    return this.http.put<ApiResponse<CategoryResponse>>(
      `${URL.CATEGORY}/${catId}`,
      { name: name, tags: tags, filterTags: filterTags },
      httpOptions
    );
  }

  delete(id: string): Observable<ApiResponse<CategoryResponse>> {
    return this.http.delete<ApiResponse<any>>(
      `${URL.ADMIN}/category/${id}`,
      httpOptions
    );
  }

  statusUpdate(
    catId: string,
    status: string
  ): Observable<ApiResponse<CategoryResponse>> {
    return this.http.patch<ApiResponse<CategoryResponse>>(
      `${URL.ADMIN}/category-status`,
      { catId, status },
      httpOptions
    );
  }

  // listSubCategory(catId: number, status: any): Observable<SubCategoryResponse[]> {
  //   return this.http.get<SubCategoryResponse[]>(URL.CATEGORY + "/" + catId + "/sub/" + status, httpOptions)
  // }

  // fetchSubCategory(catId: number, id: number): Observable<ApiResponse<CategoryResponse>> {
  //   return this.http.get<ApiResponse<CategoryResponse>>(URL.CATEGORY + "/" + catId + "/sub/fetch/" + id, httpOptions)
  // }

  // createSubCategory(catId: number, name: string): Observable<ApiResponse<CategoryResponse>> {
  //   return this.http.post<ApiResponse<CategoryResponse>>(URL.CATEGORY + "/" + catId + "/sub", {name:name}, httpOptions)
  // }

  // updateSubCategory(catId: number, id: number, name: string): Observable<ApiResponse<CategoryResponse>> {
  //   return this.http.put<ApiResponse<CategoryResponse>>(URL.CATEGORY + "/" + catId + "/sub/" + id, {name:name}, httpOptions)
  // }

  // deleteSubCategory(catId: number, id: number): Observable<ApiResponse<CategoryResponse>> {
  //   return this.http.delete<ApiResponse<CategoryResponse>>(URL.CATEGORY + "/" + catId + "/sub/" + id, httpOptions)
  // }

  // statusUpdateSubCategory(catId: number, id: number, status: any): Observable<ApiResponse<CategoryResponse>> {
  //   return this.http.put<ApiResponse<CategoryResponse>>(URL.CATEGORY + "/" + catId + "/sub/status/" + id + "/" + status, httpOptions)
  // }
}

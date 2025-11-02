import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class TodosService {
  base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private authHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || '';
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  listByListId(listId: string): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.base}/lists/${listId}/todos`, this.authHeaders());
  }

  createInList(listId: string, title: string): Observable<Todo> {
    return this.http.post<Todo>(`${this.base}/lists/${listId}/todos`, { title }, this.authHeaders());
  }

  updateInList(listId: string, todoId: string, patch: Partial<Todo>): Observable<Todo> {
    return this.http.put<Todo>(`${this.base}/lists/${listId}/todos/${todoId}`, patch, this.authHeaders());
  }

  removeInList(listId: string, todoId: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.base}/lists/${listId}/todos/${todoId}`, this.authHeaders());
  }

  clearAllInList(listId: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/lists/${listId}/todos`, this.authHeaders());
  }
}

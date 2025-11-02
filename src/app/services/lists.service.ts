import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Member {
  user: string;
  email: string;
}

export interface List {
  _id: string;
  name: string;
  owner: string;
  ownerEmail?: string;
  canWrite: boolean;
  members?: Member[];
}

@Injectable({ providedIn: 'root' })
export class ListsService {
  private base = environment.apiUrl;
  lists$ = new BehaviorSubject<List[]>([]);
  selected$ = new BehaviorSubject<List | null>(null);

  constructor(private http: HttpClient) {}

  /** יוצר כותרת עם הטוקן */
  private authHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || '';
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  load() {
    return this.http.get<List[]>(`${this.base}/lists`, this.authHeaders()).pipe(
      tap(ls => {
        this.lists$.next(ls);
        if (!this.selected$.value && ls.length) this.selected$.next(ls[0]);
      })
    );
  }

  create(name: string) {
    return this.http.post<List>(`${this.base}/lists`, { name }, this.authHeaders()).pipe(
      tap(l => {
        const cur = this.lists$.value;
        this.lists$.next([l, ...cur]);
        this.selected$.next(l);
      })
    );
  }

  remove(listId: string) {
    return this.http.delete<{ ok: true }>(`${this.base}/lists/${listId}`, this.authHeaders()).pipe(
      tap(() => {
        const next = this.lists$.value.filter(l => l._id !== listId);
        this.lists$.next(next);
        const sel = this.selected$.value;
        if (sel && sel._id === listId) this.selected$.next(next[0] ?? null);
      })
    );
  }

  select(l: List) {
    this.selected$.next(l);
  }

  share(listId: string, email: string) {
    return this.http.post(`${this.base}/lists/${listId}/share`, { email }, this.authHeaders()).pipe(
      tap(() => this.load().subscribe())
    );
  }

  leave(listId: string) {
    return this.http.delete(`${this.base}/lists/${listId}/leave`, this.authHeaders()).pipe(
      tap(() => this.load().subscribe())
    );
  }

  unshare(listId: string, memberId: string) {
    return this.http.delete(`${this.base}/lists/${listId}/share/${memberId}`, this.authHeaders()).pipe(
      tap(() => this.load().subscribe())
    );
  }
}

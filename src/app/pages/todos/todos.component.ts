import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodosService, Todo } from '../../services/todos.service';
import { ListsService, List } from '../../services/lists.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css']
})
export class TodosComponent implements OnInit, OnDestroy {
  lists: List[] = [];
  selected: List | null = null;
  items: Todo[] = [];
  newTitle = '';
  newListName = '';
  busy = false;

  shareOpen = false;
  shareEmail = '';
  busyShare = false;

  sub?: Subscription;

  constructor(private api: TodosService, private listsApi: ListsService) {}

  ngOnInit() {
    this.sub = new Subscription();
    this.sub.add(this.listsApi.lists$.subscribe(ls => (this.lists = ls)));
    this.sub.add(this.listsApi.selected$.subscribe(sel => {
      this.selected = sel;
      if (sel) this.reloadTodos();
      else this.items = [];
    }));
    this.listsApi.load().subscribe();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  selectList(l: List) {
    this.listsApi.select(l);
  }

  addList() {
    const name = this.newListName.trim();
    if (!name) return;
    this.busy = true;
    this.listsApi.create(name).subscribe({
      next: () => { this.newListName = ''; this.busy = false; },
      error: () => { this.busy = false; }
    });
  }

  deleteCurrentList() {
    if (!this.selected) return;
    this.busy = true;
    this.listsApi.remove(this.selected._id).subscribe({
      next: () => { this.busy = false; },
      error: () => { this.busy = false; }
    });
  }

  reloadTodos() {
    if (!this.selected) return;
    this.api.listByListId(this.selected._id).subscribe(items => (this.items = items ?? []));
  }

  add() {
    if (!this.selected || !this.selected.canWrite) return;
    const t = this.newTitle.trim();
    if (!t) return;
    this.busy = true;
    this.api.createInList(this.selected._id, t).subscribe({
      next: () => { this.newTitle = ''; this.busy = false; this.reloadTodos(); },
      error: () => { this.busy = false; }
    });
  }

  toggle(item: Todo) {
    if (!this.selected || !this.selected.canWrite) return;
    this.api.updateInList(this.selected._id, item._id, { completed: !item.completed })
      .subscribe(() => this.reloadTodos());
  }

  remove(item: Todo) {
    if (!this.selected || !this.selected.canWrite) return;
    this.api.removeInList(this.selected._id, item._id)
      .subscribe(() => this.reloadTodos());
  }

  clearAll() {
    if (!this.selected || !this.selected.canWrite) return;
    this.busy = true;
    this.api.clearAllInList(this.selected._id).subscribe({
      next: () => { this.busy = false; this.reloadTodos(); },
      error: () => { this.busy = false; }
    });
  }

  openShare() { this.shareOpen = true; }
  cancelShare() { this.shareOpen = false; this.shareEmail = ''; }

  shareSelected() {
    if (!this.selected || !this.selected._id) return;
    const email = this.shareEmail.trim();
    if (!email) return;
    this.busyShare = true;
    this.listsApi.share(this.selected._id, email).subscribe({
      next: () => {
        this.busyShare = false;
        this.cancelShare();
        this.listsApi.load().subscribe();
      },
      error: (err) => {
        this.busyShare = false;
        alert(err?.error?.error || 'Share failed');
      }
    });
  }

  leaveList(l: List) {
    this.busy = true;
    this.listsApi.leave(l._id).subscribe({
      next: () => { this.busy = false; this.listsApi.load().subscribe(); },
      error: () => { this.busy = false; }
    });
  }

  unshareMember(memberId: string) {
    if (!this.selected) return;
    this.busy = true;
    this.listsApi.unshare(this.selected._id, memberId).subscribe({
      next: () => { this.busy = false; this.listsApi.load().subscribe(); },
      error: () => { this.busy = false; }
    });
  }
}

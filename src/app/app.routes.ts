import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TodosComponent } from './pages/todos/todos.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'todos', component: TodosComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'todos' },
  { path: '**', redirectTo: 'todos' }
];

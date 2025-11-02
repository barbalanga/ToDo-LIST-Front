import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMsg = '';
  busy = false;
  mode: 'login' | 'register' = 'login'; 

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.errorMsg = '';
    const email = this.email.trim();
    const password = this.password;

    if (!email || !password) {
      this.errorMsg = 'נא למלא אימייל וסיסמה';
      return;
    }

    this.busy = true;

    const op = (this.mode === 'login')
      ? this.auth.login(email, password)
      : this.auth.register(email, password);

    op.subscribe({
      next: () => {
        this.busy = false;
        this.router.navigateByUrl('/todos');
      },
      error: (e: Error) => {
        this.busy = false;
        this.errorMsg = e.message; 
      }
    });
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService, User } from '../../core/services/auth.service';
import { InputComponent } from '../../shared/components/input/input.component';
import { PasswordInputComponent } from '../../shared/components/password-input/password-input.component';

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, PasswordInputComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="space-y-6">
            <app-input
              label="Email address"
              type="email"
              formControlName="email"
              placeholder="seu@email.com"
              [error]="isInvalid('email') ? (loginForm.get('email')?.errors?.['required'] ? 'Email is required' : 'Invalid email address') : null"
            ></app-input>

            <app-password-input
              label="Password"
              formControlName="password"
              placeholder="Sua senha"
              autocomplete="current-password"
              [error]="isInvalid('password') ? 'Password is required' : null"
            ></app-password-input>
          </div>

          @if (errorMessage()) {
            <div class="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200 font-medium">
              {{ errorMessage() }}
            </div>
          }

          <div>
            <button
              type="submit"
              [disabled]="isPending()"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isPending() ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LoginPageComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private http: HttpClient = inject(HttpClient);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isPending = signal(false);
  errorMessage = signal<string | null>(null);

  isInvalid(field: string) {
    const control = this.loginForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isPending.set(true);
    this.errorMessage.set(null);

    try {
      const response: LoginResponse = await firstValueFrom(
        this.http.post<LoginResponse>('/v1/auth/login', this.loginForm.value)
      );
      this.authService.login(response.token, response.refreshToken, response.user);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0 || !error.status) {
          this.errorMessage.set('O servidor está offline. Tente novamente mais tarde.');
        } else {
          this.errorMessage.set('Usuário ou senha incorretos. Verifique seus dados.');
        }
      } else {
        this.errorMessage.set('Ocorreu um erro inesperado.');
      }
    } finally {
      this.isPending.set(false);
    }
  }
}

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

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label htmlFor="email" class="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                [class.border-red-300]="isInvalid('email')"
                [class.border-gray-300]="!isInvalid('email')"
              />
              @if (isInvalid('email')) {
                <p class="mt-1 text-sm text-red-600">
                  @if (loginForm.get('email')?.errors?.['required']) { Email is required }
                  @else if (loginForm.get('email')?.errors?.['email']) { Invalid email address }
                </p>
              }
            </div>
            <div>
              <label htmlFor="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                [class.border-red-300]="isInvalid('password')"
                [class.border-gray-300]="!isInvalid('password')"
              />
              @if (isInvalid('password')) {
                <p class="mt-1 text-sm text-red-600">Password is required</p>
              }
            </div>
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

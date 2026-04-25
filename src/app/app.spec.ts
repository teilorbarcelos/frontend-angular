import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { App } from './app';
import { AuthService } from './core/services/auth.service';
import { describe, beforeEach, it, expect, vi } from 'vitest';

describe('App', () => {
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    vi.spyOn(authService, 'checkAuth').mockImplementation(() => Promise.resolve());
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should call checkAuth on init', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(authService.checkAuth).toHaveBeenCalled();
  });
});

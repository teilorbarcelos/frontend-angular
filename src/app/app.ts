import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: [`:host { display: block; height: 100vh; }`]
})
export class App implements OnInit {
  private authService = inject(AuthService);

  ngOnInit() {
    this.authService.checkAuth();
  }
}

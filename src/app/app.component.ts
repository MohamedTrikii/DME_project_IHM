import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dme-frontend';
  isAuthPage = false;

  private readonly authPages = ['/login', '/register', '/forgot-password', '/reset-password'];

  constructor(private readonly router: Router, private readonly themeService: ThemeService) {
    const initialUrl = this.router.url.split('?')[0];
    this.isAuthPage = this.authPages.includes(initialUrl);

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const url = this.router.url.split('?')[0];
      this.isAuthPage = this.authPages.includes(url);
    });
  }
}

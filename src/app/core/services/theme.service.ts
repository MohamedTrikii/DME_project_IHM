import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'dme-theme';
  private readonly themeSubject = new BehaviorSubject<Theme>(this.getInitialTheme());
  readonly theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  /**
   * Get initial theme from localStorage or system preference
   */
  private getInitialTheme(): Theme {
    // Check localStorage first
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    // Fall back to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  /**
   * Set the theme and persist to localStorage
   */
  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const current = this.themeSubject.value;
    const newTheme = current === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    return this.themeSubject.value;
  }

  /**
   * Apply theme class to document root
   */
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    const lightClass = 'dme-light';
    const darkClass = 'dme-dark';

    if (theme === 'light') {
      root.classList.remove(darkClass);
      root.classList.add(lightClass);
    } else {
      root.classList.remove(lightClass);
      root.classList.add(darkClass);
    }
  }
}

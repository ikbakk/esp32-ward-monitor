import { Injectable, signal } from '@angular/core';

export interface LoginCredentials {
  email: string;
  password: string;
  wardCode?: string;
}

const SESSION_KEY = 'ward-monitor-demo-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAuthenticated = signal(typeof localStorage !== 'undefined' && localStorage.getItem(SESSION_KEY) === 'active');

  /**
   * Backend-ready login seam. Replace the demo branch with a real HTTP auth call
   * when the ward-monitor API is available.
   */
  async login(credentials: LoginCredentials): Promise<void> {
    const email = credentials.email.trim();
    const password = credentials.password.trim();

    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    // Demo mode: accept any filled credentials while preserving the real login shape.
    localStorage.setItem(SESSION_KEY, 'active');
    this.isAuthenticated.set(true);
  }

  signOut(): void {
    localStorage.removeItem(SESSION_KEY);
    this.isAuthenticated.set(false);
  }
}

import { Service, signal } from '@angular/core';

@Service()
export class AuthService {
  readonly isDemoActive = signal(false);

  enterDemo(): void {
    this.isDemoActive.set(true);
  }

  exitDemo(): void {
    this.isDemoActive.set(false);
  }
}

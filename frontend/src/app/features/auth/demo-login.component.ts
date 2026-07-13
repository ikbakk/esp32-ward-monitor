import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-demo-login',
  template: `
    <main class="login-shell" aria-labelledby="login-title">
      <section class="login-panel login-panel-auth">
        <div class="login-intro">
          <h1 id="login-title">Ward Monitor</h1>
          <p class="login-copy">
            Sign in to review rooms, beds, monitored patients, and ESP32 sensor state.
            The form is wired for the future backend authentication API.
          </p>

          <div class="sensor-strip" aria-label="Login credentials">
            <span>Email: nurse@ward.local</span>
            <span>Password: ward-monitor</span>
          </div>
        </div>

        <form class="login-form" aria-label="Sign in" (submit)="login($event, email.value, password.value, wardCode.value)">
          <label>
            <span>Email</span>
            <input #email name="email" type="email" autocomplete="email" value="nurse@ward.local" placeholder="nurse@ward.local" required />
          </label>

          <label>
            <span>Password</span>
            <input #password name="password" type="password" autocomplete="current-password" value="ward-monitor" placeholder="••••••••" required />
          </label>

          <label>
            <span>Ward code</span>
            <input #wardCode name="wardCode" type="text" autocomplete="off" placeholder="Optional" />
          </label>

          @if (error()) {
            <p class="form-error" role="alert">{{ error() }}</p>
          }

          <button class="primary-action" type="submit" [disabled]="isSubmitting()">
            {{ isSubmitting() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </section>
    </main>
  `,
})
export class DemoLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly error = signal('');

  async login(event: SubmitEvent, email: string, password: string, wardCode?: string): Promise<void> {
    event.preventDefault();
    this.error.set('');
    this.isSubmitting.set(true);

    try {
      await this.auth.login({ email, password, wardCode });
      void this.router.navigateByUrl('/dashboard');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

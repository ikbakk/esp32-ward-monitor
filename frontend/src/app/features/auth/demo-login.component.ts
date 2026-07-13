import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-demo-login',
  template: `
    <main class="login-shell" aria-labelledby="login-title">
      <section class="login-panel">
        <p class="eyebrow">Portfolio demo</p>
        <h1 id="login-title">Ward Monitor</h1>
        <p class="login-copy">
          A nurse-station view for rooms, beds, monitored patients, and ESP32
          sensor state. Demo data includes vacant, unmonitored, warning,
          critical, offline, and unknown signal states.
        </p>

        <div class="sensor-strip" aria-label="Current demo sensors">
          <span>MAX30100 HR/SpO2</span>
          <span>MLX90614 temperature</span>
          <span>60s offline threshold</span>
        </div>

        <button class="primary-action" type="button" (click)="enterDemo()">
          Enter Demo
        </button>
      </section>
    </main>
  `,
})
export class DemoLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  enterDemo(): void {
    this.auth.enterDemo();
    void this.router.navigateByUrl('/dashboard');
  }
}

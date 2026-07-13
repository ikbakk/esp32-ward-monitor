import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { MonitorDataService } from '../core/services/monitor-data.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <aside class="sidebar" aria-label="Main navigation">
        <a class="brand" routerLink="/dashboard" aria-label="Ward Monitor dashboard">
          <span class="brand-mark" aria-hidden="true">WM</span>
          <span>
            <strong>Ward Monitor</strong>
            <small>Shift command board</small>
          </span>
        </a>

        <nav class="nav-links" aria-label="Primary">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          @for (ward of wards(); track ward.id) {
            <a [routerLink]="['/wards', ward.id]" routerLinkActive="active">{{ ward.name }}</a>
          }
        </nav>

        <section class="sidebar-status" aria-label="Current operational summary">
          <span>Critical</span>
          <strong>{{ summary().critical }}</strong>
          <span>Offline</span>
          <strong>{{ summary().offline }}</strong>
        </section>
      </aside>

      <div class="main-column">
        <header class="topbar">
          <div>
            <p class="eyebrow">Live demo mode</p>
            <h1>{{ pageTitle() }}</h1>
          </div>
          <div class="topbar-actions">
            <button type="button" class="ghost-button" (click)="togglePrivacy()">
              {{ privacyMode() ? 'Show names' : 'Privacy mode' }}
            </button>
            <button type="button" class="ghost-button" (click)="exitDemo()">Exit</button>
          </div>
        </header>

        <router-outlet />
      </div>
    </div>
  `,
})
export class ShellComponent {
  private readonly monitorData = inject(MonitorDataService);
  private readonly auth = inject(AuthService);

  readonly wards = this.monitorData.wards;
  readonly summary = this.monitorData.commandSummary;
  readonly privacyMode = signal(false);
  readonly pageTitle = computed(() => (this.privacyMode() ? 'Privacy view' : 'Clinical operations board'));

  togglePrivacy(): void {
    this.privacyMode.update((value) => !value);
    document.documentElement.dataset['privacy'] = this.privacyMode() ? 'on' : 'off';
  }

  exitDemo(): void {
    this.auth.exitDemo();
  }
}

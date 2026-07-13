import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideActivity, LucideBed, LucideBellRing, LucideBuilding2, LucideEyeOff, LucideHeartPulse, LucideHospital, LucideLayoutDashboard, LucideLogOut, LucidePanelLeftClose, LucidePanelLeftOpen, LucideUsers, LucideWifiOff } from '@lucide/angular';
import { filter, map } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { MonitorDataService } from '../core/services/monitor-data.service';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideActivity,
    LucideBed,
    LucideBellRing,
    LucideBuilding2,
    LucideEyeOff,
    LucideHeartPulse,
    LucideHospital,
    LucideLayoutDashboard,
    LucideLogOut,
    LucidePanelLeftClose,
    LucidePanelLeftOpen,
    LucideUsers,
    LucideWifiOff,
  ],
  template: `
    <div class="app-shell" [class.sidebar-compact]="!sidebarWide()">
      <aside class="sidebar" aria-label="Main navigation">
        <div class="sidebar-head">
          <a class="brand" routerLink="/dashboard" aria-label="Ward Monitor dashboard" title="Ward Monitor">
            <span class="brand-mark" aria-hidden="true"><svg lucideHospital class="icon"></svg></span>
            <span class="brand-copy">
              <strong>Ward Monitor</strong>
              <small>Shift command board</small>
            </span>
          </a>

          <button type="button" class="sidebar-toggle" (click)="toggleSidebar()" [attr.aria-label]="sidebarWide() ? 'Use compact sidebar' : 'Use wide sidebar'" [title]="sidebarWide() ? 'Compact sidebar' : 'Wide sidebar'">
            @if (sidebarWide()) {
              <svg lucidePanelLeftClose class="icon"></svg>
            } @else {
              <svg lucidePanelLeftOpen class="icon"></svg>
            }
          </button>
        </div>

        <nav class="nav-links" aria-label="Primary">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" title="Dashboard">
            <svg lucideLayoutDashboard class="icon"></svg>
            <span class="nav-label">Dashboard</span>
          </a>
          @for (ward of wards(); track ward.id) {
            <a [routerLink]="['/wards', ward.id]" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" [title]="ward.name">
              <svg lucideBuilding2 class="icon"></svg>
              <span class="nav-label">{{ ward.name }}</span>
            </a>
          }
        </nav>
      </aside>

      <div class="main-column">
        <header class="topbar">
          <div>
            <h1>{{ pageTitle() }}</h1>
          </div>

          <div class="header-command" aria-label="Command center">
            <span class="state-critical" title="Critical"><svg lucideBellRing class="icon"></svg><strong>{{ summary().critical }}</strong></span>
            <span class="state-warning" title="Warning"><svg lucideActivity class="icon"></svg><strong>{{ summary().warning }}</strong></span>
            <span class="state-offline" title="Offline"><svg lucideWifiOff class="icon"></svg><strong>{{ summary().offline }}</strong></span>
            <span title="Occupied beds"><svg lucideUsers class="icon"></svg><strong>{{ summary().occupied }}/{{ summary().totalBeds }}</strong></span>
            <span title="Unmonitored"><svg lucideHeartPulse class="icon"></svg><strong>{{ summary().unmonitored }}</strong></span>
            <span title="Vacant"><svg lucideBed class="icon"></svg><strong>{{ summary().vacant }}</strong></span>
          </div>

          <div class="topbar-actions">
            <button type="button" class="ghost-button" (click)="togglePrivacy()" [title]="privacyMode() ? 'Show names' : 'Privacy mode'">
              <svg lucideEyeOff class="icon button-icon"></svg>
              <span class="action-label">{{ privacyMode() ? 'Show names' : 'Privacy mode' }}</span>
            </button>
            <button type="button" class="ghost-button" (click)="signOut()" title="Sign out">
              <svg lucideLogOut class="icon button-icon"></svg>
              <span class="action-label">Sign out</span>
            </button>
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
  private readonly router = inject(Router);

  readonly wards = this.monitorData.wards;
  readonly summary = this.monitorData.commandSummary;
  readonly privacyMode = signal(false);
  readonly sidebarWide = signal(true);
  readonly currentUrl = toSignal(this.router.events.pipe(filter((event) => event instanceof NavigationEnd), map(() => this.router.url)), {
    initialValue: this.router.url,
  });
  readonly pageTitle = computed(() => {
    if (this.privacyMode()) {
      return 'Privacy view';
    }

    const url = this.currentUrl();
    const wardId = url.match(/^\/wards\/([^/?#]+)/)?.[1];
    const ward = this.wards().find((item) => item.id === wardId);

    if (ward) {
      return ward.name;
    }

    if (url.startsWith('/rooms/')) {
      return 'Room detail';
    }

    if (url.startsWith('/patients/')) {
      return 'Patient readings';
    }

    return 'Clinical operations board';
  });

  togglePrivacy(): void {
    this.privacyMode.update((value) => !value);
    document.documentElement.dataset['privacy'] = this.privacyMode() ? 'on' : 'off';
  }

  toggleSidebar(): void {
    this.sidebarWide.update((value) => !value);
  }

  signOut(): void {
    this.auth.signOut();
    void this.router.navigateByUrl('/');
  }
}

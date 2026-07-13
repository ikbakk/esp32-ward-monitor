import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideActivity, LucideBed, LucideBellRing, LucideRadio } from '@lucide/angular';
import { map } from 'rxjs';
import { MonitorDataService } from '../../core/services/monitor-data.service';
import { summarizeWard } from '../../core/services/status-helpers';
import { WardBoardComponent } from '../dashboard/ward-board.component';

@Component({
  selector: 'app-ward-detail',
  imports: [RouterLink, WardBoardComponent, LucideActivity, LucideBed, LucideBellRing, LucideRadio],
  template: `
    @if (ward(); as ward) {
      <main class="detail-page" aria-labelledby="ward-title">
        <a class="text-link" routerLink="/dashboard">← Dashboard</a>
        <section class="detail-hero">
          <div>
            <p class="eyebrow">{{ ward.floor }} · {{ ward.specialty }}</p>
            <h2 id="ward-title">{{ ward.name }}</h2>
            <p>Ward-level board for shift review, bed assignment, and monitoring state.</p>
          </div>
          <div class="detail-stats" aria-label="Ward stats">
            <span title="Occupied"><svg lucideBed class="icon pill-icon"></svg><strong>{{ wardSummary().occupied }}</strong></span>
            <span class="state-critical" title="Critical"><svg lucideBellRing class="icon pill-icon"></svg><strong>{{ wardSummary().critical }}</strong></span>
            <span class="state-warning" title="Warning"><svg lucideActivity class="icon pill-icon"></svg><strong>{{ wardSummary().warning }}</strong></span>
            <span class="state-unmonitored" title="Unmonitored"><svg lucideRadio class="icon pill-icon"></svg><strong>{{ wardSummary().unmonitored }}</strong></span>
          </div>
        </section>

        <app-ward-board [ward]="ward" />
      </main>
    } @else {
      <main class="detail-page"><p>Ward not found.</p></main>
    }
  `,
})
export class WardDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly monitorData = inject(MonitorDataService);

  readonly wardId = toSignal(this.route.paramMap.pipe(map((params) => params.get('wardId') ?? '')), { initialValue: this.route.snapshot.paramMap.get('wardId') ?? '' });
  readonly ward = computed(() => this.monitorData.findWard(this.wardId()));
  readonly wardSummary = computed(() => {
    const ward = this.ward();
    return ward ? summarizeWard(ward) : { occupied: 0, critical: 0, warning: 0, unmonitored: 0 };
  });
}

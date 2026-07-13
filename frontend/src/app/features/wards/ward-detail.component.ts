import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MonitorDataService } from '../../core/services/monitor-data.service';
import { summarizeWard } from '../../core/services/status-helpers';
import { WardBoardComponent } from '../dashboard/ward-board.component';

@Component({
  selector: 'app-ward-detail',
  imports: [RouterLink, WardBoardComponent],
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
            <span><strong>{{ wardSummary().occupied }}</strong> occupied</span>
            <span><strong>{{ wardSummary().critical }}</strong> critical</span>
            <span><strong>{{ wardSummary().warning }}</strong> warning</span>
            <span><strong>{{ wardSummary().unmonitored }}</strong> unmonitored</span>
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

  readonly ward = computed(() => this.monitorData.findWard(this.route.snapshot.paramMap.get('wardId') ?? ''));
  readonly wardSummary = computed(() => {
    const ward = this.ward();
    return ward ? summarizeWard(ward) : { occupied: 0, critical: 0, warning: 0, unmonitored: 0 };
  });
}

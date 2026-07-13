import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MonitorDataService } from '../../core/services/monitor-data.service';
import { formatVitalValue, getStateClass, getStateLabel } from '../../core/services/status-helpers';
import { WardBoardComponent } from './ward-board.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, WardBoardComponent],
  template: `
    <main class="page-grid" aria-labelledby="dashboard-title">
      <section class="command-panel">
        <div>
          <p class="eyebrow">Nurse shift priority</p>
          <h2 id="dashboard-title">Command center</h2>
        </div>

        <div class="summary-grid" aria-label="Hospital summary">
          <article class="summary-card critical"><strong>{{ summary().critical }}</strong><span>Critical</span></article>
          <article class="summary-card warning"><strong>{{ summary().warning }}</strong><span>Warning</span></article>
          <article class="summary-card offline"><strong>{{ summary().offline }}</strong><span>Offline</span></article>
          <article class="summary-card"><strong>{{ summary().occupied }}/{{ summary().totalBeds }}</strong><span>Occupied beds</span></article>
          <article class="summary-card"><strong>{{ summary().unmonitored }}</strong><span>Unmonitored</span></article>
          <article class="summary-card"><strong>{{ summary().vacant }}</strong><span>Vacant</span></article>
        </div>
      </section>

      <section class="priority-panel" aria-labelledby="priority-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Critical first</p>
            <h2 id="priority-title">Patients needing review</h2>
          </div>
          <span>{{ priorityBeds().length }} active notices</span>
        </div>

        <div class="priority-list">
          @for (item of priorityBeds(); track item.bed.id) {
            <a class="priority-item" [class]="stateClass(item.bed.state)" [routerLink]="item.bed.patient ? ['/patients', item.bed.patient.id] : ['/rooms', item.location.roomId]">
              <span class="priority-state">{{ stateLabel(item.bed.state) }}</span>
              <strong data-private-name>{{ item.bed.patient?.fullName ?? 'No patient assigned' }}</strong>
              <span>{{ item.location.wardName }} · {{ item.location.roomName }} · {{ item.location.bedLabel }}</span>
              @if (latestVitals(item.bed.id).length > 0) {
                <span class="priority-vitals">
                  @for (vital of latestVitals(item.bed.id); track vital.key) {
                    <span>{{ vital.label }} {{ formatVital(vital) }}</span>
                  }
                </span>
              }
            </a>
          } @empty {
            <p class="quiet-copy">No warning or critical demo patients right now.</p>
          }
        </div>
      </section>

      <section class="board-list" aria-label="Ward boards">
        @for (ward of wards(); track ward.id) {
          <app-ward-board [ward]="ward" />
        }
      </section>
    </main>
  `,
})
export class DashboardComponent {
  private readonly monitorData = inject(MonitorDataService);

  readonly wards = this.monitorData.wards;
  readonly summary = this.monitorData.commandSummary;
  readonly priorityBeds = this.monitorData.priorityBeds;

  stateClass = getStateClass;
  stateLabel = getStateLabel;
  formatVital = formatVitalValue;

  latestVitals(bedId: string) {
    return this.monitorData.snapshot().readings.find((reading) => reading.bedId === bedId)?.vitals ?? [];
  }
}

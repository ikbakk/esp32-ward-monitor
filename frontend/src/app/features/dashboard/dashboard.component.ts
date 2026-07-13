import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideActivity, LucideBellRing, LucideHeartPulse, LucideThermometer } from '@lucide/angular';
import { MonitorDataService } from '../../core/services/monitor-data.service';
import { formatVitalValue, getStateClass, getStateLabel } from '../../core/services/status-helpers';
import { WardBoardComponent } from './ward-board.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, WardBoardComponent, LucideActivity, LucideBellRing, LucideHeartPulse, LucideThermometer],
  template: `
    <main class="page-grid dashboard-only" aria-labelledby="priority-title">
      <section class="priority-panel" aria-labelledby="priority-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Critical first</p>
            <h2 id="priority-title">Needs review</h2>
          </div>
          <span title="Active notices"><svg lucideBellRing class="icon pill-icon"></svg>{{ priorityBeds().length }}</span>
        </div>

        <div class="priority-list">
          @for (item of priorityBeds(); track item.bed.id) {
            <a class="priority-item" [class]="stateClass(item.bed.state)" [routerLink]="item.bed.patient ? ['/patients', item.bed.patient.id] : ['/rooms', item.location.roomId]">
              <span class="priority-state" [title]="stateLabel(item.bed.state)"><svg lucideBellRing class="icon"></svg></span>
              <strong data-private-name>{{ item.bed.patient?.fullName ?? 'No patient assigned' }}</strong>
              <span>{{ item.location.wardName }} · {{ item.location.roomName }} · {{ item.location.bedLabel }}</span>
              @if (latestVitals(item.bed.id).length > 0) {
                <span class="priority-vitals">
                  @for (vital of latestVitals(item.bed.id); track vital.key) {
                    <span [title]="vital.label">
                      @if (vital.key === 'temperature') {
                        <svg lucideThermometer class="icon vital-icon"></svg>
                      } @else if (vital.key === 'heart-rate') {
                        <svg lucideHeartPulse class="icon vital-icon"></svg>
                      } @else {
                        <svg lucideActivity class="icon vital-icon"></svg>
                      }
                      {{ formatVital(vital) }}
                    </span>
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
  readonly priorityBeds = this.monitorData.priorityBeds;

  stateClass = getStateClass;
  stateLabel = getStateLabel;
  formatVital = formatVitalValue;

  latestVitals(bedId: string) {
    return this.monitorData.snapshot().readings.find((reading) => reading.bedId === bedId)?.vitals ?? [];
  }
}

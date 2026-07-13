import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Bed, ClinicalState, Ward } from '../../core/models/monitoring.models';
import { MonitorDataService } from '../../core/services/monitor-data.service';
import { findLatestReadingForBed, formatVitalValue, getStateClass, getStateLabel, getWardHighestState, summarizeWard } from '../../core/services/status-helpers';

@Component({
  selector: 'app-ward-board',
  imports: [RouterLink],
  template: `
    <section class="ward-board" [class]="wardStateClass()" [attr.aria-labelledby]="ward().id + '-title'">
      <header class="ward-board-header">
        <div>
          <p class="eyebrow">{{ ward().floor }} · {{ ward().specialty }}</p>
          <h2 [id]="ward().id + '-title'">{{ ward().name }}</h2>
        </div>
        <a class="text-link" [routerLink]="['/wards', ward().id]">Open ward</a>
      </header>

      <div class="ward-metrics" aria-label="Ward summary">
        <span><strong>{{ summary().critical }}</strong> critical</span>
        <span><strong>{{ summary().warning }}</strong> warning</span>
        <span><strong>{{ summary().offline }}</strong> offline</span>
        <span><strong>{{ summary().unmonitored }}</strong> unmonitored</span>
        <span><strong>{{ summary().vacant }}</strong> vacant</span>
      </div>

      <div class="room-stack">
        @for (room of ward().rooms; track room.id) {
          <article class="room-lane" [attr.aria-label]="room.name + ' beds'">
            <div class="room-label">
              <a [routerLink]="['/rooms', room.id]">{{ room.name }}</a>
              <span>{{ room.acuity }}</span>
            </div>

            <div class="bed-row">
              @for (bed of room.beds; track bed.id) {
                <a class="bed-tile" [class]="bedClass(bed)" [routerLink]="bed.patient ? ['/patients', bed.patient.id] : ['/rooms', room.id]">
                  <span class="bed-topline">
                    <strong>{{ bed.label }}</strong>
                    <span>{{ stateLabel(bed.state) }}</span>
                  </span>

                  @if (bed.patient) {
                    <span class="patient-name" data-private-name>{{ bed.patient.fullName }}</span>
                    <span class="patient-meta">{{ bed.patient.diagnosis }}</span>
                  } @else {
                    <span class="patient-name">Available bed</span>
                    <span class="patient-meta">No admitted patient</span>
                  }

                  @if (latestVitals(bed).length > 0) {
                    <span class="mini-vitals" aria-label="Latest vital signs">
                      @for (vital of latestVitals(bed); track vital.key) {
                        <span [class]="'mini-vital ' + stateClass(vital.state)">
                          {{ vital.label }} {{ formatVital(vital) }}
                        </span>
                      }
                    </span>
                  } @else if (bed.state === 'unmonitored') {
                    <span class="empty-vitals">No active hardware order</span>
                  } @else if (bed.state === 'vacant') {
                    <span class="empty-vitals">Ready for assignment</span>
                  }

                  @if (bed.device) {
                    <span class="device-line">
                      {{ bed.device.label }} · {{ bed.device.batteryPercent ?? 0 }}% · {{ bed.device.signalQuality ?? 'unknown' }} signal
                    </span>
                  }
                </a>
              }
            </div>
          </article>
        }
      </div>
    </section>
  `,
})
export class WardBoardComponent {
  readonly ward = input.required<Ward>();
  private readonly monitorData = inject(MonitorDataService);

  summary() {
    return summarizeWard(this.ward());
  }

  wardStateClass(): string {
    return getStateClass(getWardHighestState(this.ward()));
  }

  bedClass(bed: Bed): string {
    return `state-card ${getStateClass(bed.state)}`;
  }

  stateClass(state: ClinicalState): string {
    return getStateClass(state);
  }

  stateLabel(state: ClinicalState): string {
    return getStateLabel(state);
  }

  latestVitals(bed: Bed) {
    return findLatestReadingForBed(this.monitorData.snapshot(), bed)?.vitals ?? [];
  }

  formatVital = formatVitalValue;
}

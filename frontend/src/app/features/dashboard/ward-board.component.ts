import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideActivity, LucideBattery, LucideBed, LucideBellRing, LucideHeartPulse, LucideRadio, LucideThermometer, LucideWifi, LucideWifiOff } from '@lucide/angular';
import type { Bed, ClinicalState, Ward } from '../../core/models/monitoring.models';
import { MonitorDataService } from '../../core/services/monitor-data.service';
import { findLatestReadingForBed, formatVitalValue, getStateClass, getStateLabel, getWardHighestState, summarizeWard } from '../../core/services/status-helpers';

@Component({
  selector: 'app-ward-board',
  imports: [RouterLink, LucideActivity, LucideBattery, LucideBed, LucideBellRing, LucideHeartPulse, LucideRadio, LucideThermometer, LucideWifi, LucideWifiOff],
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
        <span class="state-critical" title="Critical"><svg lucideBellRing class="icon pill-icon"></svg><strong>{{ summary().critical }}</strong></span>
        <span class="state-warning" title="Warning"><svg lucideActivity class="icon pill-icon"></svg><strong>{{ summary().warning }}</strong></span>
        <span class="state-offline" title="Offline"><svg lucideWifiOff class="icon pill-icon"></svg><strong>{{ summary().offline }}</strong></span>
        <span class="state-unmonitored" title="Unmonitored"><svg lucideRadio class="icon pill-icon"></svg><strong>{{ summary().unmonitored }}</strong></span>
        <span class="state-vacant" title="Vacant"><svg lucideBed class="icon pill-icon"></svg><strong>{{ summary().vacant }}</strong></span>
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
                    <span [title]="stateLabel(bed.state)"><svg lucideBellRing class="icon"></svg></span>
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
                  } @else if (bed.state === 'unmonitored') {
                    <span class="empty-vitals" title="No active hardware order"><svg lucideRadio class="icon vital-icon"></svg></span>
                  } @else if (bed.state === 'vacant') {
                    <span class="empty-vitals" title="Ready for assignment"><svg lucideBed class="icon vital-icon"></svg></span>
                  }

                  @if (bed.device) {
                    <span class="device-line">
                      <span title="Battery"><svg lucideBattery class="icon vital-icon"></svg>{{ bed.device.batteryPercent ?? 0 }}%</span>
                      <span [title]="'Signal: ' + (bed.device.signalQuality ?? 'unknown')"><svg lucideWifi class="icon vital-icon"></svg>{{ bed.device.signalQuality ?? 'unknown' }}</span>
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

import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideActivity, LucideBattery, LucideBed, LucideHeartPulse, LucideThermometer, LucideWifi } from '@lucide/angular';
import { map } from 'rxjs';
import type { Bed, ClinicalState } from '../../core/models/monitoring.models';
import { MonitorDataService } from '../../core/services/monitor-data.service';
import { findLatestReadingForBed, formatVitalValue, getStateClass, getStateLabel } from '../../core/services/status-helpers';

@Component({
  selector: 'app-room-detail',
  imports: [RouterLink, LucideActivity, LucideBattery, LucideBed, LucideHeartPulse, LucideThermometer, LucideWifi],
  template: `
    @if (room(); as room) {
      <main class="detail-page" aria-labelledby="room-title">
        <a class="text-link" [routerLink]="['/wards', room.wardId]">← Back to ward</a>
        <section class="detail-hero compact">
          <div>
            <p class="eyebrow">{{ room.acuity }} room</p>
            <h2 id="room-title">{{ room.name }}</h2>
            <p>Bed-level state with device metadata and latest mock vitals.</p>
          </div>
        </section>

        <section class="room-detail-grid" aria-label="Room beds">
          @for (bed of room.beds; track bed.id) {
            <article class="bed-detail" [class]="stateClass(bed.state)">
              <header>
                <span><svg lucideBed class="icon vital-icon"></svg>{{ bed.label }}</span>
                <strong [title]="stateLabel(bed.state)"><svg lucideActivity class="icon"></svg></strong>
              </header>

              @if (bed.patient) {
                <h3 data-private-name>{{ bed.patient.fullName }}</h3>
                <p>{{ bed.patient.age }} · {{ bed.patient.sex }} · {{ bed.patient.diagnosis }}</p>
                <a class="text-link" [routerLink]="['/patients', bed.patient.id]">Open patient history</a>
              } @else {
                <h3>Vacant bed</h3>
                <p>Ready for admission or hardware reassignment.</p>
              }

              @if (latestVitals(bed).length > 0) {
                <div class="vital-table" aria-label="Latest vitals">
                  @for (vital of latestVitals(bed); track vital.key) {
                    <div [class]="'vital-row ' + stateClass(vital.state)">
                      <span>
                        @if (vital.key === 'temperature') {
                          <svg lucideThermometer class="icon vital-icon"></svg>
                        } @else if (vital.key === 'heart-rate') {
                          <svg lucideHeartPulse class="icon vital-icon"></svg>
                        } @else {
                          <svg lucideActivity class="icon vital-icon"></svg>
                        }
                        <span class="sr-only">{{ vital.label }}</span>
                      </span>
                      <strong>{{ formatVital(vital) }}</strong>
                    </div>
                  }
                </div>
              } @else {
                <p class="quiet-copy">No live vitals for this bed state.</p>
              }

              @if (bed.device) {
                <dl class="device-meta">
                  <div><dt><svg lucideActivity class="icon vital-icon"></svg>Device</dt><dd>{{ bed.device.label }}</dd></div>
                  <div><dt><svg lucideBattery class="icon vital-icon"></svg>Battery</dt><dd>{{ bed.device.batteryPercent ?? 0 }}%</dd></div>
                  <div><dt><svg lucideWifi class="icon vital-icon"></svg>WiFi</dt><dd>{{ bed.device.wifiRssi ?? 0 }} dBm</dd></div>
                  <div><dt><svg lucideWifi class="icon vital-icon"></svg>Signal</dt><dd>{{ bed.device.signalQuality ?? 'unknown' }}</dd></div>
                </dl>
              }
            </article>
          }
        </section>
      </main>
    } @else {
      <main class="detail-page"><p>Room not found.</p></main>
    }
  `,
})
export class RoomDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly monitorData = inject(MonitorDataService);

  readonly roomId = toSignal(this.route.paramMap.pipe(map((params) => params.get('roomId') ?? '')), { initialValue: this.route.snapshot.paramMap.get('roomId') ?? '' });
  readonly room = computed(() => this.monitorData.findRoom(this.roomId()));

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

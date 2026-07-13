import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideActivity, LucideBattery, LucideBellRing, LucideClock, LucideHeartPulse, LucideRadio, LucideThermometer, LucideWifi } from '@lucide/angular';
import { map } from 'rxjs';
import { MonitorDataService } from '../../core/services/monitor-data.service';
import { formatVitalValue, getStateClass, getStateLabel } from '../../core/services/status-helpers';

@Component({
  selector: 'app-patient-detail',
  imports: [RouterLink, LucideActivity, LucideBattery, LucideBellRing, LucideClock, LucideHeartPulse, LucideRadio, LucideThermometer, LucideWifi],
  template: `
    @if (patientBed(); as item) {
      <main class="detail-page" aria-labelledby="patient-title">
        <a class="text-link" [routerLink]="['/rooms', item.location.roomId]">← Back to {{ item.location.roomName }}</a>
        <section class="detail-hero patient-hero" [class]="stateClass(item.bed.state)">
          <div>
            <p class="eyebrow">{{ item.location.wardName }} · {{ item.location.roomName }} · {{ item.location.bedLabel }}</p>
            <h2 id="patient-title" data-private-name>{{ item.bed.patient?.fullName }}</h2>
            <p>{{ item.bed.patient?.diagnosis }} · {{ item.bed.patient?.monitoringPlan }}</p>
          </div>
          <strong class="state-pill" [title]="stateLabel(item.bed.state)"><svg lucideBellRing class="icon pill-icon"></svg></strong>
        </section>

        <section class="patient-layout">
          <article class="history-panel">
            <h3>Latest readings</h3>
            @for (reading of readings(); track reading.id) {
              <div class="reading-block">
                <time [attr.datetime]="reading.timestamp"><svg lucideClock class="icon vital-icon"></svg>{{ formatDate(reading.timestamp) }}</time>
                <div class="vital-table">
                  @for (vital of reading.vitals; track vital.key) {
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
              </div>
            } @empty {
              <p class="quiet-copy">No sensor readings are attached to this admission.</p>
            }
          </article>

          <aside class="care-panel" aria-label="Monitoring notes">
            <h3>Monitoring state</h3>
            <p>{{ item.bed.notes ?? 'No shift note attached to this demo bed.' }}</p>
            @if (item.bed.device) {
              <dl class="device-meta stacked">
                <div><dt><svg lucideRadio class="icon vital-icon"></svg>Device</dt><dd>{{ item.bed.device.label }}</dd></div>
                <div><dt><svg lucideActivity class="icon vital-icon"></svg>Status</dt><dd>{{ item.bed.device.status }}</dd></div>
                <div><dt><svg lucideBattery class="icon vital-icon"></svg>Battery</dt><dd>{{ item.bed.device.batteryPercent ?? 0 }}%</dd></div>
                <div><dt><svg lucideWifi class="icon vital-icon"></svg>Signal quality</dt><dd>{{ item.bed.device.signalQuality ?? 'unknown' }}</dd></div>
              </dl>
            } @else {
              <p class="quiet-copy">This patient is admitted without active ESP32 hardware.</p>
            }
          </aside>
        </section>
      </main>
    } @else {
      <main class="detail-page"><p>Patient not found.</p></main>
    }
  `,
})
export class PatientDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly monitorData = inject(MonitorDataService);

  readonly patientId = toSignal(this.route.paramMap.pipe(map((params) => params.get('patientId') ?? '')), { initialValue: this.route.snapshot.paramMap.get('patientId') ?? '' });
  readonly patientBed = computed(() => this.monitorData.findPatientBed(this.patientId()));
  readonly readings = computed(() => this.monitorData.readingsForPatient(this.patientId()));

  stateClass = getStateClass;
  stateLabel = getStateLabel;
  formatVital = formatVitalValue;

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(value));
  }
}

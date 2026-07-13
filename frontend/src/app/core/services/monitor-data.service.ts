import { Service, computed, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MOCK_HOSPITAL } from '../data/mock-monitoring.data';
import type { BedWithLocation, HospitalSnapshot, Patient, Reading, Room, Ward } from '../models/monitoring.models';
import { flattenBeds, getPriorityBeds, summarizeHospital, summarizeWard } from './status-helpers';

@Service()
export class MonitorDataService {
  private readonly hospitalSnapshot = signal<HospitalSnapshot>(MOCK_HOSPITAL);

  readonly dataSource = environment.monitorDataSource;
  readonly snapshot = this.hospitalSnapshot.asReadonly();
  readonly wards = computed(() => this.snapshot().wards);
  readonly commandSummary = computed(() => summarizeHospital(this.snapshot()));
  readonly priorityBeds = computed(() => getPriorityBeds(this.snapshot()));
  readonly allBeds = computed(() => flattenBeds(this.snapshot()));

  readonly wardSummaries = computed(() => this.wards().map((ward) => summarizeWard(ward)));

  findWard(wardId: string): Ward | undefined {
    return this.wards().find((ward) => ward.id === wardId);
  }

  findRoom(roomId: string): Room | undefined {
    return this.wards()
      .flatMap((ward) => ward.rooms)
      .find((room) => room.id === roomId);
  }

  findPatient(patientId: string): Patient | undefined {
    return this.allBeds()
      .map(({ bed }) => bed.patient)
      .find((patient) => patient?.id === patientId);
  }

  findPatientBed(patientId: string): BedWithLocation | undefined {
    return this.allBeds().find(({ bed }) => bed.patient?.id === patientId);
  }

  readingsForPatient(patientId: string): Reading[] {
    return this.snapshot()
      .readings.filter((reading) => reading.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

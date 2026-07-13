import type {
  Bed,
  BedLocation,
  BedWithLocation,
  ClinicalState,
  CommandSummary,
  Device,
  HospitalSnapshot,
  Reading,
  VitalReading,
  Ward,
  WardSummary,
} from '../models/monitoring.models';

const statePriority: Record<ClinicalState, number> = {
  critical: 7,
  warning: 6,
  offline: 5,
  unknown: 4,
  unmonitored: 3,
  normal: 2,
  vacant: 1,
};

export function compareClinicalState(a: ClinicalState, b: ClinicalState): number {
  return statePriority[b] - statePriority[a];
}

export function getStateLabel(state: ClinicalState): string {
  switch (state) {
    case 'normal':
      return 'Normal';
    case 'warning':
      return 'Warning';
    case 'critical':
      return 'Critical';
    case 'offline':
      return 'Device offline';
    case 'unmonitored':
      return 'Unmonitored';
    case 'vacant':
      return 'Vacant';
    case 'unknown':
      return 'Unknown signal';
  }
}

export function getStateClass(state: ClinicalState): string {
  return `state-${state}`;
}

export function getVitalState(vital: VitalReading): ClinicalState {
  if (vital.state !== 'unknown') {
    return vital.state;
  }

  if (vital.value === null) {
    return 'unknown';
  }

  if (typeof vital.value !== 'number') {
    return 'normal';
  }

  switch (vital.key) {
    case 'heart-rate':
      return getHeartRateState(vital.value);
    case 'spo2':
      return getSpo2State(vital.value);
    case 'temperature':
      return getTemperatureState(vital.value);
    default:
      return 'normal';
  }
}

export function getHeartRateState(value: number): ClinicalState {
  if (value < 40 || value > 130) {
    return 'critical';
  }

  if (value < 50 || value > 120) {
    return 'warning';
  }

  return 'normal';
}

export function getSpo2State(value: number): ClinicalState {
  if (value < 90) {
    return 'critical';
  }

  if (value < 95) {
    return 'warning';
  }

  return 'normal';
}

export function getTemperatureState(value: number): ClinicalState {
  if (value >= 39) {
    return 'critical';
  }

  if (value >= 37.8) {
    return 'warning';
  }

  return 'normal';
}

export function isDeviceOffline(device: Device | undefined, now = Date.now()): boolean {
  if (!device || device.status === 'offline') {
    return true;
  }

  if (!device.lastSeenAt) {
    return device.status !== 'online';
  }

  return now - new Date(device.lastSeenAt).getTime() > 60_000;
}

export function formatVitalValue(vital: VitalReading): string {
  if (vital.value === null) {
    return '—';
  }

  if (typeof vital.value === 'boolean') {
    return vital.value ? 'Yes' : 'No';
  }

  return `${vital.value}${vital.unit ? ` ${vital.unit}` : ''}`;
}

export function findLatestReadingForBed(snapshot: HospitalSnapshot, bed: Bed): Reading | undefined {
  if (!bed.device) {
    return undefined;
  }

  const readings = snapshot.readings
    .filter((reading) => reading.deviceId === bed.device?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return readings[0];
}

export function flattenBeds(snapshot: HospitalSnapshot): BedWithLocation[] {
  return snapshot.wards.flatMap((ward) =>
    ward.rooms.flatMap((room) =>
      room.beds.map((bed) => ({
        bed,
        location: {
          wardId: ward.id,
          wardName: ward.name,
          roomId: room.id,
          roomName: room.name,
          bedId: bed.id,
          bedLabel: bed.label,
        } satisfies BedLocation,
      })),
    ),
  );
}

export function getPriorityBeds(snapshot: HospitalSnapshot): BedWithLocation[] {
  return flattenBeds(snapshot)
    .filter(({ bed }) => ['critical', 'warning', 'offline', 'unknown'].includes(bed.state))
    .sort((a, b) => compareClinicalState(a.bed.state, b.bed.state));
}

export function summarizeHospital(snapshot: HospitalSnapshot): CommandSummary {
  const beds = flattenBeds(snapshot).map(({ bed }) => bed);

  return {
    totalBeds: beds.length,
    occupied: beds.filter((bed) => bed.patient).length,
    monitored: beds.filter((bed) => bed.patient && bed.device && bed.state !== 'offline').length,
    critical: beds.filter((bed) => bed.state === 'critical').length,
    warning: beds.filter((bed) => bed.state === 'warning').length,
    offline: beds.filter((bed) => bed.state === 'offline').length,
    unmonitored: beds.filter((bed) => bed.state === 'unmonitored').length,
    vacant: beds.filter((bed) => bed.state === 'vacant').length,
    unknown: beds.filter((bed) => bed.state === 'unknown').length,
  };
}

export function summarizeWard(ward: Ward): WardSummary {
  const beds = ward.rooms.flatMap((room) => room.beds);

  return {
    wardId: ward.id,
    wardName: ward.name,
    critical: beds.filter((bed) => bed.state === 'critical').length,
    warning: beds.filter((bed) => bed.state === 'warning').length,
    offline: beds.filter((bed) => bed.state === 'offline').length,
    unmonitored: beds.filter((bed) => bed.state === 'unmonitored').length,
    vacant: beds.filter((bed) => bed.state === 'vacant').length,
    occupied: beds.filter((bed) => bed.patient).length,
    totalBeds: beds.length,
  };
}

export function getWardHighestState(ward: Ward): ClinicalState {
  const states = ward.rooms.flatMap((room) => room.beds.map((bed) => bed.state));
  return [...states].sort(compareClinicalState)[0] ?? 'vacant';
}

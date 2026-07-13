export type ClinicalState =
  | 'normal'
  | 'warning'
  | 'critical'
  | 'offline'
  | 'unmonitored'
  | 'vacant'
  | 'unknown';

export type DeviceStatus = 'online' | 'offline' | 'maintenance' | 'unknown';
export type SignalQuality = 'good' | 'fair' | 'poor' | 'unknown';
export type VitalValue = number | string | boolean | null;

export interface HospitalSnapshot {
  id: string;
  name: string;
  generatedAt: string;
  wards: Ward[];
  readings: Reading[];
}

export interface Ward {
  id: string;
  name: string;
  specialty: string;
  floor: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;
  wardId: string;
  acuity: 'standard' | 'stepdown' | 'icu' | 'isolation';
  beds: Bed[];
}

export interface Bed {
  id: string;
  label: string;
  roomId: string;
  patient?: Patient;
  device?: Device;
  state: ClinicalState;
  notes?: string;
}

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  sex: 'Female' | 'Male' | 'Other';
  admissionDate: string;
  diagnosis: string;
  attendingTeam: string;
  monitoringPlan: 'continuous' | 'spot-check' | 'not-ordered';
}

export interface Device {
  id: string;
  label: string;
  assignedBedId?: string;
  status: DeviceStatus;
  batteryPercent?: number;
  wifiRssi?: number;
  signalQuality?: SignalQuality;
  lastSeenAt?: string;
  firmware?: string;
}

export interface Reading {
  id: string;
  deviceId: string;
  patientId?: string;
  roomId: string;
  bedId?: string;
  timestamp: string;
  vitals: VitalReading[];
}

export interface VitalReading {
  key: string;
  label: string;
  value: VitalValue;
  unit?: string;
  state: ClinicalState;
  trend?: 'up' | 'down' | 'flat' | 'unknown';
  source?: 'MAX30100' | 'MLX90614' | 'manual' | 'future-sensor' | 'mock';
}

export interface BedLocation {
  wardId: string;
  wardName: string;
  roomId: string;
  roomName: string;
  bedId: string;
  bedLabel: string;
}

export interface BedWithLocation {
  bed: Bed;
  location: BedLocation;
}

export interface WardSummary {
  wardId: string;
  wardName: string;
  critical: number;
  warning: number;
  offline: number;
  unmonitored: number;
  vacant: number;
  occupied: number;
  totalBeds: number;
}

export interface CommandSummary {
  totalBeds: number;
  occupied: number;
  monitored: number;
  critical: number;
  warning: number;
  offline: number;
  unmonitored: number;
  vacant: number;
  unknown: number;
}

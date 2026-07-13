import type { Bed, Device, HospitalSnapshot, Patient, Reading, VitalReading, Ward } from '../models/monitoring.models';
import { getHeartRateState, getSpo2State, getTemperatureState } from '../services/status-helpers';

const now = Date.now();
const isoAgo = (seconds: number): string => new Date(now - seconds * 1000).toISOString();

const patient = (
  id: string,
  fullName: string,
  age: number,
  sex: Patient['sex'],
  diagnosis: string,
  monitoringPlan: Patient['monitoringPlan'] = 'continuous',
): Patient => ({
  id,
  fullName,
  age,
  sex,
  diagnosis,
  monitoringPlan,
  admissionDate: isoAgo(86_400 * (Number(id.replace(/\D/g, '')) % 12 + 1)),
  attendingTeam: monitoringPlan === 'not-ordered' ? 'General Medicine' : 'Nursing Shift A',
});

const device = (
  id: string,
  assignedBedId: string,
  status: Device['status'],
  lastSeenSecondsAgo: number,
  batteryPercent: number,
  wifiRssi: number,
  signalQuality: Device['signalQuality'],
): Device => ({
  id,
  label: id.toUpperCase(),
  assignedBedId,
  status,
  batteryPercent,
  wifiRssi,
  signalQuality,
  lastSeenAt: isoAgo(lastSeenSecondsAgo),
  firmware: 'demo-0.4.2',
});

const heroVitals = (hr: number | null, spo2: number | null, temp: number | null): VitalReading[] => [
  {
    key: 'heart-rate',
    label: 'Heart rate',
    value: hr,
    unit: 'bpm',
    state: hr === null ? 'unknown' : getHeartRateState(hr),
    trend: hr !== null && hr > 100 ? 'up' : 'flat',
    source: 'MAX30100',
  },
  {
    key: 'spo2',
    label: 'SpO2',
    value: spo2,
    unit: '%',
    state: spo2 === null ? 'unknown' : getSpo2State(spo2),
    trend: spo2 !== null && spo2 < 95 ? 'down' : 'flat',
    source: 'MAX30100',
  },
  {
    key: 'temperature',
    label: 'Temperature',
    value: temp,
    unit: '°C',
    state: temp === null ? 'unknown' : getTemperatureState(temp),
    trend: temp !== null && temp >= 37.8 ? 'up' : 'flat',
    source: 'MLX90614',
  },
];

const reading = (
  id: string,
  deviceId: string,
  patientId: string,
  roomId: string,
  bedId: string,
  secondsAgo: number,
  vitals: VitalReading[],
): Reading => ({
  id,
  deviceId,
  patientId,
  roomId,
  bedId,
  timestamp: isoAgo(secondsAgo),
  vitals,
});

const bed = (payload: Bed): Bed => payload;

const b101aPatient = patient('patient-101-a', 'Amina Hartono', 62, 'Female', 'Post-operative observation');
const b101bPatient = patient('patient-101-b', 'Rizky Pratama', 48, 'Male', 'Pneumonia watch');
const b102aPatient = patient('patient-102-a', 'Clara Wibowo', 77, 'Female', 'Sepsis risk');
const b103aPatient = patient('patient-103-a', 'Michael Tan', 54, 'Male', 'Cardiac telemetry');
const b201aPatient = patient('patient-201-a', 'Sofia Lestari', 31, 'Female', 'Dengue recovery', 'spot-check');
const b201bPatient = patient('patient-201-b', 'Yusuf Maulana', 66, 'Male', 'Stroke recovery', 'continuous');
const b202aPatient = patient('patient-202-a', 'Nadia Putri', 42, 'Female', 'Rawat inap observation', 'not-ordered');
const b301aPatient = patient('patient-301-a', 'Bima Saputra', 59, 'Male', 'Respiratory observation');
const b301bPatient = patient('patient-301-b', 'Emma Rodriguez', 39, 'Female', 'Fever workup');

export const MOCK_HOSPITAL: HospitalSnapshot = {
  id: 'hospital-demo',
  name: 'Ward Monitor Demo Hospital',
  generatedAt: new Date(now).toISOString(),
  wards: [
    {
      id: 'ward-medical',
      name: 'Medical Ward',
      specialty: 'Internal Medicine',
      floor: 'Level 2',
      rooms: [
        {
          id: 'room-101',
          name: 'Room 101',
          wardId: 'ward-medical',
          acuity: 'standard',
          beds: [
            bed({
              id: 'bed-101-a',
              label: 'Bed A',
              roomId: 'room-101',
              state: 'normal',
              patient: b101aPatient,
              device: device('esp-101-a', 'bed-101-a', 'online', 8, 88, -52, 'good'),
            }),
            bed({
              id: 'bed-101-b',
              label: 'Bed B',
              roomId: 'room-101',
              state: 'warning',
              patient: b101bPatient,
              device: device('esp-101-b', 'bed-101-b', 'online', 11, 72, -64, 'fair'),
              notes: 'SpO2 trending down; review after rounds.',
            }),
          ],
        },
        {
          id: 'room-102',
          name: 'Room 102',
          wardId: 'ward-medical',
          acuity: 'stepdown',
          beds: [
            bed({
              id: 'bed-102-a',
              label: 'Bed A',
              roomId: 'room-102',
              state: 'critical',
              patient: b102aPatient,
              device: device('esp-102-a', 'bed-102-a', 'online', 5, 61, -58, 'good'),
              notes: 'Critical oxygen saturation in demo data.',
            }),
            bed({
              id: 'bed-102-b',
              label: 'Bed B',
              roomId: 'room-102',
              state: 'vacant',
            }),
          ],
        },
        {
          id: 'room-103',
          name: 'Room 103',
          wardId: 'ward-medical',
          acuity: 'standard',
          beds: [
            bed({
              id: 'bed-103-a',
              label: 'Bed A',
              roomId: 'room-103',
              state: 'offline',
              patient: b103aPatient,
              device: device('esp-103-a', 'bed-103-a', 'offline', 140, 19, -81, 'unknown'),
              notes: 'Device has not checked in within 60 seconds.',
            }),
          ],
        },
      ],
    },
    {
      id: 'ward-surgical',
      name: 'Surgical Ward',
      specialty: 'Post-op and recovery',
      floor: 'Level 3',
      rooms: [
        {
          id: 'room-201',
          name: 'Room 201',
          wardId: 'ward-surgical',
          acuity: 'standard',
          beds: [
            bed({
              id: 'bed-201-a',
              label: 'Bed A',
              roomId: 'room-201',
              state: 'normal',
              patient: b201aPatient,
              device: device('esp-201-a', 'bed-201-a', 'online', 7, 93, -49, 'good'),
            }),
            bed({
              id: 'bed-201-b',
              label: 'Bed B',
              roomId: 'room-201',
              state: 'unknown',
              patient: b201bPatient,
              device: device('esp-201-b', 'bed-201-b', 'online', 4, 55, -72, 'poor'),
              notes: 'Poor MAX30100 contact quality; values withheld.',
            }),
          ],
        },
        {
          id: 'room-202',
          name: 'Room 202',
          wardId: 'ward-surgical',
          acuity: 'standard',
          beds: [
            bed({
              id: 'bed-202-a',
              label: 'Bed A',
              roomId: 'room-202',
              state: 'unmonitored',
              patient: b202aPatient,
              notes: 'Admitted inpatient without active sensor order.',
            }),
            bed({
              id: 'bed-202-b',
              label: 'Bed B',
              roomId: 'room-202',
              state: 'vacant',
            }),
          ],
        },
      ],
    },
    {
      id: 'ward-respiratory',
      name: 'Respiratory Ward',
      specialty: 'Pulmonary care',
      floor: 'Level 4',
      rooms: [
        {
          id: 'room-301',
          name: 'Room 301',
          wardId: 'ward-respiratory',
          acuity: 'stepdown',
          beds: [
            bed({
              id: 'bed-301-a',
              label: 'Bed A',
              roomId: 'room-301',
              state: 'warning',
              patient: b301aPatient,
              device: device('esp-301-a', 'bed-301-a', 'online', 10, 80, -60, 'fair'),
            }),
            bed({
              id: 'bed-301-b',
              label: 'Bed B',
              roomId: 'room-301',
              state: 'warning',
              patient: b301bPatient,
              device: device('esp-301-b', 'bed-301-b', 'online', 12, 77, -63, 'good'),
            }),
          ],
        },
      ],
    },
  ] satisfies Ward[],
  readings: [
    reading('reading-101-a', 'esp-101-a', b101aPatient.id, 'room-101', 'bed-101-a', 8, heroVitals(78, 98, 36.8)),
    reading('reading-101-b', 'esp-101-b', b101bPatient.id, 'room-101', 'bed-101-b', 11, heroVitals(108, 92, 37.4)),
    reading('reading-102-a', 'esp-102-a', b102aPatient.id, 'room-102', 'bed-102-a', 5, heroVitals(132, 88, 38.6)),
    reading('reading-103-a', 'esp-103-a', b103aPatient.id, 'room-103', 'bed-103-a', 140, heroVitals(86, 96, 36.9)),
    reading('reading-201-a', 'esp-201-a', b201aPatient.id, 'room-201', 'bed-201-a', 7, heroVitals(72, 99, 36.6)),
    reading('reading-201-b', 'esp-201-b', b201bPatient.id, 'room-201', 'bed-201-b', 4, heroVitals(null, null, 36.7)),
    reading('reading-301-a', 'esp-301-a', b301aPatient.id, 'room-301', 'bed-301-a', 10, heroVitals(116, 94, 37.2)),
    reading('reading-301-b', 'esp-301-b', b301bPatient.id, 'room-301', 'bed-301-b', 12, heroVitals(101, 96, 38.2)),
  ],
};

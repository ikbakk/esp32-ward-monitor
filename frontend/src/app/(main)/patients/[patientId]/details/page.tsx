"use client";

import PatientCriticalAlerts from "@/components/patientCriticalAlerts";
import PatientVitalTrends from "@/components/patientVitalTrends";
import TimeRangeSelector from "@/components/timeRangeSelector";
import SkeletonText from "@/components/ui/skeleton-text";
import { getPatient } from "@/hooks/queries/patients";
import {
  TimeRange,
  useReadingsRealtime,
} from "@/hooks/useRealtimeReadingsByTimeRange";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function GraphsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const pathname = usePathname();
  const patientId = pathname.split("/")[2];

  const { patient } = getPatient(patientId);
  const { data } = useReadingsRealtime({ timeRange, patientId });

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4 flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <SkeletonText
            loading={!patient}
            skeletonClassName="w-full h-8 bg-gray-200"
          >
            <h2 className="w-full text-2xl font-bold text-foreground">
              {patient?.name}
            </h2>
          </SkeletonText>
          <h4 className="w-full text-muted-foreground">
            <SkeletonText
              loading={!patient}
              skeletonClassName="w-full h-6 bg-gray-200"
            >
              Age {patient?.age} - Admission Date {patient?.admission_date}
            </SkeletonText>
          </h4>
        </div>
        <div className="flex items-center gap-3">
          Timeframe:
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
      </div>
      {data ? (
        <PatientVitalTrends currentPatientData={data ? data : []} />
      ) : (
        <div>Fetching data</div>
      )}
      <PatientCriticalAlerts />
    </div>
  );
}

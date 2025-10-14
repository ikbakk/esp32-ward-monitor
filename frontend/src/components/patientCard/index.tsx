"use client";

import { Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import PatientCardContent from "./patientCardContent";
import PatientInfo from "./patientInfo";
import { getConditionColor } from "./cardUtils";
import PatientCardHeader from "./cardHeader";
import last from "lodash/last";
import SkeletonText from "../ui/skeleton-text";
import type { PatientTable } from "@/types/supabase";
import { getReadings } from "@/hooks/queries/readings";

interface PatientCardProps {
  patient: PatientTable;
  isLoading: boolean;
}

const PatientCard = ({ patient, isLoading }: PatientCardProps) => {
  const { data: readings } = getReadings(patient.id);
  const latestReadings = last(readings);
  const date = latestReadings?.timestamp
    ? new Date(latestReadings.timestamp).toLocaleDateString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null; // or undefined, or a fallback date

  return (
    <Card className="max-w w-full-sm border border-gray-800">
      <CardHeader className={`${getConditionColor("normal")} p-4 text-white`}>
        <PatientCardHeader
          isLoading={isLoading}
          roomName={patient.room_location || ""}
          bedName={patient.bed_number || ""}
          patientCondition={"normal"}
        />
      </CardHeader>

      <CardContent className="flex flex-col gap-4 p-4">
        {/* Patient Info */}
        <PatientInfo
          isLoading={isLoading}
          name={patient.name}
          age={patient.age}
          admissionDate={patient.admission_date || ""}
        />

        {/* Vital Signs */}
        <PatientCardContent
          isLoading={isLoading}
          latestReading={latestReadings}
          // abnormalities={getAbnormalities("")}
        />
      </CardContent>

      {/* Footer */}
      <CardFooter className="px-4 pb-4">
        <div className="flex w-full items-center justify-between rounded bg-gray-50 p-2 text-xs text-gray-500">
          <SkeletonText
            loading={false}
            className="flex w-full items-center gap-1"
            skeletonClassName="w-[65%] h-8 bg-gray-200"
          >
            <Clock className="h-4 w-4" />
            Last updated: <br />
            {date}
          </SkeletonText>
          <SkeletonText
            loading={isLoading}
            skeletonClassName="h-8 w-24 bg-gray-200"
          >
            <Link href={`/patients/${patient.id}/details`}>
              <Button
                variant="link"
                size="sm"
                className="text-xs hover:cursor-pointer"
              >
                View Details
              </Button>
            </Link>
          </SkeletonText>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PatientCard;

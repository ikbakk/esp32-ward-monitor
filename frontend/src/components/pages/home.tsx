"use client";

import PatientCard from "@/components/patientCard";
import { getPatients } from "@/hooks/queries/patients";

export default function HomePage() {
  const { data: patients, isLoading } = getPatients();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {patients
        ? patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              isLoading={isLoading}
            />
          ))
        : null}
    </div>
  );
}

import { LayoutDashboard } from "lucide-react";
import HomePage from "@/components/pages/home";

export default function Home() {
  return (
    <div className="flex-1 w-full space-y-6">
      <div className="mb-6">
        <h2 className="flex items-center text-2xl font-bold text-foreground">
          <LayoutDashboard className="mr-2 h-4 w-4" /> Patient Monitoring
        </h2>
        <p className="text-gray-600">
          Real-time vital signs and patient status
        </p>
      </div>

      <HomePage />
    </div>
  );
}

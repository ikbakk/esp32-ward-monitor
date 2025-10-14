"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TimeRange } from "@/hooks/useRealtimeReadingsByTimeRange";

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: TimeRange) => void;
}

const TimeRangeSelector = ({ value, onChange }: TimeRangeSelectorProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Time range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="6h">Last 6h</SelectItem>
        <SelectItem value="12h">Last 12h</SelectItem>
        <SelectItem value="24h">Last 24h</SelectItem>
        <SelectItem value="48h">Last 48h</SelectItem>
        <SelectItem value="all">All records</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default TimeRangeSelector;

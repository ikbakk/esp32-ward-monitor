import type { RealtimeChannel } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import type { ReadingsTable } from "@/types/supabase";

export type TimeRange = "6h" | "12h" | "24h" | "48h" | "all";

interface HooksProps {
  enabled?: boolean;
  patientId: string;
  timeRange: TimeRange;
}

const getCutoffTimestamp = (range: Exclude<TimeRange, "all">): string => {
  const now = Date.now();
  const hoursMap: Record<Exclude<TimeRange, "all">, number> = {
    "6h": 6,
    "12h": 12,
    "24h": 24,
    "48h": 48,
  };
  const cutoff = new Date(now - hoursMap[range] * 60 * 60 * 1000);
  return cutoff.toISOString();
};

export const useReadingsRealtime = ({
  enabled = true,
  patientId,
  timeRange,
}: HooksProps) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const queryKey = ["readings", timeRange, patientId];

  const query = useQuery<ReadingsTable[]>({
    queryKey,
    queryFn: async () => {
      let query = supabaseClient
        .from("readings")
        .select("*")
        .eq("patient_id", patientId);

      if (timeRange !== "all") {
        const cutoff = getCutoffTimestamp(timeRange);
        query = query.gte("timestamp", cutoff);
      }

      const { data, error } = await query.order("timestamp", {
        ascending: true,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: enabled && !!patientId,
  });

  useEffect(() => {
    if (!enabled || !supabaseClient || !patientId) return;

    const channelName = `readings-inserts-${patientId}-${timeRange}-${Date.now()}`;
    const channel = supabaseClient.channel(channelName);

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "readings",
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => {
        const newRecord = payload.new as ReadingsTable;

        // Skip invalid/null timestamps
        if (!newRecord.timestamp) return;

        if (timeRange === "all") {
          queryClient.setQueryData(
            queryKey,
            (oldData: ReadingsTable[] | undefined) =>
              oldData ? [...oldData, newRecord] : [newRecord],
          );
          return;
        }

        const cutoff = getCutoffTimestamp(timeRange);
        if (newRecord.timestamp >= cutoff) {
          queryClient.setQueryData(
            queryKey,
            (oldData: ReadingsTable[] | undefined) =>
              oldData ? [...oldData, newRecord] : [newRecord],
          );
        }
      },
    );

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabaseClient.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [supabaseClient, patientId, timeRange, enabled, queryClient, queryKey]);

  return query;
};

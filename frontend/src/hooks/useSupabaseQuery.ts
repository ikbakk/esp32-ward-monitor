import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

export const useGetAllFromTable = <
  T extends keyof Database["public"]["Tables"],
>(
  table: T,
) => {
  return useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabaseClient.from(table).select("*");

      if (error) throw new Error(error.message);
      return data;
    },
  });
};

type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export const useGetFromTableByColumn = <
  T extends keyof Database["public"]["Tables"],
  K extends keyof TableRow<T>,
>(
  table: T,
  queryColumn: K,
  queryValue: TableRow<T>[K],
) => {
  return useQuery({
    queryKey: [table, queryColumn, queryValue],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from(table) // row, insert, update types
        .select("*")
        .eq(queryColumn as string, queryValue as any); // Supabase expects string here

      if (error) throw new Error(error.message);
      return data!;
    },
  });
};

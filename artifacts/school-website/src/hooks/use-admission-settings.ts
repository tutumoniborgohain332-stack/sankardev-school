import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["settings", "admission_open"] as const;

/** Hook for any page to check if admissions are open (no auth needed) */
export function useAdmissionOpen() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/settings/public");
      if (!res.ok) return true; // default to open on error
      const json = await res.json();
      return (json as { admissionOpen: boolean }).admissionOpen;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  return { admissionOpen: data ?? true, isLoading };
}

/** Hook for admin dashboard to toggle admission on/off */
export function useToggleAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (open: boolean) => {
      const res = await fetch("/api/settings/admission", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ open }),
      });
      if (!res.ok) throw new Error("Failed to update admission settings");
      return res.json() as Promise<{ admissionOpen: boolean }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

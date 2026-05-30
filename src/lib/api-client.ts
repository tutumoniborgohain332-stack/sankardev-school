import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetcher = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export function getGetMeQueryKey() {
  return ["me"];
}
export function useGetMe(options?: any) {
  return useQuery<any>({ queryKey: getGetMeQueryKey(), queryFn: () => fetcher("/api/auth/me"), ...options?.query });
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: any) =>
      fetcher("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => fetcher("/api/auth/logout", { method: "POST" }),
  });
}

// Stats
export function useGetDashboardStats() {
  return useQuery({ queryKey: ["dashboard-stats"], queryFn: () => fetcher("/api/stats/dashboard") });
}
export function useGetClassStats() {
  return useQuery({ queryKey: ["class-stats"], queryFn: () => fetcher("/api/stats/classes") });
}

// Students
export function getListStudentsQueryKey(params: any = {}) { return ["students", params]; }
export function useListStudents(params: any = {}, options?: any) {
  const q = new URLSearchParams(params).toString();
  return useQuery<any[]>({ queryKey: getListStudentsQueryKey(params), queryFn: () => fetcher(`/api/students?${q}`), ...options?.query });
}
export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetcher("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data?.data || data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}
export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: any) => fetcher(`/api/students/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}
export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetcher(`/api/students/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

// Staff
export function getListStaffQueryKey() { return ["staff"]; }
export function useListStaff(options?: any) {
  return useQuery({ queryKey: getListStaffQueryKey(), queryFn: () => fetcher("/api/staff") });
}
export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetcher("/api/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data?.data || data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}
export function useUpdateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: any) => fetcher(`/api/staff/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}
export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetcher(`/api/staff/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

// News
export function getListNewsQueryKey(params?: any) { return ["news", params]; }
export function useListNews(params?: any) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useQuery<any[]>({ queryKey: getListNewsQueryKey(params), queryFn: () => fetcher(`/api/news${query}`) });
}
export function useCreateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetcher("/api/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data?.data || data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news"] }),
  });
}
export function useUpdateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: any) => fetcher(`/api/news/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news"] }),
  });
}
export function useDeleteNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetcher(`/api/news/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["news"] }),
  });
}

// Admissions
export function getListAdmissionsQueryKey(params?: Record<string, string>) { return ["admissions", params]; }
export function useListAdmissions(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useQuery({ queryKey: getListAdmissionsQueryKey(params), queryFn: () => fetcher(`/api/admissions${query}`) });
}
export function useSubmitAdmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetcher("/api/admissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data?.data || data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admissions"] }),
  });
}
export function useUpdateAdmissionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, remarks }: any) => fetcher(`/api/admissions/${id}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, remarks }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admissions"] }),
  });
}

// Gallery
export function getListGalleryQueryKey() { return ["gallery"]; }
export function useListGallery(options?: any) {
  return useQuery({ queryKey: getListGalleryQueryKey(), queryFn: () => fetcher("/api/gallery") });
}
export function useCreateGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetcher("/api/gallery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data?.data || data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}
export function useDeleteGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetcher(`/api/gallery/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}

// Results
export function getListResultsQueryKey(params: any = {}) {
  return ["results", params];
}
export function useListResults(params: any = {}) {
  const q = new URLSearchParams(params).toString();
  return useQuery({ queryKey: getListResultsQueryKey(params), queryFn: () => fetcher(`/api/results?${q}`) });
}
export function useCreateResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetcher("/api/results", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data?.data || data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["results"] }),
  });
}
export function useUpdateResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: any) => fetcher(`/api/results/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["results"] }),
  });
}
export function useDeleteResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetcher(`/api/results/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["results"] }),
  });
}

// Attendance
export function getGetAttendanceQueryKey(params: any) { return ["attendance", params]; }
export function useGetAttendance(params: any, options?: any) {
  const q = new URLSearchParams(params).toString();
  return useQuery<any[]>({ queryKey: getGetAttendanceQueryKey(params), queryFn: () => fetcher(`/api/attendance?${q}`), ...options?.query });
}
export function useMarkAttendanceBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetcher("/api/attendance/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data?.data || data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export type AdmissionApplication = any;
export type ExamResult = any;
export type SubjectResult = any;
export type AttendanceBulkInputRecordsItemStatus = 'present' | 'absent' | 'late' | 'half_day';

// Settings
export function getSettingQueryKey(key: string) { return ["settings", key]; }
export function useGetSetting(key: string) {
  return useQuery({ queryKey: getSettingQueryKey(key), queryFn: () => fetcher("/api/settings?key=" + key) });
}
export function useSetSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { key: string, value: string }) => fetcher("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: getSettingQueryKey(variables.key) });
    },
  });
}


// Settings
export function useGetAdmissionSettings() {
  return useQuery({ queryKey: ['settings', 'admission'], queryFn: () => fetcher('/api/settings/public') });
}

export function useUpdateAdmissionSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (open: boolean) => fetcher('/api/settings/admission', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ open }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}

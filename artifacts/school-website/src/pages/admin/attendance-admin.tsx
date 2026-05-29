import { useState, useEffect, useMemo } from "react";
import { 
  useListStudents, 
  useGetAttendance, 
  useMarkAttendanceBulk, 
  getGetAttendanceQueryKey,
  type AttendanceBulkInputRecordsItemStatus 
} from "@workspace/api-client-react";
import { useGetMe } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, CheckSquare, Search, Users } from "lucide-react";

const CLASSES = ["Ankur", "Mukul", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function AttendanceAdmin() {
  const { toast } = useToast();
  const { data: user } = useGetMe();
  const today = new Date().toISOString().split("T")[0];
  const [mode, setMode] = useState<"search" | "mark" | "report">("mark");
  
  // Mark states
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  // Report states
  const [reportMonth, setReportMonth] = useState(String(new Date().getMonth() + 1));
  const [reportYear, setReportYear] = useState(String(new Date().getFullYear()));
  const [report, setReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [search, setSearch] = useState("");

  const attendanceEnabled = !!(selectedClass && selectedDate && (mode === "mark" || mode === "search"));
  const attendanceParams = attendanceEnabled
    ? { date: selectedDate, className: selectedClass, section: undefined }
    : undefined;

  const { data: students, isLoading: studentsLoading } = useListStudents(
    selectedClass ? { class: selectedClass } : {}
  );

  const { data: existingAttendance, refetch: refetchAttendance } = useGetAttendance(
    attendanceParams,
    { query: { queryKey: getGetAttendanceQueryKey(attendanceParams), enabled: attendanceEnabled } }
  );

  const markBulk = useMarkAttendanceBulk();

  useEffect(() => {
    if (mode !== "mark") return;
    if (existingAttendance && existingAttendance.length > 0) {
      const map: Record<number, string> = {};
      existingAttendance.forEach((r: any) => { map[r.studentId] = r.status; });
      setAttendanceMap(map);
    } else if (students && students.length > 0) {
      const map: Record<number, string> = {};
      students.forEach((s: any) => { map[s.id] = "present"; });
      setAttendanceMap(map);
    } else {
      setAttendanceMap({});
    }
  }, [existingAttendance, students, mode]);

  const toggleStatus = (studentId: number) => {
    setAttendanceMap(prev => {
      const cur = prev[studentId] || "present";
      const next = cur === "present" ? "absent" : cur === "absent" ? "late" : "present";
      return { ...prev, [studentId]: next };
    });
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedDate || !students?.length) {
      toast({ title: "Select class and date first", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      await markBulk.mutateAsync({
        data: {
          date: selectedDate,
          className: selectedClass,
          section: undefined,
          markedBy: user?.name || "Admin",
          records: students.map((s: any) => ({ studentId: s.id, status: (attendanceMap[s.id] || "present") as AttendanceBulkInputRecordsItemStatus })),
        }
      });
      refetchAttendance();
      toast({ title: "Attendance saved successfully!" });
    } catch { toast({ title: "Failed to save attendance", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleGenerateReport = async () => {
    if (!selectedClass) { toast({ title: "Select a class first", variant: "destructive" }); return; }
    setReportLoading(true);
    setReport(null);
    try {
      const params = new URLSearchParams({ className: selectedClass, month: reportMonth, year: reportYear });
      const res = await fetch(`/api/attendance/report?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      setReport(await res.json());
    } catch { toast({ title: "Failed to generate report", variant: "destructive" }); }
    finally { setReportLoading(false); }
  };

  const stats = {
    total: students?.length || 0,
    present: Object.values(attendanceMap).filter(v => v === "present").length,
    absent: Object.values(attendanceMap).filter(v => v === "absent").length,
    late: Object.values(attendanceMap).filter(v => v === "late").length,
  };

  const filteredReportRecords = useMemo(() => {
    if (!report?.records) return [];
    if (!search.trim()) return report.records;
    const lower = search.toLowerCase();
    return report.records.filter((r: any) => 
      r.studentName.toLowerCase().includes(lower) || r.rollNumber.includes(lower)
    );
  }, [report, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground mt-1">Manage and track student attendance</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto bg-card p-1.5 rounded-lg border shadow-sm">
          <Button variant={mode === "search" ? "default" : "ghost"} size="sm" onClick={() => setMode("search")} className="flex items-center gap-2">
            <Search className="w-4 h-4" /> Search Record
          </Button>
          <Button variant={mode === "mark" ? "default" : "ghost"} size="sm" onClick={() => setMode("mark")} className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" /> Mark Attendance
          </Button>
          <Button variant={mode === "report" ? "default" : "ghost"} size="sm" onClick={() => setMode("report")}>Monthly Report</Button>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full bg-card p-3 rounded-lg border shadow-sm flex-wrap">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <span className="text-xs text-muted-foreground font-medium uppercase px-1">Class</span>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {mode === "mark" || mode === "search" ? (
          <>
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <span className="text-xs text-muted-foreground font-medium uppercase px-1">Date</span>
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>
            {mode === "search" && (
              <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                <span className="text-xs text-muted-foreground font-medium uppercase px-1">Search</span>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search name or roll no..." 
                    className="pl-8" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
              <span className="text-xs text-muted-foreground font-medium uppercase px-1">Month</span>
              <Select value={reportMonth} onValueChange={setReportMonth}>
                <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
              <span className="text-xs text-muted-foreground font-medium uppercase px-1">Year</span>
              <Select value={reportYear} onValueChange={setReportYear}>
                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  {[0, 1, 2].map(y => {
                    const yr = String(new Date().getFullYear() - y);
                    return <SelectItem key={yr} value={yr}>{yr}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:w-auto w-full pt-5">
              <Button onClick={handleGenerateReport} disabled={reportLoading || !selectedClass}>
                {reportLoading ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </>
        )}
      </div>

      {mode === "mark" && (
        <>
          {!selectedClass ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-12 text-center text-muted-foreground">
                <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-foreground mb-1">Select a Class</h3>
                <p>Please select a class from the dropdown above to mark attendance.</p>
              </CardContent>
            </Card>
          ) : studentsLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : students?.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-12 text-center flex flex-col items-center justify-center">
                <Users className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-xl font-bold mb-2">No Students in {selectedClass}</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  You cannot mark attendance because there are no students registered in Class {selectedClass} yet. 
                  Attendance is marked by toggling Present/Absent for registered students.
                </p>
                <Button onClick={() => window.location.href = '/admin/students'}>
                  Go to Students Page to Register Students
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <Card className="shadow-sm"><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
                <Card className="shadow-sm border-accent/20 bg-accent/5"><CardContent className="p-4 text-center"><p className="text-sm text-accent">Present</p><p className="text-2xl font-bold text-accent">{stats.present}</p></CardContent></Card>
                <Card className="shadow-sm border-destructive/20 bg-destructive/5"><CardContent className="p-4 text-center"><p className="text-sm text-destructive">Absent</p><p className="text-2xl font-bold text-destructive">{stats.absent}</p></CardContent></Card>
                <Card className="shadow-sm border-secondary/20 bg-secondary/5"><CardContent className="p-4 text-center"><p className="text-sm text-secondary-foreground">Late</p><p className="text-2xl font-bold text-secondary-foreground">{stats.late}</p></CardContent></Card>
              </div>

              <Card className="shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-semibold w-24">Roll No.</th>
                      <th className="px-4 py-3 font-semibold">Student Name</th>
                      <th className="px-4 py-3 font-semibold w-40 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(students || []).map((s: any) => {
                      const status = attendanceMap[s.id] || "present";
                      return (
                        <tr key={s.id} className="hover:bg-muted/20">
                          <td className="px-4 py-3 font-mono text-muted-foreground">{s.rollNumber}</td>
                          <td className="px-4 py-3 font-medium">{s.studentName}</td>
                          <td className="px-4 py-3 text-right">
                            <Button 
                              size="sm" 
                              variant={status === "present" ? "default" : status === "absent" ? "destructive" : "secondary"}
                              className={`w-28 ${status === "present" ? "bg-accent hover:bg-accent/90 text-white" : ""}`}
                              onClick={() => toggleStatus(s.id)}
                            >
                              {status.toUpperCase()}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sm:w-auto shadow-md gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? "Saving Attendance..." : "Save Attendance"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {mode === "report" && report && (
        <Card className="shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">Report: {MONTHS[Number(reportMonth)-1]} {reportYear}</h3>
              <p className="text-sm text-muted-foreground">Class: {selectedClass} • Total Working Days: {report.totalWorkingDays}</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search name or roll no..." 
                className="pl-8" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold w-24">Roll No.</th>
                <th className="px-4 py-3 font-semibold">Student Name</th>
                <th className="px-4 py-3 font-semibold text-center w-24">Present</th>
                <th className="px-4 py-3 font-semibold text-center w-24">Absent</th>
                <th className="px-4 py-3 font-semibold text-center w-24">Late</th>
                <th className="px-4 py-3 font-semibold text-right w-24">Avg %</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredReportRecords.map((r: any) => {
                const total = report.totalWorkingDays || 1;
                const percentage = Math.round((r.present / total) * 100);
                const color = percentage >= 75 ? "text-green-600" : percentage >= 50 ? "text-yellow-600" : "text-destructive";
                
                return (
                  <tr key={r.studentId} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-muted-foreground">{r.rollNumber}</td>
                    <td className="px-4 py-3 font-medium">{r.studentName}</td>
                    <td className="px-4 py-3 text-center text-accent font-medium">{r.present}</td>
                    <td className="px-4 py-3 text-center text-destructive font-medium">{r.absent}</td>
                    <td className="px-4 py-3 text-center text-secondary-foreground font-medium">{r.late}</td>
                    <td className={`px-4 py-3 text-right font-bold ${color}`}>{percentage}%</td>
                  </tr>
                );
              })}
              {filteredReportRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {mode === "search" && (
        <Card className="shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold w-24">Roll No.</th>
                <th className="px-4 py-3 font-semibold">Student Name</th>
                <th className="px-4 py-3 font-semibold text-right w-32">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {existingAttendance?.filter((r: any) => 
                !search.trim() || 
                r.studentName.toLowerCase().includes(search.toLowerCase()) || 
                r.rollNumber.includes(search)
              ).map((r: any) => {
                const status = r.status || "present";
                return (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-muted-foreground">{r.rollNumber}</td>
                    <td className="px-4 py-3 font-medium">{r.studentName}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      <span className={`px-2 py-1 rounded text-xs ${
                        status === "present" ? "bg-accent/10 text-accent" : 
                        status === "absent" ? "bg-destructive/10 text-destructive" : 
                        "bg-secondary text-secondary-foreground"
                      }`}>
                        {status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {(!existingAttendance || existingAttendance.length === 0) && selectedClass && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No attendance records found for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

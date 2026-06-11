"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useGetMe, useListStudents, useLogout, getGetMeQueryKey, useListNews, useGetMyAttendance } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, BookOpen, Calendar as CalendarIcon, Award, FileText, Bell, CreditCard } from "lucide-react";
import { PWAInstallButton } from "@/components/pwa-install-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";

type Tab = "profile" | "attendance" | "fees";

export default function PortalStudent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  
  const { data: user, isLoading: isAuthLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: students, isLoading: isStudentsLoading, isError: isStudentsError } = useListStudents({}, { query: { enabled: !!user && user.role === "student" } });
  const logout = useLogout();

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== "student")) {
      router.push("/login/student");
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || !user || user.role !== "student") {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16">
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-40 md:col-span-2 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  const studentData = students && students.length > 0 ? students[0] : null;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => window.location.href = "/"
    });
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
    { id: "profile", label: "My Profile", icon: <User className="w-4 h-4" /> },
    { id: "attendance", label: "Attendance", icon: <CalendarIcon className="w-4 h-4" /> },
    { id: "fees", label: "Pay Fees", icon: <CreditCard className="w-4 h-4" />, disabled: true },
  ];

  return (
    <MainLayout>
      <div className="bg-primary/5 min-h-[80vh] py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">Here is your academic overview.</p>
            </div>
            <div className="flex items-center gap-4">
              <PWAInstallButton />
              <Button disabled={logout.isPending} variant="outline" onClick={handleLogout} className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10">
                <LogOut className="w-4 h-4" /> {logout.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-xl p-2 shadow-sm border">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { if (!tab.disabled) setActiveTab(tab.id); }}
                disabled={tab.disabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-sm"
                    : tab.disabled
                    ? "text-muted-foreground/50 bg-muted/30 cursor-not-allowed border border-dashed border-muted-foreground/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                title={tab.disabled ? "Coming Soon" : ""}
              >
                {tab.icon}
                {tab.label}
                {tab.disabled && <span className="text-[10px] uppercase bg-background px-1.5 py-0.5 rounded ml-1 shadow-sm font-bold opacity-70">Soon</span>}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "profile" && (
            <ProfileTab 
              user={user} 
              studentData={studentData} 
              isStudentsLoading={isStudentsLoading} 
              isStudentsError={isStudentsError} 
            />
          )}
          {activeTab === "attendance" && (
            <AttendanceTab />
          )}
          
        </div>
      </div>
    </MainLayout>
  );
}

function ProfileTab({ user, studentData, isStudentsLoading, isStudentsError }: any) {
  const { data: news, isLoading: isNewsLoading, isError: isNewsError } = useListNews({}, { query: { enabled: true } });
  const recentNews = news?.filter((n: any) => !n.isImportant).slice(0, 3) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Card */}
      <div className="lg:col-span-1">
        <Card className="shadow-lg border-t-4 border-t-primary overflow-hidden">
          <div className="bg-primary/10 h-32 relative">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                <AvatarImage src={studentData?.photoUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <CardContent className="pt-16 pb-6 text-center">
            <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
            <p className="text-muted-foreground font-medium mb-6">Student ID: {user.username}</p>
            
            {isStudentsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : isStudentsError ? (
              <p className="text-destructive font-medium bg-destructive/10 p-3 rounded-lg text-sm">Failed to load student details. Please try again later.</p>
            ) : studentData ? (
              <div className="space-y-3 text-sm text-left">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <BookOpen className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Class</p>
                    <p className="font-semibold">{studentData.className} {studentData.section && `- Sec ${studentData.section}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <User className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Roll Number</p>
                    <p className="font-semibold">{studentData.rollNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Award className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">APAAR ID</p>
                    <p className="font-semibold">{studentData.apaarId || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Admission Date</p>
                    <p className="font-semibold">
                      {new Date(studentData.admissionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Detailed student record not found.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-2 space-y-8">
        {/* Notice Board */}
        <Card className="shadow-md border-t-4 border-t-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" /> Recent Notices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isNewsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              ) : isNewsError ? (
                <p className="text-destructive font-medium text-sm">Failed to load notices. Please refresh.</p>
              ) : recentNews.length > 0 ? recentNews.map((item: any) => {
                const date = new Date(item.publishedAt);
                return (
                <div key={item.id} className="flex gap-4 p-4 rounded-lg bg-muted/20 border hover:bg-muted/40 transition-colors">
                  <div className="flex flex-col items-center justify-center bg-background rounded-md border min-w-[60px] p-2 text-center h-fit">
                    <span className="text-xs text-muted-foreground font-bold uppercase">{date.toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-xl font-bold text-primary">{date.getDate()}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                    {item.titleAssamese && <h4 className="font-bold text-foreground mb-1 opacity-90">{item.titleAssamese}</h4>}
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                    {item.contentAssamese && <p className="text-sm text-muted-foreground mt-1 opacity-90">{item.contentAssamese}</p>}
                  </div>
                </div>
                )
              }) : <p className="text-muted-foreground text-sm">No recent notices.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AttendanceTab() {
  const { data: attendanceRecords, isLoading } = useGetMyAttendance();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[200px] rounded-xl" />
      </div>
    );
  }

  // Parse attendance records to Date arrays for modifiers
  const presentDates = attendanceRecords?.filter((r: any) => r.status === "present").map((r: any) => new Date(r.date)) || [];
  const absentDates = attendanceRecords?.filter((r: any) => r.status === "absent").map((r: any) => new Date(r.date)) || [];
  const lateDates = attendanceRecords?.filter((r: any) => r.status === "late").map((r: any) => new Date(r.date)) || [];

  const selectedRecord = attendanceRecords?.find((r: any) => {
    if (!selectedDate) return false;
    const rDate = new Date(r.date);
    return rDate.toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-7">
        <Card className="shadow-lg border-t-4 border-t-emerald-500">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-500" /> Attendance Calendar (Last 90 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-xl border shadow-sm p-4"
              modifiers={{
                present: presentDates,
                absent: absentDates,
                late: lateDates,
              }}
              modifiersClassNames={{
                present: "bg-emerald-500/20 text-emerald-700 font-bold",
                absent: "bg-destructive/20 text-destructive font-bold",
                late: "bg-amber-500/20 text-amber-700 font-bold",
              }}
              disabled={(date) => date > new Date()}
            />
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-5 space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Selected Date Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="text-center p-6 bg-muted/20 rounded-xl border">
                <p className="text-sm text-muted-foreground font-semibold uppercase mb-2">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                {selectedRecord ? (
                  <div className="mt-4">
                    <span className={`inline-block px-6 py-2 rounded-full text-lg font-bold capitalize ${
                      selectedRecord.status === 'present' ? 'bg-emerald-500/20 text-emerald-700' :
                      selectedRecord.status === 'absent' ? 'bg-destructive/20 text-destructive' :
                      'bg-amber-500/20 text-amber-700'
                    }`}>
                      {selectedRecord.status}
                    </span>
                    {selectedRecord.remarks && (
                      <p className="mt-4 text-sm text-muted-foreground border-t pt-4">Remarks: {selectedRecord.remarks}</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 text-muted-foreground">
                    <p className="text-lg font-medium">No record found</p>
                    <p className="text-xs mt-1">Holiday or record not marked yet.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">Select a date on the calendar</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="text-lg">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3"><div className="w-6 h-6 rounded bg-emerald-500/20"></div><span className="text-sm font-medium">Present</span></div>
              <div className="flex items-center gap-3"><div className="w-6 h-6 rounded bg-destructive/20"></div><span className="text-sm font-medium">Absent</span></div>
              <div className="flex items-center gap-3"><div className="w-6 h-6 rounded bg-amber-500/20"></div><span className="text-sm font-medium">Late</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

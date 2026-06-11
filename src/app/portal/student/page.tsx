"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useGetMe, useListStudents, useLogout, getGetMeQueryKey, useListNews } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, BookOpen, Calendar, Award, FileText, Bell } from "lucide-react";
import { PWAInstallButton } from "@/components/pwa-install-button";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalStudent() {
  const router = useRouter();
  const { data: user, isLoading: isAuthLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: students, isLoading: isStudentsLoading } = useListStudents({});
  const { data: news, isLoading: isNewsLoading } = useListNews();
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
      onSuccess: () => router.push("/")
    });
  };

  const recentNews = news?.filter((n: any) => !n.isImportant).slice(0, 3) || [];

  return (
    <MainLayout>
      <div className="bg-primary/5 min-h-[80vh] py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">Here is your academic overview for today.</p>
            </div>
            <div className="flex items-center gap-4">
            <PWAInstallButton />
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
          </div>

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
                        <Calendar className="w-5 h-5 text-primary shrink-0" />
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
              {/* Dashboard Widgets Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Attendance Tracker */}
                <Card className="shadow-md border-t-4 border-t-emerald-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-500" /> Attendance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-emerald-600">92%</p>
                      <p className="text-sm text-muted-foreground mt-1">Present: 184 Days</p>
                      <p className="text-sm text-muted-foreground">Absent: 16 Days</p>
                    </div>
                    <div className="relative w-24 h-24">
                      <svg viewBox="0 0 36 36" className="w-full h-full stroke-current text-emerald-500">
                        <path className="text-muted/30" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path strokeWidth="3" strokeDasharray="92, 100" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">92%</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fee Status */}
                <Card className="shadow-md border-t-4 border-t-amber-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-500" /> Fee Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                      <div>
                        <p className="font-bold text-amber-700 dark:text-amber-500">Pending Dues</p>
                        <p className="text-2xl font-bold mt-1">₹0.00</p>
                      </div>
                      <div className="bg-emerald-500/20 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        All Clear
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Next installment due: Nov 15</p>
                  </CardContent>
                </Card>
              </div>

              {/* Dashboard Widgets Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming Assignments */}
                <Card className="shadow-md border-t-4 border-t-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-500" /> Upcoming Assignments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-semibold text-sm">Mathematics Homework</p>
                          <p className="text-xs text-muted-foreground">Algebra Chapter 4</p>
                        </div>
                        <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-md font-medium">Due Tomorrow</span>
                      </li>
                      <li className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-semibold text-sm">Science Project</p>
                          <p className="text-xs text-muted-foreground">Solar System Model</p>
                        </div>
                        <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md font-medium">Due in 3 Days</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Today's Schedule */}
                <Card className="shadow-md border-t-4 border-t-purple-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-500" /> Today's Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="relative pl-4 border-l-2 border-primary">
                        <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                        <p className="text-xs text-muted-foreground font-semibold">09:00 AM - 09:45 AM</p>
                        <p className="font-bold text-sm">English Literature</p>
                        <p className="text-xs text-muted-foreground">Room 102</p>
                      </div>
                      <div className="relative pl-4 border-l-2 border-muted">
                        <div className="absolute w-3 h-3 bg-muted rounded-full -left-[7px] top-1"></div>
                        <p className="text-xs text-muted-foreground font-semibold">09:45 AM - 10:30 AM</p>
                        <p className="font-bold text-sm">Mathematics</p>
                        <p className="text-xs text-muted-foreground">Room 102</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

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
        </div>
      </div>
    </MainLayout>
  );
}



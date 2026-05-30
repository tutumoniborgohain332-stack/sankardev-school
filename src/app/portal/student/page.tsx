"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { useGetMe, useListStudents, useLogout, getGetMeQueryKey } from "@/lib/api-client";
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
  const { data: students, isLoading: isStudentsLoading } = useListStudents({ search: user?.username });
  const logout = useLogout();

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== "student")) {
      router.push("/login/student");
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || !user) {
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

  const studentData = students?.find(s => s.username === user.username);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.push("/")
    });
  };

  return (
    <MainLayout>
      <div className="bg-primary/5 min-h-[80vh] py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-serif font-bold text-foreground">Student Dashboard</h1>
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
              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="hover:border-primary/50 hover:shadow-md cursor-pointer transition-all">
                  <CardContent className="p-6 text-center">
                    <FileText className="w-8 h-8 mx-auto text-primary mb-3" />
                    <h3 className="font-semibold text-sm">Report Cards</h3>
                  </CardContent>
                </Card>
                <Card className="hover:border-primary/50 hover:shadow-md cursor-pointer transition-all">
                  <CardContent className="p-6 text-center">
                    <Calendar className="w-8 h-8 mx-auto text-accent mb-3" />
                    <h3 className="font-semibold text-sm">Timetable</h3>
                  </CardContent>
                </Card>
                <Card className="hover:border-primary/50 hover:shadow-md cursor-pointer transition-all">
                  <CardContent className="p-6 text-center">
                    <BookOpen className="w-8 h-8 mx-auto text-secondary mb-3" />
                    <h3 className="font-semibold text-sm">Library</h3>
                  </CardContent>
                </Card>
                <Card className="hover:border-primary/50 hover:shadow-md cursor-pointer transition-all">
                  <CardContent className="p-6 text-center">
                    <Award className="w-8 h-8 mx-auto text-primary mb-3" />
                    <h3 className="font-semibold text-sm">Certificates</h3>
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
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-lg bg-muted/20 border hover:bg-muted/40 transition-colors">
                        <div className="flex flex-col items-center justify-center bg-background rounded-md border min-w-[60px] p-2 text-center h-fit">
                          <span className="text-xs text-muted-foreground font-bold uppercase">MAY</span>
                          <span className="text-xl font-bold text-primary">1{i}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground mb-1">Upcoming Class Test Series</h4>
                          <p className="text-sm text-muted-foreground">The schedule for the upcoming class tests has been published. Please review your respective subjects.</p>
                        </div>
                      </div>
                    ))}
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



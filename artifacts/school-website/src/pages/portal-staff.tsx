import { MainLayout } from "@/components/layout/main-layout";
import { useGetMe, useListStaff, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, BookOpen, Mail, Phone, Award, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalStaff() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isAuthLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: staff, isLoading: isStaffLoading } = useListStaff();
  const logout = useLogout();

  useEffect(() => {
    if (!isAuthLoading && (!user || (user.role !== "staff" && user.role !== "admin"))) {
      setLocation("/login/staff");
    }
  }, [user, isAuthLoading, setLocation]);

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

  const staffData = staff?.find(s => s.username === user.username);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/")
    });
  };

  return (
    <MainLayout>
      <div className="bg-muted/30 min-h-[80vh] py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-serif font-bold text-foreground">Staff Dashboard</h1>
            <div className="flex gap-4">
              {user.role === "admin" && (
                <Button variant="outline" onClick={() => setLocation("/admin")} className="border-accent text-accent hover:bg-accent/10">
                  Go to Admin Panel
                </Button>
              )}
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10">
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg border-t-4 border-t-accent overflow-hidden">
                <div className="bg-accent/10 h-32 relative">
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                      <AvatarImage src={staffData?.photoUrl || undefined} />
                      <AvatarFallback className="bg-accent text-accent-foreground text-3xl">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <CardContent className="pt-16 pb-6 text-center">
                  <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                  <p className="text-accent font-bold uppercase tracking-wider text-sm mb-6">
                    {staffData?.designation || "Staff Member"}
                  </p>
                  
                  {isStaffLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : staffData ? (
                    <div className="space-y-3 text-sm text-left">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <BookOpen className="w-5 h-5 text-accent shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Department</p>
                          <p className="font-semibold">{staffData.department}</p>
                        </div>
                      </div>
                      {staffData.subject && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <User className="w-5 h-5 text-accent shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Subject</p>
                            <p className="font-semibold">{staffData.subject}</p>
                          </div>
                        </div>
                      )}
                      {staffData.qualification && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <Award className="w-5 h-5 text-accent shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Qualification</p>
                            <p className="font-semibold">{staffData.qualification}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Phone className="w-5 h-5 text-accent shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Phone</p>
                          <p className="font-semibold">{staffData.phone || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Mail className="w-5 h-5 text-accent shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Email</p>
                          <p className="font-semibold truncate max-w-[200px]">{staffData.email || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Detailed staff record not found.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" /> Faculty Notices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-4 p-5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                        <div className="flex flex-col items-center justify-center bg-white rounded-md border min-w-[70px] p-2 text-center h-fit shadow-sm">
                          <span className="text-xs text-primary font-bold uppercase">MAY</span>
                          <span className="text-2xl font-bold text-foreground">1{i+2}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-primary mb-1">Staff Meeting - Quarter {i}</h4>
                          <p className="text-sm text-foreground/80 mb-2">Mandatory staff meeting in the main hall. Please bring your department progress reports.</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                            <span>Time: 2:00 PM</span>
                            <span>Venue: Main Hall</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="shadow-sm">
                   <CardHeader className="pb-3">
                     <CardTitle className="text-lg">Quick Links</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-2">
                     <Button variant="ghost" className="w-full justify-start text-left font-medium">View Class Schedules</Button>
                     <Button variant="ghost" className="w-full justify-start text-left font-medium">Submit Marks</Button>
                     <Button variant="ghost" className="w-full justify-start text-left font-medium">Leave Application</Button>
                   </CardContent>
                 </Card>
                 <Card className="shadow-sm">
                   <CardHeader className="pb-3">
                     <CardTitle className="text-lg">Resources</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-2">
                     <Button variant="ghost" className="w-full justify-start text-left font-medium">Academic Calendar</Button>
                     <Button variant="ghost" className="w-full justify-start text-left font-medium">Syllabus Guidelines</Button>
                     <Button variant="ghost" className="w-full justify-start text-left font-medium">Employee Handbook</Button>
                   </CardContent>
                 </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

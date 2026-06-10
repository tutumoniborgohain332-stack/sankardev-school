"use client";

import { MainLayout } from "@/components/layout/main-layout";
import {
  useGetMe, useListStaff, useLogout, getGetMeQueryKey,
  useListNews, useCreateNews, useUpdateNews, useDeleteNews,
  useListGallery, useCreateGalleryItem, useDeleteGalleryItem,
  useListResults, useCreateResult, useDeleteResult,
  useCreateStaff,
  useListStudents,
  useListAdmissions, useUpdateAdmissionStatus,
  useGetAttendance, useMarkAttendanceBulk,
  getGetAttendanceQueryKey,
  type AttendanceBulkInputRecordsItemStatus,
} from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  User, LogOut, Bell, Image, BarChart2, Users, ClipboardList,
  Plus, Trash2, Pencil, Check, X, BookOpen, Phone, Mail, Award,
  GraduationCap, Calendar, ChevronRight, FileText, UserPlus, CheckSquare,
} from "lucide-react";
import { PWAInstallButton } from "@/components/pwa-install-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { uploadImageWithCompression, deleteImageFromSupabase } from "@/lib/supabase";

type Tab = "dashboard" | "notices" | "gallery" | "results" | "staff" | "students" | "admissions" | "attendance";

export default function PortalStaff() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isAuthLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: staffList, isLoading: isStaffLoading } = useListStaff();
  const logout = useLogout();

  const isPrivilegedRole = (role: string | undefined) => role === "admin";

  useEffect(() => {
    if (!isAuthLoading && (!user || (user.role !== "staff" && user.role !== "admin"))) {
      router.push("/login/staff");
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || !user || (!isPrivilegedRole(user?.role) && user?.role !== "staff")) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-40 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[400px] md:col-span-2" />
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </MainLayout>
    );
  }

  const staffData = staffList?.find(s => s.username === user.username);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.push("/")
    });
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <User className="w-4 h-4" /> },
    { id: "notices", label: "Notices", icon: <Bell className="w-4 h-4" /> },
    { id: "attendance", label: "Attendance", icon: <CheckSquare className="w-4 h-4" /> },
    { id: "gallery", label: "Gallery", icon: <Image className="w-4 h-4" /> },
    { id: "results", label: "Results", icon: <BarChart2 className="w-4 h-4" /> },
    { id: "staff", label: "Add Staff", icon: <UserPlus className="w-4 h-4" /> },
    { id: "students", label: "Students", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "admissions", label: "Admissions", icon: <ClipboardList className="w-4 h-4" /> },
  ];

  return (
    <MainLayout>
      <div className="bg-muted/20 min-h-[80vh] py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Staff Management Portal</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Welcome, <span className="font-semibold text-primary">{user.name}</span>
                {staffData?.designation && <> — {staffData.designation}</>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PWAInstallButton />
              {user.role === "admin" && (
                <Button variant="outline" onClick={() => router.push("/admin")} className="border-primary text-primary hover:bg-primary/10 text-sm">
                  Admin Panel
                </Button>
              )}
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive/10 text-sm">
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-xl p-2 shadow-sm border">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "dashboard" && <DashboardTab user={user} staffData={staffData} isStaffLoading={isStaffLoading} />}
          {activeTab === "notices" && <NoticesTab toast={toast} queryClient={queryClient} />}
          {activeTab === "attendance" && <AttendanceTab user={user} toast={toast} queryClient={queryClient} />}
          {activeTab === "gallery" && <GalleryTab toast={toast} queryClient={queryClient} />}
          {activeTab === "results" && <ResultsTab toast={toast} queryClient={queryClient} />}
          {activeTab === "staff" && <AddStaffTab toast={toast} queryClient={queryClient} />}
          {activeTab === "students" && <StudentsTab />}
          {activeTab === "admissions" && <AdmissionsTab toast={toast} queryClient={queryClient} />}
        </div>
      </div>
    </MainLayout>
  );
}

/* ─── Dashboard Tab ─── */
function DashboardTab({ user, staffData, isStaffLoading }: any) {
  const { data: stats } = useListStaff();
  const { data: news } = useListNews({ limit: 5 });
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="shadow-md border-t-4 border-t-primary overflow-hidden">
          <div className="bg-primary/10 h-28 relative">
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                <AvatarImage src={staffData?.photoUrl || undefined} />
                <AvatarFallback className="bg-primary text-white text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <CardContent className="pt-14 pb-6 text-center">
            <h2 className="text-xl font-bold mb-1">{user.name}</h2>
            <p className="text-primary font-semibold uppercase tracking-wider text-xs mb-5">
              {staffData?.designation || "Staff Member"}
            </p>
            {isStaffLoading ? (
              <div className="space-y-3"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
            ) : staffData ? (
              <div className="space-y-2 text-sm text-left">
                {[
                  { icon: <User className="w-4 h-4 text-primary shrink-0" />, label: "Subject", val: staffData.subject },
                  { icon: <Award className="w-4 h-4 text-primary shrink-0" />, label: "Qualification", val: staffData.qualification },
                  { icon: <Phone className="w-4 h-4 text-primary shrink-0" />, label: "Phone", val: staffData.phone || "N/A" },
                  { icon: <Mail className="w-4 h-4 text-primary shrink-0" />, label: "Email", val: staffData.email || "N/A" },
                ].filter(i => i.val).map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-2.5 bg-muted/40 rounded-lg">
                    {item.icon}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase leading-none">{item.label}</p>
                      <p className="font-semibold text-xs mt-0.5 truncate max-w-[180px]">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Profile details not found.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Total Staff", val: stats?.length ?? "—", icon: <Users className="w-5 h-5" />, color: "text-primary bg-primary/10" },
            { label: "Notices", val: news?.length ?? "—", icon: <Bell className="w-5 h-5" />, color: "text-secondary bg-secondary/20" },
            { label: "Role", val: user.role.toUpperCase(), icon: <Award className="w-5 h-5" />, color: "text-accent bg-accent/10" },
          ].map(stat => (
            <Card key={stat.label} className="shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${stat.color}`}>{stat.icon}</div>
                <div>
                  <p className="text-lg font-bold leading-none">{stat.val}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Recent Notices</CardTitle>
          </CardHeader>
          <CardContent>
            {news?.slice(0, 4).map(item => (
              <div key={item.id} className="flex items-start gap-3 py-2.5 border-b last:border-b-0">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.publishedAt).toLocaleDateString()}</p>
                </div>
                {item.isImportant && <Badge className="text-xs bg-destructive/10 text-destructive border-0">Important</Badge>}
              </div>
            ))}
            {!news?.length && <p className="text-sm text-muted-foreground">No notices yet.</p>}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              ["Manage Notices", "notices"],
              ["Gallery Management", "gallery"],
              ["Add Results", "results"],
              ["Add New Staff", "staff"],
              ["View Students", "students"],
              ["Admissions", "admissions"],
            ].map(([label, tab]) => (
              <Button key={tab} variant="outline" className="justify-between text-sm h-10" onClick={() => {}}>
                {label} <ChevronRight className="w-4 h-4" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─── Notices Tab ─── */
function NoticesTab({ toast, queryClient }: any) {
  const { data: news, isLoading } = useListNews({ limit: 100 });
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();
  const deleteNews = useDeleteNews();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "", isImportant: false });
  const [saving, setSaving] = useState(false);

  const resetForm = () => { setForm({ title: "", content: "", category: "", isImportant: false }); setEditItem(null); setShowForm(false); };

  const openEdit = (item: any) => {
    setForm({ title: item.title, content: item.content, category: item.category ?? "", isImportant: item.isImportant });
    setEditItem(item);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast({ title: "Fill in title and content", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = { title: form.title, content: form.content, category: form.category || undefined, isImportant: form.isImportant };
      if (editItem) {
        await updateNews.mutateAsync({ id: editItem.id, data: payload });
        toast({ title: "Notice updated!" });
      } else {
        await createNews.mutateAsync({ data: payload });
        toast({ title: "Notice published! Auto-translating to Assamese..." });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      resetForm();
    } catch {
      toast({ title: "Failed to save notice", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this notice?")) return;
    await deleteNews.mutateAsync(id);
    queryClient.invalidateQueries({ queryKey: ["/api/news"] });
    toast({ title: "Notice deleted" });
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Notice Board Management</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Notice
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{editItem ? "Edit Notice" : "Create New Notice"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title (English or Assamese — auto-translated)</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notice title..." className="mt-1" />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Notice content..." rows={4} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Exam, Meeting, Holiday" className="mt-1" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.isImportant} onCheckedChange={v => setForm(f => ({ ...f, isImportant: v }))} />
                <Label>Mark as Important</Label>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? "Saving & Translating..." : editItem ? "Update Notice" : "Publish Notice"}
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
            <p className="text-xs text-muted-foreground">Notices are automatically translated between English and Assamese and shown in both languages on the homepage.</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : (
        <div className="space-y-3">
          {news?.map(item => (
            <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm truncate">{item.title}</h3>
                      {item.isImportant && <Badge className="text-xs bg-destructive/10 text-destructive border-0 shrink-0">Important</Badge>}
                      {item.category && <Badge variant="outline" className="text-xs shrink-0">{item.category}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{item.content}</p>
                    {(item as any).titleAssamese && (
                      <p className="text-xs text-primary/70 font-medium">{(item as any).titleAssamese}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(item.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)} className="h-8 w-8 p-0">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)} className="h-8 w-8 p-0 border-destructive text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!news?.length && (
            <Card className="shadow-sm">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No notices yet. Create your first notice above.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Gallery Tab ─── */
function GalleryTab({ toast, queryClient }: any) {
  const { data: gallery, isLoading } = useListGallery({});
  const createItem = useCreateGalleryItem();
  const deleteItem = useDeleteGalleryItem();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", thumbnailUrl: "", category: "", description: "", type: "photo" as "photo" | "video" });
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const url = await uploadImageWithCompression(file, "assets");
      if (url) {
        setForm(f => ({ ...f, url, type: file.type.startsWith("video/") ? "video" : "photo" }));
      }
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveStagingImage = async () => {
    if (form.url && form.url.includes("supabase.co")) {
      await deleteImageFromSupabase(form.url, "assets");
    }
    setForm(f => ({ ...f, url: "" }));
  };

  const handleAdd = async () => {
    if (!form.title.trim() || !form.url.trim()) { toast({ title: "Fill in title and URL", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await createItem.mutateAsync({ data: { title: form.title, url: form.url, thumbnailUrl: form.thumbnailUrl || undefined, category: form.category || undefined, description: form.description || undefined, type: form.type } });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Photo added to gallery!" });
      setForm({ title: "", url: "", thumbnailUrl: "", category: "", description: "", type: "photo" });
      setShowForm(false);
    } catch {
      toast({ title: "Failed to add photo", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (item: any) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    // Delete from Supabase bucket first if it's a supabase URL
    if (item.url.includes("supabase.co")) {
      await deleteImageFromSupabase(item.url, "assets");
    }
    
    await deleteItem.mutateAsync(item.id);
    queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
    toast({ title: "Deleted from gallery" });
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Gallery Management</h2>
        <Button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Photo/Video
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader className="pb-3"><CardTitle className="text-base">Add New Gallery Item</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Photo title" className="mt-1" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v: any) => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Upload File (Image/Video) *</Label>
              <Input type="file" accept="image/*,video/*" onChange={handleFileChange} disabled={isUploading || !!form.url} className="mt-1" />
              {isUploading && <p className="text-xs text-primary font-medium animate-pulse mt-1">Compressing and uploading...</p>}
              {form.url && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-green-600 font-medium">✓ File uploaded</p>
                  <Button type="button" variant="ghost" size="sm" onClick={handleRemoveStagingImage} className="h-5 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                    Remove
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Classroom">Classroom</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" className="mt-1" />
              </div>
            </div>
            {form.url && <img src={form.url} alt="preview" className="h-32 rounded-lg object-cover border" onError={e => (e.currentTarget.style.display = "none")} />}
            <div className="flex gap-3">
              <Button onClick={handleAdd} disabled={saving || isUploading} className="flex-1">{saving ? "Uploading..." : "Add to Gallery"}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-square rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery?.map(item => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden border shadow-sm aspect-square bg-muted">
              <img src={item.thumbnailUrl || item.url} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" onError={e => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/200x200?text=Photo"; }} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 gap-2 p-2">
                <p className="text-white text-xs font-semibold text-center line-clamp-2">{item.title}</p>
                {item.category && <Badge className="text-xs bg-primary/80 text-white border-0">{item.category}</Badge>}
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item)} className="mt-1 h-7 text-xs">
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
          {!gallery?.length && (
            <div className="col-span-full">
              <Card className="shadow-sm">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Image className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No gallery items yet. Add your first photo above.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Results Tab ─── */
function ResultsTab({ toast, queryClient }: any) {
  const { data: results, isLoading } = useListResults({});
  const createResult = useCreateResult();
  const deleteResult = useDeleteResult();

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    rollNumber: "", studentName: "", className: "", section: "",
    examType: "Final" as "Mid-term" | "Final" | "Unit-Test",
    academicYear: "2025-26",
    subjects: [{ subject: "", maxMarks: 100, marksObtained: 0, grade: "A" }],
    totalMarks: 100, marksObtained: 0, percentage: "0", result: "Pass" as "Pass" | "Fail",
    rank: "", remarks: "",
  });

  const calcPercentage = (obtained: number, total: number) => total > 0 ? ((obtained / total) * 100).toFixed(2) : "0";
  const calcGrade = (pct: number) => pct >= 90 ? "A+" : pct >= 75 ? "A" : pct >= 60 ? "B" : pct >= 45 ? "C" : pct >= 33 ? "D" : "F";

  const handleSubjectChange = (idx: number, field: string, val: string | number) => {
    const subs = form.subjects.map((s, i) => i === idx ? { ...s, [field]: val } : s);
    const totalObtained = subs.reduce((a, b) => a + Number(b.marksObtained), 0);
    const totalMax = subs.reduce((a, b) => a + Number(b.maxMarks), 0);
    const pct = calcPercentage(totalObtained, totalMax);
    setForm(f => ({
      ...f, subjects: subs.map(s => ({ ...s, grade: calcGrade((Number(s.marksObtained) / Number(s.maxMarks)) * 100) })),
      marksObtained: totalObtained, totalMarks: totalMax, percentage: pct,
      result: Number(pct) >= 33 ? "Pass" : "Fail",
    }));
  };

  const addSubject = () => setForm(f => ({ ...f, subjects: [...f.subjects, { subject: "", maxMarks: 100, marksObtained: 0, grade: "A" }] }));
  const removeSubject = (idx: number) => setForm(f => ({ ...f, subjects: f.subjects.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.rollNumber || !form.studentName || !form.className) { toast({ title: "Fill required fields", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await createResult.mutateAsync({
        data: {
          rollNumber: form.rollNumber, studentName: form.studentName, className: form.className,
          section: form.section || undefined, examType: form.examType, academicYear: form.academicYear,
          subjects: form.subjects as any, totalMarks: form.totalMarks, marksObtained: form.marksObtained,
          percentage: form.percentage, result: form.result, rank: form.rank ? Number(form.rank) : undefined,
          remarks: form.remarks || undefined,
        }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      toast({ title: "Result added!" });
      setShowForm(false);
    } catch { toast({ title: "Failed to add result", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this result?")) return;
    await deleteResult.mutateAsync(id);
    queryClient.invalidateQueries({ queryKey: ["/api/results"] });
    toast({ title: "Result deleted" });
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Exam Results Management</h2>
        <Button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Result
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-primary/30 shadow-md">
          <CardHeader className="pb-3"><CardTitle className="text-base">Add New Result</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Roll Number *</Label><Input value={form.rollNumber} onChange={e => setForm(f => ({ ...f, rollNumber: e.target.value }))} className="mt-1" /></div>
              <div><Label>Student Name *</Label><Input value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} className="mt-1" /></div>
              <div><Label>Class *</Label><Input value={form.className} onChange={e => setForm(f => ({ ...f, className: e.target.value }))} placeholder="e.g. Class X" className="mt-1" /></div>
              <div><Label>Section</Label><Input value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Exam Type</Label>
                <Select value={form.examType} onValueChange={(v: any) => setForm(f => ({ ...f, examType: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Final">Final</SelectItem>
                    <SelectItem value="Mid-term">Mid-term</SelectItem>
                    <SelectItem value="Unit-Test">Unit-Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Academic Year</Label><Input value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))} className="mt-1" /></div>
              <div><Label>Rank</Label><Input type="number" value={form.rank} onChange={e => setForm(f => ({ ...f, rank: e.target.value }))} className="mt-1" /></div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Subjects</Label>
                <Button size="sm" variant="outline" onClick={addSubject} className="h-7 text-xs"><Plus className="w-3 h-3 mr-1" /> Add Subject</Button>
              </div>
              <div className="space-y-2">
                {form.subjects.map((sub, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 items-center">
                    <Input placeholder="Subject" value={sub.subject} onChange={e => handleSubjectChange(idx, "subject", e.target.value)} />
                    <Input type="number" placeholder="Max Marks" value={sub.maxMarks} onChange={e => handleSubjectChange(idx, "maxMarks", Number(e.target.value))} />
                    <Input type="number" placeholder="Obtained" value={sub.marksObtained} onChange={e => handleSubjectChange(idx, "marksObtained", Number(e.target.value))} />
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${sub.grade === "F" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"} border-0`}>{sub.grade}</Badge>
                      {form.subjects.length > 1 && <Button size="sm" variant="ghost" onClick={() => removeSubject(idx)} className="h-7 w-7 p-0 text-destructive"><X className="w-3.5 h-3.5" /></Button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-muted/30 p-3 rounded-lg">
              <div><Label>Total Marks</Label><p className="font-bold text-lg mt-1">{form.totalMarks}</p></div>
              <div><Label>Marks Obtained</Label><p className="font-bold text-lg mt-1">{form.marksObtained}</p></div>
              <div><Label>Percentage</Label><p className={`font-bold text-lg mt-1 ${Number(form.percentage) >= 33 ? "text-accent" : "text-destructive"}`}>{form.percentage}%</p></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Result</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={`text-sm px-4 py-1 ${form.result === "Pass" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"} border-0`}>{form.result}</Badge>
                </div>
              </div>
              <div><Label>Remarks</Label><Input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} className="mt-1" /></div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="flex-1">{saving ? "Saving..." : "Add Result"}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                {["Roll No.", "Name", "Class", "Exam", "Year", "%", "Result", ""].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {results?.map(r => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{r.rollNumber}</td>
                  <td className="px-4 py-3 font-medium">{r.studentName}</td>
                  <td className="px-4 py-3">{r.className}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{r.examType}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{r.academicYear}</td>
                  <td className="px-4 py-3 font-bold">{r.percentage}%</td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${r.result === "Pass" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"} border-0`}>{r.result}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)} className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
              {!results?.length && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No results added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Add Staff Tab ─── */
function AddStaffTab({ toast, queryClient }: any) {
  const createStaff = useCreateStaff();
  const { data: staffList } = useListStaff();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", designation: "", qualification: "", subject: "",
    phone: "", email: "", joinDate: new Date().toISOString().split("T")[0],
    photoUrl: "", username: "", password: "", isHeadmaster: false,
  });

  const handleSave = async () => {
    if (!form.name || !form.designation) { toast({ title: "Fill required fields (Name, Designation)", variant: "destructive" }); return; }
    if (form.username && !form.password) { toast({ title: "Password required when username is set", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await createStaff.mutateAsync({
        data: {
          name: form.name, designation: form.designation,
          qualification: form.qualification || undefined, subject: form.subject || undefined,
          phone: form.phone || undefined, email: form.email || undefined, joinDate: form.joinDate,
          photoUrl: form.photoUrl || undefined, username: form.username || undefined,
          password: form.password || undefined, isHeadmaster: form.isHeadmaster,
        }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({ title: `${form.name} added as staff member!` });
      setForm({ name: "", designation: "", qualification: "", subject: "", phone: "", email: "", joinDate: new Date().toISOString().split("T")[0], photoUrl: "", username: "", password: "", isHeadmaster: false });
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to add staff member";
      toast({ title: msg, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold">Add New Staff Member</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md border-t-4 border-t-primary">
          <CardHeader className="pb-3"><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Teacher's full name" className="mt-1" /></div>
              <div><Label>Designation *</Label><Input value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} placeholder="e.g. Teacher" className="mt-1" /></div>
              <div><Label>Qualification</Label><Input value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} placeholder="e.g. M.Sc, B.Ed" className="mt-1" /></div>
              <div><Label>Subject</Label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Mathematics" className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1" /></div>
              <div><Label>Join Date</Label><Input type="date" value={form.joinDate} onChange={e => setForm(f => ({ ...f, joinDate: e.target.value }))} className="mt-1" /></div>
              <div className="col-span-2"><Label>Photo URL</Label><Input value={form.photoUrl} onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))} placeholder="https://..." className="mt-1" /></div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Switch checked={form.isHeadmaster} onCheckedChange={v => setForm(f => ({ ...f, isHeadmaster: v }))} />
              <div>
                <Label>Is Headmaster</Label>
                <p className="text-xs text-muted-foreground">Mark if this person is the headmaster</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="shadow-md border-t-4 border-t-accent">
            <CardHeader className="pb-3"><CardTitle className="text-base">Portal Access (Optional)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Create login credentials so this teacher can access the staff portal.</p>
              <div><Label>Username</Label><Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="login username" className="mt-1" /></div>
              <div><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="minimum 6 characters" className="mt-1" /></div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full h-12 text-base font-bold">
            {saving ? "Adding Staff Member..." : "Add Staff Member"}
          </Button>

          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Current Staff ({staffList?.length ?? 0})</CardTitle></CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {staffList?.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={s.photoUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{s.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.designation}</p>
                  </div>
                  {s.isHeadmaster && <Badge className="text-xs bg-primary/10 text-primary border-0">HM</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─── Students Tab ─── */
function StudentsTab() {
  const { data: students, isLoading } = useListStudents({});
  const [search, setSearch] = useState("");
  const filtered = students?.filter(s =>
    s.studentName.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.includes(search) ||
    s.className.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Students ({students?.length ?? 0})</h2>
        <Input placeholder="Search by name, roll, class..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                {["Roll No.", "Name", "Father", "Class", "Admission Date", "Phone"].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered?.map(s => (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{s.rollNumber}</td>
                  <td className="px-4 py-3 font-medium">{s.studentName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.fatherName}</td>
                  <td className="px-4 py-3">{s.className}{s.section ? ` (${s.section})` : ""}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{s.admissionDate}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.guardianPhone || "—"}</td>
                </tr>
              ))}
              {!filtered?.length && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Admissions Tab ─── */
function AdmissionsTab({ toast, queryClient }: any) {
  const { data: admissions, isLoading } = useListAdmissions({});
  const updateStatus = useUpdateAdmissionStatus();
  const [updating, setUpdating] = useState<number | null>(null);

  const handleStatus = async (id: number, status: "approved" | "rejected" | "pending", remarks?: string) => {
    setUpdating(id);
    try {
      await updateStatus.mutateAsync({ id, data: { status, remarks } });
      queryClient.invalidateQueries({ queryKey: ["/api/admissions"] });
      toast({ title: `Application ${status}!` });
    } catch { toast({ title: "Failed to update", variant: "destructive" }); }
    finally { setUpdating(null); }
  };

  const statusColor = (s: string) => s === "approved" ? "bg-accent/10 text-accent" : s === "rejected" ? "bg-destructive/10 text-destructive" : "bg-secondary/20 text-secondary-foreground";

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold">Admission Applications ({admissions?.length ?? 0})</h2>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : (
        <div className="space-y-4">
          {admissions?.map(app => (
            <Card key={app.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold">{app.studentName}</h3>
                      <Badge className={`text-xs border-0 ${statusColor(app.status)}`}>{app.status}</Badge>
                      <Badge variant="outline" className="text-xs">Class: {app.appliedForClass}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                      <span>Father: {app.fatherName}</span>
                      <span>Mother: {app.motherName}</span>
                      {app.dateOfBirth && <span>DOB: {app.dateOfBirth}</span>}
                      {app.fatherPhone && <span>Phone: {app.fatherPhone}</span>}
                      {app.apaarId && <span>APAAR: {app.apaarId}</span>}
                      <span>Applied: {new Date(app.submittedAt).toLocaleDateString()}</span>
                    </div>
                    {app.remarks && <p className="text-xs text-muted-foreground mt-1">Remarks: {app.remarks}</p>}
                  </div>
                  {app.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" className="bg-accent hover:bg-accent/90 text-white h-8 text-xs gap-1" disabled={updating === app.id} onClick={() => handleStatus(app.id, "approved")}>
                        <Check className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10 h-8 text-xs gap-1" disabled={updating === app.id} onClick={() => handleStatus(app.id, "rejected")}>
                        <X className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {!admissions?.length && (
            <Card className="shadow-sm">
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No admission applications yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Attendance Tab ─── */
const CLASSES = ["Ankur", "Mukul", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const SECTIONS = ["A", "B", "C", "D"];

const NO_SECTION = "_all";

function AttendanceTab({ user, toast }: any) {
  const today = new Date().toISOString().split("T")[0];
  const [mode, setMode] = useState<"mark" | "report">("mark");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState(NO_SECTION);
  const [selectedDate, setSelectedDate] = useState(today);
  const [reportMonth, setReportMonth] = useState(String(new Date().getMonth() + 1));
  const [reportYear, setReportYear] = useState(String(new Date().getFullYear()));
  const [attendanceMap, setAttendanceMap] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const sectionValue = selectedSection === NO_SECTION ? undefined : selectedSection;

  const attendanceEnabled = !!(selectedClass && selectedDate);
  const attendanceParams = attendanceEnabled
    ? { date: selectedDate, className: selectedClass, section: sectionValue }
    : undefined;

  const { data: students } = useListStudents(
    selectedClass ? { class: selectedClass } : {},
  );

  const { data: existingAttendance, refetch: refetchAttendance } = useGetAttendance(
    attendanceParams,
    { query: { queryKey: getGetAttendanceQueryKey(attendanceParams), enabled: attendanceEnabled } }
  );

  const markBulk = useMarkAttendanceBulk();

  useEffect(() => {
    if (existingAttendance && existingAttendance.length > 0) {
      const map: Record<number, string> = {};
      existingAttendance.forEach((r: any) => { map[r.studentId] = r.status; });
      setAttendanceMap(map);
    } else if (students && students.length > 0) {
      const map: Record<number, string> = {};
      students.forEach((s: any) => { map[s.id] = "present"; });
      setAttendanceMap(map);
    }
  }, [existingAttendance, students]);

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
          section: sectionValue,
          markedBy: user.name,
          records: students.map((s: any) => ({ studentId: s.id, status: (attendanceMap[s.id] || "present") as AttendanceBulkInputRecordsItemStatus })),
        }
      });
      refetchAttendance();
      toast({ title: "Attendance saved!" });
    } catch { toast({ title: "Failed to save attendance", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleGenerateReport = async () => {
    if (!selectedClass) { toast({ title: "Select a class first", variant: "destructive" }); return; }
    setReportLoading(true);
    setReport(null);
    try {
      const params = new URLSearchParams({ className: selectedClass, month: reportMonth, year: reportYear });
      if (sectionValue) params.set("section", sectionValue);
      const res = await fetch(`/api/attendance/report?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      setReport(await res.json());
    } catch { toast({ title: "Failed to generate report", variant: "destructive" }); }
    finally { setReportLoading(false); }
  };

  const statusBadge = (status: string) => {
    if (status === "present") return "bg-accent/15 text-accent border-accent/30";
    if (status === "absent") return "bg-destructive/15 text-destructive border-destructive/30";
    return "bg-yellow-100 text-yellow-700 border-yellow-300";
  };

  const presentCount = students?.filter((s: any) => attendanceMap[s.id] === "present").length ?? 0;
  const absentCount = students?.filter((s: any) => attendanceMap[s.id] === "absent").length ?? 0;
  const lateCount = students?.filter((s: any) => attendanceMap[s.id] === "late").length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex gap-3 items-center flex-wrap">
        <h2 className="text-lg font-bold flex-1">Attendance Management</h2>
        <div className="flex gap-2 bg-white border rounded-lg p-1">
          <button onClick={() => setMode("mark")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === "mark" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
            Mark Attendance
          </button>
          <button onClick={() => setMode("report")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === "report" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
            Monthly Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs mb-1.5 block">Class *</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SECTION}>All Sections</SelectItem>
                  {SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {mode === "mark" ? (
              <div>
                <Label className="text-xs mb-1.5 block">Date *</Label>
                <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="h-9 text-sm" max={today} />
              </div>
            ) : (
              <>
                <div>
                  <Label className="text-xs mb-1.5 block">Month</Label>
                  <Select value={reportMonth} onValueChange={setReportMonth}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Year</Label>
                  <Select value={reportYear} onValueChange={setReportYear}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{["2024","2025","2026"].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </>
            )}
            {mode === "report" && (
              <div className="flex items-end">
                <Button onClick={handleGenerateReport} className="h-9 w-full text-sm" disabled={!selectedClass || reportLoading}>
                  {reportLoading ? "Loading..." : "Generate Report"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mark Attendance Mode */}
      {mode === "mark" && selectedClass && students && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-base">{selectedClass}{selectedSection ? ` - ${selectedSection}` : ""} &middot; {selectedDate}</CardTitle>
              <div className="flex gap-2 items-center">
                <Badge className="bg-accent/15 text-accent border-accent/30 border">{presentCount} Present</Badge>
                <Badge className="bg-destructive/15 text-destructive border-destructive/30 border">{absentCount} Absent</Badge>
                {lateCount > 0 && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 border">{lateCount} Late</Badge>}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Click a student row to toggle: Present → Absent → Late</p>
          </CardHeader>
          <CardContent className="p-0">
            {students.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No students found for this class.</p>
              </div>
            ) : (
              <div className="divide-y">
                {students.map((student: any, idx: number) => {
                  const status = attendanceMap[student.id] || "present";
                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStatus(student.id)}
                      className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <span className="text-xs text-muted-foreground w-6 text-right">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{student.studentName}</p>
                        <p className="text-xs text-muted-foreground">Roll: {student.rollNumber}</p>
                      </div>
                      <Badge className={`text-xs border capitalize min-w-[60px] justify-center ${statusBadge(status)}`}>{status}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          {students.length > 0 && (
            <div className="p-4 border-t flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{students.length} students total</p>
              <Button onClick={handleSave} disabled={saving} className="h-9 text-sm px-6">
                {saving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          )}
        </Card>
      )}

      {!selectedClass && mode === "mark" && (
        <Card className="shadow-sm">
          <CardContent className="p-8 text-center text-muted-foreground">
            <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Select a class above to mark attendance.</p>
          </CardContent>
        </Card>
      )}

      {/* Monthly Report Mode */}
      {mode === "report" && report && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {report.className}{report.section ? ` - ${report.section}` : ""} &middot; {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][(report.month ?? 1) - 1]} {report.year}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {!report.students?.length ? (
              <div className="p-8 text-center text-muted-foreground">No attendance data for this period.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-left">
                    <th className="px-4 py-2 font-semibold text-xs whitespace-nowrap">Roll</th>
                    <th className="px-4 py-2 font-semibold text-xs">Name</th>
                    <th className="px-4 py-2 font-semibold text-xs text-center text-accent">Present</th>
                    <th className="px-4 py-2 font-semibold text-xs text-center text-destructive">Absent</th>
                    <th className="px-4 py-2 font-semibold text-xs text-center text-yellow-600">Late</th>
                    <th className="px-4 py-2 font-semibold text-xs text-center">Total Days</th>
                    <th className="px-4 py-2 font-semibold text-xs text-center">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.students.map((s: any) => {
                    const pct = s.total > 0 ? Math.round((s.present / s.total) * 100) : 0;
                    return (
                      <tr key={s.studentId} className="hover:bg-muted/20">
                        <td className="px-4 py-2 text-xs text-muted-foreground">{s.rollNumber}</td>
                        <td className="px-4 py-2 font-medium whitespace-nowrap">{s.studentName}</td>
                        <td className="px-4 py-2 text-center text-accent font-bold">{s.present}</td>
                        <td className="px-4 py-2 text-center text-destructive font-bold">{s.absent}</td>
                        <td className="px-4 py-2 text-center text-yellow-600 font-bold">{s.late}</td>
                        <td className="px-4 py-2 text-center text-muted-foreground">{s.total}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`font-bold ${pct >= 75 ? "text-accent" : pct >= 50 ? "text-yellow-600" : "text-destructive"}`}>{pct}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}



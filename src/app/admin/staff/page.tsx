"use client";

import { useState } from "react";
import { uploadImageWithCompression } from "@/lib/supabase";
import {
  useListStaff,
  getListStaffQueryKey,
  useCreateStaff,
  useDeleteStaff,
  useUpdateStaff,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Plus, Trash2, Star, Camera, X, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  designation: z.string().min(1, "Designation is required"),
  joinDate: z.string().min(1, "Join date is required"),
  qualification: z.string().optional(),
  subject: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  isHeadmaster: z.boolean().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  photoUrl: z.string().optional(),
});

type StaffForm = z.infer<typeof staffSchema>;

export default function StaffAdmin() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { data: staff, isLoading } = useListStaff();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<StaffForm>({
    // @ts-ignore
    resolver: zodResolver(staffSchema),
    defaultValues: { name: "", designation: "", joinDate: "", qualification: "", subject: "", phone: "", email: "", isHeadmaster: false, username: "", password: "", photoUrl: "" },
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    // Show local preview INSTANTLY — no need to wait for upload
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);
    form.setValue("photoUrl", ""); // clear previous Supabase URL until upload done

    setIsUploading(true);
    try {
      const url = await uploadImageWithCompression(file, "assets");
      if (url) {
        form.setValue("photoUrl", url);
        // swap local blob URL with real Supabase URL
        URL.revokeObjectURL(localUrl);
        setPhotoPreview(url);
      } else {
        // upload failed — clear preview
        setPhotoPreview(null);
        URL.revokeObjectURL(localUrl);
      }
    } catch (err) {
      console.error("Photo upload failed", err);
      setPhotoPreview(null);
      URL.revokeObjectURL(localUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    form.setValue("photoUrl", "");
    setPhotoPreview(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
      setPhotoPreview(null);
      setEditingId(null);
    }
  };

  const onSubmit = (data: StaffForm) => {
    const payload = { ...data, username: data.username || undefined, password: data.password || undefined, photoUrl: data.photoUrl || undefined };
    if (editingId) {
      updateStaff.mutate(
        { id: editingId, data: payload as any },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
            form.reset();
            setPhotoPreview(null);
            setEditingId(null);
            setIsOpen(false);
          },
        }
      );
    } else {
      createStaff.mutate(
        { data: payload as any },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
            form.reset();
            setPhotoPreview(null);
            setIsOpen(false);
          },
        }
      );
    }
  };

  const handleEdit = (member: any) => {
    form.reset({
      name: member.name,
      designation: member.designation,
      joinDate: member.joinDate ? new Date(member.joinDate).toISOString().split("T")[0] : "",
      qualification: member.qualification || "",
      subject: member.subject || "",
      phone: member.phone || "",
      email: member.email || "",
      isHeadmaster: member.isHeadmaster || false,
      username: member.username || "",
      password: "",
      photoUrl: member.photoUrl || "",
    });
    setPhotoPreview(member.photoUrl || null);
    setEditingId(member.id);
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteStaff.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
        setDeletingId(null);
      },
      onError: () => setDeletingId(null),
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{staff?.length ?? 0} staff members</p>
        </div>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-staff" className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Photo Upload Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-primary" />
                  <Label className="text-sm font-semibold">Teacher Photo <span className="text-primary">(Must Have)</span></Label>
                </div>

                {photoPreview ? (
                  /* ── Preview box ── */
                  <div className="space-y-2">
                    <div className="relative w-full h-44 rounded-xl overflow-hidden border-2 border-primary/40">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover object-top"
                      />
                      {/* Uploading overlay — shown on top of the preview */}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-white text-xs font-semibold">Uploading to server...</span>
                        </div>
                      )}
                      {/* Success badge */}
                      {!isUploading && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1.5 font-medium">
                          ✓ Photo ready
                        </div>
                      )}
                    </div>
                    {/* Action buttons below the preview */}
                    <div className="flex gap-2">
                      <label
                        htmlFor="staff-photo-upload"
                        className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border border-primary/40 text-primary text-sm font-medium cursor-pointer hover:bg-primary/10 transition-colors"
                      >
                        <Camera className="w-4 h-4" /> Change Photo
                        <input
                          id="staff-photo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                          disabled={isUploading}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={isUploading}
                        className="flex items-center gap-1 px-3 h-9 rounded-lg border border-destructive/40 text-destructive text-sm hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Empty upload box ── */
                  <label
                    htmlFor="staff-photo-upload"
                    className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Camera className="w-8 h-8" />
                      <span className="text-sm font-medium">Tap to select photo</span>
                      <span className="text-xs">Gallery or Camera</span>
                    </div>
                    <input
                      id="staff-photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label>Full Name *</Label>
                  <Input {...form.register("name")} placeholder="Shri Bhupen Bora" data-testid="input-staff-name" />
                  {form.formState.errors.name && <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Designation *</Label>
                  <Input {...form.register("designation")} placeholder="Teacher" data-testid="input-staff-designation" />
                  {form.formState.errors.designation && <p className="text-destructive text-xs">{form.formState.errors.designation.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Join Date *</Label>
                  <Input type="date" {...form.register("joinDate")} data-testid="input-staff-joindate" />
                </div>
                <div className="space-y-1">
                  <Label>Qualification</Label>
                  <Input {...form.register("qualification")} placeholder="M.Sc., B.Ed." />
                </div>
                <div className="space-y-1">
                  <Label>Subject</Label>
                  <Input {...form.register("subject")} placeholder="Mathematics" />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input {...form.register("phone")} placeholder="9876543210" />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input {...form.register("email")} placeholder="email@school.ac.in" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Checkbox
                    id="isHeadmaster"
                    checked={form.watch("isHeadmaster")}
                    onCheckedChange={(v) => form.setValue("isHeadmaster", !!v)}
                    data-testid="checkbox-headmaster"
                  />
                  <Label htmlFor="isHeadmaster">Mark as Headmaster</Label>
                </div>
                {/* Login credentials section */}
                <div className="col-span-2 border-t pt-3 mt-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Login Credentials (Must Have)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Username {!editingId && "*"}</Label>
                      <Input required={!editingId} {...form.register("username")} placeholder="e.g. bhupen_bora" autoComplete="off" />
                    </div>
                    <div className="space-y-1">
                      <Label>Password {!editingId && "*"}</Label>
                      <Input required={!editingId} type="password" {...form.register("password")} placeholder={editingId ? "Leave blank to keep current" : "Set login password"} autoComplete="new-password" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">This staff member can login to the Staff Portal using these credentials.</p>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createStaff.isPending || updateStaff.isPending || isUploading} data-testid="button-submit-staff">
                {createStaff.isPending || updateStaff.isPending ? "Saving..." : isUploading ? "Uploading photo..." : (editingId ? "Save Changes" : "Add Staff Member")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff?.map((member) => (
                <TableRow key={member.id} data-testid={`row-staff-${member.id}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {member.name}
                      {member.isHeadmaster && <Badge variant="secondary" className="text-xs"><Star className="w-3 h-3 mr-1" />Head</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{member.designation}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{member.subject ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{member.qualification ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{member.phone ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(member)} data-testid={`button-edit-staff-${member.id}`}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" data-testid={`button-delete-staff-${member.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to remove {member.name}? This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            disabled={deletingId === member.id}
                            onClick={() => handleDelete(member.id)} 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingId === member.id ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
}


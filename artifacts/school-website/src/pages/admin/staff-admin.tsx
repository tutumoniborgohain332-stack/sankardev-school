import { useState } from "react";
import {
  useListStaff,
  getListStaffQueryKey,
  useCreateStaff,
  useDeleteStaff,
} from "@workspace/api-client-react";
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
import { Plus, Trash2, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  designation: z.string().min(1, "Designation is required"),
  department: z.string().min(1, "Department is required"),
  joinDate: z.string().min(1, "Join date is required"),
  qualification: z.string().optional(),
  subject: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  isHeadmaster: z.boolean().optional(),
});

type StaffForm = z.infer<typeof staffSchema>;

export default function StaffAdmin() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: staff, isLoading } = useListStaff();
  const createStaff = useCreateStaff();
  const deleteStaff = useDeleteStaff();

  const form = useForm<StaffForm>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: "", designation: "", department: "", joinDate: "", qualification: "", subject: "", phone: "", email: "", isHeadmaster: false },
  });

  const onSubmit = (data: StaffForm) => {
    createStaff.mutate(
      { data: { name: data.name, designation: data.designation, department: data.department, joinDate: data.joinDate, qualification: data.qualification, subject: data.subject, phone: data.phone, email: data.email, isHeadmaster: data.isHeadmaster } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
          form.reset();
          setIsOpen(false);
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteStaff.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() }),
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{staff?.length ?? 0} staff members</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-staff" className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <Label>Department *</Label>
                  <Input {...form.register("department")} placeholder="Science" data-testid="input-staff-department" />
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
              </div>
              <Button type="submit" className="w-full" disabled={createStaff.isPending} data-testid="button-submit-staff">
                {createStaff.isPending ? "Saving..." : "Add Staff Member"}
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
                <TableHead>Department</TableHead>
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
                  <TableCell>{member.department}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{member.subject ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{member.qualification ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{member.phone ?? "—"}</TableCell>
                  <TableCell>
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
                          <AlertDialogAction onClick={() => handleDelete(member.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

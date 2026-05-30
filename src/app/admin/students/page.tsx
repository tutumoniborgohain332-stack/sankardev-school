"use client";

import { useState } from "react";
import { 
  useListStudents, 
  getListStudentsQueryKey, 
  useCreateStudent, 
  useDeleteStudent,
  useGetMe
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2, ArrowUpCircle, ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
  studentName: z.string().min(1, "Required"),
  fatherName: z.string().min(1, "Required"),
  motherName: z.string().min(1, "Required"),
  className: z.string().min(1, "Required"),
  rollNumber: z.string().min(1, "Required"),
  apaarId: z.string().min(1, "Required"),
  admissionDate: z.string().min(1, "Required"),
  section: z.string().optional(),
  dateOfBirth: z.string().optional(),
  caste: z.string().optional(),
  religion: z.string().optional(),
  bloodGroup: z.string().optional(),
  nationality: z.string().optional(),
  guardianPhone: z.string().optional()
});

export default function StudentsAdmin() {
  const [search, setSearch] = useState("");
  const [className, setClassName] = useState<string>("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpscaleOpen, setIsUpscaleOpen] = useState(false);
  const [upscalePassword, setUpscalePassword] = useState("");
  const [upscaleLoading, setUpscaleLoading] = useState(false);
  const { data: currentUser } = useGetMe();
  const isPrivileged = currentUser?.role === "principal" || currentUser?.role === "vice_principal";
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: students, isLoading } = useListStudents(
    { search: search || undefined, class: className || undefined },
    { query: { queryKey: getListStudentsQueryKey({ search: search || undefined, class: className || undefined }) } }
  );

  const createStudent = useCreateStudent();
  const deleteStudent = useDeleteStudent();

  const form = useForm<z.infer<typeof formSchema>>({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      fatherName: "",
      motherName: "",
      className: "",
      rollNumber: "",
      apaarId: "",
      admissionDate: new Date().toISOString().split("T")[0],
      section: "",
      dateOfBirth: "",
      caste: "",
      religion: "",
      bloodGroup: "",
      nationality: "Indian",
      guardianPhone: ""
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createStudent.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
          setIsAddOpen(false);
          form.reset();
          toast({ title: "Student added successfully" });
        },
        onError: () => {
          toast({ title: "Failed to add student", variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteStudent.mutate(
      id,
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
          toast({ title: "Student deleted" });
        },
        onError: () => {
          toast({ title: "Failed to delete student", variant: "destructive" });
        }
      }
    );
  };

  const handleUpscale = async () => {
    if (!upscalePassword) return;
    setUpscaleLoading(true);
    try {
      const res = await fetch("/api/students/upscale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: upscalePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upscale failed");
      queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
      toast({ title: "✅ Upscale Successful!", description: data.message });
      setIsUpscaleOpen(false);
      setUpscalePassword("");
    } catch (err: any) {
      toast({ title: "Upscale Failed", description: err.message, variant: "destructive" });
    } finally {
      setUpscaleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <div className="flex items-center gap-2">
          {/* Upscale button - only for Principal / Vice Principal */}
          {isPrivileged && (
            <Button
              variant="outline"
              className="border-amber-500 text-amber-600 hover:bg-amber-50 font-semibold"
              onClick={() => setIsUpscaleOpen(true)}
            >
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Upscale Classes
            </Button>
          )}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Student</Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="studentName" render={({ field }) => (
                    <FormItem><FormLabel>Student Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="apaarId" render={({ field }) => (
                    <FormItem><FormLabel>APAAR ID *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="fatherName" render={({ field }) => (
                    <FormItem><FormLabel>Father's Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="motherName" render={({ field }) => (
                    <FormItem><FormLabel>Mother's Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="className" render={({ field }) => (
                    <FormItem><FormLabel>Class *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["Ankur", "Mukul", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="section" render={({ field }) => (
                    <FormItem><FormLabel>Section</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["A", "B", "C", "D"].map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="rollNumber" render={({ field }) => (
                    <FormItem><FormLabel>Roll Number *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="admissionDate" render={({ field }) => (
                    <FormItem><FormLabel>Admission Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="guardianPhone" render={({ field }) => (
                    <FormItem><FormLabel>Guardian Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                    <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createStudent.isPending}>
                    {createStudent.isPending ? "Adding..." : "Save Student"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search students..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={className} onValueChange={(val) => setClassName(val === "all" ? "" : val)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {["Ankur", "Mukul", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"].map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>APAAR ID</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Roll No.</TableHead>
              <TableHead>Father's Name</TableHead>
              <TableHead>Admission Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : students?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              students?.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.studentName}</TableCell>
                  <TableCell>{student.apaarId}</TableCell>
                  <TableCell>
                    {student.className} {student.section && `(${student.section})`}
                  </TableCell>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>{student.fatherName}</TableCell>
                  <TableCell>{new Date(student.admissionDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {student.studentName}'s record.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(student.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Upscale Confirmation Dialog */}
      <Dialog open={isUpscaleOpen} onOpenChange={(open) => { setIsUpscaleOpen(open); if (!open) setUpscalePassword(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <ShieldAlert className="w-5 h-5" /> Upscale All Classes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              <p className="font-semibold mb-1">⚠️ This action will:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Promote ALL students to the next class</li>
                <li>Ankur → Mukul → Class I → II → ... → X</li>
                <li>Class X students will be auto-deleted after <strong>10 days</strong></li>
              </ul>
              <p className="mt-2 font-semibold">Are you sure you want to continue?</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="upscale-password">Enter your password to confirm</Label>
              <Input
                id="upscale-password"
                type="password"
                placeholder="Your login password"
                value={upscalePassword}
                onChange={e => setUpscalePassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleUpscale()}
              />
              <p className="text-xs text-muted-foreground">Only Principal or Vice Principal password is accepted.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setIsUpscaleOpen(false); setUpscalePassword(""); }}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                onClick={handleUpscale}
                disabled={!upscalePassword || upscaleLoading}
              >
                {upscaleLoading ? "Upscaling..." : "✅ Confirm Upscale"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


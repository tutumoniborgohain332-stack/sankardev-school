"use client";

import { useState } from "react";
import {
  useListResults,
  getListResultsQueryKey,
  useCreateResult,
  useUpdateResult,
  useDeleteResult,
} from "@/lib/api-client";
import type { ExamResult, SubjectResult } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, PlusCircle, MinusCircle, CheckCircle, XCircle } from "lucide-react";

const CLASSES = ["Ankur", "Mukul", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const EXAM_TYPES = ["Mid-term", "Final", "Unit-Test"] as const;
const GRADES = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];

const EMPTY_SUBJECT: SubjectResult = { subject: "", maxMarks: 100, marksObtained: 0, grade: "A" };

const DEFAULT_FORM = {
  rollNumber: "",
  studentName: "",
  className: "",
  section: "",
  examType: "Final" as string,
  academicYear: "2024-25",
  subjects: [{ ...EMPTY_SUBJECT }],
  totalMarks: 0,
  marksObtained: 0,
  percentage: "0",
  result: "Pass" as string,
  rank: "",
  remarks: "",
};

type FormState = typeof DEFAULT_FORM;

function computeTotals(subjects: SubjectResult[]): { totalMarks: number; marksObtained: number; percentage: string; result: string } {
  const total = subjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0);
  const obtained = subjects.reduce((sum, s) => sum + (Number(s.marksObtained) || 0), 0);
  const pct = total > 0 ? ((obtained / total) * 100).toFixed(2) : "0";
  const passed = obtained >= total * 0.33;
  return { totalMarks: total, marksObtained: obtained, percentage: pct, result: passed ? "Pass" : "Fail" };
}

function ResultForm({
  initial,
  onSave,
  saving,
  onClose,
}: {
  initial: FormState;
  onSave: (data: FormState) => void;
  saving: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setSubject = (idx: number, field: keyof SubjectResult, value: string | number) => {
    const updated = form.subjects.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    const totals = computeTotals(updated);
    setForm(prev => ({ ...prev, subjects: updated, ...totals }));
  };

  const addSubject = () => {
    const updated = [...form.subjects, { ...EMPTY_SUBJECT }];
    const totals = computeTotals(updated);
    setForm(prev => ({ ...prev, subjects: updated, ...totals }));
  };

  const removeSubject = (idx: number) => {
    const updated = form.subjects.filter((_, i) => i !== idx);
    const totals = computeTotals(updated);
    setForm(prev => ({ ...prev, subjects: updated, ...totals }));
  };

  return (
    <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Roll Number *</Label>
          <Input value={form.rollNumber} onChange={e => setField("rollNumber", e.target.value)} placeholder="e.g. 101" />
        </div>
        <div className="space-y-1">
          <Label>Student Name *</Label>
          <Input value={form.studentName} onChange={e => setField("studentName", e.target.value)} placeholder="Full name" />
        </div>
        <div className="space-y-1">
          <Label>Class *</Label>
          <Select value={form.className} onValueChange={v => setField("className", v)}>
            <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Section</Label>
          <Select value={form.section} onValueChange={v => setField("section", v)}>
            <SelectTrigger><SelectValue placeholder="Select section (Optional)" /></SelectTrigger>
            <SelectContent>
              {["A", "B", "C", "D"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Exam Type *</Label>
          <Select value={form.examType} onValueChange={v => setField("examType", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{EXAM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Academic Year *</Label>
          <Select value={form.academicYear} onValueChange={v => setField("academicYear", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-25">2024-25</SelectItem>
              <SelectItem value="2023-24">2023-24</SelectItem>
              <SelectItem value="2022-23">2022-23</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Subjects */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-base font-bold">Subjects & Marks</Label>
          <Button type="button" variant="outline" size="sm" className="flex items-center gap-1" onClick={addSubject}>
            <PlusCircle className="w-4 h-4" /> Add Subject
          </Button>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-4">Subject</div>
            <div className="col-span-2 text-center">Max</div>
            <div className="col-span-2 text-center">Obtained</div>
            <div className="col-span-2 text-center">Grade</div>
            <div className="col-span-2"></div>
          </div>
          {form.subjects.map((sub, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-4">
                <Input value={sub.subject} onChange={e => setSubject(idx, "subject", e.target.value)} placeholder="Mathematics" className="h-8 text-sm" />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={sub.maxMarks}
                  onChange={e => {
                    const val = Number(e.target.value);
                    if (val <= 100 && val >= 0) setSubject(idx, "maxMarks", val);
                  }}
                  className="h-8 text-sm text-center"
                  min={0}
                  max={100}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={sub.marksObtained}
                  onChange={e => {
                    const val = Number(e.target.value);
                    if (val <= sub.maxMarks && val >= 0) setSubject(idx, "marksObtained", val);
                  }}
                  className="h-8 text-sm text-center"
                  min={0}
                  max={sub.maxMarks}
                />
              </div>
              <div className="col-span-2">
                <Select value={sub.grade} onValueChange={v => setSubject(idx, "grade", v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex justify-center">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeSubject(idx)} disabled={form.subjects.length === 1}>
                  <MinusCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Auto-computed totals */}
        <div className="mt-3 p-3 rounded-lg bg-muted/50 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Total Marks</p>
            <p className="font-bold text-lg">{form.totalMarks} / {form.totalMarks}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Obtained / Percentage</p>
            <p className="font-bold text-lg">{form.marksObtained} ({parseFloat(form.percentage).toFixed(1)}%)</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Result</p>
            <div className={`inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded text-sm ${form.result === "Pass" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {form.result === "Pass" ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {form.result}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Optional fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Rank (optional)</Label>
          <Input type="number" value={form.rank} onChange={e => setField("rank", e.target.value)} placeholder="1" min={1} />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Remarks (optional)</Label>
          <Textarea value={form.remarks} onChange={e => setField("remarks", e.target.value)} placeholder="Any additional remarks..." rows={2} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button className="flex-1" disabled={saving || !form.rollNumber || !form.studentName || !form.className} onClick={() => onSave(form)}>
          {saving ? "Saving..." : "Save Result"}
        </Button>
      </div>
    </div>
  );
}

export default function ResultsAdmin() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<ExamResult | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterYear, setFilterYear] = useState("2024-25");
  const [filterClass, setFilterClass] = useState("all");

  const queryClient = useQueryClient();
  const { data: results, isLoading } = useListResults({
    academicYear: filterYear || undefined,
    className: (filterClass && filterClass !== "all") ? filterClass : undefined,
  });

  const createResult = useCreateResult();
  const updateResult = useUpdateResult();
  const deleteResult = useDeleteResult();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListResultsQueryKey() });

  const handleCreate = (form: typeof DEFAULT_FORM) => {
    createResult.mutate(
      {
        data: {
          rollNumber: form.rollNumber,
          studentName: form.studentName,
          className: form.className,
          section: form.section || undefined,
          examType: form.examType as "Mid-term" | "Final" | "Unit-Test",
          academicYear: form.academicYear,
          subjects: form.subjects,
          totalMarks: form.totalMarks,
          marksObtained: form.marksObtained,
          percentage: form.percentage,
          result: form.result as "Pass" | "Fail",
          rank: form.rank ? Number(form.rank) : undefined,
          remarks: form.remarks || undefined,
        },
      },
      { onSuccess: () => { invalidate(); setIsCreateOpen(false); } }
    );
  };

  const handleUpdate = (form: typeof DEFAULT_FORM) => {
    if (!editingResult) return;
    updateResult.mutate(
      {
        id: editingResult.id,
        data: {
          rollNumber: form.rollNumber,
          studentName: form.studentName,
          className: form.className,
          section: form.section || undefined,
          examType: form.examType as "Mid-term" | "Final" | "Unit-Test",
          academicYear: form.academicYear,
          subjects: form.subjects,
          totalMarks: form.totalMarks,
          marksObtained: form.marksObtained,
          percentage: form.percentage,
          result: form.result as "Pass" | "Fail",
          rank: form.rank ? Number(form.rank) : undefined,
          remarks: form.remarks || undefined,
        },
      },
      { onSuccess: () => { invalidate(); setEditingResult(null); } }
    );
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteResult.mutate(id, { 
      onSuccess: () => { invalidate(); setDeletingId(null); },
      onError: () => setDeletingId(null),
    });
  };

  const editingForm = editingResult
    ? {
        rollNumber: editingResult.rollNumber,
        studentName: editingResult.studentName,
        className: editingResult.className,
        section: editingResult.section ?? "",
        examType: editingResult.examType,
        academicYear: editingResult.academicYear,
        subjects: editingResult.subjects,
        totalMarks: editingResult.totalMarks,
        marksObtained: editingResult.marksObtained,
        percentage: editingResult.percentage,
        result: editingResult.result,
        rank: editingResult.rank?.toString() ?? "",
        remarks: editingResult.remarks ?? "",
      }
    : DEFAULT_FORM;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exam Results</h1>
          <p className="text-muted-foreground text-sm mt-1">{results?.length ?? 0} results published</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="button-add-result">
              <Plus className="w-4 h-4" /> Add Result
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Exam Result</DialogTitle>
            </DialogHeader>
            <ResultForm
              initial={DEFAULT_FORM}
              onSave={handleCreate}
              saving={createResult.isPending}
              onClose={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024-25">2024-25</SelectItem>
            <SelectItem value="2023-24">2023-24</SelectItem>
            <SelectItem value="2022-23">2022-23</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingResult} onOpenChange={(open) => { if (!open) setEditingResult(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Result — {editingResult?.studentName}</DialogTitle>
          </DialogHeader>
          <ResultForm
            initial={editingForm}
            onSave={handleUpdate}
            saving={updateResult.isPending}
            onClose={() => setEditingResult(null)}
          />
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Roll No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Exam Type</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    No results published yet. Click "Add Result" to publish the first one.
                  </TableCell>
                </TableRow>
              )}
              {results?.map((r) => (
                <TableRow key={r.id} data-testid={`row-result-${r.id}`}>
                  <TableCell className="font-mono font-medium">{r.rollNumber}</TableCell>
                  <TableCell className="font-medium">{r.studentName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Class {r.className}{r.section ? ` - ${r.section}` : ""}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.examType}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.academicYear}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.marksObtained}/{r.totalMarks}</TableCell>
                  <TableCell className="font-medium">{parseFloat(r.percentage).toFixed(1)}%</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${r.result === "Pass" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                      {r.result === "Pass" ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {r.result}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingResult(r)} data-testid={`button-edit-result-${r.id}`}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" data-testid={`button-delete-result-${r.id}`}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Result</AlertDialogTitle>
                            <AlertDialogDescription>Delete result for {r.studentName} ({r.examType} {r.academicYear})?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              disabled={deletingId === r.id}
                              onClick={() => handleDelete(r.id)} 
                              className="bg-destructive text-destructive-foreground"
                            >
                              {deletingId === r.id ? "Deleting..." : "Delete"}
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


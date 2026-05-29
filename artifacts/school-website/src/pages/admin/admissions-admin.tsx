import { useState } from "react";
import {
  useListAdmissions,
  getListAdmissionsQueryKey,
  useUpdateAdmissionStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";

import type { AdmissionApplication } from "@workspace/api-client-react";
import { useAdmissionOpen, useToggleAdmission } from "@/hooks/use-admission-settings";
import { Switch } from "@/components/ui/switch";
type Admission = AdmissionApplication;

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Approved</Badge>;
  if (status === "rejected") return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Rejected</Badge>;
  return <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs flex items-center gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground text-sm w-48 shrink-0">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function AdmissionsAdmin() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [remarks, setRemarks] = useState("");
  const queryClient = useQueryClient();
  const { admissionOpen } = useAdmissionOpen();
  const toggleAdmission = useToggleAdmission();

  const params = selectedTab !== "all" ? { status: selectedTab as "pending" | "approved" | "rejected" } : {};
  const { data: admissions, isLoading } = useListAdmissions(params);
  const updateStatus = useUpdateAdmissionStatus();

  const handleStatusUpdate = (id: number, status: "approved" | "rejected") => {
    updateStatus.mutate(
      { id, data: { status, remarks: remarks || undefined } },
      {
        onSuccess: (updated) => {
          queryClient.invalidateQueries({ queryKey: getListAdmissionsQueryKey() });
          setSelectedAdmission(updated);
          setRemarks("");
        },
      }
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admission Applications</h1>
          <p className="text-muted-foreground text-sm mt-1">{admissions?.length ?? 0} applications</p>
        </div>

        {/* Admission Portal Toggle */}
        <div className="flex items-center gap-3 bg-muted/50 border border-border rounded-xl px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Admission Portal</p>
            <p className="text-xs text-muted-foreground">
              {admissionOpen ? "Publicly visible — accepting applications" : "Hidden from public — not accepting"}
            </p>
          </div>
          <Switch
            id="admission-toggle"
            checked={admissionOpen}
            onCheckedChange={(val) => toggleAdmission.mutate(val)}
            disabled={toggleAdmission.isPending}
            className="data-[state=checked]:bg-green-600"
          />
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Student Name</TableHead>
                    <TableHead>Father's Name</TableHead>
                    <TableHead>Class Applied</TableHead>
                    <TableHead>APAAR ID</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-16">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admissions?.map((app) => (
                    <TableRow
                      key={app.id}
                      className="cursor-pointer hover:bg-muted/30"
                      data-testid={`row-admission-${app.id}`}
                      onClick={() => { setSelectedAdmission(app); setRemarks(""); }}
                    >
                      <TableCell className="font-medium">{app.studentName}</TableCell>
                      <TableCell className="text-muted-foreground">{app.fatherName}</TableCell>
                      <TableCell><Badge variant="outline">{app.appliedForClass}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{app.apaarId ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(app.submittedAt).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell><StatusBadge status={app.status} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-view-admission-${app.id}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Sheet */}
      <Sheet open={!!selectedAdmission} onOpenChange={(open) => { if (!open) setSelectedAdmission(null); }}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedAdmission && (
            <>
              <SheetHeader className="mb-4">
                <SheetTitle className="text-xl">Admission Application</SheetTitle>
                <div className="flex items-center gap-3">
                  <StatusBadge status={selectedAdmission.status} />
                  <span className="text-muted-foreground text-sm">Applied: {new Date(selectedAdmission.submittedAt).toLocaleDateString("en-IN")}</span>
                </div>
              </SheetHeader>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Student Details</h3>
                  <DetailRow label="Student Name" value={selectedAdmission.studentName} />
                  <DetailRow label="Father's Name" value={selectedAdmission.fatherName} />
                  <DetailRow label="Mother's Name" value={selectedAdmission.motherName} />
                  <DetailRow label="Date of Birth" value={selectedAdmission.dateOfBirth} />
                  <DetailRow label="Age" value={selectedAdmission.age} />
                  <DetailRow label="Blood Group" value={selectedAdmission.bloodGroup} />
                  <DetailRow label="Caste" value={selectedAdmission.caste} />
                  <DetailRow label="Religion" value={selectedAdmission.religion} />
                  <DetailRow label="Nationality" value={selectedAdmission.nationality} />
                  <DetailRow label="APAAR ID" value={selectedAdmission.apaarId} />
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Address & Contact</h3>
                  <DetailRow label="Permanent Address" value={selectedAdmission.permanentAddress} />
                  <DetailRow label="Present Address" value={selectedAdmission.presentAddress} />
                  <DetailRow label="PIN Code" value={selectedAdmission.pinCode} />
                  <DetailRow label="Father's Phone" value={selectedAdmission.fatherPhone} />
                  <DetailRow label="Mother's Phone" value={selectedAdmission.motherPhone} />
                  <DetailRow label="Guardian Name" value={selectedAdmission.guardianName} />
                  <DetailRow label="Guardian Relation" value={selectedAdmission.guardianRelation} />
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Academic Details</h3>
                  <DetailRow label="Class Applied For" value={selectedAdmission.appliedForClass} />
                  <DetailRow label="Special Category" value={selectedAdmission.specialCategory} />
                  <DetailRow label="Previous School" value={selectedAdmission.previousSchoolName} />
                  <DetailRow label="Previous Class" value={selectedAdmission.previousClass} />
                  <DetailRow label="Previous Result" value={selectedAdmission.previousClassResult} />
                  <DetailRow label="Reason for Leaving" value={selectedAdmission.reasonForLeaving} />
                  <DetailRow label="Sibling (Name)" value={selectedAdmission.siblingName} />
                  <DetailRow label="Sibling (Class)" value={selectedAdmission.siblingClass} />
                </div>

                {selectedAdmission.remarks && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Remarks</h3>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedAdmission.remarks}</p>
                    </div>
                  </>
                )}

                {selectedAdmission.status === "pending" && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Label>Remarks (optional)</Label>
                      <Textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add remarks before approving or rejecting..."
                        rows={3}
                        data-testid="textarea-remarks"
                      />
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                          onClick={() => handleStatusUpdate(selectedAdmission.id, "approved")}
                          disabled={updateStatus.isPending}
                          data-testid="button-approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 flex items-center gap-2"
                          onClick={() => handleStatusUpdate(selectedAdmission.id, "rejected")}
                          disabled={updateStatus.isPending}
                          data-testid="button-reject"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

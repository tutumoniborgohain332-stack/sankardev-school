"use client";

import { useState } from "react";
import { useListComplaints, useDeleteComplaint } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, AlertCircle, Loader2, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

export default function AdminComplaintsPage() {
  const { data: complaints, isLoading, isError } = useListComplaints();
  const deleteComplaint = useDeleteComplaint();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteComplaint.mutate(id, {
      onSuccess: () => setDeletingId(null),
      onError: () => setDeletingId(null),
    });
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (isError) return <div className="p-12 text-destructive text-center">Failed to load complaints.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Complaints & Reports</h1>
        <p className="text-muted-foreground mt-2">
          View public reports securely. All reports are automatically deleted after 7 days.
        </p>
      </div>

      {!complaints?.length ? (
        <Card className="border-dashed shadow-sm bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <ShieldAlert className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-foreground">No complaints to review</h3>
            <p className="text-muted-foreground text-sm mt-1">Your inbox is clean!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {complaints.map((item: any) => (
            <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Card className="h-full flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden border-destructive/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-destructive/80" />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-lg text-foreground font-bold leading-tight">{item.subject}</CardTitle>
                      <CardDescription className="text-xs font-medium mt-1.5 flex flex-col gap-1">
                        <span className="text-primary font-bold">{item.name}</span>
                        <span className="text-muted-foreground">{item.identityDetails}</span>
                      </CardDescription>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Report?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to permanently delete this report early? It cannot be recovered.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            disabled={deletingId === item.id}
                            onClick={() => handleDelete(item.id)} 
                            className="bg-destructive text-destructive-foreground"
                          >
                            {deletingId === item.id ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="bg-muted/30 p-3 rounded-md text-sm text-foreground/90 whitespace-pre-wrap flex-1 border border-border/50">
                    {item.content}
                  </div>
                  <div className="mt-4 pt-3 border-t flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    <span>ID: #{item.id}</span>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

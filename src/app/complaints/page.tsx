"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCreateComplaint } from "@/lib/api-client";

export default function ComplaintsPage() {
  const [formData, setFormData] = useState({ name: "", identityDetails: "", subject: "", content: "" });
  const [success, setSuccess] = useState(false);
  const createComplaint = useCreateComplaint();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createComplaint.mutate(formData, {
      onSuccess: () => {
        setSuccess(true);
        setFormData({ name: "", identityDetails: "", subject: "", content: "" });
      }
    });
  };

  return (
    <MainLayout>
      <div className="bg-muted/20 min-h-[80vh] py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <FadeIn>
            <div className="text-center mb-10">
              <div className="mx-auto w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">File a Report / Complaint</h1>
              <p className="text-muted-foreground text-lg">
                Please provide your details below to submit a complaint directly to the school authorities. 
                Your report will be automatically deleted after 7 days to protect privacy.
              </p>
            </div>

            {success ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800 font-bold">Report Submitted Successfully</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your complaint has been forwarded to the administration. Thank you for notifying us.
                </AlertDescription>
                <Button className="mt-4" variant="outline" onClick={() => setSuccess(false)}>File another report</Button>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-border space-y-6">
                {createComplaint.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{(createComplaint.error as any)?.message || "Failed to submit report"}</AlertDescription>
                  </Alert>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input 
                      id="name" 
                      required 
                      placeholder="Enter your name" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="identity">Identity Details *</Label>
                    <Input 
                      id="identity" 
                      required 
                      placeholder="Class / Roll No / Phone Number" 
                      value={formData.identityDetails}
                      onChange={(e) => setFormData({ ...formData, identityDetails: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input 
                    id="subject" 
                    required 
                    placeholder="Briefly describe the issue" 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Full Report / Complaint *</Label>
                  <Textarea 
                    id="content" 
                    required 
                    placeholder="Provide detailed information here..." 
                    className="min-h-[150px]"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full font-bold text-lg" disabled={createComplaint.isPending}>
                  {createComplaint.isPending ? "Submitting..." : "Submit Securely"}
                </Button>
              </form>
            )}
          </FadeIn>
        </div>
      </div>
    </MainLayout>
  );
}

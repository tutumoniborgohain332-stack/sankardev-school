"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useListResults } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Printer, Trophy, BookOpen, AlertCircle, CheckCircle, XCircle } from "lucide-react";

const CURRENT_YEAR = "2024-25";
const EXAM_TYPES = ["Mid-term", "Final", "Unit-Test"] as const;
const CLASSES = ["Ankur", "Mukul", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function getGradeColor(grade: string) {
  if (grade === "A+" || grade === "A") return "bg-green-100 text-green-800 border-green-200";
  if (grade === "B+" || grade === "B") return "bg-blue-100 text-blue-800 border-blue-200";
  if (grade === "C+" || grade === "C") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (grade === "D") return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-red-100 text-red-800 border-red-200";
}

export default function Results() {
  const [searchParams, setSearchParams] = useState<{
    rollNumber: string;
    className: string;
    examType: string;
    academicYear: string;
  }>({ rollNumber: "", className: "all", examType: "all", academicYear: CURRENT_YEAR });

  const [submitted, setSubmitted] = useState(false);
  const [query, setQuery] = useState<typeof searchParams | null>(null);

  const { data: results, isLoading, isFetching, error } = useListResults(
    query
      ? {
          rollNumber: query.rollNumber || undefined,
          className: (query.className && query.className !== "all") ? query.className : undefined,
          examType: (query.examType && query.examType !== "all") ? query.examType : undefined,
          academicYear: query.academicYear || undefined,
        }
      : undefined
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery({ ...searchParams });
    setSubmitted(true);
  };

  const handlePrint = () => window.print();

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-primary mb-2">Exam Results</h1>
            <p className="text-xl font-bold text-foreground/80">পৰীক্ষাৰ ফলাফল</p>
            <p className="text-muted-foreground mt-2">Sankardev Sishu Vidya Niketan Mathurapure</p>
          </motion.div>

          {/* Search Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-lg border-border mb-8">
              <CardHeader className="bg-primary/5 border-b px-6 py-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Search Your Result
                </h2>
                <p className="text-sm text-muted-foreground">Enter your Roll Number and select your class to find your result</p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <Label htmlFor="rollNumber" className="font-semibold">Roll Number (ক্ৰমাংক) *</Label>
                    <Input
                      id="rollNumber"
                      placeholder="e.g. 101"
                      value={searchParams.rollNumber}
                      onChange={(e) => setSearchParams(p => ({ ...p, rollNumber: e.target.value }))}
                      className="text-lg h-11"
                      data-testid="input-roll"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">Class (শ্ৰেণী)</Label>
                    <Select
                      value={searchParams.className}
                      onValueChange={(v) => setSearchParams(p => ({ ...p, className: v }))}
                    >
                      <SelectTrigger data-testid="select-class">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">Exam Type (পৰীক্ষাৰ প্ৰকাৰ)</Label>
                    <Select
                      value={searchParams.examType}
                      onValueChange={(v) => setSearchParams(p => ({ ...p, examType: v }))}
                    >
                      <SelectTrigger data-testid="select-examtype">
                        <SelectValue placeholder="Select Exam" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Exams</SelectItem>
                        {EXAM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">Academic Year (শিক্ষাবৰ্ষ)</Label>
                    <Select
                      value={searchParams.academicYear}
                      onValueChange={(v) => setSearchParams(p => ({ ...p, academicYear: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-25">2024-25</SelectItem>
                        <SelectItem value="2023-24">2023-24</SelectItem>
                        <SelectItem value="2022-23">2022-23</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-bold shadow-[0_8px_30px_rgb(232,117,10,0.3)] hover:shadow-[0_8px_30px_rgb(232,117,10,0.5)] transition-all active:scale-95"
                      disabled={isLoading || isFetching}
                      data-testid="button-search"
                    >
                      {(isLoading || isFetching) ? "Searching..." : "Search Result"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {(isLoading || isFetching) ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center py-24"
              >
                <div className="flex flex-col items-center gap-4 text-primary">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <p className="font-semibold animate-pulse">Searching Records...</p>
                </div>
              </motion.div>
            ) : submitted && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error ? (
                  <Card className="border-border shadow-md">
                    <CardContent className="p-12 text-center">
                      <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Error Fetching Results</h3>
                      <p className="text-muted-foreground">There was a problem retrieving the result. Please try again later.</p>
                    </CardContent>
                  </Card>
                ) : (!results || results.length === 0) ? (
                  <Card className="border-border shadow-md">
                    <CardContent className="p-12 text-center">
                      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">No Results Found</h3>
                      <p className="text-muted-foreground">No exam result found for the given details. Please check your Roll Number, Class and Academic Year and try again.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6 print-area">
                    {/* Print button */}
                    <div className="flex justify-end print:hidden">
                      <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                        <Printer className="w-4 h-4" />
                        Print Result
                      </Button>
                    </div>

                    {results.map((result) => (
                      <Card key={result.id} className="shadow-lg border-border overflow-hidden" data-testid={`result-card-${result.id}`}>
                        {/* School Header (for print) */}
                        <div className="hidden print:block text-center py-4 border-b">
                          <h2 className="text-xl font-bold">শংকৰদেৱ শিশু নিকেতন মথুৰাপুৰ</h2>
                          <p className="text-sm">Sankardev Sishu Vidya Niketan Mathurapure</p>
                          <h3 className="text-lg font-bold mt-1">{result.examType} Examination — {result.academicYear}</h3>
                        </div>

                        {/* Result Banner */}
                        <div className={`px-6 py-4 flex items-center justify-between ${result.result === "Pass" ? "bg-green-600" : "bg-red-600"} text-white`}>
                          <div className="flex items-center gap-3">
                            {result.result === "Pass"
                              ? <CheckCircle className="w-7 h-7" />
                              : <XCircle className="w-7 h-7" />
                            }
                            <div>
                              <p className="text-sm font-medium opacity-90">{result.examType} Examination · {result.academicYear}</p>
                              <p className="text-2xl font-bold">{result.result === "Pass" ? "উত্তীৰ্ণ — PASSED" : "অনুত্তীৰ্ণ — FAILED"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold">{parseFloat(result.percentage).toFixed(1)}%</p>
                            <p className="text-sm opacity-80">Percentage</p>
                          </div>
                        </div>

                        <CardContent className="p-6 space-y-6">
                          {/* Student Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">Student Name</p>
                              <p className="font-bold text-foreground mt-0.5">{result.studentName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">Roll Number</p>
                              <p className="font-bold text-foreground mt-0.5">{result.rollNumber}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">Class</p>
                              <p className="font-bold text-foreground mt-0.5">Class {result.className}{result.section ? ` — ${result.section}` : ""}</p>
                            </div>
                            {result.rank && (
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Rank</p>
                                <p className="font-bold text-foreground mt-0.5 flex items-center gap-1">
                                  <Trophy className="w-4 h-4 text-amber-500" />
                                  {result.rank}
                                </p>
                              </div>
                            )}
                          </div>

                          <Separator />

                          {/* Subject-wise marks */}
                          <div>
                            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-primary" />
                              Subject-wise Marks (বিষয়ভিত্তিক নম্বৰ)
                            </h3>
                            <div className="overflow-x-auto rounded-xl border border-border">
                              <table className="w-full text-sm">
                                <thead className="bg-muted/60">
                                  <tr>
                                    <th className="text-left px-4 py-2.5 font-semibold">Subject</th>
                                    <th className="text-center px-4 py-2.5 font-semibold">Max Marks</th>
                                    <th className="text-center px-4 py-2.5 font-semibold">Obtained</th>
                                    <th className="text-center px-4 py-2.5 font-semibold">Grade</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {result.subjects.map((sub, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                      <td className="px-4 py-2.5 font-medium">{sub.subject}</td>
                                      <td className="px-4 py-2.5 text-center text-muted-foreground">{sub.maxMarks}</td>
                                      <td className="px-4 py-2.5 text-center font-bold">{sub.marksObtained}</td>
                                      <td className="px-4 py-2.5 text-center">
                                        <Badge className={`text-xs font-bold ${getGradeColor(sub.grade)}`}>
                                          {sub.grade}
                                        </Badge>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-primary/10 font-bold border-t-2 border-primary/20">
                                  <tr>
                                    <td className="px-4 py-3">Total</td>
                                    <td className="px-4 py-3 text-center">{result.totalMarks}</td>
                                    <td className="px-4 py-3 text-center">{result.marksObtained}</td>
                                    <td className="px-4 py-3 text-center">{parseFloat(result.percentage).toFixed(1)}%</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>

                          {result.remarks && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Remarks</p>
                                <p className="text-sm bg-muted/50 p-3 rounded-lg">{result.remarks}</p>
                              </div>
                            </>
                          )}

                          <Separator />
                          <p className="text-xs text-muted-foreground text-center">
                            Published on {new Date(result.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} ·
                            This is a computer-generated result. For any discrepancy, contact the school office.
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
}



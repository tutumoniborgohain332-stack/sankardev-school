import { MainLayout } from "@/components/layout/main-layout";
import { useSubmitAdmission } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  serialNumber: z.string().optional(),
  classRollNumber: z.string().optional(),
  studentNamePrefix: z.string(),
  studentName: z.string().min(2, "Name is required"),
  fatherNamePrefix: z.string(),
  fatherName: z.string().min(2, "Father's name is required"),
  motherName: z.string().min(2, "Mother's name is required"),
  permanentVillage: z.string().min(2, "Village is required"),
  permanentPo: z.string().min(2, "P.O. is required"),
  permanentPin: z.string().min(6, "Valid PIN is required"),
  presentVillage: z.string().min(2, "Village is required"),
  presentPo: z.string().min(2, "P.O. is required"),
  presentPin: z.string().min(6, "Valid PIN is required"),
  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
  dateOfBirth: z.string().min(10, "Date of birth is required"),
  age: z.string().optional(),
  caste: z.string().min(2, "Caste is required"),
  religion: z.string().min(2, "Religion is required"),
  bloodGroup: z.string().optional(),
  nationality: z.string().min(2, "Nationality is required"),
  previousSchoolName: z.string().optional(),
  previousSchoolAddress: z.string().optional(),
  previousClass: z.string().optional(),
  reasonForLeaving: z.string().optional(),
  appliedForClass: z.string().min(1, "Class is required"),
  siblingName: z.string().optional(),
  siblingClass: z.string().optional(),
  siblingSection: z.string().optional(),
  specialCategory: z.string().optional(),
  apaarId: z.string().optional(),
  fatherPhone: z.string().optional(),
  motherPhone: z.string().optional(),
  place: z.string().min(2, "Place is required"),
  date: z.string().min(10, "Date is required"),
});

export default function Admission() {
  const { toast } = useToast();
  const submitAdmission = useSubmitAdmission();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentNamePrefix: "Sri",
      fatherNamePrefix: "Sri",
      nationality: "Indian",
      reasonForLeaving: "transfer",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const permanentAddress = `${values.permanentVillage}, P.O.: ${values.permanentPo}, PIN: ${values.permanentPin}`;
    const presentAddress = `${values.presentVillage}, P.O.: ${values.presentPo}, PIN: ${values.presentPin}`;
    
    submitAdmission.mutate({
      data: {
        serialNumber: values.serialNumber,
        classRollNumber: values.classRollNumber,
        studentName: `${values.studentNamePrefix}. ${values.studentName}`,
        fatherName: `${values.fatherNamePrefix}. ${values.fatherName}`,
        motherName: values.motherName,
        permanentAddress,
        presentAddress,
        guardianName: values.guardianName,
        guardianRelation: values.guardianRelation,
        dateOfBirth: values.dateOfBirth,
        age: values.age,
        caste: values.caste,
        religion: values.religion,
        nationality: values.nationality,
        bloodGroup: values.bloodGroup,
        previousSchoolName: values.previousSchoolName,
        previousSchoolAddress: values.previousSchoolAddress,
        previousClass: values.previousClass,
        reasonForLeaving: values.reasonForLeaving,
        appliedForClass: values.appliedForClass,
        siblingName: values.siblingName,
        siblingClass: values.siblingClass,
        siblingSection: values.siblingSection,
        specialCategory: values.specialCategory,
        apaarId: values.apaarId,
        fatherPhone: values.fatherPhone,
        motherPhone: values.motherPhone,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Application Submitted Successfully",
          description: "Your admission application has been received.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your application.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <MainLayout>
      <div className="bg-primary/5 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <Card className="border-t-8 border-t-primary shadow-xl">
            <CardHeader className="text-center border-b pb-8">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                শিশু শিক্ষা সমিতি, অসমৰ অন্তৰ্গত
              </div>
              <CardTitle className="text-3xl md:text-4xl font-serif text-primary">
                নামভৰ্তি আবেদন পত্ৰ <br />
                <span className="text-xl text-foreground font-sans mt-2 block">Admission Application Form</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                  
                  {/* Header Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-xl">
                    <FormField
                      control={form.control}
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serial No. (ক্রমিক নং)</FormLabel>
                          <FormControl>
                            <Input placeholder="Office Use Only" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="classRollNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Roll No. (গণীতৰ ক্ৰমাংক)</FormLabel>
                          <FormControl>
                            <Input placeholder="Office Use Only" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Student Details */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold border-b pb-2 text-primary">1. Student Details (ছাত্র/ছাত্রীৰ বিৱৰণ)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name="studentNamePrefix"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prefix</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Prefix" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Sri">Sri</SelectItem>
                                  <SelectItem value="Smt">Smt.</SelectItem>
                                  <SelectItem value="Md">Md.</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="md:col-span-9">
                        <FormField
                          control={form.control}
                          name="studentName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student's Full Name (ছাত্র/ছাত্রীৰ নাম)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fatherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father's Name (পিতৃৰ নাম)</FormLabel>
                            <div className="flex gap-2">
                              <Select defaultValue="Sri">
                                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="Sri">Sri</SelectItem></SelectContent>
                              </Select>
                              <FormControl>
                                <Input placeholder="Father's name" {...field} className="flex-1" />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="motherName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother's Name (মাতৃৰ নাম)</FormLabel>
                            <FormControl>
                              <Input placeholder="Mother's name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <p className="text-base font-bold">Permanent Address (স্থায়ী ঠিকনা)</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="permanentVillage" render={({field}) => (
                          <FormItem><FormLabel>Village/Town (বাসস্থান)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                        )} />
                        <FormField control={form.control} name="permanentPo" render={({field}) => (
                          <FormItem><FormLabel>P.O. (ডাকঘৰ)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                        )} />
                        <FormField control={form.control} name="permanentPin" render={({field}) => (
                          <FormItem><FormLabel>PIN (পিন)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                        )} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-base font-bold">Present Address (বৰ্তমান ঠিকনা)</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="presentVillage" render={({field}) => (
                          <FormItem><FormLabel>Village/Town (বাসস্থান)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                        )} />
                        <FormField control={form.control} name="presentPo" render={({field}) => (
                          <FormItem><FormLabel>P.O. (ডাকঘৰ)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                        )} />
                        <FormField control={form.control} name="presentPin" render={({field}) => (
                          <FormItem><FormLabel>PIN (পিন)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                        )} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="guardianName" render={({field}) => (
                        <FormItem><FormLabel>Local Guardian's Name (স্থানীয় অভিভাৱকৰ নাম)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                      <FormField control={form.control} name="guardianRelation" render={({field}) => (
                        <FormItem><FormLabel>Guardian Relation (অভিভাৱকৰ সম্পৰ্ক)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <FormField control={form.control} name="dateOfBirth" render={({field}) => (
                        <FormItem><FormLabel>Date of Birth (জন্ম তাৰিখ)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                      <FormField control={form.control} name="age" render={({field}) => (
                        <FormItem><FormLabel>Age</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                      <FormField control={form.control} name="caste" render={({field}) => (
                        <FormItem><FormLabel>Caste (জাতি)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                      <FormField control={form.control} name="religion" render={({field}) => (
                        <FormItem><FormLabel>Religion (ধৰ্ম)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="bloodGroup" render={({field}) => (
                        <FormItem><FormLabel>Blood Group (তেজৰ গ্ৰুপ)</FormLabel><FormControl><Input placeholder="(from previous report card)" {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                      <FormField control={form.control} name="nationality" render={({field}) => (
                        <FormItem><FormLabel>Nationality (নাগৰিকত্ব)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                    </div>
                  </div>

                  {/* Previous School */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold border-b pb-2 text-primary">2. Previous School Details (আগৰ বিদ্যালয়ৰ বিৱৰণ)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="previousSchoolName" render={({field}) => (
                        <FormItem><FormLabel>School Name (বিদ্যালয়ৰ নাম)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                      <FormField control={form.control} name="previousSchoolAddress" render={({field}) => (
                        <FormItem><FormLabel>Address (ঠিকনা)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                      <FormField control={form.control} name="previousClass" render={({field}) => (
                        <FormItem><FormLabel>Last Class Attended (শেষ শ্ৰেণী)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                      <FormField control={form.control} name="reasonForLeaving" render={({field}) => (
                        <FormItem>
                          <FormLabel>Reason for Leaving (বিদ্যালয় এৰাৰ কাৰণ)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="transfer">Transfer</SelectItem>
                              <SelectItem value="passed">Passed</SelectItem>
                              <SelectItem value="withdrawn">Withdrawn</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage/>
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* Class Applied */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold border-b pb-2 text-primary">3. Admission Details (নামভৰ্তিৰ বিৱৰণ)</h3>
                    <FormField control={form.control} name="appliedForClass" render={({field}) => (
                      <FormItem className="md:w-1/2">
                        <FormLabel>Class Applied For (পঢ়িব বিচৰা শ্ৰেণী)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {["Pre-Primary", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"].map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage/>
                      </FormItem>
                    )} />

                    <div className="space-y-4">
                      <p className="text-base font-bold">Siblings in this school (এই বিদ্যালয়ত পঢ়া ভাই/ভনী)</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="siblingName" render={({field}) => (
                          <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                        )} />
                        <FormField control={form.control} name="siblingClass" render={({field}) => (
                          <FormItem><FormLabel>Class</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                        )} />
                        <FormField control={form.control} name="siblingSection" render={({field}) => (
                          <FormItem><FormLabel>Section</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                        )} />
                      </div>
                    </div>
                  </div>

                  {/* Special Info */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold border-b pb-2 text-primary">4. Additional Information (অতিৰিক্ত তথ্য)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="specialCategory" render={({field}) => (
                        <FormItem><FormLabel>Special Category</FormLabel><FormControl><Input placeholder="Arts/Science/Commerce" {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                      <FormField control={form.control} name="apaarId" render={({field}) => (
                        <FormItem><FormLabel>APAAR ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                      <FormField control={form.control} name="fatherPhone" render={({field}) => (
                        <FormItem><FormLabel>Father's Phone (পিতৃৰ ফোন)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                      <FormField control={form.control} name="motherPhone" render={({field}) => (
                        <FormItem><FormLabel>Mother's Phone (মাতৃৰ ফোন)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                    </div>
                  </div>

                  {/* Declaration */}
                  <div className="space-y-6 bg-muted/20 p-6 rounded-xl border">
                    <h3 className="text-lg font-bold text-center mb-4">Declaration (ঘোষণা)</h3>
                    <p className="text-sm text-muted-foreground text-center mb-6">
                      I hereby declare that the information provided above is true to the best of my knowledge. I agree to abide by the rules and regulations of the school.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <FormField control={form.control} name="place" render={({field}) => (
                        <FormItem><FormLabel>Place (স্থান)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                      <FormField control={form.control} name="date" render={({field}) => (
                        <FormItem><FormLabel>Date (তাৰিখ)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage/></FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 pt-8">
                      <div className="text-center">
                        <div className="border-b border-dashed border-gray-400 w-48 mx-auto mb-2"></div>
                        <p className="text-sm font-medium">Signature of Student</p>
                      </div>
                      <div className="text-center">
                        <div className="border-b border-dashed border-gray-400 w-48 mx-auto mb-2"></div>
                        <p className="text-sm font-medium">Signature of Parent/Guardian</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center pt-8">
                    <Button type="submit" size="lg" className="w-full md:w-auto px-12 py-6 text-lg font-bold rounded-full shadow-lg" disabled={submitAdmission.isPending}>
                      {submitAdmission.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

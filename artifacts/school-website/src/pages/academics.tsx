import { MainLayout } from "@/components/layout/main-layout";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Book, CalendarDays } from "lucide-react";

export default function Academics() {
  return (
    <MainLayout>
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent"
          >
            Academics
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg max-w-2xl mx-auto opacity-90"
          >
            Comprehensive education framework designed for academic excellence and overall development.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full border-primary/20 shadow-md">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center text-primary text-2xl font-serif">
                  <Book className="mr-3 text-accent h-6 w-6" /> Classes Offered
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">We offer comprehensive education following the prescribed curriculum from foundational stages to secondary education.</p>
                <ul className="space-y-2 font-medium text-foreground">
                  <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-accent before:rounded-full before:mr-3">Ankur (Pre-Primary I)</li>
                  <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-accent before:rounded-full before:mr-3">Mukul (Pre-Primary II)</li>
                  <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-accent before:rounded-full before:mr-3">Class I to V (Primary)</li>
                  <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-accent before:rounded-full before:mr-3">Class VI to VIII (Upper Primary)</li>
                  <li className="flex items-center before:content-[''] before:w-2 before:h-2 before:bg-accent before:rounded-full before:mr-3">Class IX & X (Secondary)</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-primary/20 shadow-md">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center text-primary text-2xl font-serif">
                  <Book className="mr-3 text-accent h-6 w-6" /> Key Subjects
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {["Assamese", "English", "Mathematics", "General Science", "Social Science", "Hindi", "Sanskrit", "Computer Science", "Physical Education", "Moral Education", "Music & Art"].map((sub) => (
                    <span key={sub} className="px-3 py-1 bg-accent/10 text-primary rounded-full text-sm font-semibold border border-accent/20">
                      {sub}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-primary/20 shadow-md">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center text-primary text-2xl font-serif">
                  <Clock className="mr-3 text-accent h-6 w-6" /> School Timings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h4 className="font-bold text-foreground">Monday to Friday</h4>
                  <p className="text-muted-foreground">8:30 AM to 2:45 PM</p>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Saturday</h4>
                  <p className="text-muted-foreground">8:30 AM to 12:30 PM</p>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Morning Assembly</h4>
                  <p className="text-muted-foreground">8:40 AM (Attendance mandatory)</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl font-serif font-bold text-primary mb-8 flex items-center">
            <CalendarDays className="mr-3 text-accent h-8 w-8" /> Academic Calendar Highlights
          </h2>
          <div className="bg-card shadow-md rounded-xl overflow-hidden border border-border">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead className="w-[200px] font-bold text-primary">Event / Examination</TableHead>
                  <TableHead className="font-bold text-primary">Tentative Month</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">New Session Begins</TableCell>
                  <TableCell>April</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">First Unit Test</TableCell>
                  <TableCell>May</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Half Yearly Examination</TableCell>
                  <TableCell>September</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Second Unit Test</TableCell>
                  <TableCell>November</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Annual Sports & Cultural Week</TableCell>
                  <TableCell>December</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Annual Examination</TableCell>
                  <TableCell>March</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}

import { MainLayout } from "@/components/layout/main-layout";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We will get back to you soon.",
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <MainLayout>
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent"
          >
            Contact Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg max-w-2xl mx-auto opacity-90"
          >
            We'd love to hear from you. Reach out with any questions or inquiries.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-serif font-bold text-primary">Get in Touch</h2>
            <p className="text-muted-foreground text-lg">
              Feel free to visit us during school hours or reach out via phone or email. Our administration team is ready to assist you.
            </p>

            <div className="grid gap-6">
              <Card className="border-none shadow-md">
                <CardContent className="flex items-start p-6 gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 text-accent">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">School Address</h3>
                    <p className="text-muted-foreground">
                      Sankardev Shishu/Vidya Niketan<br />
                      Mathurapur, Assam<br />
                      PIN: 785689, India
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardContent className="flex items-start p-6 gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Phone</h3>
                    <p className="text-muted-foreground">+91 9876543210</p>
                    <p className="text-muted-foreground">+91 8765432109</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardContent className="flex items-start p-6 gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Email</h3>
                    <p className="text-muted-foreground">contact@ssvnmathurapur.edu.in</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-md">
                <CardContent className="flex items-start p-6 gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 text-accent">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Office Hours</h3>
                    <p className="text-muted-foreground">Mon - Fri: 8:00 AM - 3:00 PM</p>
                    <p className="text-muted-foreground">Sat: 8:00 AM - 1:00 PM</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="shadow-xl border-primary/10 overflow-hidden">
              <div className="bg-primary/5 p-6 border-b border-border">
                <h3 className="text-2xl font-serif font-bold text-primary">Send us a Message</h3>
              </div>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold">Your Name</label>
                    <Input id="name" required placeholder="John Doe" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold">Email Address</label>
                    <Input id="email" type="email" required placeholder="john@example.com" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-semibold">Subject</label>
                    <Input id="subject" required placeholder="Admission Inquiry" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-semibold">Message</label>
                    <Textarea id="message" required placeholder="How can we help you?" className="min-h-[150px] bg-muted/50" />
                  </div>
                  <Button type="submit" variant="default" className="w-full font-bold text-lg h-12">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Map Placeholder */}
      <div className="w-full h-[400px] bg-muted relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-primary/5">
          <MapPin className="h-12 w-12 mb-4 text-primary/40" />
          <p className="font-semibold text-lg">Interactive Map Integration Placeholder</p>
          <p className="text-sm">Mathurapur, Assam</p>
        </div>
      </div>
    </MainLayout>
  );
}

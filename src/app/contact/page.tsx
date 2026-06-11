"use client";

import { useState } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("https://formsubmit.co/ajax/ssnmathurapur@gmail.com", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to submit");
      toast({
        title: "Message Sent",
        description: "Thank you for contacting us. We will get back to you soon.",
      });
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                      Sankardev Sishu Vidya Niketan Mathurapur<br />
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
                    <p className="text-muted-foreground">+91 9365526549</p>
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
                    <p className="text-muted-foreground">ssnmathurapur@gmail.com</p>
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
                    <Input id="name" name="name" required placeholder="John Doe" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold">Email Address</label>
                    <Input id="email" name="email" type="email" required placeholder="john@example.com" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-semibold">Subject</label>
                    <Input id="subject" name="_subject" required placeholder="Admission Inquiry" className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-semibold">Message</label>
                    <Textarea id="message" name="message" required placeholder="How can we help you?" className="min-h-[150px] bg-muted/50" />
                  </div>
                  <input type="hidden" name="_captcha" value="false" />
                  <Button type="submit" variant="default" disabled={isSubmitting} className="w-full font-bold text-lg h-12 shadow-[0_8px_30px_rgb(232,117,10,0.3)] hover:shadow-[0_8px_30px_rgb(232,117,10,0.5)] transition-all active:scale-95">
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      

    </MainLayout>
  );
}


import { MainLayout } from "@/components/layout/main-layout";
import { useGetDashboardStats, useListNews } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, GraduationCap, ArrowRight, Bell, BookOpen, Building2 } from "lucide-react";
import { useState, useEffect } from "react";

const HERO_IMAGES = [
  "/images/hero-1.png",
  "/images/hero-2.png",
  "/images/hero-3.png",
  "/images/hero-4.png",
];

export default function Home() {
  const { data: stats } = useGetDashboardStats();
  const { data: news } = useListNews({ limit: 5 });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const importantNews = news?.filter((n) => n.isImportant) || [];

  return (
    <MainLayout>
      {/* Marquee Ticker */}
      {importantNews.length > 0 && (
        <div className="bg-accent text-accent-foreground overflow-hidden py-2 px-4 flex items-center border-b border-accent-foreground/10">
          <Bell className="w-4 h-4 mr-3 flex-shrink-0 animate-pulse" />
          <span className="font-bold mr-4 shrink-0 uppercase text-sm tracking-wider">Latest News:</span>
          <div className="relative flex overflow-x-hidden w-full whitespace-nowrap">
            <motion.div
              className="flex whitespace-nowrap gap-10"
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
            >
              {[...importantNews, ...importantNews, ...importantNews].map((item, i) => (
                <span key={`${item.id}-${i}`} className="text-sm font-medium">
                  {item.title}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[500px] max-h-[800px] w-full overflow-hidden bg-primary/90">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentImageIndex}
            src={HERO_IMAGES[currentImageIndex]}
            alt="School Hero"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </AnimatePresence>
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <span className="text-accent font-bold tracking-widest uppercase mb-4 block drop-shadow-md">
              Welcome to our Heritage
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif text-white mb-6 drop-shadow-lg">
              শংকৰদেৱ শিশু/বিদ্যা নিকেতন<br/>
              <span className="text-3xl md:text-5xl lg:text-6xl mt-4 block">Mathurapur</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium drop-shadow-md">
              Fostering excellence in education while preserving the rich cultural legacy of Assam.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="default" className="font-bold text-lg px-8 py-6 rounded-full shadow-xl hover:scale-105 transition-transform">
                <Link href="/admission">Admissions Open</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold text-lg px-8 py-6 rounded-full bg-white/10 text-white border-white/30 backdrop-blur-sm hover:bg-white/20">
                <Link href="/about">Discover Our History</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white relative -mt-10 mx-4 md:mx-12 lg:mx-24 rounded-2xl shadow-xl z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-center p-6"
            >
              <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-bold text-primary mb-2">
                {stats?.totalStudents || "500+"}
              </h3>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Active Students</p>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center p-6 border-t md:border-t-0 md:border-l md:border-r border-border"
            >
              <div className="mx-auto w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-bold text-accent mb-2">
                {stats?.totalStaff || "40+"}
              </h3>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Dedicated Faculty</p>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center p-6 border-t md:border-t-0 border-border"
            >
              <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-bold text-primary mb-2">
                25+
              </h3>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Years of Excellence</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* News & Announcements */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">Notice Board</h2>
              <div className="h-1 w-20 bg-accent rounded-full"></div>
            </div>
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80 font-semibold group">
              <Link href="/news" className="flex items-center">
                View All <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid gap-6">
              {news?.slice(0, 3).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow border-l-4 border-l-accent overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {new Date(item.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            {item.isImportant && (
                              <span className="bg-destructive/10 text-destructive text-xs px-2 py-1 rounded-full font-bold uppercase">Important</span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground line-clamp-2">
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-6">
              <Card className="bg-primary text-primary-foreground shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <BookOpen className="w-32 h-32" />
                </div>
                <CardContent className="p-8 relative z-10">
                  <h3 className="text-2xl font-serif font-bold mb-4 text-accent">Admissions Open</h3>
                  <p className="mb-8 text-primary-foreground/90 font-medium leading-relaxed">
                    Join our prestigious institution. We are now accepting applications for the upcoming academic session from Pre-primary to Class X.
                  </p>
                  <Button asChild variant="default" className="w-full font-bold shadow-md hover:scale-105 transition-transform">
                    <Link href="/admission">Apply Online Now</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-primary/20 shadow-md">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-4 text-primary">Quick Links</h3>
                  <ul className="space-y-3 font-medium">
                    <li>
                      <Link href="/academics" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                        <ArrowRight className="w-4 h-4 mr-2" /> Academic Calendar
                      </Link>
                    </li>
                    <li>
                      <Link href="/gallery" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                        <ArrowRight className="w-4 h-4 mr-2" /> Photo Gallery
                      </Link>
                    </li>
                    <li>
                      <Link href="/login/student" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                        <ArrowRight className="w-4 h-4 mr-2" /> Student Portal
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="flex items-center text-muted-foreground hover:text-accent transition-colors">
                        <ArrowRight className="w-4 h-4 mr-2" /> Contact Administration
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

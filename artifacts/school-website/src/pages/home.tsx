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

type NewsItem = {
  id: number;
  title: string;
  content: string;
  titleAssamese?: string | null;
  contentAssamese?: string | null;
  isImportant: boolean;
  category?: string | null;
  publishedAt: string;
};

export default function Home() {
  const { data: stats } = useGetDashboardStats();
  const { data: rawNews } = useListNews({ limit: 5 });
  const news = rawNews as NewsItem[] | undefined;
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
        <div className="bg-primary text-white overflow-hidden py-2 px-4 flex items-center">
          <Bell className="w-4 h-4 mr-3 flex-shrink-0 animate-pulse" />
          <span className="font-bold mr-4 shrink-0 uppercase text-xs tracking-widest">Latest:</span>
          <div className="relative flex overflow-x-hidden w-full whitespace-nowrap">
            <motion.div
              className="flex whitespace-nowrap gap-10"
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
            >
              {[...importantNews, ...importantNews, ...importantNews].map((item, i) => (
                <span key={`${item.id}-${i}`} className="text-sm font-medium">
                  {item.title}
                  {item.titleAssamese && ` • ${item.titleAssamese}`}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[500px] max-h-[800px] w-full overflow-hidden" style={{ background: "hsl(28, 95%, 50%)" }}>
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentImageIndex}
            src={HERO_IMAGES[currentImageIndex]}
            alt="School Hero"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.55, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif text-white mb-4 drop-shadow-lg">
              শংকৰদেৱ শিশু নিকেতন মথুৰাপুৰ
            </h1>
            <h2 className="text-2xl md:text-3xl text-white/90 mb-3 font-serif">Sankardev Sishu Vidya Niketan Mathurapure</h2>
            <span className="text-xl md:text-2xl text-white/80 block mb-8">Mathurapur</span>
            <p className="text-base md:text-lg text-white/90 mb-10 max-w-2xl mx-auto font-medium drop-shadow-md">
              
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="font-bold text-lg px-8 py-6 rounded-full shadow-xl hover:scale-105 transition-transform bg-white text-primary hover:bg-white/90">
                <Link href="/admission">Admissions Open</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white relative -mt-10 mx-4 md:mx-12 lg:mx-24 rounded-2xl shadow-xl z-20 border border-border">
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
              <h3 className="text-4xl font-bold text-primary mb-2">{stats?.totalStudents || "500+"}</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Active Students</p>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center p-6 border-t md:border-t-0 md:border-l md:border-r border-border"
            >
              <div className="mx-auto w-16 h-16 bg-secondary/20 text-secondary-foreground rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-bold text-secondary-foreground mb-2">{stats?.totalStaff || "15+"}</h3>
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
              <h3 className="text-4xl font-bold text-primary mb-2">25+</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Years of Excellence</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Notice Board — Bilingual */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">Notice Board</h2>
              <p className="text-sm text-muted-foreground mb-3">জাননী বোর্ড — Notices in English & Assamese</p>
              <div className="h-1 w-20 bg-primary rounded-full"></div>
            </div>
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80 font-semibold group">
              <Link href="/news" className="flex items-center">
                View All <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid gap-5">
              {news?.slice(0, 3).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary overflow-hidden bg-white">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            {item.isImportant && (
                              <span className="bg-destructive/10 text-destructive text-xs px-2 py-0.5 rounded-full font-bold uppercase shrink-0">Important</span>
                            )}
                            {item.category && (
                              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full shrink-0">{item.category}</span>
                            )}
                          </div>
                          {/* English */}
                          <h3 className="text-base font-bold mb-1 text-foreground">{item.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{item.content}</p>
                          {/* Assamese */}
                          {item.titleAssamese && (
                            <div className="border-t pt-2 mt-2">
                              <h3 className="text-base font-bold mb-1 text-primary">{item.titleAssamese}</h3>
                              {item.contentAssamese && (
                                <p className="text-muted-foreground text-sm line-clamp-2">{item.contentAssamese}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {!news?.length && (
                <Card className="bg-white border-dashed">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No notices yet. Check back soon.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="grid gap-5">
              <Card className="shadow-lg overflow-hidden relative border-0" style={{ background: "hsl(28, 95%, 50%)" }}>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <BookOpen className="w-32 h-32 text-white" />
                </div>
                <CardContent className="p-8 relative z-10">
                  <h3 className="text-2xl font-serif font-bold mb-3 text-white">Admissions Open</h3>
                  <p className="mb-6 text-white/90 font-medium leading-relaxed text-sm">
                    Join our prestigious institution. Accepting applications for the upcoming academic session — Ankur to Class X.
                  </p>
                  <Button asChild className="w-full font-bold shadow-md hover:scale-105 transition-transform bg-white text-primary hover:bg-white/90">
                    <Link href="/admission">Apply Online Now</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-base font-bold mb-4 text-foreground">Quick Links</h3>
                  <ul className="space-y-2.5 font-medium">
                    {[
                      ["Academic Calendar", "/academics"],
                      ["Photo Gallery", "/gallery"],
                      ["Results", "/results"],
                      ["Student Portal", "/login/student"],
                      ["Contact Administration", "/contact"],
                    ].map(([label, href]) => (
                      <li key={href}>
                        <Link href={href} className="flex items-center text-muted-foreground hover:text-primary transition-colors text-sm">
                          <ArrowRight className="w-3.5 h-3.5 mr-2 shrink-0" /> {label}
                        </Link>
                      </li>
                    ))}
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

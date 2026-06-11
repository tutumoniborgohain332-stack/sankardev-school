import { MainLayout } from "@/components/layout/main-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, GraduationCap, ArrowRight, Bell, BookOpen, Building2 } from "lucide-react";
import { db } from "@/lib/db";
import { studentsTable, staffTable, newsTable } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";
import { isAdmissionOpen } from "@/lib/settings";
import { HeroCarousel } from "@/components/hero-carousel";
import { NoticeMarquee } from "@/components/notice-marquee";
import { FadeIn } from "@/components/fade-in";

export const revalidate = 60;

export default async function Home() {
  // Fetch stats directly on server
  const [[studentStats], [staffStats]] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(studentsTable),
    db.select({ count: sql<number>`count(*)` }).from(staffTable)
  ]);
  const stats = { totalStudents: studentStats?.count || 0, totalStaff: staffStats?.count || 0 };

  // Fetch news directly on server
  const news = await db.select().from(newsTable).orderBy(desc(newsTable.publishedAt)).limit(5);
  const importantNews = news.filter((n) => n.isImportant);

  const admissionOpen = await isAdmissionOpen();

  return (
    <MainLayout>
      <NoticeMarquee importantNews={importantNews} />
      <HeroCarousel admissionOpen={admissionOpen} />

      {/* Stats Section */}
      <FadeIn className="py-16 bg-gradient-to-br from-white to-orange-50/30 relative -mt-10 mx-4 md:mx-12 lg:mx-24 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20 border border-border backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 group hover:-translate-y-1 transition-transform">
              <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-bold text-primary mb-2">{stats.totalStudents}+</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Active Students</p>
            </div>

            <div className="text-center p-6 border-t md:border-t-0 md:border-l md:border-r border-border group hover:-translate-y-1 transition-transform">
              <div className="mx-auto w-16 h-16 bg-secondary/20 text-secondary-foreground rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-bold text-secondary-foreground mb-2">{stats.totalStaff}+</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Dedicated Faculty</p>
            </div>

            <div className="text-center p-6 border-t md:border-t-0 border-border group hover:-translate-y-1 transition-transform">
              <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-bold text-primary mb-2">25+</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Years of Excellence</p>
            </div>
          </div>
        </div>
      </FadeIn>

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
              {/* @ts-ignore */}
              <Link href="/news" className="flex items-center">
                View All <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid gap-5">
              {news?.slice(0, 3).map((item, i) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary overflow-hidden bg-white">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground">
                            {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ""}
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
              {admissionOpen && (
                <Card className="shadow-lg overflow-hidden relative border-0" style={{ background: "hsl(28, 95%, 50%)" }}>
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BookOpen className="w-32 h-32 text-white" />
                  </div>
                  <CardContent className="p-8 relative z-10">
                    <h3 className="text-2xl font-serif font-bold mb-3 text-white">Admissions Open</h3>
                    <p className="mb-6 text-white/90 font-medium leading-relaxed text-sm">
                      Join our prestigious institution. Accepting applications for the upcoming academic session — Ankur to Class X.
                    </p>
                    {/* @ts-ignore */}
                    <Button asChild className="w-full font-bold shadow-md hover:scale-105 transition-transform bg-white text-primary hover:bg-white/90">
                      {/* @ts-ignore */}
                      <Link href="/admission">Apply Online Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

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
                        {/* @ts-ignore */}
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

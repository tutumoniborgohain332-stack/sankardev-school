import { MainLayout } from "@/components/layout/main-layout";
import { useListNews } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Bell } from "lucide-react";
import { format } from "date-fns";

export default function News() {
  const { data: newsItems, isLoading } = useListNews({});

  return (
    <MainLayout>
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent"
          >
            News & Announcements
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg max-w-2xl mx-auto opacity-90"
          >
            Stay updated with the latest events, notices, and happenings at the school.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 min-h-[50vh]">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : newsItems && newsItems.length > 0 ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {newsItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-l-4 ${item.isImportant ? 'border-l-destructive' : 'border-l-accent'} shadow-md hover:shadow-lg transition-shadow`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {format(new Date(item.publishedAt), 'MMMM d, yyyy')}
                      </span>
                      {item.isImportant && (
                        <span className="bg-destructive/10 text-destructive text-xs px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                          <Bell className="h-3 w-3" /> Important
                        </span>
                      )}
                      {item.category && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold uppercase">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-2xl font-serif text-primary">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Bell className="h-16 w-16 text-muted mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-muted-foreground">No announcements yet</h3>
            <p className="text-muted-foreground mt-2">Check back later for updates.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

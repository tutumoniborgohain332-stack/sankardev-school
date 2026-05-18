import { MainLayout } from "@/components/layout/main-layout";
import { useListStaff } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, BookOpen, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Staff() {
  const { data: staff, isLoading } = useListStaff();

  return (
    <MainLayout>
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent"
          >
            Our Dedicated Faculty
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg max-w-2xl mx-auto opacity-90"
          >
            Meet the experienced and passionate educators who guide our students towards excellence.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 min-h-[50vh]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[300px] bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : staff && staff.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {staff.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 4) * 0.1 }}
              >
                <Card className="h-full overflow-hidden hover:shadow-xl transition-shadow border-primary/10 flex flex-col group">
                  <div className="h-24 bg-primary/10 w-full relative">
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                        <AvatarImage src={member.photoUrl || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <CardContent className="pt-16 pb-6 px-6 text-center flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{member.name}</h3>
                    <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">
                      {member.designation}
                    </p>
                    
                    <div className="space-y-3 text-sm text-left mt-auto bg-muted/30 p-4 rounded-xl">
                      {member.subject && (
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-foreground">{member.subject}</span>
                        </div>
                      )}
                      {member.qualification && (
                        <div className="flex items-start gap-2">
                          <Award className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-foreground">{member.qualification}</span>
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                          <a href={`mailto:${member.email}`} className="text-primary hover:underline truncate">{member.email}</a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <User className="h-16 w-16 text-muted mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-muted-foreground">No staff members found</h3>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

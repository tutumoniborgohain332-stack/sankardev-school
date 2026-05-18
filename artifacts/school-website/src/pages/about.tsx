import { MainLayout } from "@/components/layout/main-layout";
import { motion } from "framer-motion";

export default function About() {
  return (
    <MainLayout>
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent"
          >
            About Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg max-w-2xl mx-auto opacity-90"
          >
            Discover the heritage, mission, and vision of Sankardev Shishu/Vidya Niketan, Mathurapur.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-serif font-bold text-primary mb-6">Our History</h2>
            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
              Established with the blessings of Shishu Shiksha Samiti, Assam, our school has been a beacon of knowledge in Mathurapur for over two decades. We were founded on the principles of integrating modern education with the rich cultural and spiritual heritage of Assam, particularly the teachings of Srimanta Sankardev.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Over the years, we have grown from a small learning center to a premier institution, nurturing thousands of students who have gone on to excel in various fields while remaining rooted in their cultural values.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-80 rounded-2xl overflow-hidden shadow-xl"
          >
            <img src="/images/hero-1.png" alt="School History" className="absolute inset-0 w-full h-full object-cover" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-accent/10 p-8 rounded-2xl border border-accent/20"
          >
            <h3 className="text-2xl font-serif font-bold text-primary mb-4">Our Vision</h3>
            <p className="text-lg text-foreground leading-relaxed">
              To create a vibrant learning environment where students achieve academic excellence, develop strong moral character, and cultivate a deep appreciation for our rich Indian culture and Assamese heritage.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-primary/5 p-8 rounded-2xl border border-primary/10"
          >
            <h3 className="text-2xl font-serif font-bold text-primary mb-4">Our Mission</h3>
            <ul className="list-disc list-inside text-lg text-foreground space-y-2 ml-4">
              <li>To provide holistic education that balances modern scientific temper with traditional values.</li>
              <li>To foster physical, mental, and spiritual growth in every child.</li>
              <li>To instill a sense of patriotism and social responsibility.</li>
              <li>To empower students to face global challenges confidently.</li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card shadow-lg rounded-2xl p-8 border border-border"
        >
          <h2 className="text-3xl font-serif font-bold text-primary mb-6 text-center">Principal's Message</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3 aspect-square rounded-xl overflow-hidden bg-muted flex-shrink-0 relative">
               <img src="/images/hero-2.png" alt="Principal" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-2/3">
              <h4 className="text-xl font-bold text-accent mb-2">Sri Bhabendra Nath</h4>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">Headmaster</p>
              <div className="text-lg text-muted-foreground space-y-4 italic leading-relaxed">
                <p>"Education is not merely the accumulation of facts, but the preparation of life itself. At Sankardev Shishu/Vidya Niketan, Mathurapur, we strive to ignite the spark of curiosity in every child."</p>
                <p>"We are committed to providing an environment where our students not only excel academically but also imbibe the timeless values taught by Mahapurush Srimanta Sankardev. We believe in nurturing well-rounded individuals who will contribute positively to society and the nation."</p>
                <p>"I invite you to be a part of our journey towards excellence."</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}

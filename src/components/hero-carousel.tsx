"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HERO_IMAGES = [
  "/images/hero-1.png",
  "/images/hero-2.png",
  "/images/hero-3.png",
  "/images/hero-4.png",
];

export function HeroCarousel({ admissionOpen }: { admissionOpen: boolean }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[80vh] min-h-[500px] max-h-[800px] w-full overflow-hidden bg-black">
      <AnimatePresence mode="popLayout">
        <motion.img
          key={currentImageIndex}
          src={HERO_IMAGES[currentImageIndex]}
          alt={`School Campus ${currentImageIndex + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </AnimatePresence>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-4xl mx-auto p-4 md:p-8"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif text-white mb-4 drop-shadow-lg">
            শংকৰদেৱ শিশু নিকেতন মথুৰাপুৰ
          </h1>
          <h2 className="text-2xl md:text-3xl text-white/95 mb-3 font-serif">Sankardev Sishu Vidya Niketan Mathurapur</h2>
          <span className="text-xl md:text-2xl text-primary font-bold block mb-8 uppercase tracking-[0.2em]">Mathurapur</span>
          <p className="text-base md:text-lg text-white/90 mb-10 max-w-2xl mx-auto font-medium drop-shadow-md"></p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {admissionOpen && (
              <Button asChild size="lg" className="font-bold text-lg px-8 py-6 rounded-full shadow-[0_8px_30px_rgb(232,117,10,0.3)] hover:shadow-[0_8px_30px_rgb(232,117,10,0.5)] hover:-translate-y-1 transition-all active:scale-95 bg-primary text-white hover:bg-primary/90">
                <Link href="/admission">Admissions Open</Link>
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

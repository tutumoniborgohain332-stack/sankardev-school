"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useListGallery } from "@/lib/api-client";
import Link from "next/link";

export function HeroCarousel({ admissionOpen }: { admissionOpen: boolean }) {
  const { data: galleryItems, isLoading } = useListGallery();
  const heroItems = galleryItems?.filter((item: any) => item.isHero) || [];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasLoadedFirstImage, setHasLoadedFirstImage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasLoadedFirstImage(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (heroItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroItems.length]);

  const hasImages = heroItems.length > 0;

  return (
    <section className="relative h-[80vh] min-h-[500px] max-h-[800px] w-full overflow-hidden bg-slate-900">
      <div className="absolute inset-0 bg-slate-800/40 animate-pulse" />
      {hasImages ? (
        <AnimatePresence>
          {heroItems[currentImageIndex]?.type === "video" ? (
            <motion.video
              key={currentImageIndex}
              src={heroItems[currentImageIndex].url}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              initial={!hasLoadedFirstImage ? { clipPath: "inset(0 0 100% 0)", scale: 1.02 } : { opacity: 0, scale: 1.05 }}
              animate={!hasLoadedFirstImage ? { clipPath: "inset(0 0 0% 0)", scale: 1, zIndex: 1 } : { opacity: 1, scale: 1, zIndex: 1 }}
              exit={{ opacity: 0.99, zIndex: 0 }}
              transition={!hasLoadedFirstImage ? { duration: 2, ease: "easeInOut" } : { duration: 1.5, ease: "easeInOut" }}
            />
          ) : (
            <motion.img
              key={currentImageIndex}
              src={heroItems[currentImageIndex]?.url}
              alt={`School Campus ${currentImageIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              initial={!hasLoadedFirstImage ? { clipPath: "inset(0 0 100% 0)", scale: 1.02 } : { opacity: 0, scale: 1.05 }}
              animate={!hasLoadedFirstImage ? { clipPath: "inset(0 0 0% 0)", scale: 1, zIndex: 1 } : { opacity: 1, scale: 1, zIndex: 1 }}
              exit={{ opacity: 0.99, zIndex: 0 }}
              transition={!hasLoadedFirstImage ? { duration: 2, ease: "easeInOut" } : { duration: 1.5, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-950 via-zinc-950 to-black pattern-grid-lg opacity-90" />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-4xl mx-auto p-4 md:p-8"
        >
          <h1 className="sr-only">Sankardev Sishu Vidya Niketan, Mathurapur</h1>
          <div className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif text-white mb-4 drop-shadow-lg" aria-hidden="true">
            শংকৰদেৱ শিশু নিকেতন মথুৰাপুৰ
          </div>
          <h2 className="text-2xl md:text-3xl text-white/95 mb-3 font-serif">Sankardev Sishu Vidya Niketan Mathurapur</h2>
          <span className="text-xl md:text-2xl text-primary font-bold block mb-4 uppercase tracking-[0.2em]">Mathurapur</span>
          
          {/* SEO Text Hidden */}
          <p className="sr-only">
            Welcome to Mathurapure Sankardev, also known as Sankardev Mathurapure or Niketan Mathurapure. 
            We are the premier Sankardev Sishu Vidya Niketan serving the Mathurapur region.
          </p>
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

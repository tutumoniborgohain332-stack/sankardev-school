"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useListGallery } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = ["All", "Events", "Sports", "Cultural", "Classroom"];

export default function Gallery() {
  const { data: galleryItems, isLoading } = useListGallery();
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photos = galleryItems?.filter((item) => item.type === "photo") || [];
  const videos = galleryItems?.filter((item) => item.type === "video") || [];

  const filteredPhotos =
    activeCategory === "All"
      ? photos
      : photos.filter((item) => item.category === activeCategory);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : filteredPhotos.length - 1);
    }
  };

  const nextPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex < filteredPhotos.length - 1 ? lightboxIndex + 1 : 0);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredPhotos.length]);

  return (
    <MainLayout>
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent"
          >
            Photo & Video Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg max-w-2xl mx-auto opacity-90"
          >
            Glimpses of life at Sankardev Sishu Vidya Niketan Mathurapure
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 min-h-[50vh]">
        <Tabs defaultValue="All" onValueChange={setActiveCategory} className="mb-12">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-muted/50 p-1 flex-wrap h-auto rounded-xl">
              {CATEGORIES.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeCategory} className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="aspect-square bg-muted animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : filteredPhotos.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                  }
                }}
              >
                {filteredPhotos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    variants={{
                      hidden: { opacity: 0, scale: 0.9 },
                      visible: { opacity: 1, scale: 1 }
                    }}
                    className="relative group cursor-pointer aspect-square overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <h3 className="text-white font-bold truncate">{photo.title}</h3>
                      {photo.category && (
                        <span className="text-accent text-xs font-medium uppercase tracking-wider">
                          {photo.category}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-2xl">
                <p className="text-muted-foreground font-medium text-lg">No photos found in this category.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {videos.length > 0 && (
          <div className="mt-20 pt-16 border-t border-border">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-serif font-bold text-primary mb-4">Video Gallery</h2>
              <div className="h-1 w-20 bg-accent rounded-full mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow border-primary/10">
                  <div className="aspect-video relative bg-black flex items-center justify-center group cursor-pointer">
                    {video.thumbnailUrl ? (
                      <>
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 ml-1" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <iframe
                        src={video.url}
                        title={video.title}
                        className="w-full h-full border-0 pointer-events-none"
                        allowFullScreen
                      />
                    )}
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg mb-1 truncate">{video.title}</h3>
                    {video.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-8"
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={prevPhoto}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 md:p-4 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
            >
              <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
            </button>

            <button
              onClick={nextPhoto}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 md:p-4 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
            >
              <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
            </button>

            <div className="max-w-5xl w-full max-h-[85vh] flex flex-col">
              <img
                src={filteredPhotos[lightboxIndex].url}
                alt={filteredPhotos[lightboxIndex].title}
                className="w-full h-full object-contain"
              />
              <div className="mt-4 text-center">
                <h3 className="text-white text-xl font-bold">{filteredPhotos[lightboxIndex].title}</h3>
                {filteredPhotos[lightboxIndex].description && (
                  <p className="text-white/70 mt-2">{filteredPhotos[lightboxIndex].description}</p>
                )}
                <div className="mt-4 text-white/50 text-sm">
                  {lightboxIndex + 1} / {filteredPhotos.length}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}



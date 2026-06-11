"use client";

import { useState } from "react";
import { uploadImageWithCompression, deleteImageFromSupabase } from "@/lib/supabase";
import {
  useListGallery,
  getListGalleryQueryKey,
  useCreateGalleryItem,
  useDeleteGalleryItem,
  useUpdateGalleryItem,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Plus, Trash2, Image as ImageIcon, Video } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
const gallerySchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["photo", "video"]),
  url: z.string().min(1, "Please upload a file"),
  thumbnailUrl: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

type GalleryForm = z.infer<typeof gallerySchema>;

export default function GalleryAdmin() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { data: items, isLoading } = useListGallery();
  const createItem = useCreateGalleryItem();
  const deleteItem = useDeleteGalleryItem();
  const updateItem = useUpdateGalleryItem();

  const toggleHero = (item: any) => {
    updateItem.mutate({ id: item.id, data: { isHero: !item.isHero } });
  };

  const categories = ["All", "Events", "Sports", "Academic", "Infrastructure", "Others"];
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems = activeCategory === "All" 
    ? items 
    : items?.filter(item => {
        if (!item.category) return activeCategory === "Others";
        return item.category.toLowerCase() === activeCategory.toLowerCase();
      });

  const form = useForm<GalleryForm>({
    // @ts-ignore
    resolver: zodResolver(gallerySchema),
    defaultValues: { title: "", type: "photo", url: "", thumbnailUrl: "", category: "", description: "" },
  });

  const onSubmit = (data: GalleryForm) => {
    createItem.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() });
          form.reset();
          setIsOpen(false);
        },
      }
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const url = await uploadImageWithCompression(file, "assets");
      if (url) {
        form.setValue("url", url);
        form.setValue("type", file.type.startsWith("video/") ? "video" : "photo");
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveStagingImage = async () => {
    const url = form.getValues("url");
    if (url && url.includes("supabase.co")) {
      await deleteImageFromSupabase(url, "assets");
    }
    form.setValue("url", "");
  };

  const handleOpenChange = async (open: boolean) => {
    if (!open) {
      // If closing dialog, check if there's an orphaned upload that hasn't been saved
      const url = form.getValues("url");
      if (url && url.includes("supabase.co")) {
        await deleteImageFromSupabase(url, "assets");
      }
      form.reset();
    }
    setIsOpen(open);
  };

  const handleDelete = async (item: any) => {
    setDeletingId(item.id);
    try {
      // Delete from Supabase bucket first if it's a supabase URL
      if (item.url.includes("supabase.co")) {
        await deleteImageFromSupabase(item.url, "assets");
      }
      
      // Delete from database
      deleteItem.mutate(item.id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() });
          setDeletingId(null);
        },
        onError: () => setDeletingId(null),
      });
    } catch (err) {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gallery Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{items?.length ?? 0} items</p>
        </div>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="button-add-gallery">
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Gallery Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label>Title *</Label>
                <Input {...form.register("title")} placeholder="Annual Sports Day 2025" data-testid="input-gallery-title" />
                {form.formState.errors.title && <p className="text-destructive text-xs">{form.formState.errors.title.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Type *</Label>
                <Controller
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-testid="select-gallery-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photo">Photo</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label>Upload File (Image/Video) *</Label>
                <Input type="file" accept="image/*,video/*" onChange={handleFileChange} disabled={isUploading || !!form.watch("url")} />
                {isUploading && <p className="text-xs text-primary font-medium animate-pulse">Compressing and uploading to Supabase...</p>}
                {form.watch("url") && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-green-600 font-medium">✓ File uploaded</p>
                    <Button type="button" variant="ghost" size="sm" onClick={handleRemoveStagingImage} className="h-5 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                      Remove
                    </Button>
                  </div>
                )}
                {form.formState.errors.url && <p className="text-destructive text-xs">{form.formState.errors.url.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Controller
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c !== "All").map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea {...form.register("description")} placeholder="Brief description..." rows={3} />
              </div>
              <Button type="submit" className="w-full" disabled={createItem.isPending || isUploading} data-testid="button-submit-gallery">
                {createItem.isPending ? "Saving..." : "Add Item"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar">
            {categories.map(cat => (
              <Button 
                key={cat} 
                variant={activeCategory === cat ? "default" : "outline"}
                onClick={() => setActiveCategory(cat)}
                className="rounded-full h-8 text-xs px-4 flex-shrink-0"
              >
                {cat}
              </Button>
            ))}
          </div>
          
          {filteredItems?.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-muted">
              <p className="text-muted-foreground">No gallery items found in this category.</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredItems?.map((item) => (
            <motion.div
              key={item.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative group rounded-xl overflow-hidden border border-border bg-card"
              data-testid={`card-gallery-${item.id}`}
            >
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {item.type === "photo" ? (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Video className="w-10 h-10" />
                    <span className="text-xs">Video</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate">{item.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    {item.type === "photo" ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                    {item.category ?? item.type}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {item.type === "photo" && (
                      <div className="flex items-center" title="Show on Homepage Slider">
                        <Label className="text-[10px] uppercase mr-1.5 text-muted-foreground font-bold tracking-wider">Hero</Label>
                        <Switch 
                          checked={item.isHero} 
                          onCheckedChange={() => toggleHero(item)}
                          disabled={updateItem.isPending}
                          className="scale-75 origin-right"
                        />
                      </div>
                    )}
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" data-testid={`button-delete-gallery-${item.id}`}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Item</AlertDialogTitle>
                        <AlertDialogDescription>Remove "{item.title}" from the gallery?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          disabled={deletingId === item.id}
                          onClick={(e) => { e.preventDefault(); handleDelete(item); }} 
                          className="bg-destructive text-destructive-foreground"
                        >
                          {deletingId === item.id ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
          )}
        </>
      )}
    </div>
  );
}


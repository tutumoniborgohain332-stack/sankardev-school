import { useState } from "react";
import {
  useListGallery,
  getListGalleryQueryKey,
  useCreateGalleryItem,
  useDeleteGalleryItem,
} from "@workspace/api-client-react";
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
import { motion } from "framer-motion";
import { Plus, Trash2, Image as ImageIcon, Video } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const gallerySchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["photo", "video"]),
  url: z.string().url("Must be a valid URL"),
  thumbnailUrl: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

type GalleryForm = z.infer<typeof gallerySchema>;

export default function GalleryAdmin() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: items, isLoading } = useListGallery();
  const createItem = useCreateGalleryItem();
  const deleteItem = useDeleteGalleryItem();

  const form = useForm<GalleryForm>({
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

  const handleDelete = (id: number) => {
    deleteItem.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListGalleryQueryKey() }),
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gallery Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{items?.length ?? 0} items</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                <Label>URL *</Label>
                <Input {...form.register("url")} placeholder="https://..." data-testid="input-gallery-url" />
                {form.formState.errors.url && <p className="text-destructive text-xs">{form.formState.errors.url.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Thumbnail URL</Label>
                <Input {...form.register("thumbnailUrl")} placeholder="https://..." />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Input {...form.register("category")} placeholder="Sports / Cultural / Events..." />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea {...form.register("description")} placeholder="Brief description..." rows={3} />
              </div>
              <Button type="submit" className="w-full" disabled={createItem.isPending} data-testid="button-submit-gallery">
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
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {items?.map((item) => (
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
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    {item.type === "photo" ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                    {item.category ?? item.type}
                  </Badge>
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
                        <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

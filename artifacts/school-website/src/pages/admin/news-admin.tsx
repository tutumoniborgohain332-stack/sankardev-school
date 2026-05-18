import { useState } from "react";
import {
  useListNews,
  getListNewsQueryKey,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, Bell } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const newsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().optional(),
  isImportant: z.boolean().optional(),
});

type NewsForm = z.infer<typeof newsSchema>;

export default function NewsAdmin() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { data: news, isLoading } = useListNews();
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();
  const deleteNews = useDeleteNews();

  const createForm = useForm<NewsForm>({
    resolver: zodResolver(newsSchema),
    defaultValues: { title: "", content: "", category: "", isImportant: false },
  });

  const editForm = useForm<NewsForm>({
    resolver: zodResolver(newsSchema),
    defaultValues: { title: "", content: "", category: "", isImportant: false },
  });

  const handleCreate = (data: NewsForm) => {
    createNews.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListNewsQueryKey() });
          createForm.reset();
          setIsCreateOpen(false);
        },
      }
    );
  };

  const handleEdit = (item: NonNullable<typeof news>[0]) => {
    editForm.reset({ title: item.title, content: item.content, category: item.category ?? "", isImportant: item.isImportant });
    setEditingId(item.id);
  };

  const handleUpdate = (data: NewsForm) => {
    if (!editingId) return;
    updateNews.mutate(
      { id: editingId, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListNewsQueryKey() });
          setEditingId(null);
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteNews.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNewsQueryKey() }),
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">News & Announcements</h1>
          <p className="text-muted-foreground text-sm mt-1">{news?.length ?? 0} items</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="button-create-news">
              <Plus className="w-4 h-4" /> Create News
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create News / Announcement</DialogTitle>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <div className="space-y-1">
                <Label>Title *</Label>
                <Input {...createForm.register("title")} placeholder="Annual Sports Day 2025" data-testid="input-news-title" />
                {createForm.formState.errors.title && <p className="text-destructive text-xs">{createForm.formState.errors.title.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Content *</Label>
                <Textarea {...createForm.register("content")} placeholder="Full announcement text..." rows={5} data-testid="textarea-news-content" />
                {createForm.formState.errors.content && <p className="text-destructive text-xs">{createForm.formState.errors.content.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Input {...createForm.register("category")} placeholder="Sports / Academic / Cultural..." />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isImportant-create"
                  checked={createForm.watch("isImportant")}
                  onCheckedChange={(v) => createForm.setValue("isImportant", !!v)}
                  data-testid="checkbox-important"
                />
                <Label htmlFor="isImportant-create">Mark as Important</Label>
              </div>
              <Button type="submit" className="w-full" disabled={createNews.isPending} data-testid="button-submit-news">
                {createNews.isPending ? "Creating..." : "Create News"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editingId !== null} onOpenChange={(open) => { if (!open) setEditingId(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit News Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input {...editForm.register("title")} />
            </div>
            <div className="space-y-1">
              <Label>Content *</Label>
              <Textarea {...editForm.register("content")} rows={5} />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Input {...editForm.register("category")} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isImportant-edit"
                checked={editForm.watch("isImportant")}
                onCheckedChange={(v) => editForm.setValue("isImportant", !!v)}
              />
              <Label htmlFor="isImportant-edit">Mark as Important</Label>
            </div>
            <Button type="submit" className="w-full" disabled={updateNews.isPending}>
              {updateNews.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news?.map((item) => (
                <TableRow key={item.id} data-testid={`row-news-${item.id}`}>
                  <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                  <TableCell>
                    {item.category ? <Badge variant="outline" className="text-xs">{item.category}</Badge> : <span className="text-muted-foreground text-sm">—</span>}
                  </TableCell>
                  <TableCell>
                    {item.isImportant && (
                      <Badge className="text-xs flex items-center gap-1 w-fit bg-amber-100 text-amber-800 border-amber-200">
                        <Bell className="w-3 h-3" /> Important
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(item.publishedAt).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)} data-testid={`button-edit-news-${item.id}`}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" data-testid={`button-delete-news-${item.id}`}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete News</AlertDialogTitle>
                            <AlertDialogDescription>Delete "{item.title}"?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
}

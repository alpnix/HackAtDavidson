import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RichTextEditor } from "@/components/RichTextEditor";
import { supabase } from "@/integrations/supabase/client";
import { getCoverUrl } from "@/lib/blog-utils";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { BlogWithCreator } from "@/types/blog";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z
    .string()
    .refine((s) => s.replace(/<[^>]*>/g, "").trim().length > 0, "Content is required"),
});

type FormValues = z.infer<typeof schema>;

interface UpdateBlogDialogProps {
  blog: BlogWithCreator;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UpdateBlogDialog({
  blog,
  open,
  onOpenChange,
  onSuccess,
}: UpdateBlogDialogProps) {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverRemoved, setCoverRemoved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", content: "" },
  });

  useEffect(() => {
    if (open && blog) {
      form.reset({ title: blog.title, content: blog.content });
      setCoverFile(null);
      setCoverRemoved(false);
      setCoverPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, [open, blog, form]);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop() || "png";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("blogs").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("blogs").getPublicUrl(path);
    return data.publicUrl;
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    setCoverFile(file);
    setCoverRemoved(false);
    const url = URL.createObjectURL(file);
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const resetCover = () => {
    setCoverFile(null);
    setCoverRemoved(true);
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      let coverUrl: string | null = blog.cover_url;
      if (coverRemoved) {
        coverUrl = null;
      } else if (coverFile) {
        const ext = coverFile.name.split(".").pop() || "png";
        const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("blogs").upload(path, coverFile, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) throw new Error(error.message);
        coverUrl = path;
      }
      const { error } = await supabase
        .from("blogs")
        .update({
          title: values.title,
          content: values.content,
          ...(coverUrl !== blog.cover_url && { cover_url: coverUrl }),
        })
        .eq("id", blog.id);
      if (error) throw error;
      toast.success("Blog updated");
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update blog");
    } finally {
      setSubmitting(false);
    }
  };

  const currentCoverUrl = !coverRemoved && !coverFile && blog.cover_url
    ? getCoverUrl(blog.cover_url)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-primary">Update blog</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="update-blog-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Blog title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Cover image</FormLabel>
              {coverPreview ? (
                <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-border">
                  <img src={coverPreview} alt="" className="h-full w-full object-cover" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={resetCover}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : currentCoverUrl ? (
                <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-border">
                  <img src={currentCoverUrl} alt="" className="h-full w-full object-cover" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={resetCover}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input p-8">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drop or click to upload</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={handleCoverChange}
                  />
                </div>
              )}
              {!coverPreview && currentCoverUrl && (
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="update-cover-input"
                    className="sr-only"
                    onChange={handleCoverChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("update-cover-input")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Replace cover
                  </Button>
                </div>
              )}
            </FormItem>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      key={blog.id}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write your blog post…"
                      onImageUpload={uploadImage}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="update-blog-form"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

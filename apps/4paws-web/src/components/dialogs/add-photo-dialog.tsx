import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface AddPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectType: string;
  subjectId: string;
  subjectName?: string;
}

export function AddPhotoDialog({ open, onOpenChange, subjectType, subjectId, subjectName }: AddPhotoDialogProps) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPhotoMutation = useMutation({
    mutationFn: async (data: { subjectType: string; subjectId: string; url: string; caption?: string }) => {
      const res = await apiRequest("POST", "/api/v1/photos", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/photos", subjectType, subjectId] });
      toast({
        title: "Success",
        description: "Photo added successfully",
      });
      setPhotoUrl("");
      setCaption("");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add photo",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a photo URL",
        variant: "destructive",
      });
      return;
    }
    createPhotoMutation.mutate({
      subjectType,
      subjectId,
      url: photoUrl,
      caption: caption || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-add-photo">
        <DialogHeader>
          <DialogTitle>Add Photo</DialogTitle>
          <DialogDescription>
            Add a photo {subjectName ? `for ${subjectName}` : ''}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="photo-url">Photo URL</Label>
            <Input
              id="photo-url"
              data-testid="input-photo-url"
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upload your photo to a service like Imgur or Google Photos and paste the direct link here
            </p>
          </div>
          <div>
            <Label htmlFor="photo-caption">Caption (optional)</Label>
            <Textarea
              id="photo-caption"
              data-testid="textarea-photo-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption for this photo..."
              rows={3}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPhotoMutation.isPending}
              data-testid="button-submit-photo"
            >
              {createPhotoMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Photo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

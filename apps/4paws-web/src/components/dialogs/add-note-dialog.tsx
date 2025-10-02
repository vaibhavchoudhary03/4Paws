import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectType: string;
  subjectId: string;
  subjectName?: string;
}

export function AddNoteDialog({ open, onOpenChange, subjectType, subjectId, subjectName }: AddNoteDialogProps) {
  const [noteBody, setNoteBody] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createNoteMutation = useMutation({
    mutationFn: async (data: { subjectType: string; subjectId: string; body: string; visibility: string }) => {
      const res = await apiRequest("POST", "/api/v1/notes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/notes", subjectType, subjectId] });
      toast({
        title: "Success",
        description: "Note added successfully",
      });
      setNoteBody("");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add note",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note",
        variant: "destructive",
      });
      return;
    }
    createNoteMutation.mutate({
      subjectType,
      subjectId,
      body: noteBody,
      visibility: "public_to_portal",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-add-note">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            Add a note {subjectName ? `for ${subjectName}` : ''}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="note-body">Note</Label>
            <Textarea
              id="note-body"
              data-testid="textarea-note-body"
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Enter your note here..."
              rows={5}
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
              disabled={createNoteMutation.isPending}
              data-testid="button-submit-note"
            >
              {createNoteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Note
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

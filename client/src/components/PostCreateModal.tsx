import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePost } from "@/hooks/use-posts";

interface PostCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function PostCreateModal({ isOpen, onClose, onPostCreated }: PostCreateModalProps) {
  const { profile } = useAuth();
  const [content, setContent] = useState("");
  const createPostMutation = useCreatePost();

  const handleCreatePost = () => {
    if (!profile || !content.trim()) return;
    createPostMutation.mutate(
      { userId: profile.id, content },
      {
        onSuccess: () => {
          onPostCreated();
          onClose();
          setContent("");
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 게시물 작성</DialogTitle>
        </DialogHeader>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="무슨 생각을 하고 계신가요?"
        />
        <Button onClick={handleCreatePost} disabled={createPostMutation.isPending}>
          게시
        </Button>
      </DialogContent>
    </Dialog>
  );
}
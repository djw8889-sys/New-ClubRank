import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSendFeedback } from "@/hooks/use-feedback";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { profile } = useAuth();
  const [feedback, setFeedback] = useState("");
  const sendFeedbackMutation = useSendFeedback();

  const handleSubmit = () => {
    if (!profile || !feedback.trim()) return;
    sendFeedbackMutation.mutate(
      { userId: profile.id, content: feedback },
      {
        onSuccess: () => {
          setFeedback("");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>피드백 보내기</DialogTitle>
        </DialogHeader>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="서비스 개선을 위한 의견을 보내주세요."
        />
        <Button onClick={handleSubmit} disabled={sendFeedbackMutation.isPending}>
          제출
        </Button>
      </DialogContent>
    </Dialog>
  );
}
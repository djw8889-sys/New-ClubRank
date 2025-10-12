import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface PointChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PointChargeModal({ isOpen, onClose }: PointChargeModalProps) {
  const { profile, updateProfile } = useAuth();
  const [amount, setAmount] = useState(0);

  const handleCharge = async () => {
    if (profile) {
      const currentPoints = profile.points || 0;
      await updateProfile({ points: currentPoints + amount });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>포인트 충전</DialogTitle>
        </DialogHeader>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value, 10))}
          placeholder="충전할 금액"
        />
        <Button onClick={handleCharge}>충전</Button>
      </DialogContent>
    </Dialog>
  );
}
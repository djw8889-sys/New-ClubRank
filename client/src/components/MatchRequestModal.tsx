import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/hooks/use-firebase';
import { useAuth } from '@/hooks/use-auth';
import { getAvatarSrc } from '@/utils/avatar';
import { getTierInfo } from '@/utils/tierCalculator';
import LoadingSpinner from './LoadingSpinner';
import { User } from '@shared/schema';

interface MatchRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetUser: User;
  currentUserPoints: number;
  isLoading: boolean;
}

export default function MatchRequestModal({
  isOpen,
  onClose,
  targetUser,
}: MatchRequestModalProps) {
  const { user } = useAuth();
  const { addDocument } = useFirestore();
  const { toast } = useToast();
  const loading = false; // Placeholder for loading state

  const handleMatchRequest = async () => {
    // Logic to handle match request
    if (!user) return;
    try {
      await addDocument('matches', {
        player1Id: user.uid,
        player2Id: targetUser.id,
        status: 'pending',
      });
      toast({ title: 'Success', description: 'Match request sent.' });
      onClose();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send match request.' });
    }
  };

  if (!isOpen) return null;
  const tierInfo = getTierInfo(targetUser.elo ?? 1200);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Request Match</h2>
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={getAvatarSrc(targetUser.avatarUrl, targetUser)}
            alt={targetUser.username || 'user'}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h3 className="font-bold">{targetUser.username}</h3>
            <p className="text-sm text-gray-500">
              {tierInfo.name} - {targetUser.elo ?? 1200} ELO
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleMatchRequest} disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Send Request'}
          </Button>
        </div>
      </div>
    </div>
  );
}
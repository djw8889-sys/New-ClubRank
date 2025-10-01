import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMatchHistory } from "@/hooks/use-matches";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { User } from "@shared/schema";

export interface MatchHistoryModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function MatchHistoryModal({ userId, isOpen, onClose }: MatchHistoryModalProps) {
    const { data: matches, isLoading, error } = useMatchHistory(userId);
    const { profile } = useAuth();

    const getOpponent = (match: { player1: User; player2: User }) => {
        return match.player1.id === profile?.id ? match.player2 : match.player1;
    };

    const getMatchResult = (match: { result: string | null; player1Id: string }) => {
        if (!match.result) return { text: "Pending", color: "bg-gray-500" };
        const userWon = (match.result === 'player1_wins' && match.player1Id === profile?.id) ||
                        (match.result === 'player2_wins' && match.player1Id !== profile?.id);
        return userWon ? { text: "Win", color: "bg-green-500" } : { text: "Loss", color: "bg-red-500" };
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Match History</DialogTitle>
                    <DialogDescription>Here are the results of your recent matches.</DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-2">
                    {isLoading && <p>Loading history...</p>}
                    {error && <p>Error loading history: {error.message}</p>}
                    {matches && matches.map(match => {
                        const opponent = getOpponent(match);
                        const result = getMatchResult(match);
                        
                        // FIX: 객체(`{}`)를 직접 렌더링하던 오류 수정
                        return (
                            <div key={match.id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                    <p>vs {opponent.username}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(match.scheduledAt || match.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <Badge className={result.color}>{result.text}</Badge>
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}


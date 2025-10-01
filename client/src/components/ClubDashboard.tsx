import { useClubMembers, useLeaveClub } from "@/hooks/use-clubs";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Club } from "@shared/schema";
// ... other imports

interface ClubDashboardProps {
    club: Club;
    onClose: () => void;
}

export default function ClubDashboard({ club, onClose }: ClubDashboardProps) {
    const { data: members, isLoading, error } = useClubMembers(club.id);
    const { toast } = useToast();
    const leaveClubMutation = useLeaveClub();

    const handleLeaveClub = () => {
        leaveClubMutation.mutate({ clubId: club.id }, {
            onSuccess: () => {
                toast({ title: "Successfully left the club." });
                onClose();
            },
            onError: (err) => {
                toast({ title: "Failed to leave club", description: err.message, variant: "destructive" });
            }
        });
    };

    if(isLoading) return <div>Loading members...</div>
    if(error) return <div>Error: {error.message}</div>

    return (
        <div>
            <h2>{club.name} Members</h2>
            <ul>
                {members?.map(member => (
                    <li key={member.id}>{member.username} - {member.member.role}</li>
                ))}
            </ul>
            <Button variant="destructive" onClick={handleLeaveClub}>Leave Club</Button>
        </div>
    );
}


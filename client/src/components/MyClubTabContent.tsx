import { Club } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MyClubTabContentProps {
  myClubMemberships: { club: Club; role: string }[] | undefined;
  isLoading: boolean;
  onManageClub: (club: Club) => void;
}

export default function MyClubTabContent({
  myClubMemberships,
  isLoading,
  onManageClub,
}: MyClubTabContentProps) {
  if (isLoading) {
    return <div className="p-4 text-center">Loading your clubs...</div>;
  }

  if (!myClubMemberships || myClubMemberships.length === 0) {
    return (
      <Card className="m-4">
        <CardHeader>
          <CardTitle>No Clubs Joined</CardTitle>
          <CardDescription>
            You haven't joined any clubs yet. Find one to join!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {myClubMemberships.map(({ club, role }) => (
        <Card key={club.id}>
          <CardHeader>
            <CardTitle>{club.name}</CardTitle>
            <CardDescription>{club.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your role: {role}</p>
            <Button onClick={() => onManageClub(club)}>Manage</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { ClubMember } from "@shared/schema";

export function useClubs() {
  const { user } = useAuth();

  const {
    data: myClubMemberships,
    isLoading,
    error,
  } = useQuery<ClubMember[]>({
    queryKey: ["my-club-memberships", user?.uid],
    queryFn: async () => {
      const res = await fetch("/api/clubs/my-memberships");
      if (!res.ok) {
        throw new Error("Failed to fetch club memberships");
      }
      return res.json();
    },
    enabled: !!user,
  });

  return { myClubMemberships, isLoading, error };
}

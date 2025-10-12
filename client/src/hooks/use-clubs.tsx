import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { Club, NewClub, ClubMember, User } from "@shared/schema";

async function fetcher(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(errorBody.message || "An error occurred");
  }
  return res.json();
}

// Hook to get the current user's club memberships
export function useClubs() {
  const { user } = useAuth();
  return useQuery<{ club: Club; role: string }[], Error>({
    queryKey: ["clubs", "membership"],
    queryFn: () => fetcher("/api/clubs/my-membership"),
    enabled: !!user,
  });
}

// Hook to get a list of all clubs (or search)
export function useClubSearch(searchTerm: string = "") {
  return useQuery<Club[], Error>({
    queryKey: ["clubs", "search", searchTerm],
    queryFn: () => fetcher(`/api/clubs?search=${searchTerm}`),
  });
}

// Hook to get members of a specific club
export function useClubMembers(clubId: number | null) {
  return useQuery< (User & { member: { role: string; joinedAt: string } })[], Error>({
    queryKey: ["clubs", "members", clubId],
    queryFn: () => fetcher(`/api/clubs/${clubId}/members`),
    enabled: !!clubId,
  });
}

// Hook to create a new club
export function useCreateClub() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  return useMutation<Club, Error, Omit<NewClub, 'ownerId' | 'createdAt'>>({
    mutationFn: (newClubData) => {
        if (!profile) throw new Error("You must be logged in to create a club.");
        const newClub: NewClub = {
            ...newClubData,
            ownerId: profile.id,
            createdAt: new Date(),
        }
        return fetcher("/api/clubs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newClub),
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
}


// Hook to join a club
export function useJoinClub() {
    const queryClient = useQueryClient();
    return useMutation<ClubMember, Error, { clubId: number }>({
        mutationFn: ({ clubId }) =>
            fetcher(`/api/clubs/${clubId}/join`, {
                method: 'POST',
            }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['clubs', 'membership'] });
            queryClient.invalidateQueries({ queryKey: ['clubs', 'members', data.clubId] });
        },
    });
}

// Hook to leave a club
export function useLeaveClub() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { clubId: number }>({
    mutationFn: ({ clubId }) =>
      fetcher(`/api/clubs/${clubId}/leave`, {
        method: "POST",
      }),
    onSuccess: (_, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: ["clubs", "membership"] });
      queryClient.invalidateQueries({ queryKey: ["clubs", "members", clubId] });
    },
  });
}


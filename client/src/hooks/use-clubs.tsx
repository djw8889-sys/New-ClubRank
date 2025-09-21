import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';

// Define types for club-related data
interface ClubMembership {
  membership: {
    id: number;
    userId: string;
    clubId: number;
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
    isActive: boolean;
  };
  club: {
    id: number;
    name: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    description: string | null;
    primaryColor: string | null;
    rankingPoints: number | null;
    region: string;
    establishedAt: Date | null;
  };
}

interface ClubSearchResult {
  id: number;
  name: string;
  description: string | null;
  region: string;
  primaryColor: string | null;
  rankingPoints: number | null;
  memberCount: number;
  establishedAt: Date | null;
}

interface ClubMember {
  id: number;
  userId: string;
  clubId: number;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  isActive: boolean;
}

// Club membership hook
export function useMyClubMembership() {
  return useQuery<ClubMembership[]>({
    queryKey: ['/api/clubs/my-membership'],
  });
}

// Club search hook
export function useClubSearch(region: string) {
  return useQuery<ClubSearchResult[]>({
    queryKey: [`/api/clubs/search?region=${encodeURIComponent(region)}`],
    enabled: !!region,
  });
}

// Club members hook
export function useClubMembers(clubId: number) {
  return useQuery<ClubMember[]>({
    queryKey: ['/api/clubs', clubId, 'members'],
    enabled: !!clubId,
  });
}

// Club matches hook
export function useClubMatches(clubId: number) {
  return useQuery({
    queryKey: ['/api/clubs', clubId, 'matches'],
    enabled: !!clubId,
  });
}

// Create club mutation
export function useCreateClub() {
  return useMutation({
    mutationFn: async (clubData: {
      name: string;
      region: string;
      description?: string;
      logoUrl?: string;
      bannerUrl?: string;
      primaryColor?: string;
    }) => {
      const response = await apiRequest('POST', '/api/clubs', clubData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clubs/my-membership'] });
    },
  });
}

// Join club mutation
export function useJoinClub() {
  return useMutation({
    mutationFn: async (clubId: number) => {
      const response = await apiRequest('POST', `/api/clubs/${clubId}/join`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clubs/my-membership'] });
    },
  });
}

// Leave club mutation
export function useLeaveClub() {
  return useMutation({
    mutationFn: async (clubId: number) => {
      const response = await apiRequest('DELETE', `/api/clubs/${clubId}/leave`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clubs/my-membership'] });
    },
  });
}

// Create club match mutation
export function useCreateClubMatch() {
  return useMutation({
    mutationFn: async ({ clubId, matchData }: {
      clubId: number;
      matchData: {
        receivingClubId: number;
        matchDate?: Date;
        matchLocation?: string;
        matchType?: 'friendly' | 'tournament' | 'league';
        notes?: string;
      };
    }) => {
      const response = await apiRequest('POST', `/api/clubs/${clubId}/matches`, matchData);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/clubs', variables.clubId, 'matches'] 
      });
    },
  });
}

// Update member role mutation
export function useUpdateMemberRole() {
  return useMutation({
    mutationFn: async ({ memberId, role }: {
      memberId: number;
      role: 'owner' | 'admin' | 'member';
    }) => {
      const response = await apiRequest('PATCH', `/api/clubs/members/${memberId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clubs'] });
    },
  });
}

// Remove member mutation
export function useRemoveMember() {
  return useMutation({
    mutationFn: async (memberId: number) => {
      const response = await apiRequest('DELETE', `/api/clubs/members/${memberId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clubs'] });
    },
  });
}
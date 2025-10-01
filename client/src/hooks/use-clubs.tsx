import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { ClubMember, User, insertClubSchema } from "@shared/schema";
import { z } from "zod";

// 내 클럽 멤버십 정보를 가져오는 훅
export function useMyClubMembership() {
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

// 특정 클럽의 멤버 목록을 가져오는 훅
export function useClubMembers(clubId: number | undefined) {
    return useQuery<(User & { member: ClubMember })[]>({
        queryKey: ['club-members', clubId],
        queryFn: async () => {
            const res = await fetch(`/api/clubs/${clubId}/members`);
            if (!res.ok) {
                throw new Error('Failed to fetch club members');
            }
            return res.json();
        },
        enabled: !!clubId, // clubId가 있을 때만 쿼리 실행
    });
}

// 클럽을 탈퇴하는 뮤테이션 훅
export function useLeaveClub() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: async (clubId: number) => {
            const res = await fetch(`/api/clubs/${clubId}/membership`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to leave club');
            }
        },
        onSuccess: (_, clubId) => {
            // 성공 시 관련 쿼리를 무효화하여 데이터를 새로고침
            queryClient.invalidateQueries({ queryKey: ['my-club-memberships'] });
            queryClient.invalidateQueries({ queryKey: ['club-members', clubId] });
        },
    });
}

// 새로운 클럽을 생성하는 뮤테이션 훅 (<<--- 이 부분이 추가되었습니다!)
export function useCreateClub() {
    const queryClient = useQueryClient();
    return useMutation<any, Error, z.infer<typeof insertClubSchema>>({
        mutationFn: async (newClub) => {
            const res = await fetch('/api/clubs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newClub),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to create club');
            }
            return res.json();
        },
        onSuccess: () => {
            // 클럽 생성 성공 시, 클럽 목록과 내 멤버십 정보를 새로고침
            queryClient.invalidateQueries({ queryKey: ['clubs'] });
            queryClient.invalidateQueries({ queryKey: ['my-club-memberships'] });
        },
    });
}


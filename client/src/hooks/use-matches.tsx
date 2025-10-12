import { useQuery } from "@tanstack/react-query";
import { Match, User } from "@shared/schema";
import axios from "axios";

// 경기 상세 정보와 플레이어 정보를 함께 가져오는 타입
type MatchWithPlayers = Match & {
  player1: User;
  player2: User;
};

// 특정 ID의 경기 정보를 가져오는 훅
export const useMatchById = (matchId: number) => {
  return useQuery<MatchWithPlayers, Error>({
    queryKey: ["match", matchId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/matches/${matchId}`);
      return data;
    },
    enabled: !!matchId, // matchId가 있을 때만 쿼리 실행
  });
};

// 특정 사용자의 경기 기록을 가져오는 훅
export const useMatchHistory = (userId: string) => {
  return useQuery<MatchWithPlayers[], Error>({
    queryKey: ["matches", "history", userId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/users/${userId}/matches`);
      return data;
    },
    enabled: !!userId, // userId가 있을 때만 쿼리 실행
  });
};

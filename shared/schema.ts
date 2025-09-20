// TypeScript types for the Firebase-based tennis matching app
// Note: This app uses Firebase Firestore, not PostgreSQL

export interface User {
  id: string;
  email: string;
  username: string;
  photoURL: string | null;
  ntrp: string;
  region: string;
  age: string;
  bio: string | null;
  availableTimes: string[];
  points: number;
  wins: number;
  losses: number;
  mannerScore: number; // 매너 점수 (1-5, 기본값 5)
  mannerReviewsCount: number; // 매너 리뷰 받은 횟수
  mannerScoreSum: number; // 매너 점수 합계
  tier?: string; // Calculated tier based on performance
  role?: 'admin' | 'user'; // User role for permissions
  isProfileComplete?: boolean; // 프로필 설정 완료 여부
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  requesterId: string;
  targetId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  scheduledAt?: Date;
  location?: string;
  pointsCost: number;
  result?: 'requester_won' | 'target_won' | 'draw';
  isReviewed: boolean; // 전체 리뷰 완료 여부 (양쪽 다 완료)
  reviewedByRequester: boolean; // 요청자 리뷰 완료 여부
  reviewedByTarget: boolean; // 대상자 리뷰 완료 여부
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat {
  id: string;
  matchId: string;
  senderId: string;
  message: string;
  createdAt: Date;
}

// 1:1 채팅을 위한 새로운 인터페이스들
export interface ChatRoom {
  id: string;
  participants: string[]; // 참여자 ID 배열 (항상 2명)
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

export interface Participant {
  id: string;
  chatRoomId: string;
  userId: string;
  joinedAt: Date;
}

export interface Post {
  id: string;
  authorId: string;
  title: string;
  content: string;
  likes: string[]; // 좋아요한 사용자 ID 배열
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export interface Friend {
  id: string;
  userId1: string; // 친구 요청을 보낸 사용자
  userId2: string; // 친구 요청을 받은 사용자
  status: 'pending' | 'accepted'; // 친구 관계 상태
  createdAt: Date;
  updatedAt: Date;
}

// Input types for creating new records (omitting auto-generated fields)
export interface InsertUser {
  email: string;
  username: string;
  photoURL?: string | null;
  ntrp: string;
  region: string;
  age: string;
  bio?: string | null;
  availableTimes: string[];
  mannerScore?: number; // 기본값 5
  mannerReviewsCount?: number; // 기본값 0
  mannerScoreSum?: number; // 기본값 0 (누적 합계)
  role?: 'admin' | 'user';
}

export interface InsertMatch {
  requesterId: string;
  targetId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  scheduledAt?: Date;
  location?: string;
  pointsCost: number;
  result?: 'requester_won' | 'target_won' | 'draw';
  isReviewed?: boolean; // 기본값 false (전체 리뷰 완료)
  reviewedByRequester?: boolean; // 기본값 false
  reviewedByTarget?: boolean; // 기본값 false
}

export interface InsertChat {
  matchId: string;
  senderId: string;
  message: string;
}

export interface InsertPost {
  authorId: string;
  title: string;
  content: string;
}

// 새로운 채팅 관련 Insert 타입들
export interface InsertChatRoom {
  participants: string[];
}

export interface InsertMessage {
  chatRoomId: string;
  senderId: string;
  content: string;
}

export interface InsertComment {
  authorId: string;
  content: string;
}

export interface InsertFriend {
  userId1: string;
  userId2: string;
  status: 'pending' | 'accepted';
}
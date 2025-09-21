import { useState } from "react";
import { increment } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { useFirestoreCollection, useFirestore } from "@/hooks/use-firebase";
import { usePresence } from "@/hooks/use-presence";
import { useOnlineUsers } from "@/hooks/use-online-users";
import { useChat } from "@/hooks/use-chat";
import { User, Post, Match } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { calculateTier, getTierProgress } from "@/utils/tierCalculator";
import { getAvatarSrc } from "@/utils/avatar";
import PlayerCard from "./PlayerCard";
import BottomNavigation from "./BottomNavigation";
import LoadingSpinner from "./LoadingSpinner";
import PostCreateModal from "./PostCreateModal";
import MatchResultModal from "./MatchResultModal";
import MatchRequestModal from "./MatchRequestModal";
import ChatScreen from "./ChatScreen";
import TierProgressCard from "./TierProgressCard";
import AdminPanel from "./AdminPanel";
import AdminPromotion from "./AdminPromotion";
import FeedbackModal from "./FeedbackModal";
import ClubRankLogo from "./ClubRankLogo";
import ProfileEditModal from "./ProfileEditModal";
import MatchHistoryModal from "./MatchHistoryModal";
import PointChargeModal from "./PointChargeModal";
import ShopModal from "./ShopModal";
import UserProfileModal from "./UserProfileModal";

export default function MainApp() {
  const { appUser, logout } = useAuth();
  const { requestMatch, acceptMatch, rejectMatch, deleteDocument, toggleLike, addComment } = useFirestore();
  const { onlineUsers: presenceUsers } = usePresence();
  const { onlineUsers, loading: onlineUsersLoading, refresh: refreshOnlineUsers } = useOnlineUsers();
  const { createOrFindChatRoom, chatRooms } = useChat();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('player-tab');
  const [mainHeader, setMainHeader] = useState('현재 접속 중인 플레이어');
  const [showPostModal, setShowPostModal] = useState(false);
  const [showMatchResultModal, setShowMatchResultModal] = useState(false);
  const [showMatchRequestModal, setShowMatchRequestModal] = useState(false);
  const [showChatScreen, setShowChatScreen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  const [chatOpponent, setChatOpponent] = useState<User | null>(null);
  const [chatMatchId, setChatMatchId] = useState<string>('');
  const [isNewChatMode, setIsNewChatMode] = useState(false); // true for 1:1 chat, false for match-based chat
  const [isMatchRequesting, setIsMatchRequesting] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showMatchHistoryModal, setShowMatchHistoryModal] = useState(false);
  const [showPointChargeModal, setShowPointChargeModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{[postId: string]: string}>({});
  const [showComments, setShowComments] = useState<{[postId: string]: boolean}>({});
  const [sortBy, setSortBy] = useState<'ntrp' | 'points' | 'distance'>('ntrp');
  
  // 안전한 숫자 변환 함수
  const safeNumber = (value: string | number | undefined | null, defaultValue = 0): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  };

  // 정렬된 온라인 사용자 목록
  const sortedOnlineUsers = [...onlineUsers].sort((a, b) => {
    switch (sortBy) {
      case 'ntrp':
        const aNtrp = safeNumber(a.ntrp);
        const bNtrp = safeNumber(b.ntrp);
        // NTRP가 설정되지 않은 사용자는 뒤로
        if (aNtrp === 0 && bNtrp !== 0) return 1;
        if (bNtrp === 0 && aNtrp !== 0) return -1;
        return bNtrp - aNtrp;
      case 'points':
        return safeNumber(b.points) - safeNumber(a.points);
      case 'distance':
        // 거리순은 현재 비활성화 (위치 정보가 없음)
        return 0;
      default:
        return 0;
    }
  });

  // Fetch other players (excluding current user)
  const { 
    data: players, 
    loading: playersLoading 
  } = useFirestoreCollection<User>('users', [
    { field: 'id', operator: '!=', value: appUser?.id || '' }
  ]);

  // Fetch ranking data (all users sorted by points)
  const {
    data: rankingUsers,
    loading: rankingLoading
  } = useFirestoreCollection<User>('users', [], 'points', 'desc');

  // Fetch community posts
  const {
    data: posts,
    loading: postsLoading
  } = useFirestoreCollection<Post>('posts', [], 'createdAt', 'desc');

  // Fetch user's matches
  const {
    data: userMatches,
    loading: userMatchesLoading
  } = useFirestoreCollection<Match>('matches', [
    { field: 'requesterId', operator: '==', value: appUser?.id || '' }
  ], 'createdAt', 'desc');

  // Also fetch matches where user is the target
  const {
    data: targetMatches,
    loading: targetMatchesLoading
  } = useFirestoreCollection<Match>('matches', [
    { field: 'targetId', operator: '==', value: appUser?.id || '' }
  ], 'createdAt', 'desc');

  // Combine both match lists
  const allMatches = [...userMatches, ...targetMatches]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const matchesLoading = userMatchesLoading || targetMatchesLoading;

  const handleTabChange = (tab: string, header: string) => {
    setActiveTab(tab);
    setMainHeader(header);
  };

  const handleMatchRequest = async (targetId: string) => {
    const targetPlayer = onlineUsers.find(p => p.id === targetId);
    if (!targetPlayer) return;
    
    setSelectedPlayer(targetPlayer);
    setShowMatchRequestModal(true);
  };

  const handleConfirmMatchRequest = async () => {
    if (!appUser || !selectedPlayer) return;
    
    setIsMatchRequesting(true);

    try {
      await requestMatch(appUser.id, selectedPlayer.id, 50);

      toast({
        title: "매칭 신청 완료",
        description: `${selectedPlayer.username}님에게 매치를 신청했습니다. (테스트 버전 - 무료)`,
      });
      
      setShowMatchRequestModal(false);
      setSelectedPlayer(null);
    } catch (error: any) {
      console.error("Match request error:", error);
      toast({
        title: "매칭 신청 실패",
        description: error.message || "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsMatchRequesting(false);
    }
  };

  // 실시간 접속자와 채팅 시작
  const handleStartChat = async (otherUserId: string) => {
    try {
      if (!appUser) return;
      
      const chatRoomId = await createOrFindChatRoom(otherUserId);
      
      // 채팅 상대방 찾기 (onlineUsers에서 먼저 찾고, 없으면 다른 목록에서)
      let otherUser = onlineUsers.find(u => u.id === otherUserId) || 
        players.find(p => p.id === otherUserId) || 
        rankingUsers.find(u => u.id === otherUserId);
      
      if (!otherUser) {
        // 플레이스홀더 사용자 생성 - 나중에 데이터 하이드레이션
        otherUser = {
          id: otherUserId,
          username: "사용자",
          email: "",
          photoURL: null,
          ntrp: "0.0",
          region: "알 수 없음",
          age: "0",
          bio: null,
          availableTimes: [],
          points: 0,
          wins: 0,
          losses: 0,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01')
        };
      }
      
      // 채팅 화면 열기
      setChatOpponent(otherUser as User);
      setChatMatchId(chatRoomId);
      setIsNewChatMode(true);
      setShowChatScreen(true);
      
      toast({
        title: "채팅방 입장",
        description: `${otherUser.username}님과의 채팅을 시작합니다.`,
      });
    } catch (error: any) {
      console.error("Chat start error:", error);
      toast({
        title: "채팅 시작 실패",
        description: "채팅을 시작할 수 없습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptMatch = async (matchId: string) => {
    if (!appUser) return;

    try {
      await acceptMatch(matchId);
      toast({
        title: "매치 수락 완료",
        description: "경기 준비가 완료되었습니다! (테스트 버전 - 무료)",
      });
    } catch (error: any) {
      console.error("Accept match error:", error);
      toast({
        title: "매치 수락 실패",
        description: error.message || "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    if (!appUser) return;

    try {
      await rejectMatch(matchId);
      toast({
        title: "매치 거절 완료",
        description: "매치 요청을 거절했습니다. (테스트 버전 - 무료)",
      });
    } catch (error: any) {
      console.error("Reject match error:", error);
      toast({
        title: "매치 거절 실패",
        description: error.message || "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string, authorId: string) => {
    if (!appUser) return;
    
    // Check if current user is the author
    if (appUser.id !== authorId) {
      toast({
        title: "삭제 권한 없음",
        description: "본인이 작성한 글만 삭제할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteDocument('posts', postId);
      toast({
        title: "게시글 삭제 완료",
        description: "게시글이 성공적으로 삭제되었습니다.",
      });
    } catch (error: any) {
      console.error("Delete post error:", error);
      toast({
        title: "게시글 삭제 실패",
        description: error.message || "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!appUser) return;
    
    try {
      await toggleLike(postId);
    } catch (error: any) {
      console.error("Toggle like error:", error);
      toast({
        title: "좋아요 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!appUser) return;
    
    const commentContent = commentInputs[postId]?.trim();
    if (!commentContent) return;
    
    try {
      await addComment(postId, commentContent);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      toast({
        title: "댓글 작성 완료",
        description: "댓글이 성공적으로 작성되었습니다.",
      });
    } catch (error: any) {
      console.error("Add comment error:", error);
      toast({
        title: "댓글 작성 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const toggleCommentSection = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const updateCommentInput = (postId: string, value: string) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await logout();
    }
  };

  const handleNewPost = () => {
    setShowPostModal(true);
  };

  const handleClosePostModal = () => {
    setShowPostModal(false);
  };

  const handlePostCreated = () => {
    // Firestore의 realtime listener가 자동으로 UI를 업데이트함
    toast({
      title: "게시글이 추가되었습니다",
      description: "커뮤니티에서 확인해보세요!",
    });
  };

  // 사용자 프로필 클릭 핸들러
  const handleUserProfileClick = (userId: string) => {
    if (userId && userId !== appUser?.id) {
      setSelectedUserId(userId);
      setShowUserProfileModal(true);
    }
  };

  // 사용자 프로필 모달 닫기 핸들러
  const handleCloseUserProfileModal = () => {
    setShowUserProfileModal(false);
    setSelectedUserId(null);
  };

  const handleCompleteMatch = (match: Match) => {
    setSelectedMatch(match);
    setShowMatchResultModal(true);
  };

  const handleCloseMatchResultModal = () => {
    setShowMatchResultModal(false);
    setSelectedMatch(null);
  };

  const handleOpenChat = (match: Match) => {
    if (!appUser) return;
    
    const isRequester = match.requesterId === appUser.id;
    const opponentId = isRequester ? match.targetId : match.requesterId;
    
    // Try to find opponent in loaded lists first
    let opponent = rankingUsers.find(u => u.id === opponentId) || 
      players.find(u => u.id === opponentId);
    
    if (!opponent) {
      // Create placeholder opponent if not found in lists
      opponent = {
        id: opponentId,
        username: "로딩 중...",
        email: "",
        photoURL: null,
        ntrp: "0.0",
        region: "알 수 없음",
        age: "0",
        bio: null,
        availableTimes: [],
        points: 0,
        wins: 0,
        losses: 0,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      };
    }
    
    setChatOpponent(opponent);
    setChatMatchId(match.id);
    setShowChatScreen(true);
  };

  const handleCloseChatScreen = () => {
    setShowChatScreen(false);
    setChatOpponent(null);
    setChatMatchId('');
    setIsNewChatMode(false);
  };

  if (!appUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" data-testid="main-app">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-20">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-3">
            <ClubRankLogo size="sm" className="bg-transparent" />
            <h1 className="text-xl font-bold text-foreground" data-testid="text-main-header">
              {mainHeader}
            </h1>
            <span className="premium-badge">PREMIUM</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowShopModal(true)}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors" 
              data-testid="button-shop"
            >
              <i className="fas fa-store text-lg" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </button>
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="button-notifications">
              <i className="fas fa-bell text-lg" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
            </button>
            <div className="text-right">
              <p className="font-bold text-accent flex items-center" data-testid="text-user-points">
                <i className="fas fa-coins mr-1" />
                <span>{appUser.points}</span> P
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto bg-muted">
        {/* Online Players Tab */}
        <div className={`tab-content ${activeTab === 'player-tab' ? 'active' : 'hidden'}`}>
          {/* Quick Stats */}
          <div className="bg-background p-4 border-b border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary" data-testid="text-stat-online-players">
                  {onlineUsers.length}
                </div>
                <div className="text-xs text-muted-foreground">접속중인 플레이어</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block mr-1"></div>
                  실시간
                </div>
                <div className="text-xs text-muted-foreground">실시간 매칭</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{appUser?.wins || 0}</div>
                <div className="text-xs text-muted-foreground">총 승수</div>
              </div>
            </div>
          </div>

          {/* 정렬 및 새로고침 */}
          <div className="p-4 bg-background border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as 'ntrp' | 'points' | 'distance')}
                  className="p-2 border border-input rounded-lg bg-background text-sm focus:ring-2 focus:ring-ring" 
                  data-testid="select-sort-online-users"
                >
                  <option value="ntrp">NTRP 순</option>
                  <option value="points">포인트 순</option>
                  <option value="distance" disabled>거리 순 (비활성)</option>
                </select>
                <span className="text-xs text-muted-foreground">
                  {sortBy === 'ntrp' ? '높은 실력순' : sortBy === 'points' ? '높은 포인트순' : '거리 가까운 순'}
                </span>
              </div>
              <button 
                onClick={refreshOnlineUsers}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                title="목록 새로고침"
                data-testid="button-refresh-online-users"
              >
                <i className="fas fa-sync-alt" />
              </button>
            </div>
          </div>

          {/* 실시간 접속자 목록 */}
          <div className="p-4 space-y-4">
            {onlineUsersLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground text-sm">접속중인 플레이어를 불러오는 중...</p>
              </div>
            ) : sortedOnlineUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-users text-2xl text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2" data-testid="text-no-online-players">
                  현재 접속중인 플레이어가 없습니다
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  다른 플레이어들이 접속할 때까지 잠시만 기다려주세요
                </p>
                <button 
                  onClick={refreshOnlineUsers}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                  data-testid="button-refresh-no-players"
                >
                  <i className="fas fa-sync-alt mr-1" />
                  다시 확인하기
                </button>
              </div>
            ) : (
              sortedOnlineUsers.map((user) => (
                <div 
                  key={user.id}
                  className="bg-background rounded-xl border border-border p-4 hover:bg-muted transition-colors cursor-pointer"
                  data-testid={`online-player-card-${user.id}`}
                >
                  <div className="flex items-center space-x-4">
                    {/* 프로필 이미지 */}
                    <div className="relative">
                      <img 
                        src={getAvatarSrc(user.photoURL, user, 120)} 
                        alt={user.username} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleUserProfileClick(user.id)}
                        data-testid={`img-online-player-${user.id}`}
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                    </div>
                    
                    {/* 사용자 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 
                          className="font-bold text-foreground cursor-pointer hover:text-primary transition-colors" 
                          onClick={() => handleUserProfileClick(user.id)}
                          data-testid={`text-online-player-name-${user.id}`}
                        >
                          {user.username}
                        </h3>
                        <span className="text-xs text-muted-foreground">{user.region}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          NTRP {user.ntrp}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${calculateTier(user.points, user.wins, user.losses).color} ${calculateTier(user.points, user.wins, user.losses).bgColor}`}>
                          <i className="fas fa-medal mr-1" />
                          {calculateTier(user.points, user.wins, user.losses).name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          매너점수: {(user.mannerScore ?? 5).toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {user.wins}승 {user.losses}패 • {user.points}P
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStartChat(user.id)}
                            className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-xs hover:bg-primary/90 transition-colors"
                            data-testid={`button-chat-online-${user.id}`}
                          >
                            💬 1:1 채팅
                          </button>
                          <button
                            onClick={() => handleMatchRequest(user.id)}
                            className="bg-accent text-accent-foreground px-3 py-1 rounded-md text-xs hover:bg-accent/90 transition-colors"
                            data-testid={`button-match-request-online-${user.id}`}
                          >
                            ⚾ 매치 신청
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat List Tab - Now showing both chat rooms and matches */}
        <div className={`tab-content ${activeTab === 'chat-list-tab' ? 'active' : 'hidden'}`}>
          {/* Chat Rooms Section */}
          {chatRooms.length > 0 && (
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <i className="fas fa-comments mr-2 text-primary" />
                1:1 채팅 ({chatRooms.length})
              </h3>
              <div className="space-y-3">
                {chatRooms.map((chatRoom) => {
                  // Find the other participant
                  const otherParticipantId = chatRoom.participants.find(id => id !== appUser?.id);
                  const otherParticipant = players.find(p => p.id === otherParticipantId) ||
                    rankingUsers.find(u => u.id === otherParticipantId);
                  
                  return (
                    <div 
                      key={chatRoom.id}
                      className="bg-background rounded-xl p-4 border border-border hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => {
                        if (otherParticipant) {
                          setChatOpponent(otherParticipant);
                          setChatMatchId(chatRoom.id);
                          setIsNewChatMode(true);
                          setShowChatScreen(true);
                        }
                      }}
                      data-testid={`chat-room-${chatRoom.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <img 
                          src={otherParticipant?.photoURL || "https://source.boringavatars.com/beam/120/unknown?colors=264653,2a9d8f,e9c46a,f4a261,e76f51"} 
                          alt={otherParticipant?.username || "Unknown"} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-foreground" data-testid={`text-chat-participant-${chatRoom.id}`}>
                              {otherParticipant?.username || "Unknown User"}
                            </p>
                            {chatRoom.lastMessageAt && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(chatRoom.lastMessageAt).toLocaleDateString('ko-KR', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            )}
                          </div>
                          {chatRoom.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate">{chatRoom.lastMessage}</p>
                          )}
                          {otherParticipant && (
                            <p className="text-xs text-muted-foreground">NTRP {otherParticipant.ntrp}</p>
                          )}
                        </div>
                        <i className="fas fa-chevron-right text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matches Section */}
          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center">
              <i className="fas fa-trophy mr-2 text-accent" />
              매치 목록 ({allMatches.length})
            </h3>
            {matchesLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground text-sm">매치 목록을 불러오는 중...</p>
              </div>
            ) : allMatches.length === 0 ? (
              <p className="text-center text-muted-foreground pt-10" data-testid="text-no-matches">
                아직 매치가 없습니다.<br />
                플레이어 탭에서 매치를 신청해보세요!
              </p>
            ) : (
              <div className="space-y-3">
                {allMatches.map((match) => {
                const isRequester = match.requesterId === appUser?.id;
                const opponentId = isRequester ? match.targetId : match.requesterId;
                const opponent = rankingUsers.find(u => u.id === opponentId) || 
                  players.find(u => u.id === opponentId);
                
                const statusColors = {
                  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
                  completed: 'bg-green-100 text-green-800 border-green-200',
                  rejected: 'bg-red-100 text-red-800 border-red-200'
                };

                const statusText = {
                  pending: isRequester ? '대기중' : '응답 필요',
                  accepted: '수락됨',
                  completed: '완료',
                  rejected: '거절됨'
                };

                return (
                  <div 
                    key={match.id}
                    className="bg-background rounded-xl p-4 border border-border hover:bg-muted transition-colors"
                    data-testid={`match-${match.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <img 
                        src={getAvatarSrc(opponent?.photoURL, opponent, 120)} 
                        alt={opponent?.username || "Unknown"} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-foreground" data-testid={`text-match-opponent-${match.id}`}>
                            {opponent?.username || "Unknown User"}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[match.status]}`}>
                            {statusText[match.status]}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          NTRP {opponent?.ntrp || '?'} • {match.pointsCost}P
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(match.createdAt).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {match.status === 'pending' && !isRequester && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAcceptMatch(match.id)}
                            className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            data-testid={`button-accept-match-${match.id}`}
                          >
                            수락
                          </button>
                          <button
                            onClick={() => handleRejectMatch(match.id)}
                            className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                            data-testid={`button-reject-match-${match.id}`}
                          >
                            거절
                          </button>
                        </div>
                      )}
                      {match.status === 'accepted' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenChat(match)}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            data-testid={`button-open-chat-${match.id}`}
                          >
                            💬 채팅
                          </button>
                          <button
                            onClick={() => handleCompleteMatch(match)}
                            className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                            data-testid={`button-complete-match-${match.id}`}
                          >
                            경기 완료
                          </button>
                        </div>
                      )}
                      {match.status === 'completed' && match.result && (
                        <div className="text-center">
                          <p className="text-xs font-medium">
                            {match.result === 'draw' ? '무승부' : 
                             (match.result === 'requester_won' && isRequester) || 
                             (match.result === 'target_won' && !isRequester) ? '승리 🏆' : '패배 😔'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </div>

        {/* Ranking Tab */}
        <div className={`tab-content ${activeTab === 'ranking-tab' ? 'active' : 'hidden'}`}>
          <div className="bg-gradient-to-r from-primary to-emerald-600 p-4 text-white">
            <h2 className="text-lg font-bold mb-2">2024 Q1 시즌 랭킹</h2>
            <div className="text-sm opacity-90">
              <p>시즌 종료까지 <span className="font-bold">23일</span> 남음</p>
              <p>상위 3명에게 특별 리워드 지급!</p>
            </div>
          </div>
          <div className="p-4">
            {rankingLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground text-sm">랭킹 정보를 불러오는 중...</p>
              </div>
            ) : rankingUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8" data-testid="text-no-rankings">
                랭킹 데이터가 없습니다.
              </p>
            ) : (
              <div className="space-y-3">
                {rankingUsers.map((user, index) => (
                  <div 
                    key={user.id}
                    className={`flex items-center p-4 rounded-xl border transition-colors ${
                      user.id === appUser?.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                    data-testid={`ranking-item-${index + 1}`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold leading-none ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}
                        aria-label={`순위 ${index + 1}`}
                        title={`${index + 1}위`}
                        data-testid={`rank-badge-${user.id}`}
                      >
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        <span className="sr-only">{index + 1}위</span>
                      </div>
                      <img 
                        src={getAvatarSrc(user.photoURL, user, 80)} 
                        alt={user.username} 
                        className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleUserProfileClick(user.id)}
                      />
                      <div className="flex-1">
                        <p 
                          className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors" 
                          data-testid={`text-rank-username-${index + 1}`}
                          onClick={() => handleUserProfileClick(user.id)}
                        >
                          {user.username}
                          {user.id === appUser?.id && <span className="ml-2 text-xs text-primary font-bold">(나)</span>}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">NTRP {user.ntrp}</span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold ${calculateTier(user.points, user.wins, user.losses).color} ${calculateTier(user.points, user.wins, user.losses).bgColor}`}>
                            {calculateTier(user.points, user.wins, user.losses).name}
                          </span>
                          <span className="text-sm text-muted-foreground">• {user.region}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent" data-testid={`text-rank-points-${index + 1}`}>{user.points}P</p>
                        <p className="text-xs text-muted-foreground">{user.wins}승 {user.losses}패</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Community Tab */}
        <div className={`tab-content ${activeTab === 'community-tab' ? 'active' : 'hidden'}`}>
          <div className="p-4 border-b border-border bg-background">
            <button 
              onClick={handleNewPost}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors" 
              data-testid="button-new-post"
            >
              <i className="fas fa-pen mr-2" />
              새 글 작성하기
            </button>
          </div>
          <div className="p-4">
            {postsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground text-sm">커뮤니티 게시글을 불러오는 중...</p>
              </div>
            ) : posts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8" data-testid="text-no-posts">
                아직 커뮤니티 게시글이 없습니다.<br />
                첫 번째 게시글을 작성해보세요!
              </p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  // 작성자 정보 찾기
                  const author = rankingUsers.find(user => user.id === post.authorId) || 
                    players.find(user => user.id === post.authorId) ||
                    (post.authorId === appUser?.id ? appUser : null);
                  
                  return (
                    <div 
                      key={post.id}
                      className="bg-background rounded-xl p-4 border border-border hover:bg-muted transition-colors"
                      data-testid={`post-${post.id}`}
                    >
                      {/* Post Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <img 
                          src={getAvatarSrc(author?.photoURL, author, 80)} 
                          alt={author?.username || "Unknown"} 
                          className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => author?.id && handleUserProfileClick(author.id)}
                        />
                        <div className="flex-1">
                          <p 
                            className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors" 
                            data-testid={`text-post-author-${post.id}`}
                            onClick={() => author?.id && handleUserProfileClick(author.id)}
                          >
                            {author?.username || "Unknown User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {post.createdAt && new Date(post.createdAt).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {/* Delete button for post author */}
                        {appUser?.id === post.authorId && (
                          <button
                            onClick={() => handleDeletePost(post.id, post.authorId)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                            data-testid={`button-delete-post-${post.id}`}
                            title="게시글 삭제"
                          >
                            <i className="fas fa-trash text-sm" />
                          </button>
                        )}
                      </div>
                      
                      {/* Post Content */}
                      <div className="mb-3">
                        <h3 className="font-bold text-foreground mb-2" data-testid={`text-post-title-${post.id}`}>
                          {post.title}
                        </h3>
                        <p className="text-foreground whitespace-pre-wrap" data-testid={`text-post-content-${post.id}`}>
                          {post.content}
                        </p>
                      </div>
                      
                      {/* Post Actions */}
                      <div className="flex items-center space-x-4 pt-2 border-t border-border">
                        <button 
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center space-x-1 transition-colors ${
                            (Array.isArray(post.likes) ? post.likes : []).includes(appUser?.id || '') 
                              ? 'text-red-500 hover:text-red-600' 
                              : 'text-muted-foreground hover:text-red-500'
                          }`}
                          data-testid={`button-like-post-${post.id}`}
                        >
                          <i className={`${(Array.isArray(post.likes) ? post.likes : []).includes(appUser?.id || '') ? 'fas' : 'far'} fa-heart`} />
                          <span className="text-sm" data-testid={`text-post-likes-${post.id}`}>
                            {Array.isArray(post.likes) ? post.likes.length : (typeof post.likes === 'number' ? post.likes : 0)}
                          </span>
                        </button>
                        <button 
                          onClick={() => toggleCommentSection(post.id)}
                          className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
                          data-testid={`button-comment-post-${post.id}`}
                        >
                          <i className="far fa-comment" />
                          <span className="text-sm">댓글 {(post.comments || []).length}</span>
                        </button>
                      </div>

                      {/* Comments Section */}
                      {showComments[post.id] && (
                        <div className="mt-4 pt-4 border-t border-border">
                          {/* Existing Comments */}
                          {(post.comments || []).length > 0 && (
                            <div className="space-y-3 mb-4">
                              {post.comments.map((comment) => {
                                const commentAuthor = rankingUsers.find(user => user.id === comment.authorId) || 
                                  players.find(user => user.id === comment.authorId) ||
                                  (comment.authorId === appUser?.id ? appUser : null);
                                
                                return (
                                  <div key={comment.id} className="flex space-x-3" data-testid={`comment-${comment.id}`}>
                                    <img 
                                      src={getAvatarSrc(commentAuthor?.photoURL, commentAuthor, 64)} 
                                      alt={commentAuthor?.username || "Unknown"} 
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                      <div className="bg-muted rounded-lg px-3 py-2">
                                        <p className="font-semibold text-sm text-foreground">
                                          {commentAuthor?.username || "Unknown User"}
                                        </p>
                                        <p className="text-sm text-foreground" data-testid={`text-comment-content-${comment.id}`}>
                                          {comment.content}
                                        </p>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1 ml-3">
                                        {comment.createdAt && (comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt)).toLocaleDateString('ko-KR', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Comment Input */}
                          <div className="flex space-x-3">
                            <img 
                              src={getAvatarSrc(appUser?.photoURL, appUser, 64)} 
                              alt={appUser?.username || "User"} 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1 flex space-x-2">
                              <input
                                type="text"
                                value={commentInputs[post.id] || ''}
                                onChange={(e) => updateCommentInput(post.id, e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(post.id);
                                  }
                                }}
                                placeholder="댓글을 입력하세요..."
                                className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                data-testid={`input-comment-${post.id}`}
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                disabled={!commentInputs[post.id]?.trim()}
                                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                data-testid={`button-submit-comment-${post.id}`}
                              >
                                <i className="fas fa-paper-plane" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Profile Tab */}
        <div className={`tab-content ${activeTab === 'profile-tab' ? 'active' : 'hidden'}`}>
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary to-emerald-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <img 
                src={getAvatarSrc(appUser.photoURL, appUser, 160)} 
                alt="User profile" 
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                data-testid="img-user-profile"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold" data-testid="text-user-name">{appUser.username}</h2>
                <p className="opacity-90" data-testid="text-user-info">NTRP {appUser.ntrp} • {appUser.region}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span data-testid="text-user-record">{appUser.wins}승 {appUser.losses}패</span>
                  <span data-testid="text-user-winrate">
                    승률 {appUser.wins + appUser.losses > 0 ? Math.round((appUser.wins / (appUser.wins + appUser.losses)) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Promotion (Development/Test Mode) */}
          <div className="p-4">
            <AdminPromotion />
          </div>

          {/* Tier Progress Card */}
          <div className="p-4">
            <TierProgressCard user={appUser} />
          </div>

          {/* Stats Cards */}
          <div className="px-4 grid grid-cols-2 gap-4">
            <div className="bg-background rounded-xl p-4 text-center border border-border">
              <div className="text-2xl font-bold text-primary" data-testid="text-user-points-display">{appUser.points}</div>
              <div className="text-xs text-muted-foreground">보유 포인트</div>
            </div>
            <div className="bg-background rounded-xl p-4 text-center border border-border">
              <div className="text-2xl font-bold text-accent">-</div>
              <div className="text-xs text-muted-foreground">이번 시즌 순위</div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-2">
            <button 
              onClick={() => setShowProfileEditModal(true)}
              className="w-full text-left p-4 bg-background rounded-xl border border-border flex justify-between items-center hover:bg-muted transition-colors" 
              data-testid="button-edit-profile"
            >
              <span className="flex items-center">
                <i className="fas fa-user-edit w-6 mr-3 text-primary" />
                프로필 수정
              </span>
              <i className="fas fa-chevron-right text-muted-foreground" />
            </button>
            
            <button 
              onClick={() => setShowMatchHistoryModal(true)}
              className="w-full text-left p-4 bg-background rounded-xl border border-border flex justify-between items-center hover:bg-muted transition-colors" 
              data-testid="button-match-history"
            >
              <span className="flex items-center">
                <i className="fas fa-history w-6 mr-3 text-green-600" />
                경기 기록
              </span>
              <i className="fas fa-chevron-right text-muted-foreground" />
            </button>
            
            <button 
              onClick={() => setShowPointChargeModal(true)}
              className="w-full text-left p-4 bg-background rounded-xl border border-border flex justify-between items-center hover:bg-muted transition-colors" 
              data-testid="button-charge-points"
            >
              <span className="flex items-center">
                <i className="fas fa-coins w-6 mr-3 text-accent" />
                포인트 충전
              </span>
              <i className="fas fa-chevron-right text-muted-foreground" />
            </button>
            
            <button className="w-full text-left p-4 bg-background rounded-xl border border-border flex justify-between items-center hover:bg-muted transition-colors" data-testid="button-settings">
              <span className="flex items-center">
                <i className="fas fa-cog w-6 mr-3 text-muted-foreground" />
                설정
              </span>
              <i className="fas fa-chevron-right text-muted-foreground" />
            </button>
            
            <button 
              onClick={() => setShowFeedbackModal(true)}
              className="w-full text-left p-4 bg-background rounded-xl border border-border flex justify-between items-center hover:bg-muted transition-colors" 
              data-testid="button-feedback"
            >
              <span className="flex items-center">
                <i className="fas fa-lightbulb w-6 mr-3 text-green-600" />
                서비스 개선 제안
              </span>
              <i className="fas fa-chevron-right text-muted-foreground" />
            </button>

            {/* Admin Panel Button - Only visible to admin users */}
            {appUser.role === 'admin' && (
              <button 
                onClick={() => setShowAdminPanel(true)}
                className="w-full text-left p-4 bg-background rounded-xl border border-border flex justify-between items-center hover:bg-muted transition-colors" 
                data-testid="button-admin-panel"
              >
                <span className="flex items-center">
                  <i className="fas fa-shield-alt w-6 mr-3 text-orange-500" />
                  관리자 패널
                </span>
                <i className="fas fa-chevron-right text-muted-foreground" />
              </button>
            )}
            
            <button 
              onClick={handleLogout}
              className="w-full text-left p-4 bg-background rounded-xl border border-border flex justify-between items-center hover:bg-muted transition-colors" 
              data-testid="button-logout"
            >
              <span className="flex items-center">
                <i className="fas fa-sign-out-alt w-6 mr-3 text-destructive" />
                로그아웃
              </span>
              <i className="fas fa-chevron-right text-muted-foreground" />
            </button>
          </div>
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Chat Screen - Full overlay when active */}
      {showChatScreen && chatOpponent && (
        <div className="fixed inset-0 z-50">
          <ChatScreen
            matchId={isNewChatMode ? undefined : chatMatchId}
            chatRoomId={isNewChatMode ? chatMatchId : undefined}
            opponent={chatOpponent}
            onBack={handleCloseChatScreen}
          />
        </div>
      )}

      {/* Admin Panel - Full screen overlay for admin users */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-50">
          <div className="flex h-full">
            <button
              onClick={() => setShowAdminPanel(false)}
              className="absolute top-4 left-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
              data-testid="button-close-admin"
            >
              <i className="fas fa-arrow-left text-gray-600" />
            </button>
            <AdminPanel />
          </div>
        </div>
      )}
      
      {/* Post Creation Modal */}
      <PostCreateModal
        isOpen={showPostModal}
        onClose={handleClosePostModal}
        onPostCreated={handlePostCreated}
      />

      {/* Match Result Modal */}
      <MatchResultModal
        isOpen={showMatchResultModal}
        onClose={handleCloseMatchResultModal}
        match={selectedMatch}
        currentUser={appUser!}
        opponent={selectedMatch ? 
          (rankingUsers.find(u => u.id === (selectedMatch.requesterId === appUser?.id ? selectedMatch.targetId : selectedMatch.requesterId)) || 
           players.find(u => u.id === (selectedMatch.requesterId === appUser?.id ? selectedMatch.targetId : selectedMatch.requesterId)) || null) : null
        }
      />

      {/* Match Request Modal */}
      <MatchRequestModal
        isOpen={showMatchRequestModal}
        onClose={() => {
          setShowMatchRequestModal(false);
          setSelectedPlayer(null);
          setIsMatchRequesting(false);
        }}
        onConfirm={handleConfirmMatchRequest}
        targetUser={selectedPlayer}
        currentUserPoints={appUser?.points || 0}
        isLoading={isMatchRequesting}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      {/* Profile Modals */}
      <ProfileEditModal 
        isOpen={showProfileEditModal} 
        onClose={() => setShowProfileEditModal(false)} 
      />

      <MatchHistoryModal 
        isOpen={showMatchHistoryModal} 
        onClose={() => setShowMatchHistoryModal(false)} 
      />

      <PointChargeModal 
        isOpen={showPointChargeModal} 
        onClose={() => setShowPointChargeModal(false)} 
      />

      <ShopModal 
        isOpen={showShopModal} 
        onClose={() => setShowShopModal(false)} 
      />

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={showUserProfileModal} 
        onClose={handleCloseUserProfileModal}
        userId={selectedUserId}
        onStartChat={handleStartChat}
      />
    </div>
  );
}

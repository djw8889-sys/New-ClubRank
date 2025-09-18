import { useState } from "react";
import { increment } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { useFirestoreCollection, useFirestore } from "@/hooks/use-firebase";
import { User, Post, Match } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import PlayerCard from "./PlayerCard";
import BottomNavigation from "./BottomNavigation";
import LoadingSpinner from "./LoadingSpinner";
import PostCreateModal from "./PostCreateModal";
import MatchResultModal from "./MatchResultModal";

export default function MainApp() {
  const { appUser, logout } = useAuth();
  const { requestMatch, acceptMatch, rejectMatch } = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('player-tab');
  const [mainHeader, setMainHeader] = useState('매치 찾기');
  const [showPostModal, setShowPostModal] = useState(false);
  const [showMatchResultModal, setShowMatchResultModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

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
    if (!appUser) return;

    try {
      await requestMatch(appUser.id, targetId, 50);

      toast({
        title: "매칭 신청 완료",
        description: "상대방의 응답을 기다리고 있습니다. (50P 차감)",
      });
    } catch (error: any) {
      console.error("Match request error:", error);
      toast({
        title: "매칭 신청 실패",
        description: error.message || "다시 시도해주세요.",
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
        description: "경기 준비가 완료되었습니다! (50P 차감)",
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
        description: "매치 요청을 거절했습니다. (상대방에게 50P 환급)",
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

  const handleCompleteMatch = (match: Match) => {
    setSelectedMatch(match);
    setShowMatchResultModal(true);
  };

  const handleCloseMatchResultModal = () => {
    setShowMatchResultModal(false);
    setSelectedMatch(null);
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
            <h1 className="text-xl font-bold text-foreground" data-testid="text-main-header">
              {mainHeader}
            </h1>
            <span className="premium-badge">PREMIUM</span>
          </div>
          <div className="flex items-center space-x-4">
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
        {/* Player Discovery Tab */}
        <div className={`tab-content ${activeTab === 'player-tab' ? 'active' : 'hidden'}`}>
          {/* Quick Stats */}
          <div className="bg-background p-4 border-b border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary" data-testid="text-stat-nearby-players">
                  {players.length}
                </div>
                <div className="text-xs text-muted-foreground">주변 플레이어</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">0</div>
                <div className="text-xs text-muted-foreground">대기중 매칭</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{appUser.wins}</div>
                <div className="text-xs text-muted-foreground">총 승수</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 bg-background border-b border-border">
            <div className="grid grid-cols-3 gap-3">
              <select className="p-3 border border-input rounded-lg bg-background text-sm focus:ring-2 focus:ring-ring" data-testid="select-sort-filter">
                <option value="distance">거리순</option>
                <option value="ntrp">NTRP순</option>
                <option value="activity">활동순</option>
              </select>
              <select className="p-3 border border-input rounded-lg bg-background text-sm focus:ring-2 focus:ring-ring" data-testid="select-ntrp-filter">
                <option value="all">모든 NTRP</option>
                <option value="3.0">3.0</option>
                <option value="3.5">3.5</option>
                <option value="4.0">4.0</option>
              </select>
              <select className="p-3 border border-input rounded-lg bg-background text-sm focus:ring-2 focus:ring-ring" data-testid="select-time-filter">
                <option value="all">모든 시간</option>
                <option>평일 오전</option>
                <option>평일 오후</option>
                <option>주말 오전</option>
                <option>주말 오후</option>
              </select>
            </div>
          </div>

          {/* Player Cards */}
          <div className="p-4 space-y-4">
            {playersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : players.length === 0 ? (
              <p className="text-center text-muted-foreground py-8" data-testid="text-no-players">
                아직 다른 플레이어가 없어요.
              </p>
            ) : (
              players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onMatchRequest={handleMatchRequest}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat List Tab - Now showing matches */}
        <div className={`tab-content ${activeTab === 'chat-list-tab' ? 'active' : 'hidden'}`}>
          {matchesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : allMatches.length === 0 ? (
            <p className="text-center text-muted-foreground pt-10" data-testid="text-no-matches">
              아직 매치가 없습니다.<br />
              플레이어 탭에서 매치를 신청해보세요!
            </p>
          ) : (
            <div className="p-4 space-y-3">
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
                        src={opponent?.photoURL || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
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
                        <button
                          onClick={() => handleCompleteMatch(match)}
                          className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                          data-testid={`button-complete-match-${match.id}`}
                        >
                          경기 완료
                        </button>
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
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <img 
                        src={user.photoURL || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
                        alt={user.username} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground" data-testid={`text-rank-username-${index + 1}`}>
                          {user.username}
                          {user.id === appUser?.id && <span className="ml-2 text-xs text-primary font-bold">(나)</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">NTRP {user.ntrp} • {user.region}</p>
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
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
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
                          src={author?.photoURL || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
                          alt={author?.username || "Unknown"} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-foreground" data-testid={`text-post-author-${post.id}`}>
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
                        {post.authorId === appUser?.id && (
                          <button 
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            data-testid={`button-delete-post-${post.id}`}
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
                        <button className="flex items-center space-x-1 text-muted-foreground hover:text-red-500 transition-colors">
                          <i className="far fa-heart" />
                          <span className="text-sm" data-testid={`text-post-likes-${post.id}`}>{post.likes || 0}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
                          <i className="far fa-comment" />
                          <span className="text-sm">댓글</span>
                        </button>
                      </div>
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
                src={appUser.photoURL || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
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

          {/* Stats Cards */}
          <div className="p-4 grid grid-cols-2 gap-4">
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
            <button className="w-full text-left p-4 bg-background rounded-xl border border-border flex justify-between items-center hover:bg-muted transition-colors" data-testid="button-edit-profile">
              <span className="flex items-center">
                <i className="fas fa-user-edit w-6 mr-3 text-primary" />
                프로필 수정
              </span>
              <i className="fas fa-chevron-right text-muted-foreground" />
            </button>
            
            <button className="w-full text-left p-4 bg-background rounded-xl border border-border flex justify-between items-center hover:bg-muted transition-colors" data-testid="button-match-history">
              <span className="flex items-center">
                <i className="fas fa-history w-6 mr-3 text-green-600" />
                경기 기록
              </span>
              <i className="fas fa-chevron-right text-muted-foreground" />
            </button>
            
            <button className="w-full text-left p-4 bg-background rounded-xl border border-border flex justify-between items-center hover:bg-muted transition-colors" data-testid="button-charge-points">
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
            
            <button className="w-full text-left p-4 bg-background rounded-xl border border-border flex justify-between items-center hover:bg-muted transition-colors" data-testid="button-feedback">
              <span className="flex items-center">
                <i className="fas fa-lightbulb w-6 mr-3 text-blue-500" />
                서비스 개선 제안
              </span>
              <i className="fas fa-chevron-right text-muted-foreground" />
            </button>
            
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
    </div>
  );
}

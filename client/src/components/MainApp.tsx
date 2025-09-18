import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFirestoreCollection, useFirestore } from "@/hooks/use-firebase";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import PlayerCard from "./PlayerCard";
import BottomNavigation from "./BottomNavigation";
import LoadingSpinner from "./LoadingSpinner";

export default function MainApp() {
  const { appUser, logout } = useAuth();
  const { addDocument } = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('player-tab');
  const [mainHeader, setMainHeader] = useState('매치 찾기');

  // Fetch other players (excluding current user)
  const { 
    data: players, 
    loading: playersLoading 
  } = useFirestoreCollection<User>('users', [
    { field: 'id', operator: '!=', value: appUser?.id || '' }
  ]);

  const handleTabChange = (tab: string, header: string) => {
    setActiveTab(tab);
    setMainHeader(header);
  };

  const handleMatchRequest = async (targetId: string) => {
    if (!appUser) return;

    try {
      await addDocument('matches', {
        requesterId: appUser.id,
        targetId,
        status: 'pending',
        pointsCost: 50,
      });

      toast({
        title: "매칭 신청 완료",
        description: "상대방의 응답을 기다리고 있습니다.",
      });
    } catch (error) {
      console.error("Match request error:", error);
      toast({
        title: "매칭 신청 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await logout();
    }
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

        {/* Chat List Tab */}
        <div className={`tab-content ${activeTab === 'chat-list-tab' ? 'active' : 'hidden'}`}>
          <p className="text-center text-muted-foreground pt-10" data-testid="text-no-chats">
            진행중인 채팅이 없습니다.
          </p>
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
            <p className="text-center text-muted-foreground" data-testid="text-no-rankings">
              랭킹 데이터를 불러오는 중...
            </p>
          </div>
        </div>

        {/* Community Tab */}
        <div className={`tab-content ${activeTab === 'community-tab' ? 'active' : 'hidden'}`}>
          <div className="p-4 border-b border-border bg-background">
            <button className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors" data-testid="button-new-post">
              <i className="fas fa-pen mr-2" />
              새 글 작성하기
            </button>
          </div>
          <div className="p-4">
            <p className="text-center text-muted-foreground" data-testid="text-no-posts">
              커뮤니티 게시글이 없습니다.
            </p>
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
    </div>
  );
}

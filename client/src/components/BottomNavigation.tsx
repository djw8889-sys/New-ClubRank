interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string, header: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'player-tab', header: '매치 찾기', icon: 'fas fa-users', label: '매치' },
    { id: 'chat-list-tab', header: '채팅', icon: 'fas fa-comment-dots', label: '채팅' },
    { id: 'ranking-tab', header: '랭킹', icon: 'fas fa-trophy', label: '랭킹' },
    { id: 'community-tab', header: '커뮤니티', icon: 'fas fa-users', label: '커뮤니티' },
    { id: 'profile-tab', header: '프로필', icon: 'fas fa-user-circle', label: '프로필' },
  ];

  return (
    <nav className="bg-background border-t border-border grid grid-cols-5 text-center sticky bottom-0" data-testid="bottom-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id, tab.header)}
          className={`nav-btn p-3 ${
            activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
          }`}
          data-testid={`button-tab-${tab.id}`}
        >
          <div className={tab.id === 'chat-list-tab' ? 'relative' : ''}>
            <i className={`${tab.icon} text-lg`} />
            {tab.id === 'chat-list-tab' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
            )}
          </div>
          <span className="block text-xs mt-1">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

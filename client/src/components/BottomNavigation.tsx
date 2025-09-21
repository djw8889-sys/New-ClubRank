interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string, header: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'my-club-tab', header: '내 클럽', icon: '🏠', label: '내 클럽' },
    { id: 'individual-matching-tab', header: '현재 접속 중인 플레이어', icon: '🎾', label: '개인 매칭' },
    { id: 'club-search-tab', header: '클럽 찾기', icon: '🛡️', label: '클럽 찾기' },
    { id: 'club-ranking-tab', header: '클럽 랭킹', icon: '🏆', label: '클럽 랭킹' },
    { id: 'my-info-tab', header: '내 정보', icon: '👤', label: '내 정보' },
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
          <div className="flex justify-center items-center">
            <span className="text-lg">{tab.icon}</span>
          </div>
          <span className="block text-xs mt-1">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

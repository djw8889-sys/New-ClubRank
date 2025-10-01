import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useClubs } from "@/hooks/use-clubs";
import { User, Club, ClubMembership } from "@shared/schema";
import { Toaster } from "@/components/ui/toaster";
import BottomNavigation from "./BottomNavigation";
import MyClubTabContent from "./MyClubTabContent";
import SplashScreen from "./SplashScreen";
import ProfileSetupScreen from "./ProfileSetupScreen";
import LoginScreen from "./LoginScreen";
import PostCreateModal from "./PostCreateModal";
import UserProfileModal from "./UserProfileModal";
import MatchRequestModal from "./MatchRequestModal";
import MatchResultModal from "./MatchResultModal";
import MatchHistoryModal from "./MatchHistoryModal";
import ClubCreationModal from "./ClubCreationModal";
import ClubSearchModal from "./ClubSearchModal";
import ClubManagementModal from "./ClubManagementModal";
import ClubAnalyticsModal from "./ClubAnalyticsModal";
import BracketGeneratorModal from "./BracketGeneratorModal";
import PointChargeModal from "./PointChargeModal";
import ShopModal from "./ShopModal";
import FeedbackModal from "./FeedbackModal";

export default function MainApp() {
  const { user, profile, updateProfile, isProfileNew, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("club");
  const { data: myClubMemberships, isLoading: clubsLoading } = useClubs();

  // Modal states
  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [matchRequestUser, setMatchRequestUser] = useState<User | null>(null);
  const [matchResultId, setMatchResultId] = useState<number | null>(null);
  const [matchHistoryUserId, setMatchHistoryUserId] = useState<string | null>(null);
  const [isClubCreationModalOpen, setClubCreationModalOpen] = useState(false);
  const [isClubSearchModalOpen, setClubSearchModalOpen] = useState(false);
  const [selectedClubForManagement, setSelectedClubForManagement] = useState<ClubMembership | null>(null);
  const [selectedClubForAnalytics, setSelectedClubForAnalytics] = useState<Club | null>(null);
  const [selectedClubForBracket, setSelectedClubForBracket] = useState<Club | null>(null);
  const [isPointChargeModalOpen, setPointChargeModalOpen] = useState(false);
  const [isShopModalOpen, setShopModalOpen] = useState(false);
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);

  if (loading) {
    return <SplashScreen onComplete={() => {}} />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (!profile) {
    return <SplashScreen onComplete={() => {}} />;
  }

  if (isProfileNew) {
    return <ProfileSetupScreen onComplete={() => { /* updateProfile is not a function */ }} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="flex-1 overflow-y-auto pb-16">
        {activeTab === 'club' && myClubMemberships && (
            <MyClubTabContent
                myClubMemberships={myClubMemberships}
                isLoading={clubsLoading}
                onManageClub={(membership) => setSelectedClubForManagement(membership)}
            />
        )}
      </main>
      
      <PostCreateModal
        isOpen={isPostModalOpen}
        onClose={() => setPostModalOpen(false)}
        onPostCreated={() => {}}
      />
      {selectedUser && (
        <UserProfileModal
          userId={selectedUser.id}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          onStartChat={() => {}}
        />
      )}
      {matchRequestUser && profile && (
        <MatchRequestModal
          isOpen={!!matchRequestUser}
          onClose={() => setMatchRequestUser(null)}
          onConfirm={() => {}}
          targetUser={matchRequestUser}
          currentUserPoints={profile.points ?? 0}
          isLoading={false}
        />
      )}
      {matchResultId && user && profile && (
        <MatchResultModal
          isOpen={!!matchResultId}
          onClose={() => setMatchResultId(null)}
          match={{
            id: matchResultId,
            createdAt: new Date(),
            location: null,
            clubId: null,
            player1Id: user.uid,
            player2Id: "",
            result: null,
            eloChange: null,
            status: "completed",
            scheduledAt: null,
          }}
          currentUser={profile}
          opponent={null}
        />
      )}
       {matchHistoryUserId && (
        <MatchHistoryModal
          isOpen={!!matchHistoryUserId}
          onClose={() => setMatchHistoryUserId(null)}
        />
      )}
      <ClubCreationModal
        isOpen={isClubCreationModalOpen}
        onClose={() => setClubCreationModalOpen(false)}
      />
      <ClubSearchModal
        isOpen={isClubSearchModalOpen}
        onClose={() => setClubSearchModalOpen(false)}
      />
      {selectedClubForManagement && (
        <ClubManagementModal
          isOpen={!!selectedClubForManagement}
          membership={selectedClubForManagement}
          onClose={() => setSelectedClubForManagement(null)}
        />
      )}
      {selectedClubForAnalytics && (
         <ClubAnalyticsModal
          isOpen={!!selectedClubForAnalytics}
          clubId={selectedClubForAnalytics.id}
          clubName={selectedClubForAnalytics.name}
          members={[]}
          onClose={() => setSelectedClubForAnalytics(null)}
        />
      )}
      {selectedClubForBracket && (
        <BracketGeneratorModal
          isOpen={!!selectedClubForBracket}
          clubId={selectedClubForBracket.id}
          members={[]}
          onClose={() => setSelectedClubForBracket(null)}
        />
      )}
       <PointChargeModal
        isOpen={isPointChargeModalOpen}
        onClose={() => setPointChargeModalOpen(false)}
      />
      <ShopModal isOpen={isShopModalOpen} onClose={() => setShopModalOpen(false)} />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />

      <footer className="fixed bottom-0 left-0 right-0">
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </footer>
      <Toaster />
    </div>
  );
}
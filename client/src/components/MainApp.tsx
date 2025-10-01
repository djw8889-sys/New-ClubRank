import { useState, Dispatch, SetStateAction } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useClubs } from "@/hooks/use-clubs";
import { useOnlineUsers } from "@/hooks/use-online-users";

import { User, Club, Match, ClubMember, Post, Comment } from "@shared/schema";
import { getTierInfo } from "@/utils/tierCalculator";
import { getAvatarSrc } from "@/utils/avatar";

import { Toaster } from "@/components/ui/toaster";
import BottomNavigation from "./BottomNavigation";
import MyClubTabContent from "./MyClubTabContent";
import SplashScreen from "./SplashScreen";
import ProfileSetupScreen from "./ProfileSetupScreen";
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
  const { user, profile, updateProfile, isProfileNew } = useAuth();
  const [activeTab, setActiveTab] = useState("club");

  const { data: myClubMemberships, isLoading: clubsLoading } = useClubs();

  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [matchRequestUser, setMatchRequestUser] = useState<User | null>(null);
  const [matchResultId, setMatchResultId] = useState<number | null>(null);
  const [matchHistoryUserId, setMatchHistoryUserId] = useState<string | null>(null);
  const [isClubCreationModalOpen, setClubCreationModalOpen] = useState(false);
  const [isClubSearchModalOpen, setClubSearchModalOpen] = useState(false);
  const [selectedClubForManagement, setSelectedClubForManagement] = useState<Club | null>(null);
  const [selectedClubForAnalytics, setSelectedClubForAnalytics] = useState<Club | null>(null);
  const [selectedClubForBracket, setSelectedClubForBracket] = useState<Club | null>(null);
  const [isPointChargeModalOpen, setPointChargeModalOpen] = useState(false);
  const [isShopModalOpen, setShopModalOpen] = useState(false);
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);

  if (!user || !profile) {
    return <SplashScreen onComplete={() => {}} />;
  }

  if (isProfileNew) {
    return <ProfileSetupScreen onComplete={() => updateProfile(profile)} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="flex-1 overflow-y-auto pb-16">
        <MyClubTabContent
          myClubMemberships={myClubMemberships}
          isLoading={clubsLoading}
          onManageClub={(club) => setSelectedClubForManagement(club)}
        />
      </main>
      
      {/* Modals */}
      <PostCreateModal
        isOpen={isPostModalOpen}
        onClose={() => setPostModalOpen(false)}
        onPostCreated={() => setPostModalOpen(false)}
      />
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          onMatchRequest={(targetUser) => setMatchRequestUser(targetUser)}
        />
      )}
      {matchRequestUser && profile && (
        <MatchRequestModal
          isOpen={!!matchRequestUser}
          onClose={() => setMatchRequestUser(null)}
          onConfirm={() => {}}
          targetUser={matchRequestUser}
          currentUserPoints={profile.elo ?? 1200}
          isLoading={false}
        />
      )}
      {matchResultId && (
        <MatchResultModal
          isOpen={!!matchResultId}
          onClose={() => setMatchResultId(null)}
          matchId={matchResultId}
        />
      )}
      {matchHistoryUserId && (
        <MatchHistoryModal
          isOpen={!!matchHistoryUserId}
          onClose={() => setMatchHistoryUserId(null)}
          userId={matchHistoryUserId}
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
          club={selectedClubForManagement}
          onClose={() => setSelectedClubForManagement(null)}
        />
      )}
      {selectedClubForAnalytics && (
        <ClubAnalyticsModal
          isOpen={!!selectedClubForAnalytics}
          club={selectedClubForAnalytics}
          onClose={() => setSelectedClubForAnalytics(null)}
        />
      )}
      {selectedClubForBracket && (
        <BracketGeneratorModal
          isOpen={!!selectedClubForBracket}
          club={selectedClubForBracket}
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
        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </footer>
      <Toaster />
    </div>
  );
}


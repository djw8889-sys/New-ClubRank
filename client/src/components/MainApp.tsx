import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
// import { increment } from "firebase/firestore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useClubs } from "@/hooks/use-clubs";
import { useOnlineUsers } from "@/hooks/use-online-users";
import { useGeolocation } from "@/hooks/use-geolocation";

import { User, Club, Match, ClubMember, Post, Comment } from "@shared/schema";
import {
  getTierInfo,
  // getTierProgress,
} from "@/utils/tierCalculator";
import { useToast } from "@/hooks/use-toast";
// import PlayerCard from "@/components/PlayerCard";
import SplashScreen from "@/components/SplashScreen";
import LoginScreen from "@/components/LoginScreen";
import ProfileSetupScreen from "@/components/ProfileSetupScreen";
import BottomNavigation from "@/components/BottomNavigation";
import ClubDashboard from "@/components/ClubDashboard";
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
import AdminPanel from "./AdminPanel";
import PointChargeModal from "./PointChargeModal";
import ShopModal from "./ShopModal";
import FeedbackModal from "./FeedbackModal";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { MessageCircle, Star, ThumbsUp } from "lucide-react";

export default function MainApp() {
  const {
    user,
    profile,
    loading: authLoading,
    updateProfile,
    isProfileNew,
  } = useAuth();
  const { onlineUsers } = useOnlineUsers();
  // const presenceUsers = usePresence(); // This was unused
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // const [location, setLocation] = useGeolocation(); // This was unused
  const {
    myClubMemberships,
    isLoading: clubsLoading,
    // error: clubsError,
  } = useClubs();

  const [activeTab, setActiveTab] = useState("home");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isMatchRequestModalOpen, setMatchRequestModalOpen] = useState(false);
  const [isMatchResultModalOpen, setMatchResultModalOpen] = useState(false);
  const [isMatchHistoryModalOpen, setMatchHistoryModalOpen] = useState(false);
  const [isClubCreateModalOpen, setClubCreateModalOpen] = useState(false);
  const [isClubSearchModalOpen, setClubSearchModalOpen] = useState(false);
  const [isClubManagementModalOpen, setClubManagementModalOpen] =
    useState(false);
  const [isClubAnalyticsModalOpen, setClubAnalyticsModalOpen] =
    useState(false);
  const [isBracketModalOpen, setBracketModalOpen] = useState(false);
  const [isAdminPanelOpen, setAdminPanelOpen] = useState(false);
  const [isPointChargeModalOpen, setPointChargeModalOpen] = useState(false);
  const [isShopModalOpen, setShopModalOpen] = useState(false);
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const [selectedUserForProfile, setSelectedUserForProfile] =
    useState<User | null>(null);
  const [selectedClubForManagement, setSelectedClubForManagement] =
    useState<Club | null>(null);
  const [selectedClubForAnalytics, setSelectedClubForAnalytics] =
    useState<Club | null>(null);
  const [selectedClubForBracket, setSelectedClubForBracket] =
    useState<Club | null>(null);

  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const { data: players, isLoading: playersLoading } = useQuery<any[]>({
    queryKey: ["players"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch players");
      return res.json();
    },
  });

  const { data: rankings } = useQuery<any[]>({
    queryKey: ["rankings"],
    queryFn: async () => {
      const res = await fetch("/api/rankings");
      if (!res.ok) throw new Error("Failed to fetch rankings");
      return res.json();
    },
  });

  const { data: matches } = useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: async () => {
      const res = await fetch("/api/matches");
      if (!res.ok) throw new Error("Failed to fetch matches");
      return res.json();
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to like post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: string;
      content: string;
    }) => {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProfileView = (user: User) => {
    setSelectedUserForProfile(user);
    setProfileModalOpen(true);
  };

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
  };

  const handleCommentSubmit = (postId: string, content: string) => {
    if (content.trim()) {
      commentMutation.mutate({ postId, content });
    }
  };

  const MemoizedClubDashboard = useMemo(
    () => <ClubDashboard onManageClub={setSelectedClubForManagement} />,
    []
  );

  const matchStatusMap: { [key: string]: string } = {
    pending: "Pending",
    accepted: "Accepted",
    completed: "Completed",
    rejected: "Rejected",
  };

  const matchStatusColor: { [key: string]: string } = {
    pending: "bg-yellow-500",
    accepted: "bg-blue-500",
    completed: "bg-green-500",
    rejected: "bg-red-500",
  };

  if (authLoading) {
    return <SplashScreen />;
  }
  if (!user) {
    return <LoginScreen />;
  }
  if (isProfileNew || !profile?.displayName || !profile?.ntrp) {
    return <ProfileSetupScreen />;
  }

  const { tier, nextTier } = getTierInfo(profile.elo ?? 1500);

  const HomeFeed = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {profile.displayName}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your current ELO: {profile.elo ?? 1500}</p>
          <p>
            Your tier: {tier} ({nextTier ? `Next: ${nextTier}` : "Max Tier"})
          </p>
        </CardContent>
      </Card>
      <Button onClick={() => setPostModalOpen(true)} className="w-full">
        Create Post
      </Button>

      {postsLoading ? (
        <p>Loading posts...</p>
      ) : (
        posts?.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Avatar
                  onClick={() =>
                    handleProfileView(post.author as unknown as User)
                  }
                >
                  <AvatarImage src={post.author?.photoURL ?? undefined} />
                  <AvatarFallback>
                    {post.author?.displayName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">{post.author?.displayName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt!).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p>{post.content}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Button variant="ghost" onClick={() => handleLike(post.id!)}>
                  <ThumbsUp className="mr-2 h-4 w-4" />{" "}
                  {post.likes?.length || 0}
                </Button>
                <Button variant="ghost" onClick={() => setSelectedPost(post)}>
                  <MessageCircle className="mr-2 h-4 w-4" />{" "}
                  {post.comments?.length || 0}
                </Button>
              </div>
              {selectedPost?.id === post.id && (
                <div className="mt-4">
                  {post.comments?.map((comment: any) => (
                    <div key={comment.id} className="flex items-start space-x-2 mt-2">
                       <Avatar
                         onClick={() =>
                           handleProfileView(comment.author as unknown as User)
                         }
                       >
                         <AvatarImage src={comment.author?.photoURL ?? undefined} />
                         <AvatarFallback>
                           {comment.author?.displayName?.charAt(0)}
                         </AvatarFallback>
                       </Avatar>
                       <div>
                         <p>
                           <span className="font-bold">
                             {comment.author?.displayName}
                           </span>
                           : {comment.content}
                         </p>
                       </div>
                     </div>
                  ))}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const target = e.target as typeof e.target & {
                        comment: { value: string };
                      };
                      handleCommentSubmit(post.id!, target.comment.value);
                      target.comment.value = "";
                    }}
                    className="flex mt-2"
                  >
                    <input
                      name="comment"
                      placeholder="Add a comment..."
                      className="flex-grow border rounded p-1"
                    />
                    <Button type="submit" size="sm" className="ml-2">
                      Post
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col">
      {/* Modals */}
      {isPostModalOpen && (
        <PostCreateModal onClose={() => setPostModalOpen(false)} />
      )}
      {isProfileModalOpen && selectedUserForProfile && (
        <UserProfileModal
          user={selectedUserForProfile}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
      {isMatchRequestModalOpen && (
        <MatchRequestModal onClose={() => setMatchRequestModalOpen(false)} />
      )}
      {isMatchResultModalOpen && (
        <MatchResultModal
          onClose={() => setMatchResultModalOpen(false)}
          matchId={""}
        />
      )}
      {isMatchHistoryModalOpen && (
        <MatchHistoryModal
          onClose={() => setMatchHistoryModalOpen(false)}
          userId={user.uid}
        />
      )}
      {isClubCreateModalOpen && (
        <ClubCreationModal onClose={() => setClubCreateModalOpen(false)} />
      )}
      {isClubSearchModalOpen && (
        <ClubSearchModal onClose={() => setClubSearchModalOpen(false)} />
      )}
      {isClubManagementModalOpen && selectedClubForManagement && (
        <ClubManagementModal
          club={selectedClubForManagement}
          onClose={() => setClubManagementModalOpen(false)}
        />
      )}
      {isClubAnalyticsModalOpen && selectedClubForAnalytics && (
        <ClubAnalyticsModal
          club={selectedClubForAnalytics}
          onClose={() => setClubAnalyticsModalOpen(false)}
        />
      )}
      {isBracketModalOpen && selectedClubForBracket && (
        <BracketGeneratorModal
          club={selectedClubForBracket}
          onClose={() => setBracketModalOpen(false)}
        />
      )}
      {isAdminPanelOpen && <AdminPanel onClose={() => setAdminPanelOpen(false)} />}
      {isPointChargeModalOpen && (
        <PointChargeModal onClose={() => setPointChargeModalOpen(false)} />
      )}
      {isShopModalOpen && <ShopModal onClose={() => setShopModalOpen(false)} />}
      {isFeedbackModalOpen && (
        <FeedbackModal onClose={() => setFeedbackModalOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-grow overflow-auto p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="home">
            <HomeFeed />
          </TabsContent>
          <TabsContent value="players">
            {playersLoading ? (
              <p>Loading players...</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {players?.map((p: any) => (
                  <Card key={p.id} onClick={() => handleProfileView(p)}>
                    <CardContent className="flex flex-col items-center p-4">
                      <Avatar>
                        <AvatarImage src={p.photoURL} />
                        <AvatarFallback>{p.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="font-bold mt-2">{p.displayName}</p>
                      <p className="text-sm text-gray-500">ELO: {p.elo}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="rankings">
            <Card>
              <CardHeader>
                <CardTitle>Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                {rankings?.map((r, index) => (
                  <div key={r.user.id} className="flex items-center justify-between p-2">
                    <div className="flex items-center space-x-2">
                      <span>{index + 1}</span>
                      <Avatar>
                        <AvatarImage src={r.user.photoURL} />
                        <AvatarFallback>{r.user.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{r.user.displayName}</span>
                    </div>
                    <span>{r.ranking.elo}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="clubs">{MemoizedClubDashboard}</TabsContent>
          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle>My Matches</CardTitle>
              </CardHeader>
              <CardContent>
                {matches
                  ?.filter(
                    (m) =>
                      m.player1Id === user.uid || m.player2Id === user.uid
                  )
                  .map((match) => (
                    <div key={match.id} className="p-2 border-b">
                      <p>
                        vs{" "}
                        {match.player1Id === user.uid
                          ? match.player2?.displayName
                          : match.player1?.displayName}
                      </p>
                      <Badge
                        className={
                          matchStatusColor[match.status as keyof typeof matchStatusColor]
                        }
                      >
                        {matchStatusMap[match.status as keyof typeof matchStatusMap]}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

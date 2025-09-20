import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import SplashScreen from "@/components/SplashScreen";
import LoginScreen from "@/components/LoginScreen";
import ProfileSetupScreen from "@/components/ProfileSetupScreen";
import MainApp from "@/components/MainApp";
import ChatScreen from "@/components/ChatScreen";
import LoadingSpinner from "@/components/LoadingSpinner";

type ViewState = 'splash' | 'login' | 'profile-setup' | 'main' | 'chat';

export default function Home() {
  const { user, appUser, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('splash');

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setCurrentView('login');
    } else if (!appUser || appUser.isProfileComplete === false) {
      setCurrentView('profile-setup');
    } else {
      setCurrentView('main');
    }
  }, [user, appUser, loading]);

  const handleSplashComplete = () => {
    if (!user) {
      setCurrentView('login');
    } else if (!appUser || appUser.isProfileComplete === false) {
      setCurrentView('profile-setup');
    } else {
      setCurrentView('main');
    }
  };

  const handleProfileComplete = () => {
    setCurrentView('main');
  };

  const handleChatOpen = () => {
    setCurrentView('chat');
  };

  const handleChatBack = () => {
    setCurrentView('main');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md min-h-screen bg-background shadow-2xl flex flex-col relative">
      {currentView === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      
      {currentView === 'login' && <LoginScreen />}
      
      {currentView === 'profile-setup' && (
        <ProfileSetupScreen onComplete={handleProfileComplete} />
      )}
      
      {currentView === 'main' && <MainApp />}
      
      {currentView === 'chat' && (
        <ChatScreen onBack={handleChatBack} />
      )}
    </div>
  );
}

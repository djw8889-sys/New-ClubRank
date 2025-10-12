import { useAuth } from "@/hooks/use-auth";
import MainApp from "@/components/MainApp";
import LoginScreen from "@/components/LoginScreen";
import SplashScreen from "@/components/SplashScreen";

export default function Home() {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return <SplashScreen onComplete={() => {}} />;
  }

  if (!user || !profile) {
    return <LoginScreen />;
  }

  return <MainApp />;
}


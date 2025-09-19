import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import MatchPointLogo from "./MatchPointLogo";
import FirebaseSetupGuide from "./FirebaseSetupGuide";

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Show user-friendly error message
      let errorMessage = "로그인에 실패했습니다. 다시 시도해주세요.";
      
      if (error?.code === 'auth/unauthorized-domain') {
        errorMessage = "현재 도메인이 승인되지 않았습니다. Firebase 콘솔에서 도메인을 추가해야 합니다.";
      } else if (error?.code === 'auth/operation-not-allowed') {
        errorMessage = "Google 로그인이 비활성화되어 있습니다. Firebase 콘솔에서 Google 인증 제공업체를 활성화해주세요.";
      } else if (error?.code === 'auth/popup-blocked') {
        errorMessage = "팝업이 차단되었습니다. 브라우저 설정을 확인하거나 페이지를 새로고침해주세요.";
      } else if (error?.code === 'auth/popup-closed-by-user') {
        errorMessage = "로그인이 취소되었습니다. 다시 시도해주세요.";
      } else if (error?.code === 'auth/cancelled-popup-request') {
        errorMessage = "다른 로그인 팝업이 이미 열려있습니다. 잠시 후 다시 시도해주세요.";
      } else if (error?.code === 'auth/network-request-failed') {
        errorMessage = "네트워크 연결을 확인해주세요.";
      }
      
      toast({
        title: "로그인 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-white" data-testid="login-screen">
      {/* Hero section with logo */}
      <div className="h-1/2 bg-gradient-to-br from-green-500 to-green-600 relative flex flex-col items-center justify-center">
        <div className="text-center text-white">
          <MatchPointLogo size="xl" variant="white" className="mx-auto mb-6 bg-white/20" />
          <h1 className="text-4xl font-bold mb-2">Match Point</h1>
          <p className="text-green-100 text-lg">당신의 테니스 파트너를 찾아보세요</p>
        </div>
      </div>
      
      <div className="flex-1 p-6 flex flex-col justify-center bg-white">
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 text-gray-600">
            <i className="fas fa-users text-green-600" />
            <span className="text-sm">1:1 개인 매칭 시스템</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600">
            <i className="fas fa-map-marker-alt text-green-600" />
            <span className="text-sm">지역별 파트너 찾기</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600">
            <i className="fas fa-trophy text-green-600" />
            <span className="text-sm">랭킹 & 포인트 시스템</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            data-testid="button-google-login"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
            ) : (
              <i className="fab fa-google mr-3" />
            )}
            {loading ? "로그인 중..." : "구글로 시작하기"}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-6 text-center leading-relaxed">
          서비스 이용을 위해 개인정보 처리방침과<br />
          이용약관에 동의가 필요합니다.
        </p>
        
        <FirebaseSetupGuide />
      </div>
    </div>
  );
}

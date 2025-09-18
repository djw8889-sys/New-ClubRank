import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleKakaoLogin = () => {
    alert('카카오 로그인은 Firebase 콘솔에서 추가 설정이 필요합니다.');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" data-testid="login-screen">
      {/* Hero image with tennis court */}
      <div 
        className="h-1/2 bg-cover bg-center relative" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-8 left-6 text-white">
          <h1 className="text-4xl font-bold mb-2">🎾 Match Point</h1>
          <p className="text-emerald-200 text-lg">당신의 테니스 파트너를 찾아보세요</p>
        </div>
      </div>
      
      <div className="flex-1 p-6 flex flex-col justify-center bg-gradient-to-b from-background to-muted">
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 text-muted-foreground">
            <i className="fas fa-users text-primary" />
            <span className="text-sm">1:1 개인 매칭 시스템</span>
          </div>
          <div className="flex items-center space-x-3 text-muted-foreground">
            <i className="fas fa-map-marker-alt text-primary" />
            <span className="text-sm">지역별 파트너 찾기</span>
          </div>
          <div className="flex items-center space-x-3 text-muted-foreground">
            <i className="fas fa-trophy text-primary" />
            <span className="text-sm">랭킹 & 포인트 시스템</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleGoogleLogin}
            className="w-full bg-white border-2 border-border text-foreground font-semibold py-4 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            data-testid="button-google-login"
          >
            <i className="fab fa-google mr-3 text-red-500" />
            구글로 시작하기
          </Button>
          <Button 
            onClick={handleKakaoLogin}
            className="w-full bg-accent text-accent-foreground font-semibold py-4 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            data-testid="button-kakao-login"
          >
            <i className="fas fa-comment mr-3" />
            카카오로 시작하기
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-6 text-center leading-relaxed">
          서비스 이용을 위해 개인정보 처리방침과<br />
          이용약관에 동의가 필요합니다.
        </p>
      </div>
    </div>
  );
}

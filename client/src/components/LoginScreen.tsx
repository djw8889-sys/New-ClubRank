import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  return (
    <div className="flex items-center justify-center h-screen">
      <Button onClick={signInWithGoogle}>Sign in with Google</Button>
    </div>
  );
}
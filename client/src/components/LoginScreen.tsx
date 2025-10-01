import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to ClubRank</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Sign in to continue
        </p>
        <Button onClick={signInWithGoogle} size="lg">
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}


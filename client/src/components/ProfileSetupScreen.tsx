import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@shared/schema";

interface ProfileSetupScreenProps {
  onComplete: (newProfile: Partial<User>) => void;
}

export default function ProfileSetupScreen({ onComplete }: ProfileSetupScreenProps) {
  const { profile } = useAuth();
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");

  const handleComplete = () => {
    if (profile) {
      const newProfileData = { ...profile, username, bio };
      onComplete(newProfileData);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">프로필 설정</h1>
        <Input
          placeholder="사용자 이름"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Textarea
          placeholder="자기소개"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <Button onClick={handleComplete} className="w-full">
          완료
        </Button>
      </div>
    </div>
  );
}
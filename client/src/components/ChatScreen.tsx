import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useChatMessages, useSendMessage } from "@/hooks/use-chat";
import { User, Chat, Message } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAvatarSrc } from "@/utils/avatar";

interface ChatScreenProps {
  chatId: string;
}

export default function ChatScreen({ chatId }: ChatScreenProps) {
  const { profile } = useAuth();
  const { data: messages } = useChatMessages(chatId);
  const sendMessageMutation = useSendMessage();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!profile || !newMessage.trim()) return;
    sendMessageMutation.mutate({
      chatId,
      senderId: profile.id,
      content: newMessage,
    });
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === profile?.id ? 'justify-end' : 'justify-start'}`}>
            {msg.senderId !== profile?.id && (
              <img src={getAvatarSrc({})} alt="sender" className="w-8 h-8 rounded-full" />
            )}
            <div className={`rounded-lg px-4 py-2 ${msg.senderId === profile?.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t flex gap-2">
        <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="메시지 입력..." onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
        <Button onClick={handleSendMessage}>전송</Button>
      </div>
    </div>
  );
}
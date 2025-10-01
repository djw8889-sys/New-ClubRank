import { useState, useRef, useEffect, FormEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChatMessages, useChat } from '@/hooks/use-chat'; // useChatMessages 추가
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAvatarSrc } from '@/utils/avatar';
import { Message } from '@shared/schema';

interface ChatScreenProps {
  chatId: string;
}

export default function ChatScreen({ chatId }: ChatScreenProps) {
  const { user } = useAuth();
  // useChatMessages 훅으로 메시지 목록을 가져옵니다.
  const { messages, loading } = useChatMessages(chatId);
  // sendMessage 함수는 useChat 훅에서 가져옵니다.
  const { sendMessage } = useChat(); 
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chatId) return;
    try {
        await sendMessage(chatId, newMessage.trim());
        setNewMessage('');
    } catch (error) {
        console.error("Failed to send message:", error);
        // 사용자에게 에러 알림 (예: toast)
    }
  };

  if (loading) return <div className="p-4 text-center">Loading messages...</div>;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg: Message) => (
          <div key={msg.id} className={`flex items-end gap-2.5 ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
            {msg.senderId !== user?.uid && (
                <img className="w-8 h-8 rounded-full" src={getAvatarSrc({ avatarUrl: null, email: msg.senderId })} alt="avatar" />
            )}
            <div className={`flex flex-col gap-1 w-full max-w-[320px] ${msg.senderId === user?.uid ? 'items-end' : 'items-start'}`}>
               <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-sm font-semibold text-foreground">{msg.senderId === user?.uid ? 'You' : 'Sender'}</span>
                  <span className="text-xs font-normal text-muted-foreground">{new Date(msg.createdAt).toLocaleTimeString()}</span>
               </div>
               <div className={`leading-1.5 p-3 rounded-xl ${
                   msg.senderId === user?.uid 
                   ? 'bg-primary text-primary-foreground rounded-br-none' 
                   : 'bg-muted text-muted-foreground rounded-bl-none'
                }`}>
                  <p className="text-sm font-normal">{msg.content}</p>
               </div>
            </div>
            {msg.senderId === user?.uid && (
                <img className="w-8 h-8 rounded-full" src={getAvatarSrc({ avatarUrl: user?.photoURL, email: user?.email })} alt="avatar" />
            )}
         </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          className="flex-1"
          autoComplete="off"
        />
        <Button type="submit" disabled={!newMessage.trim()}>Send</Button>
      </form>
    </div>
  );
}
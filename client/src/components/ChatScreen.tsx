import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAvatarSrc } from '@/utils/avatar';
import { Message } from '@shared/schema'; // 실제 Message 타입을 schema에서 가져옵니다.

interface ChatScreenProps {
  chatId: string;
}

export default function ChatScreen({ chatId }: ChatScreenProps) {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useChat(chatId);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    await sendMessage(chatId, newMessage.trim());
    setNewMessage('');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg: Message, index: number) => (
          <div key={index} className={`flex items-start gap-2.5 ${msg.senderId === user?.uid ? 'justify-end' : ''}`}>
             <img className="w-8 h-8 rounded-full" src={getAvatarSrc(null, {email: msg.senderId || undefined})} alt="avatar" />
            <div className="flex flex-col gap-1">
               <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{msg.senderId}</span>
               </div>
               <div className="flex flex-col leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                  <p className="text-sm font-normal text-gray-900 dark:text-white">{msg.content}</p>
               </div>
            </div>
         </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          className="flex-1"
        />
        <Button type="submit" className="ml-2">Send</Button>
      </form>
    </div>
  );
}
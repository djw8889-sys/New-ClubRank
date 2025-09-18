import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatScreenProps {
  onBack: () => void;
}

export default function ChatScreen({ onBack }: ChatScreenProps) {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // TODO: Implement real chat functionality
    setMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="chat-screen">
      {/* Chat Header */}
      <header className="bg-background border-b border-border p-4 flex items-center space-x-3">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground" data-testid="button-chat-back">
          <i className="fas fa-arrow-left text-lg" />
        </Button>
        <img 
          src="https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80" 
          alt="Chat partner" 
          className="w-10 h-10 rounded-full object-cover"
          data-testid="img-chat-partner"
        />
        <div className="flex-1">
          <h2 className="font-semibold text-foreground" data-testid="text-chat-partner-name">김테니스</h2>
          <p className="text-xs text-green-600">온라인</p>
        </div>
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground" data-testid="button-chat-menu">
          <i className="fas fa-ellipsis-v" />
        </Button>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted">
        <div className="flex justify-end">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-sm max-w-xs chat-bubble-animation" data-testid="message-sent">
            안녕하세요! 내일 오전 매칭 가능하신가요?
          </div>
        </div>
        
        <div className="flex justify-start">
          <div className="bg-background border border-border px-4 py-2 rounded-2xl rounded-bl-sm max-w-xs chat-bubble-animation" data-testid="message-received">
            네! 몇 시쯤 어떠세요?
          </div>
        </div>
      </main>

      {/* Chat Input */}
      <div className="bg-background border-t border-border p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="메시지를 입력하세요..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full p-3 border border-input rounded-full bg-muted focus:ring-2 focus:ring-ring focus:border-transparent pr-12"
              data-testid="input-chat-message"
            />
            <Button variant="ghost" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground" data-testid="button-chat-attach">
              <i className="fas fa-paperclip" />
            </Button>
          </div>
          <Button 
            onClick={handleSendMessage}
            className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-colors"
            data-testid="button-send-message"
          >
            <i className="fas fa-paper-plane" />
          </Button>
        </div>
      </div>
    </div>
  );
}

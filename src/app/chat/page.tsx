
'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import { useSessions } from '@/context/session-context';
import type { Session, Message, User } from '@/lib/types';
import { currentUser } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const ChatPage: NextPage = () => {
  const { sessions, addMessage } = useSessions();
  const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const mySessions = React.useMemo(() => 
    sessions.filter(session => 
      session.players.some(p => p.id === currentUser.id)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [sessions]
  );
  
  React.useEffect(() => {
    if (!selectedSessionId && mySessions.length > 0) {
      setSelectedSessionId(mySessions[0].id);
    }
  }, [mySessions, selectedSessionId]);

  const selectedSession = React.useMemo(() => 
    mySessions.find(s => s.id === selectedSessionId),
    [mySessions, selectedSessionId]
  );

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setIsSheetOpen(false); // Close sheet on mobile after selection
  }

  return (
    <Card className="flex h-[calc(100vh-10rem)] w-full overflow-hidden">
      <SessionList
        sessions={mySessions}
        selectedSessionId={selectedSessionId}
        onSelectSession={handleSelectSession}
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
      />
      <ChatWindow 
        session={selectedSession} 
        onAddMessage={addMessage} 
        currentUser={currentUser}
        onOpenSheet={() => setIsSheetOpen(true)}
      />
    </Card>
  );
};

const SessionList = ({ sessions, selectedSessionId, onSelectSession, isSheetOpen, setIsSheetOpen }: {
  sessions: Session[],
  selectedSessionId: string | null,
  onSelectSession: (id: string) => void,
  isSheetOpen: boolean,
  setIsSheetOpen: (isOpen: boolean) => void,
}) => {
  const isMobile = useIsMobile();

  const sessionListContent = (
    <div className={cn("flex flex-col", isMobile ? "h-full" : "h-full border-r")}>
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold font-headline flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            Session Chats
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                'w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3',
                selectedSessionId === session.id
                  ? 'bg-muted'
                  : 'hover:bg-muted/50'
              )}
            >
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={session.imageUrl} alt={session.level} data-ai-hint="volleyball session" />
                <AvatarFallback>{session.level.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate">
                 <p className="font-semibold">{session.level} Session</p>
                 <p className="text-sm text-muted-foreground truncate">{new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric'})}</p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  if (isMobile) {
    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side="left" className="p-0 w-80">
                <SheetTitle className="sr-only">Session Chats</SheetTitle>
                {sessionListContent}
            </SheetContent>
        </Sheet>
    );
  }

  return <div className="w-1/3 xl:w-1/4 hidden md:block">{sessionListContent}</div>;
};

const ChatWindow = ({ session, onAddMessage, currentUser, onOpenSheet }: {
  session: Session | undefined,
  onAddMessage: (sessionId: string, message: Message) => void,
  currentUser: User,
  onOpenSheet: () => void,
}) => {
  const [newMessage, setNewMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && session) {
      const message: Message = {
        id: `m${Date.now()}`,
        sender: currentUser,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };
      onAddMessage(session.id, message);
      setNewMessage('');
    }
  };

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-muted/20">
         <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
         <h3 className="text-xl font-semibold text-muted-foreground">Select a chat</h3>
         <p className="text-muted-foreground">Choose one of your sessions to see the conversation.</p>
         {isMobile && <Button onClick={onOpenSheet} className="mt-4">Select Session</Button>}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      <header className="flex items-center gap-4 p-4 border-b">
        {isMobile && (
            <Button variant="outline" size="icon" onClick={onOpenSheet}>
                <MessageCircle className="h-5 w-5"/>
            </Button>
        )}
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={session.imageUrl} alt={session.level} data-ai-hint="volleyball session"/>
          <AvatarFallback>{session.level.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold text-lg">{session.level} Session</h3>
          <p className="text-sm text-muted-foreground">{session.players.length} members</p>
        </div>
      </header>
      <div className="flex-1 p-4 overflow-y-auto bg-muted/20">
        <div className="space-y-4">
          {session.messages.map((message, index) => {
             const isCurrentUser = message.sender.id === currentUser.id;
             const showAvatar = index === 0 || session.messages[index-1].sender.id !== message.sender.id;

             return (
                <div key={message.id} className={cn('flex items-end gap-2', isCurrentUser && 'justify-end')}>
                    {!isCurrentUser && (
                        <Avatar className={cn('h-8 w-8', !showAvatar && 'opacity-0')}>
                            {showAvatar && <AvatarImage src={message.sender.avatarUrl} alt={message.sender.name} />}
                            <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={cn('max-w-xs lg:max-w-md p-3 rounded-lg', isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-background')}>
                       {!isCurrentUser && showAvatar && <p className="text-xs font-semibold mb-1">{message.sender.name}</p>}
                       <p className="text-sm">{message.content}</p>
                       <p className="text-xs text-right mt-1 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                       </p>
                    </div>
                     {isCurrentUser && (
                        <Avatar className={cn('h-8 w-8', !showAvatar && 'opacity-0')}>
                            {showAvatar && <AvatarImage src={message.sender.avatarUrl} alt={message.sender.name} />}
                            <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
             )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <footer className="p-4 border-t bg-background">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </footer>
    </div>
  );
};


export default ChatPage;

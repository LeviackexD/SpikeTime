
'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import { useSessions } from '@/context/session-context';
import type { Session, Message, User, DirectChat } from '@/lib/types';
import { mockUsers, currentUser } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, Users, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewChatModal from '@/components/chat/new-chat-modal';


const ChatPage: NextPage = () => {
  const { 
    sessions, 
    addMessage,
    directChats,
    addDirectMessage,
    createDirectChat,
  } = useSessions();
  const [selectedChatId, setSelectedChatId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState('sessions');
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = React.useState(false);

  const mySessions = React.useMemo(() => {
    if (!currentUser) return [];
    return sessions.filter(session => 
      session.players.some(p => p.id === currentUser.id)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions]
  );
  
  React.useEffect(() => {
    if (!selectedChatId && mySessions.length > 0 && activeTab === 'sessions') {
      setSelectedChatId(mySessions[0].id);
    } else if (!selectedChatId && directChats.length > 0 && activeTab === 'direct') {
        setSelectedChatId(directChats[0].id);
    }
  }, [mySessions, directChats, selectedChatId, activeTab]);

  const selectedSession = React.useMemo(() => 
    mySessions.find(s => s.id === selectedChatId),
    [mySessions, selectedChatId]
  );

  const selectedDirectChat = React.useMemo(() =>
    directChats.find(c => c.id === selectedChatId),
    [directChats, selectedChatId]
  );

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setIsSheetOpen(false); // Close sheet on mobile after selection
  }

  const handleStartNewChat = (user: User) => {
    const existingChat = directChats.find(chat => chat.participants.some(p => p.id === user.id));
    if (existingChat) {
      setSelectedChatId(existingChat.id);
    } else {
      const newChatId = createDirectChat(user);
      setSelectedChatId(newChatId);
    }
    setActiveTab('direct');
    setIsNewChatModalOpen(false);
  };

  const getChatTitle = () => {
    if(activeTab === 'sessions' && selectedSession) {
        return `${selectedSession.level} Session`
    }
    if (activeTab === 'direct' && selectedDirectChat && currentUser) {
        const otherUser = selectedDirectChat.participants.find(p => p.id !== currentUser.id);
        return otherUser?.name || 'Direct Message';
    }
    return 'Select a chat';
  }
  
  if (!currentUser) {
    return null; // or a loading spinner
  }

  return (
    <>
    <Card className="flex h-[calc(100vh-10rem)] w-full overflow-hidden">
      <ChatList
        sessions={mySessions}
        directChats={directChats}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewChatClick={() => setIsNewChatModalOpen(true)}
      />
      <ChatWindow 
        session={selectedSession} 
        directChat={selectedDirectChat}
        onAddSessionMessage={addMessage} 
        onAddDirectMessage={addDirectMessage}
        onOpenSheet={() => setIsSheetOpen(true)}
        chatKey={selectedChatId}
        title={getChatTitle()}
        activeTab={activeTab}
      />
    </Card>
    <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        users={mockUsers.filter(u => u.id !== currentUser.id)}
        onStartChat={handleStartNewChat}
    />
    </>
  );
};

interface ChatListProps {
    sessions: Session[],
    directChats: DirectChat[],
    selectedChatId: string | null,
    onSelectChat: (id: string) => void,
    isSheetOpen: boolean,
    setIsSheetOpen: (isOpen: boolean) => void,
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onNewChatClick: () => void;
}

const ChatList = ({ sessions, directChats, selectedChatId, onSelectChat, isSheetOpen, setIsSheetOpen, activeTab, setActiveTab, onNewChatClick }: ChatListProps) => {
  const isMobile = useIsMobile();

  const chatListContent = (
    <div className={cn("flex flex-col", isMobile ? "h-full" : "h-full border-r")}>
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold font-headline flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            Chats
        </h2>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList className="m-2 grid w-auto grid-cols-2">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="direct">Direct</TabsTrigger>
        </TabsList>
        <TabsContent value="sessions" className="flex-grow overflow-hidden">
            <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                {sessions.map(session => (
                    <button
                    key={session.id}
                    onClick={() => onSelectChat(session.id)}
                    className={cn(
                        'w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3',
                        selectedChatId === session.id
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
        </TabsContent>
        <TabsContent value="direct" className="flex-grow overflow-hidden flex flex-col">
            <div className="p-2 pt-0">
                 <Button variant="outline" className="w-full" onClick={onNewChatClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Chat
                </Button>
            </div>
            <ScrollArea className="h-full">
                <div className="p-2 pt-0 space-y-1">
                 {directChats.map(chat => {
                    const otherUser = chat.participants.find(p => p.id !== currentUser.id);
                    if (!otherUser) return null;
                    return (
                        <button
                            key={chat.id}
                            onClick={() => onSelectChat(chat.id)}
                            className={cn(
                                'w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3',
                                selectedChatId === chat.id
                                ? 'bg-muted'
                                : 'hover:bg-muted/50'
                            )}
                        >
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src={otherUser.avatarUrl} alt={otherUser.name} />
                                <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 truncate">
                                <p className="font-semibold">{otherUser.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{chat.messages.at(-1)?.content ?? 'No messages yet'}</p>
                            </div>
                        </button>
                    )
                 })}
                </div>
            </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (isMobile) {
    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side="left" className="p-0 w-80">
                <SheetTitle className="sr-only">Chats</SheetTitle>
                {chatListContent}
            </SheetContent>
        </Sheet>
    );
  }

  return <div className="w-1/3 xl:w-1/4 hidden md:block">{chatListContent}</div>;
};

interface ChatWindowProps {
    session?: Session;
    directChat?: DirectChat;
    onAddSessionMessage: (sessionId: string, message: Message) => void;
    onAddDirectMessage: (chatId: string, message: Message) => void;
    onOpenSheet: () => void;
    chatKey: string | null;
    title: string;
    activeTab: string;
}


const ChatWindow = ({ session, directChat, onAddSessionMessage, onAddDirectMessage, onOpenSheet, chatKey, title, activeTab }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [session?.messages, directChat?.messages, chatKey]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const message: Message = {
        id: `m${Date.now()}`,
        sender: currentUser,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
    };
    
    if (activeTab === 'sessions' && session) {
      onAddSessionMessage(session.id, message);
    } else if (activeTab === 'direct' && directChat) {
      onAddDirectMessage(directChat.id, message);
    }
    
    setNewMessage('');
  };
  
  const currentChat = activeTab === 'sessions' ? session : directChat;
  const messages = currentChat?.messages ?? [];
  const participants = activeTab === 'sessions' ? session?.players : directChat?.participants;
  const avatarUrl = activeTab === 'sessions' ? session?.imageUrl : directChat?.participants.find(p => p.id !== currentUser.id)?.avatarUrl
  const avatarFallback = title.charAt(0);


  if (!currentChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-muted/20">
         <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
         <h3 className="text-xl font-semibold text-muted-foreground">Select a chat</h3>
         <p className="text-muted-foreground">Choose a conversation to start messaging.</p>
         {isMobile && <Button onClick={onOpenSheet} className="mt-4">Select Chat</Button>}
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
          <AvatarImage src={avatarUrl} alt={title} data-ai-hint="volleyball session" />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{participants?.length} members</p>
        </div>
      </header>
      <div className="flex-1 p-4 overflow-y-auto bg-muted/20">
        <div className="space-y-4">
          {messages.map((message, index) => {
             const isCurrentUser = message.sender.id === currentUser.id;
             const showAvatar = index === 0 || messages[index-1].sender.id !== message.sender.id;

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
            key={chatKey}
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

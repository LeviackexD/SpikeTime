
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import type { Session, User } from '@/lib/types';
import { Users, Calendar, Clock, BarChart2, X, CheckCircle, UserPlus } from 'lucide-react';
import { currentUser } from '@/lib/mock-data';
import SuggestLevelButton from '../ai/suggest-level-button';
import { cn } from '@/lib/utils';


interface PlayerListProps {
  title: string;
  players: User[];
  emptyMessage: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ title, players, emptyMessage }) => {
  if (players.length === 0) {
    return (
      <div>
        <h3 className="mb-3 font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          {title} (0)
        </h3>
        <div className="flex items-center justify-center p-8 rounded-lg border border-dashed">
            <p className="text-muted-foreground text-center text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
        <h3 className="mb-3 font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            {title} ({players.length})
        </h3>
        <div className="rounded-lg border max-h-56 overflow-y-auto p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {players.map((player) => (
                <div key={player.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                <Avatar className="h-10 w-10 border-2 border-primary/50">
                    <AvatarImage src={player.avatarUrl} alt={player.name} />
                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <p className="font-semibold text-sm">{player.name}</p>
                    <p className="text-xs text-muted-foreground">{player.skillLevel}</p>
                </div>
                </div>
            ))}
          </div>
        </div>
    </div>
  );
};

interface SessionDetailsModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (sessionId: string) => void;
  onCancel: (sessionId: string) => void;
  onWaitlist: (sessionId: string) => void;
}

export default function SessionDetailsModal({ 
  session, 
  isOpen, 
  onClose,
  onBook,
  onCancel,
  onWaitlist,
}: SessionDetailsModalProps) {
  
  const [currentSession, setCurrentSession] = React.useState(session);

  React.useEffect(() => {
    setCurrentSession(session);
  }, [session, isOpen]);
  
  if (!currentSession) return null;

  const spotsFilled = currentSession.players.length;
  const progressValue = (spotsFilled / currentSession.maxPlayers) * 100;

  const isRegistered = currentSession.players.some(p => p.id === currentUser.id);
  const isOnWaitlist = currentSession.waitlist.some(p => p.id === currentUser.id);
  const isFull = spotsFilled >= currentSession.maxPlayers;
  

  const handleAction = (action: (id: string) => void) => {
    if (currentSession) {
      action(currentSession.id);
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{currentSession.level} Session</DialogTitle>
          <DialogDescription>
            Session details and registered players.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(currentSession.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{currentSession.startTime} - {currentSession.endTime}</span>
            </div>
          </div>
          
          <div>
            <div className="mb-2 flex justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Spots Filled</span>
              </div>
              <span>{spotsFilled} / {currentSession.maxPlayers}</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          <PlayerList 
            title="Registered Players"
            players={currentSession.players}
            emptyMessage="No players have registered yet."
          />

          <PlayerList 
            title="Waitlist"
            players={currentSession.waitlist}
            emptyMessage="The waitlist is empty."
          />

          {currentUser.role === 'admin' && (
             <div>
                <h3 className="mb-3 font-semibold flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-muted-foreground" />
                    Admin Actions
                </h3>
                <SuggestLevelButton playerSkillLevels={currentSession.players.map(p => p.skillLevel.toLowerCase() as "beginner" | "intermediate" | "advanced")}/>
             </div>
          )}

        </div>
        <DialogFooter className='sm:justify-between items-center'>
            <div className='flex items-center gap-2'>
            {isRegistered ? (
              <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/5 hover:text-destructive" onClick={() => handleAction(onCancel)}>
                <X className="mr-2 h-4 w-4" /> Cancel My Spot
              </Button>
            ) : isFull ? (
              isOnWaitlist ? (
                <Button variant="outline" disabled>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  On Waitlist
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => handleAction(onWaitlist)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Join Waitlist
                </Button>
              )
            ) : (
              <Button onClick={() => handleAction(onBook)}>
                Book My Spot
              </Button>
            )}
            </div>
           <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

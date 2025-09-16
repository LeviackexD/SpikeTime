
/**
 * @fileoverview A modal dialog that displays comprehensive details about a session.
 * It shows the list of registered players and the waitlist, and provides
 * action buttons for booking, canceling, or joining the waitlist.
 */

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
import { Users, Calendar, Clock, X, CheckCircle, UserPlus, XCircle, LogOut } from 'lucide-react';
import { useSessions, getSafeDate } from '@/context/session-context';
import { useAuth } from '@/context/auth-context';
import { Timestamp } from 'firebase/firestore';


interface PlayerListProps {
  title: string;
  playerIds: string[];
  allUsers: User[];
  emptyMessage: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ title, playerIds, allUsers, emptyMessage }) => {
  const players = React.useMemo(() => 
    playerIds.map(id => allUsers.find(user => user.id === id)).filter(Boolean) as User[],
    [playerIds, allUsers]
  );

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
  onLeaveWaitlist: (sessionId: string) => void;
}

export default function SessionDetailsModal({ 
  session, 
  isOpen, 
  onClose,
  onBook,
  onCancel,
  onWaitlist,
  onLeaveWaitlist,
}: SessionDetailsModalProps) {
  const { user: currentUser } = useAuth();
  const { users: allUsers } = useSessions();
  
  if (!session || !currentUser) return null;

  const spotsFilled = session.players.length;
  const progressValue = (spotsFilled / session.maxPlayers) * 100;

  const isRegistered = session.players.includes(currentUser.id);
  const isOnWaitlist = session.waitlist.includes(currentUser.id);
  const isFull = spotsFilled >= session.maxPlayers;
  
  const handleAction = (action: (id: string) => void) => {
    if (session) {
      action(session.id);
      onClose(); // Close modal after action
    }
  }

  const formatDate = (date: string | Timestamp) => {
    return getSafeDate(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }
  
  const sessionDate = getSafeDate(session.date);
  const sessionDateTime = new Date(`${sessionDate.toISOString().split('T')[0]}T${session.startTime}`);
  const now = new Date();
  const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel = hoursUntilSession > 12;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-headline text-2xl">{session.level} Session</DialogTitle>
          <DialogDescription>
            Session details and registered players.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(session.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{session.startTime} - {session.endTime}</span>
            </div>
          </div>
          
          <div>
            <div className="mb-2 flex justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Spots Filled</span>
              </div>
              <span>{spotsFilled} / {session.maxPlayers}</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          <PlayerList 
            title="Registered Players"
            playerIds={session.players}
            allUsers={allUsers}
            emptyMessage="No players have registered yet."
          />

          <PlayerList 
            title="Waitlist"
            playerIds={session.waitlist}
            allUsers={allUsers}
            emptyMessage="The waitlist is empty."
          />

        </div>
        <DialogFooter className='sm:justify-between items-center flex-shrink-0 pt-4'>
            <div className='flex items-center gap-2 flex-wrap'>
            {isRegistered ? (
              <Button 
                variant="outline" 
                onClick={() => handleAction(onCancel)}
                disabled={!canCancel}
                title={!canCancel ? "Cancellations must be made more than 12 hours in advance." : "Cancel your spot"}
              >
                <XCircle className="mr-2 h-4 w-4" /> Cancel My Spot
              </Button>
            ) : (
              <>
                {!isFull && (
                   <Button onClick={() => handleAction(onBook)}>
                      Book My Spot
                  </Button>
                )}
                {isOnWaitlist ? (
                  <Button variant="secondary" onClick={() => handleAction(onLeaveWaitlist)}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Leave Waitlist
                  </Button>
                ) : (
                  isFull && <Button
                      variant="secondary"
                      onClick={() => handleAction(onWaitlist)}
                  >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Join Waitlist
                  </Button>
                )}
              </>
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

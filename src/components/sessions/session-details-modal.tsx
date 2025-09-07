
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
import { Users, Calendar, Clock, BarChart2, Info, X } from 'lucide-react';
import { currentUser } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import SuggestLevelButton from '../ai/suggest-level-button';

interface SessionDetailsModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionDetailsModal({ session, isOpen, onClose }: SessionDetailsModalProps) {
  const { toast } = useToast();
  const [currentSession, setCurrentSession] = React.useState(session);

  React.useEffect(() => {
    setCurrentSession(session);
  }, [session, isOpen]);
  
  if (!currentSession) return null;

  const spotsFilled = currentSession.players.length;
  const spotsLeft = currentSession.maxPlayers - spotsFilled;
  const progressValue = (spotsFilled / currentSession.maxPlayers) * 100;
  const isCurrentUserRegistered = currentSession.players.some(p => p.id === currentUser.id);
  const isSessionFull = spotsLeft <= 0;

  const handleBooking = () => {
    toast({
      title: "Booking Confirmed!",
      description: `You're all set for the ${currentSession.level} session.`,
    });
    onClose();
  };

  const handleCancellation = () => {
    toast({
      title: "Cancellation Confirmed",
      description: "You have been removed from the session.",
      variant: 'destructive',
    });
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Handle invalid date string
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
              <span>{currentSession.time}</span>
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

          <div>
            <h3 className="mb-3 font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Registered Players ({spotsFilled})
            </h3>
            <div className="flex flex-wrap gap-3">
              {currentSession.players.map((player) => (
                <Avatar key={player.id} className="h-12 w-12 border-2 border-background">
                  <AvatarImage src={player.avatarUrl} alt={player.name} />
                  <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
              {spotsLeft > 0 && Array.from({ length: spotsLeft }).map((_, i) => (
                 <Avatar key={`empty-${i}`} className="h-12 w-12 border-2 border-dashed bg-muted">
                   <AvatarFallback></AvatarFallback>
                 </Avatar>
              ))}
            </div>
          </div>

           {currentSession.waitlist.length > 0 && (
             <div>
                <h3 className="mb-3 font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    Waitlist ({currentSession.waitlist.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                    {currentSession.waitlist.map((player) => (
                        <div key={player.id} className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
                          <Avatar className="h-6 w-6">
                             <AvatarImage src={player.avatarUrl} alt={player.name} />
                             <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{player.name}</span>
                        </div>
                    ))}
                </div>
             </div>
           )}

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
        <DialogFooter className='sm:justify-between'>
          {isCurrentUserRegistered ? (
             <Button variant="destructive" onClick={handleCancellation}>
              <X className="mr-2 h-4 w-4" /> Cancel My Spot
            </Button>
          ) : (
            <Button onClick={handleBooking} disabled={isSessionFull}>
              {isSessionFull ? 'Join Waitlist' : 'Book My Spot'}
            </Button>
          )}
           <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

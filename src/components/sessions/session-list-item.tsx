
/**
 * @fileoverview A card component for displaying a summary of a single session in a list.
 * Used on the main dashboard to show upcoming and available sessions.
 * Includes action buttons and a progress bar for player capacity.
 */

'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Session, User } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { getSafeDate } from '@/context/session-context';
import PlayerAvatar from './player-avatar';
import {
  CheckCircle,
  UserPlus,
  XCircle,
  Eye,
  LogOut,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface SessionListItemProps {
  session: Session;
  onBook: (sessionId: string) => Promise<boolean>;
  onCancel: (sessionId: string) => Promise<boolean>;
  onWaitlist: (sessionId: string) => Promise<boolean>;
  onLeaveWaitlist: (sessionId: string) => Promise<boolean>;
  onViewPlayers: (session: Session) => void;
  priority?: boolean;
  animationDelay?: number;
}

export default function SessionListItem({
  session,
  onBook,
  onCancel,
  onWaitlist,
  onLeaveWaitlist,
  onViewPlayers,
  priority = false,
  animationDelay = 0,
}: SessionListItemProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  if (!currentUser) return null;

  const players = session.players as User[];
  const waitlist = session.waitlist as User[];

  const isFull = players.length >= session.maxPlayers;
  const isRegistered = players.some(p => p.id === currentUser.id);
  const isOnWaitlist = waitlist.some(p => p.id === currentUser.id);

  const spotsLeft = session.maxPlayers - players.length;
  const progressValue = (players.length / session.maxPlayers) * 100;

  const sessionDate = getSafeDate(session.date);
  const sessionDateTime = new Date(`${sessionDate.toISOString().split('T')[0]}T${session.startTime}`);
  const now = new Date();
  const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel = hoursUntilSession > 12;

  const handleBook = async () => {
    const success = await onBook(session.id);
    if (success) {
      toast({ title: 'Booking Confirmed!', description: `You're all set for the ${session.level} session.`, variant: 'success' });
    } else {
      toast({ title: 'Booking Failed', description: 'Could not book your spot. The session might be full.', variant: 'destructive' });
    }
  };

  const handleCancel = async () => {
    if (!canCancel) {
      toast({ title: 'Cancellation Failed', description: 'You can only cancel more than 12 hours in advance.', variant: 'destructive' });
      return;
    }
    const success = await onCancel(session.id);
    if (success) {
      toast({ title: 'Booking Canceled', description: 'Your spot has been successfully canceled.', variant: 'success' });
    } else {
        toast({ title: 'Cancellation Failed', description: 'Could not cancel your booking.', variant: 'destructive' });
    }
  };

  const handleJoinWaitlist = async () => {
    const success = await onWaitlist(session.id);
    if (success) {
      toast({ title: 'You are on the waitlist!', description: "We'll notify you if a spot opens up.", variant: 'success' });
    } else {
        toast({ title: 'Could not join waitlist', description: 'You might already be on the list.', variant: 'destructive' });
    }
  };

  const handleLeaveWaitlist = async () => {
    const success = await onLeaveWaitlist(session.id);
    if (success) {
      toast({ title: 'Removed from Waitlist', description: 'You have successfully left the waitlist.', variant: 'success' });
    }
  };

  const formatDate = (date: Date) => {
     const day = date.toLocaleDateString('en-US', { day: '2-digit', timeZone: 'UTC' });
     const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
     return { day, month };
  };
  
  const { day, month } = formatDate(sessionDate);

  return (
    <Card 
      className="flex flex-col overflow-hidden transition-all hover:shadow-xl h-full animate-slide-up-and-fade"
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'backwards' }}
    >
      <CardHeader className="p-0 relative">
        <Badge
          variant={isFull ? 'destructive' : 'secondary'}
          className="absolute top-2 right-2 z-10"
        >
          {isFull ? 'Full' : `${spotsLeft} spots left`}
        </Badge>
        <div className="absolute top-2 left-2 z-10 bg-background/80 text-foreground rounded-md text-center p-2 flex flex-col items-center justify-center w-12 h-12 font-bold backdrop-blur-sm">
           <span className="text-lg leading-none">{day}</span>
           <span className="text-xs uppercase">{month}</span>
        </div>
        <div className="relative h-40 w-full">
          <Image
            src={session.imageUrl || `https://picsum.photos/seed/${session.id}/400/300`}
            alt="Volleyball session"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            style={{ objectFit: 'cover' }}
            className="rounded-t-lg"
            data-ai-hint="volleyball action"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <div className="absolute bottom-0 p-4">
            <CardTitle className="font-headline text-lg text-white">
                {session.level} Level
            </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-grow space-y-4">
          <div className="space-y-1 text-sm text-muted-foreground">
             <p>{session.startTime} - {session.endTime}</p>
             <p>{session.location}</p>
          </div>
        
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <TooltipProvider>
                  <div className="flex -space-x-2 overflow-hidden">
                    {players.slice(0, 4).map(player => (
                      <PlayerAvatar key={player.id} player={player} className="h-8 w-8 border-2 border-background" />
                    ))}
                    {players.length > 4 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium border-2 border-background">
                            +{players.length - 4}
                        </div>
                    )}
                  </div>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onViewPlayers(session)}>
                              <Eye className="h-4 w-4" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>View Details</p>
                      </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
            </div>
            <Progress value={progressValue} className="h-1" />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto flex flex-col gap-2">
        {isRegistered ? (
          <Button
            className="w-full"
            variant="outline"
            onClick={handleCancel}
            disabled={!canCancel}
            title={!canCancel ? "Cancellations must be made more than 12 hours in advance." : "Cancel your spot"}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Spot
          </Button>
        ) : (
          <>
            {!isFull && (
              <Button className="w-full" onClick={handleBook}>
                Book My Spot
              </Button>
            )}
            
            {isOnWaitlist ? (
              <Button className="w-full" variant="secondary" onClick={handleLeaveWaitlist}>
                <LogOut className="mr-2 h-4 w-4" />
                Leave Waitlist
              </Button>
            ) : (
             isFull && <Button
                className="w-full"
                variant="secondary"
                onClick={handleJoinWaitlist}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Join Waitlist
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}

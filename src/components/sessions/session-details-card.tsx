
/**
 * @fileoverview A card component that displays detailed information about a single session.
 * Used on the calendar page to list sessions for a selected day.
 * Includes actions for booking, canceling, or joining a waitlist.
 */

'use client';

import * as React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  UserPlus,
  LogOut,
} from 'lucide-react';
import type { Session, User } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getSafeDate } from '@/lib/utils';

interface SessionDetailsCardProps {
  session: Session;
  onBook: (sessionId: string) => Promise<boolean>;
  onCancel: (sessionId: string) => Promise<boolean>;
  onWaitlist: (sessionId: string) => Promise<boolean>;
  onLeaveWaitlist: (sessionId: string) => Promise<boolean>;
  priority?: boolean;
}

export default function SessionDetailsCard({
  session,
  onBook,
  onCancel,
  onWaitlist,
  onLeaveWaitlist,
  priority = false,
}: SessionDetailsCardProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  if (!currentUser) {
    return null; // Or a loading skeleton
  }
  const players = session.players as User[];
  const waitlist = session.waitlist as User[];

  const isFull = players.length >= session.maxPlayers;
  const isRegistered = players.some(p => p.id === currentUser.id);
  const isOnWaitlist = waitlist.some(p => p.id === currentUser.id);

  const sessionDate = getSafeDate(session.date);
  const sessionDateTime = new Date(`${sessionDate.toISOString().split('T')[0]}T${session.startTime}`);
  const now = new Date();
  const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel = hoursUntilSession > 12;

  const handleBook = async () => {
    const success = await onBook(session.id);
    if (success) {
      toast({ title: 'Booking Confirmed!', description: `You're all set for the ${session.level} session.`, variant: 'success' });
    }
  };

  const handleCancel = async () => {
    const success = await onCancel(session.id);
    if (success) {
      toast({ title: 'Booking Canceled', description: 'Your spot has been successfully canceled.', variant: 'success' });
    }
  };

  const handleJoinWaitlist = async () => {
    const success = await onWaitlist(session.id);
    if (success) {
      toast({ title: 'You are on the waitlist!', description: "We'll notify you if a spot opens up.", variant: 'success' });
    }
  };

  const handleLeaveWaitlist = async () => {
    const success = await onLeaveWaitlist(session.id);
    if (success) {
      toast({ title: 'Removed from Waitlist', description: 'You have successfully left the waitlist.', variant: 'success' });
    }
  };


  return (
    <Card className="flex flex-col md:flex-row overflow-hidden transition-all hover:shadow-xl w-full animate-scale-in">
      <div className="relative h-48 md:h-auto md:w-1/3">
        <Image
          src={session.imageUrl || `https://picsum.photos/seed/${session.id}/600/400`}
          alt="Volleyball session"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={priority}
          style={{ objectFit: 'cover' }}
          className="md:rounded-l-lg md:rounded-r-none"
          data-ai-hint="volleyball action"
        />
      </div>
      <div className="flex flex-col flex-grow">
        <CardContent className="p-4 space-y-3 flex-grow">
            <div className="flex justify-between items-start">
                <div>
                    <Badge variant={isFull ? 'destructive' : 'secondary'}>
                        {isFull ? 'Full' : `${session.maxPlayers - players.length} players left`}
                    </Badge>
                    <h3 className="font-headline text-xl font-bold mt-2">
                        {session.level} Level
                    </h3>
                </div>
                <div className='text-right'>
                  <p className="font-semibold text-primary">{sessionDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          timeZone: 'UTC',
                      })}</p>
                  <p className="text-sm">{sessionDate.toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          timeZone: 'UTC',
                      })}</p>
                </div>
            </div>
            
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">{session.startTime} - {session.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="font-semibold">{session.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">
                        {players.length} / {session.maxPlayers} players
                    </span>
                </div>
            </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-col gap-2 items-stretch">
          {isRegistered ? (
            <Button
              className="w-full"
              variant="outline"
              onClick={handleCancel}
              disabled={!canCancel}
              title={!canCancel ? "Cancellations must be made more than 12 hours in advance." : "Cancel your spot"}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel My Spot
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
      </div>
    </Card>
  );
}

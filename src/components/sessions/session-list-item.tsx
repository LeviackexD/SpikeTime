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
import { useSessions } from '@/context/session-context';
import PlayerAvatar from './player-avatar';
import {
  Users,
  CheckCircle,
  UserPlus,
  XCircle,
  Eye,
} from 'lucide-react';

interface SessionListItemProps {
  session: Session;
  onBook: (sessionId: string) => void;
  onCancel: (sessionId: string) => void;
  onWaitlist: (sessionId: string) => void;
  onViewPlayers: (session: Session) => void;
  priority?: boolean;
}

export default function SessionListItem({
  session,
  onBook,
  onCancel,
  onWaitlist,
  onViewPlayers,
  priority = false,
}: SessionListItemProps) {
  const { user: currentUser } = useAuth();
  const { users } = useSessions();

  if (!currentUser) return null;

  const isFull = session.players.length >= session.maxPlayers;
  const isRegistered = session.players.includes(currentUser.id);
  const isOnWaitlist = session.waitlist.includes(currentUser.id);

  const spotsLeft = session.maxPlayers - session.players.length;
  const progressValue = (session.players.length / session.maxPlayers) * 100;
  
  const getPlayer = (id: string) => users.find(u => u.id === id);

  const sessionDateTime = new Date(`${session.date}T${session.startTime}`);
  const now = new Date();
  const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel = hoursUntilSession > 12;

  const formatDate = (dateString: string) => {
     const date = new Date(dateString);
     const day = date.toLocaleDateString('en-US', { day: '2-digit', timeZone: 'UTC' });
     const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
     return { day, month };
  };
  
  const { day, month } = formatDate(session.date);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-xl h-full">
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
        
        <div>
          <div className="flex -space-x-2 overflow-hidden mb-2">
            {session.players.slice(0, 5).map(playerId => {
                const player = getPlayer(playerId);
                return player && <PlayerAvatar key={player.id} player={player} />;
            })}
            {session.players.length > 5 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium border-2 border-background">
                    +{session.players.length - 5}
                </div>
            )}
          </div>
          <Progress value={progressValue} className="h-1" />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto flex flex-col gap-2">
        <Button className="w-full" variant="outline" onClick={() => onViewPlayers(session)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
        </Button>
        {isRegistered ? (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onCancel(session.id)}
            disabled={!canCancel}
            title={!canCancel ? "Cancellations must be made more than 12 hours in advance." : "Cancel your spot"}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Spot
          </Button>
        ) : isFull ? (
          isOnWaitlist ? (
            <Button className="w-full" variant="outline" disabled>
              <CheckCircle className="mr-2 h-4 w-4" />
              On Waitlist
            </Button>
          ) : (
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => onWaitlist(session.id)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Join Waitlist
            </Button>
          )
        ) : (
          <Button className="w-full" onClick={() => onBook(session.id)}>
            Book My Spot
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

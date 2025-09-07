
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  Users,
} from 'lucide-react';
import type { Session, User } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import PlayerAvatar from './player-avatar';

interface SessionListItemProps {
  session: Session;
  currentUser: User;
  onBook: (sessionId: string) => void;
  onCancel: (sessionId: string) => void;
  onWaitlist: (sessionId: string) => void;
  priority?: boolean;
}

export default function SessionListItem({
  session,
  currentUser,
  onBook,
  onCancel,
  onWaitlist,
  priority = false,
}: SessionListItemProps) {
  const isFull = session.players.length >= session.maxPlayers;
  const isRegistered = session.players.some((p) => p.id === currentUser.id);
  const isOnWaitlist = session.waitlist.some((p) => p.id === currentUser.id);
  const progressValue = (session.players.length / session.maxPlayers) * 100;


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-xl w-full h-full">
        <CardHeader className="p-0 relative h-32">
            <Image
                src={`https://picsum.photos/seed/${session.id}/400/300`}
                alt="Volleyball session"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={priority}
                style={{ objectFit: 'cover' }}
                className="rounded-t-lg"
                data-ai-hint="volleyball action"
            />
            <Badge className="absolute top-2 right-2" variant={isFull ? 'destructive' : 'secondary'}>
                {isFull ? 'Full' : `${session.maxPlayers - session.players.length} spots left`}
            </Badge>
        </CardHeader>
        <div className="flex flex-col flex-grow p-3 space-y-2">
            <CardTitle className="font-headline text-base">{session.level} Level</CardTitle>
            <div className="space-y-1 text-xs text-muted-foreground flex-grow">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(session.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{session.time}</span>
                </div>
            </div>
             <div>
                <div className="mb-1 flex justify-between items-center text-xs text-muted-foreground">
                    <span className="font-semibold flex items-center gap-1"><Users className="h-3 w-3" /> Players</span>
                    <span>{session.players.length}/{session.maxPlayers}</span>
                </div>
                <Progress value={progressValue} className="h-1.5" />
             </div>
             <div className="flex -space-x-2 overflow-hidden pt-1">
                {session.players.slice(0, 8).map(p => <PlayerAvatar key={p.id} player={p} />)}
                {session.players.length > 8 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground border-2 border-background">
                        +{session.players.length - 8}
                    </div>
                )}
             </div>
        </div>
        <CardFooter className="bg-muted/50 p-2">
        {isRegistered ? (
            <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => onCancel(session.id)}
            >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel My Spot
            </Button>
            ) : isFull ? (
            isOnWaitlist ? (
                <Button className="w-full" variant="outline" size="sm" disabled>
                <CheckCircle className="mr-2 h-4 w-4" />
                On Waitlist
                </Button>
            ) : (
                <Button
                className="w-full"
                variant="secondary"
                size="sm"
                onClick={() => onWaitlist(session.id)}
                >
                <UserPlus className="mr-2 h-4 w-4" />
                Join Waitlist
                </Button>
            )
            ) : (
            <Button className="w-full" size="sm" onClick={() => onBook(session.id)}>
                Book My Spot
            </Button>
            )}
        </CardFooter>
    </Card>
  );
}

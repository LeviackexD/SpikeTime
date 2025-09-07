
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  UserPlus,
} from 'lucide-react';
import type { Session, User } from '@/lib/types';
import { Card, CardContent, CardFooter } from '../ui/card';

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  return (
    <Card className="flex flex-col md:flex-row overflow-hidden transition-all hover:shadow-xl w-full">
        <div className="relative h-40 md:h-auto md:w-48">
            <Image
                src={`https://picsum.photos/seed/${session.id}/400/300`}
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
            <CardContent className="p-4 space-y-2 flex-grow">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <h3 className="font-headline text-lg font-bold">
                            {session.level} Level
                        </h3>
                        <p className="font-semibold text-primary text-sm">{formatDate(session.date)}</p>
                    </div>
                    <Badge variant={isFull ? 'destructive' : 'secondary'}>
                        {isFull ? 'Full' : `${session.maxPlayers - session.players.length} spots left`}
                    </Badge>
                </div>
                
                <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{session.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{session.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span>
                            {session.players.length} / {session.maxPlayers} players
                        </span>
                    </div>
                </div>
            </CardContent>
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
        </div>
    </Card>
  );
}

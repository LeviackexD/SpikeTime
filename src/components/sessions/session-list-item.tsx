
'use client';

import * as React from 'react';
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
} from 'lucide-react';
import type { Session, User } from '@/lib/types';

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
}: SessionListItemProps) {
  const isFull = session.players.length >= session.maxPlayers;
  const isRegistered = session.players.some((p) => p.id === currentUser.id);
  const isOnWaitlist = session.waitlist.some((p) => p.id === currentUser.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg w-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-headline text-xl font-bold">
              {session.level} Level
            </h3>
            <p className="font-semibold text-primary">{formatDate(session.date)}</p>
          </div>
          <Badge variant={isFull ? 'destructive' : 'secondary'}>
            {isFull ? 'Full' : `${session.maxPlayers - session.players.length} players left`}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{session.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{session.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {session.players.length} / {session.maxPlayers} players
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4">
        {isRegistered ? (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onCancel(session.id)}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel My Spot
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

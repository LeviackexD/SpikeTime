
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
} from 'lucide-react';
import type { Session } from '@/lib/types';
import { useAuth } from '@/context/auth-context';

interface SessionDetailsCardProps {
  session: Session;
  onBook: (sessionId: string) => void;
  onCancel: (sessionId: string) => void;
  onWaitlist: (sessionId: string) => void;
  priority?: boolean;
}

export default function SessionDetailsCard({
  session,
  onBook,
  onCancel,
  onWaitlist,
  priority = false,
}: SessionDetailsCardProps) {
  const { user: currentUser } = useAuth();
  
  if (!currentUser) {
    return null; // Or a loading skeleton
  }
  const isFull = session.players.length >= session.maxPlayers;
  const isRegistered = session.players.includes(currentUser.id);
  const isOnWaitlist = session.waitlist.includes(currentUser.id);

  return (
    <Card className="flex flex-col md:flex-row overflow-hidden transition-all hover:shadow-xl w-full">
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
                        {isFull ? 'Full' : `${session.maxPlayers - session.players.length} players left`}
                    </Badge>
                    <h3 className="font-headline text-xl font-bold mt-2">
                        {session.level} Level
                    </h3>
                </div>
                <div className='text-right'>
                  <p className="font-semibold text-primary">{new Date(session.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          timeZone: 'UTC',
                      })}</p>
                  <p className="text-sm">{new Date(session.date).toLocaleDateString('en-US', {
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
                        {session.players.length} / {session.maxPlayers} players
                    </span>
                </div>
            </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
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
      </div>
    </Card>
  );
}

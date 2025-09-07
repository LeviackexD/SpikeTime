
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
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

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
  
  if (!currentUser) {
    // Or a loading skeleton
    return null;
  }
  
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
        <div className="relative h-48">
            <Image
                src={session.imageUrl || `https://picsum.photos/seed/${session.id}/400/300`}
                alt="Volleyball session"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={priority}
                style={{ objectFit: 'cover' }}
                className="rounded-t-lg"
                data-ai-hint="volleyball action"
            />
             <Badge className="absolute top-2 right-2" variant={isFull ? 'destructive' : 'success'}>
                {isFull ? 'Full' : `${session.maxPlayers - session.players.length} spots left`}
            </Badge>
        </div>
        <div className="flex flex-col flex-grow">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="font-headline text-lg">{session.level} Level</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow space-y-3">
                <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(session.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{session.startTime} - {session.endTime}</span>
                    </div>
                </div>
                <div>
                    <div className="mb-1 flex justify-between items-center text-xs text-muted-foreground">
                        <span className="font-semibold flex items-center gap-1"><Users className="h-3 w-3" /> Players</span>
                        <span>{session.players.length}/{session.maxPlayers}</span>
                    </div>
                    <Progress value={progressValue} className="h-1.5" indicatorClassName={cn({
                        'bg-destructive': isFull,
                        'bg-green-600': !isFull,
                    })} />
                </div>
                <Button 
                variant="link" 
                className="text-xs justify-start p-0 h-auto"
                onClick={() => onViewPlayers(session)}
                >
                View Players
                </Button>
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

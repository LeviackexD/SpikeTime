
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
import { useLanguage } from '@/context/language-context';
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
  const { t, locale } = useLanguage();
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
      toast({ title: t('toasts.bookingConfirmedTitle'), description: t('toasts.bookingConfirmedDescription', { level: t(`skillLevels.${session.level}`) }), variant: 'success' });
    } else {
      toast({ title: t('toasts.bookingFailedTitle'), description: t('toasts.bookingFailedDescription'), variant: 'destructive' });
    }
  };

  const handleCancel = async () => {
    if (!canCancel) {
      toast({ title: t('toasts.cancellationFailedTitle'), description: t('toasts.cancellationFailedTime'), variant: 'destructive' });
      return;
    }
    const success = await onCancel(session.id);
    if (success) {
      toast({ title: t('toasts.bookingCanceledTitle'), description: t('toasts.bookingCanceledDescription'), variant: 'success' });
    } else {
        toast({ title: t('toasts.cancellationFailedTitle'), description: t('toasts.cancellationFailedDescription'), variant: 'destructive' });
    }
  };

  const handleJoinWaitlist = async () => {
    const success = await onWaitlist(session.id);
    if (success) {
      toast({ title: t('toasts.waitlistJoinedTitle'), description: t('toasts.waitlistJoinedDescription'), variant: 'success' });
    } else {
        toast({ title: t('toasts.waitlistJoinFailedTitle'), description: t('toasts.waitlistJoinFailedDescription'), variant: 'destructive' });
    }
  };

  const handleLeaveWaitlist = async () => {
    const success = await onLeaveWaitlist(session.id);
    if (success) {
      toast({ title: t('toasts.waitlistLeftTitle'), description: t('toasts.waitlistLeftDescription'), variant: 'success' });
    } else {
       toast({ title: t('toasts.waitlistLeaveFailedTitle'), description: t('toasts.waitlistLeaveFailedDescription'), variant: 'destructive' });
    }
  };

  const formatDate = (date: Date) => {
     const day = date.toLocaleDateString(locale, { day: '2-digit', timeZone: 'UTC' });
     const month = date.toLocaleDateString(locale, { month: 'short', timeZone: 'UTC' });
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
          {isFull ? t('components.sessionListItem.full') : t('components.sessionListItem.spotsLeft', { count: spotsLeft })}
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
                {t(`skillLevels.${session.level}`)} Level
            </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-grow space-y-4">
          <div className="space-y-1 text-sm text-muted-foreground">
             <p>{session.startTime} - {session.endTime}</p>
             <p>{session.location}</p>
          </div>
        
        <div className="space-y-2">
             <TooltipProvider>
                <div className="flex justify-between items-center">
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
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onViewPlayers(session)}>
                              <Eye className="h-4 w-4" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>{t('components.sessionListItem.viewDetails')}</p>
                      </TooltipContent>
                  </Tooltip>
                </div>
            </TooltipProvider>
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
            title={!canCancel ? t('modals.sessionDetails.cancellationTooltip') : t('modals.sessionDetails.cancelSpot')}
          >
            <XCircle className="mr-2 h-4 w-4" />
            {t('modals.sessionDetails.cancelSpot')}
          </Button>
        ) : isOnWaitlist ? (
            <div className='flex gap-2 w-full'>
                {!isFull && 
                <Button className="w-full" onClick={handleBook}>
                    {t('modals.sessionDetails.bookSpot')}
                </Button>
                }
                <Button className="w-full" variant="secondary" onClick={handleLeaveWaitlist}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('modals.sessionDetails.leaveWaitlist')}
                </Button>
            </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            {!isFull && (
              <Button className="w-full" onClick={handleBook}>
                {t('modals.sessionDetails.bookSpot')}
              </Button>
            )}
            <Button
              className="w-full"
              variant="secondary"
              onClick={handleJoinWaitlist}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t('modals.sessionDetails.joinWaitlist')}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

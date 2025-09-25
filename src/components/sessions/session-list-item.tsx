
/**
 * @fileoverview A card component for displaying a summary of a single session in a list.
 * Used on the main dashboard to show upcoming and available sessions.
 * Includes action buttons and a progress bar for player capacity.
 * Now includes swipe-to-action functionality on mobile.
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
import { getSafeDate, toYYYYMMDD } from '@/context/session-context';
import PlayerAvatar from './player-avatar';
import {
  CheckCircle,
  UserPlus,
  XCircle,
  Eye,
  LogOut,
  Calendar,
  Check,
  Camera,
  Loader2,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { formatTime, cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


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
  const isMobile = useIsMobile();

  // --- Swipe Gesture State ---
  const [touchStart, setTouchStart] = React.useState(0);
  const [isSwiping, setIsSwiping] = React.useState(false);
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const swipeThreshold = 75; // pixels to swipe before action triggers


  if (!currentUser) return null;

  const players = (session.players || []) as Partial<User>[];
  const waitlist = (session.waitlist || []) as Partial<User>[];

  const isFull = players.length >= session.maxPlayers;
  const isRegistered = players.some(p => p.id === currentUser.id);
  const isOnWaitlist = waitlist.some(p => p.id === currentUser.id);

  const spotsLeft = session.maxPlayers - players.length;
  const progressValue = (players.length / session.maxPlayers) * 100;

  const sessionDate = getSafeDate(session.date);
  const sessionDateTime = new Date(`${toYYYYMMDD(sessionDate)}T${session.startTime}`);
  const now = new Date();
  const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel = hoursUntilSession > 12;

  // --- Action Handlers ---
  const handleAction = async (action: (id: string) => Promise<boolean>, successToast: { title: string, description: string, duration?: number }, failureToast: { title: string, description: string }) => {
    const success = await action(session.id);
    if (success) {
      toast({ ...successToast, variant: 'success' });
    } else {
      toast({ ...failureToast, variant: 'destructive' });
    }
  };

  const handleBook = () => handleAction(
    onBook, 
    { title: t('toasts.bookingConfirmedTitle'), description: t('toasts.bookingConfirmedDescription', { level: t(`skillLevels.${session.level}`) }), duration: 1500 },
    { title: t('toasts.bookingFailedTitle'), description: t('toasts.bookingFailedDescription') }
  );

  const handleCancel = () => {
    if (!canCancel) {
      toast({ title: t('toasts.cancellationFailedTitle'), description: t('toasts.cancellationFailedTime'), variant: 'destructive' });
      return;
    }
    handleAction(
      onCancel, 
      { title: t('toasts.bookingCanceledTitle'), description: t('toasts.bookingCanceledDescription'), duration: 1500 },
      { title: t('toasts.cancellationFailedTitle'), description: t('toasts.cancellationFailedDescription') }
    );
  };

  const handleJoinWaitlist = () => handleAction(
    onWaitlist, 
    { title: t('toasts.waitlistJoinedTitle'), description: t('toasts.waitlistJoinedDescription'), duration: 1500 },
    { title: t('toasts.waitlistJoinFailedTitle'), description: t('toasts.waitlistJoinFailedDescription') }
  );

  const handleLeaveWaitlist = () => handleAction(
    onLeaveWaitlist, 
    { title: t('toasts.waitlistLeftTitle'), description: t('toasts.waitlistLeftDescription'), duration: 1500 },
    { title: t('toasts.waitlistLeaveFailedTitle'), description: t('toasts.waitlistLeaveFailedDescription') }
  );
  
  const canSwipeRight = !isRegistered && !isFull;
  const canSwipeLeft = isRegistered && canCancel;

  // --- Swipe Handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || (!canSwipeLeft && !canSwipeRight)) return;
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isSwiping) return;

    const currentX = e.targetTouches[0].clientX;
    let offset = currentX - touchStart;

    // Restrict swipe direction based on available actions
    if (!canSwipeRight && offset > 0) {
      offset = 0;
    }
    if (!canSwipeLeft && offset < 0) {
      offset = 0;
    }

    setSwipeOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isSwiping) return;

    if (canSwipeRight && swipeOffset > swipeThreshold) {
      handleBook();
    } else if (canSwipeLeft && swipeOffset < -swipeThreshold) {
      handleCancel();
    }
    
    // Reset positions
    setSwipeOffset(0);
    setIsSwiping(false);
  };

  const renderActionButtons = () => {
    if (isRegistered) {
      return (
        <Button
          className="w-full"
          variant="outline"
          onClick={handleCancel}
          disabled={!canCancel}
          title={!canCancel ? t('toasts.cancellationFailedTime') : t('modals.sessionDetails.cancelSpot')}
        >
          <XCircle className="mr-2 h-4 w-4" />
          {t('modals.sessionDetails.cancelSpot')}
        </Button>
      );
    }
  
    if (isOnWaitlist) {
      return (
        <div className="w-full flex flex-col gap-2">
          {!isFull && (
            <Button className="w-full" onClick={handleBook}>
              {t('modals.sessionDetails.bookSpot')}
            </Button>
          )}
          <Button className="w-full" variant="secondary" onClick={handleLeaveWaitlist}>
            <LogOut className="mr-2 h-4 w-4" />
            {t('modals.sessionDetails.leaveWaitlist')}
          </Button>
        </div>
      );
    }
  
    if (!isFull) {
      return (
        <div className="w-full flex flex-col gap-2">
          <Button className="w-full" onClick={handleBook}>
            {t('modals.sessionDetails.bookSpot')}
          </Button>
          <Button className="w-full" variant="secondary" onClick={handleJoinWaitlist}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t('modals.sessionDetails.joinWaitlist')}
          </Button>
        </div>
      );
    } else {
      return (
        <Button className="w-full" variant="secondary" onClick={handleJoinWaitlist}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('modals.sessionDetails.joinWaitlist')}
        </Button>
      );
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-card h-full">
      {isMobile && (
        <>
          {/* Swipe Right to Book Background */}
          {canSwipeRight && (
            <div className="absolute inset-0 bg-green-500 flex items-center justify-start px-6 transition-opacity" style={{ opacity: Math.min(1, Math.max(0, swipeOffset / swipeThreshold)) }}>
              <Check className="h-6 w-6 text-white" />
              <span className="ml-2 font-semibold text-white">{t('modals.sessionDetails.bookSpot')}</span>
            </div>
          )}
          {/* Swipe Left to Cancel Background */}
          {canSwipeLeft && (
            <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-6 transition-opacity" style={{ opacity: Math.min(1, Math.max(0, -swipeOffset / swipeThreshold)) }}>
              <span className="mr-2 font-semibold text-white">{t('modals.sessionDetails.cancelSpot')}</span>
              <XCircle className="h-6 w-6 text-white" />
            </div>
          )}
        </>
      )}
      <div
        className="relative h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease',
        }}
      >
        <Card 
          className="flex flex-col overflow-hidden transition-shadow hover:shadow-xl h-full animate-slide-up-and-fade w-full rounded-lg"
          style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'backwards' }}
        >
          <CardHeader className="p-0 relative">
            <Badge
              variant={isFull ? 'destructive' : 'secondary'}
              className="absolute top-2 right-2 z-10"
            >
              {isFull ? t('components.sessionListItem.full') : t('components.sessionListItem.spotsLeft', { count: spotsLeft })}
            </Badge>
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

          <CardContent className="p-4 flex-grow space-y-4 bg-card">
              <div className="space-y-1 text-base text-muted-foreground">
                 <p className="font-medium text-foreground">{sessionDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                 <p>{formatTime(session.startTime)} - {formatTime(session.endTime)}</p>
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

          <CardFooter className="p-4 pt-0 mt-auto flex flex-col gap-2 bg-card">
            {renderActionButtons()}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

    

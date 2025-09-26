

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
import PlayerAvatar from './player-avatar';
import {
  CheckCircle,
  UserPlus,
  XCircle,
  Eye,
  LogOut,
  Check,
  Clock,
  MapPin,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { formatTime, cn, getSafeDate } from '@/lib/utils';


interface SessionListItemProps {
  session: Session;
  onBook: (sessionId: string) => Promise<boolean>;
  onCancel: (sessionId: string) => Promise<boolean>;
  onWaitlist: (sessionId: string) => Promise<boolean>;
  onLeaveWaitlist: (sessionId: string) => Promise<boolean>;
  onViewPlayers: (session: Session) => void;
  priority?: boolean;
  animationDelay?: number;
  index: number;
}

const categoryStyles: Record<string, { bg: string; text: string; pin: string }> = {
  '0': { bg: 'bg-paper-yellow', text: 'text-red-800', pin: 'bg-red-500' },
  '1': { bg: 'bg-paper-blue', text: 'text-blue-800', pin: 'bg-blue-500' },
  '2': { bg: 'bg-paper-pink', text: 'text-purple-800', pin: 'bg-purple-500' },
  '3': { bg: 'bg-paper-green', text: 'text-green-800', pin: 'bg-green-500' },
};


export default function SessionListItem({
  session,
  onBook,
  onCancel,
  onWaitlist,
  onLeaveWaitlist,
  onViewPlayers,
  priority = false,
  animationDelay = 0,
  index,
}: SessionListItemProps) {
  const { user: currentUser } = useAuth();
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  
  if (!currentUser) return null;

  const players = (session.players || []) as Partial<User>[];
  const waitlist = (session.waitlist || []) as Partial<User>[];

  const rotationClass = `note-${(index % 6) + 1}`;
  const styles = categoryStyles[(index % 4).toString()];

  const isFull = players.length >= session.maxPlayers;
  const isRegistered = players.some(p => p.id === currentUser.id);
  const isOnWaitlist = waitlist.some(p => p.id === currentUser.id);

  const spotsLeft = session.maxPlayers - players.length;
  const progressValue = (players.length / session.maxPlayers) * 100;

  const sessionDateTime = getSafeDate(`${session.date}T${session.startTime}`);
  const now = new Date();
  const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel = hoursUntilSession > 6;
  

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
  

  const renderActionButtons = () => {
    // 1. User is registered
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
  
    // 2. User is on the waitlist
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
  
    // 3. User is not involved, and session is full
    if (isFull) {
        return (
            <Button className="w-full" variant="secondary" onClick={handleJoinWaitlist}>
              <UserPlus className="mr-2 h-4 w-4" />
              {t('modals.sessionDetails.joinWaitlist')}
            </Button>
        );
    }

    // 4. User is not involved, session has space
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
  };


  return (
    <div 
      className={cn('note p-4 rounded-lg shadow-lg relative fade-in flex flex-col h-full', styles.bg, rotationClass)}
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'backwards' }}
    >
      <div className={cn('pushpin', styles.pin)}></div>
      
      <div className="flex-grow space-y-3">
        <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="handwriting text-2xl font-bold text-brown mb-1">{t(`skillLevels.${session.level}`)}</h3>
              <p className="font-semibold text-brown-dark">{getSafeDate(session.date).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <Badge
                variant={isFull ? 'destructive' : 'secondary'}
                className="text-xs"
            >
                {isFull ? t('components.sessionListItem.full') : t('components.sessionListItem.spotsLeft', { count: spotsLeft })}
            </Badge>
        </div>

        <div className="space-y-2 text-sm border-t border-dashed border-brown-light/30 pt-3 text-brown-dark">
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-semibold">{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
            </div>
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                 <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(session.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline hover:text-brown transition-colors"
                >
                  {session.location}
                </a>
            </div>
        </div>
        
        <div className="space-y-2 !mt-4">
             <TooltipProvider>
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2 overflow-hidden">
                    {players.slice(0, 5).map(player => (
                      <PlayerAvatar key={player.id} player={player} className="h-8 w-8 border-2 border-paper" />
                    ))}
                    {players.length > 5 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium border-2 border-paper">
                            +{players.length - 5}
                        </div>
                    )}
                  </div>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-brown-dark hover:bg-brown/10" onClick={() => onViewPlayers(session)}>
                              <Eye className="h-4 w-4" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>{t('components.sessionListItem.viewDetails')}</p>
                      </TooltipContent>
                  </Tooltip>
                </div>
            </TooltipProvider>
            <Progress value={progressValue} className="h-1 bg-brown/20" indicatorClassName='bg-brown' />
        </div>
      </div>

      <div className="pt-4 mt-auto flex flex-col gap-2">
        {renderActionButtons()}
      </div>
    </div>
  );
}

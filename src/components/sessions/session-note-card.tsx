
/**
 * @fileoverview A card component that displays session details as a pinned note.
 * Used on the calendar page to list sessions for a selected day on a corkboard.
 * Includes actions for booking, canceling, or joining a waitlist.
 */
'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Users, UserPlus, XCircle, LogOut } from 'lucide-react';
import type { Session, User } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { getSafeDate } from '@/context/session-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import PlayerAvatar from './player-avatar';
import { TooltipProvider } from '@/components/ui/tooltip';

interface SessionNoteCardProps {
  session: Session;
  onBook: (sessionId: string) => Promise<boolean>;
  onCancel: (sessionId: string) => Promise<boolean>;
  onWaitlist: (sessionId: string) => Promise<boolean>;
  onLeaveWaitlist: (sessionId: string) => Promise<boolean>;
  index: number;
}

export default function SessionNoteCard({
  session,
  onBook,
  onCancel,
  onWaitlist,
  onLeaveWaitlist,
  index,
}: SessionNoteCardProps) {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  if (!currentUser) {
    return null; // Or a loading skeleton
  }
  
  const players = session.players as User[];
  const waitlist = session.waitlist as User[];
  const rotationClass = `note-${(index % 4) + 1}`;

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
      toast({ title: t('toasts.bookingConfirmedTitle'), description: t('toasts.bookingConfirmedDescription', { level: t(`skillLevels.${session.level}`) }), variant: 'success' });
    }
  };

  const handleCancel = async () => {
    const success = await onCancel(session.id);
    if (success) {
      toast({ title: t('toasts.bookingCanceledTitle'), description: t('toasts.bookingCanceledDescription'), variant: 'success' });
    }
  };

  const handleJoinWaitlist = async () => {
    const success = await onWaitlist(session.id);
    if (success) {
      toast({ title: t('toasts.waitlistJoinedTitle'), description: t('toasts.waitlistJoinedDescription'), variant: 'success' });
    }
  };

  const handleLeaveWaitlist = async () => {
    const success = await onLeaveWaitlist(session.id);
    if (success) {
      toast({ title: t('toasts.waitlistLeftTitle'), description: t('toasts.waitlistLeftDescription'), variant: 'success' });
    }
  };

  return (
    <div
      className={cn('note bg-paper p-4 rounded-lg shadow-lg relative fade-in', rotationClass)}
      style={{ animationDelay: `${index * 100}ms` }}
    >
        <div className={cn('pushpin bg-blue-500')}></div>
        <div className="space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="handwriting text-2xl font-bold text-brown mb-1">{t(`skillLevels.${session.level}`)} Level</h3>
                    <Badge variant={isFull ? 'destructive' : 'secondary'} className="text-xs">
                        {isFull ? t('components.sessionListItem.full') : t('components.sessionNoteCard.spotsLeft', { count: session.maxPlayers - players.length })}
                    </Badge>
                </div>
                <div className="flex -space-x-2 overflow-hidden pr-2">
                    <TooltipProvider>
                    {players.slice(0, 3).map(player => (
                      <PlayerAvatar key={player.id} player={player} className="h-8 w-8 border-2 border-paper" />
                    ))}
                    {players.length > 3 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium border-2 border-paper">
                            +{players.length - 3}
                        </div>
                    )}
                    </TooltipProvider>
                </div>
            </div>
            
            <div className="space-y-2 text-sm border-t border-dashed border-brown-light/30 pt-3">
                <div className="flex items-center gap-2 text-brown-dark">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">{session.startTime} - {session.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-brown-dark">
                    <MapPin className="h-4 w-4" />
                    <span className="font-semibold">{session.location}</span>
                </div>
            </div>

             <div className="pt-2 flex flex-col gap-2 items-stretch">
                {isRegistered ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={!canCancel}
                        title={!canCancel ? t('modals.sessionDetails.cancellationTooltip') : t('modals.sessionDetails.cancelSpot')}
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        {t('modals.sessionDetails.cancelSpot')}
                    </Button>
                ) : isOnWaitlist ? (
                    <Button size="sm" variant="secondary" onClick={handleLeaveWaitlist}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {t('modals.sessionDetails.leaveWaitlist')}
                    </Button>
                ) : !isFull ? (
                    <Button size="sm" onClick={handleBook} className="bg-brown text-cream button-hover">
                        {t('modals.sessionDetails.bookSpot')}
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleJoinWaitlist}
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        {t('modals.sessionDetails.joinWaitlist')}
                    </Button>
                )}
            </div>
        </div>
    </div>
  );
}

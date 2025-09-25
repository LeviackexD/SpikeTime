'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Session, User } from '@/lib/types';
import { Users, Calendar, Clock, X, CheckCircle, UserPlus, XCircle, LogOut, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import PlayerAvatar from './player-avatar';
import { TooltipProvider } from '@/components/ui/tooltip';
import GenerateTeamsButton from './generate-teams-button';
import { cn, formatTime, getSafeDate } from '@/lib/utils';
import Image from 'next/image';
import { Input } from '../ui/input';


interface SessionDetailsModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (sessionId: string) => Promise<boolean>;
  onCancel: (sessionId: string) => Promise<boolean>;
  onWaitlist: (sessionId: string) => Promise<boolean>;
  onLeaveWaitlist: (sessionId: string) => Promise<boolean>;
}

export default function SessionDetailsModal({ 
  session, 
  isOpen, 
  onClose,
  onBook,
  onCancel,
  onWaitlist,
  onLeaveWaitlist,
}: SessionDetailsModalProps) {
  const { user: currentUser } = useAuth();
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  
  if (!session || !currentUser) return null;

  const players = (session.players || []) as Partial<User>[];
  const waitlist = (session.waitlist || []) as Partial<User>[];

  const spotsFilled = players.length;
  const progressValue = (spotsFilled / session.maxPlayers) * 100;
  
  const isRegistered = players.some(p => p.id === currentUser.id);
  const isOnWaitlist = waitlist.some(p => p.id === currentUser.id);
  const isFull = spotsFilled >= session.maxPlayers;
  const canGenerateTeams = spotsFilled >= 2;
  
  const handleAction = async (action: (id: string) => Promise<boolean>, successToast: { title: string, description: string, duration?: number }, failureToast: { title: string, description: string }) => {
    if (session) {
      const success = await action(session.id);
      if (success) {
        toast({ ...successToast, variant: 'success' });
        onClose(); // Close modal on success
      } else {
        toast({ ...failureToast, variant: 'destructive' });
      }
    }
  }

  const sessionDateTime = getSafeDate(`${session.date}T${session.startTime}`);
  const now = new Date();
  const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel = hoursUntilSession > 12;

  const bookAction = () => {
    handleAction(
      onBook, 
      { title: t('toasts.bookingConfirmedTitle'), description: t('toasts.bookingConfirmedDescription', { level: t(`skillLevels.${session.level}`) }), duration: 1500 },
      { title: t('toasts.bookingFailedTitle'), description: t('toasts.bookingFailedDescription') }
    );
  }
  const cancelAction = () => {
     if (!canCancel) {
      toast({ title: t('toasts.cancellationFailedTitle'), description: t('toasts.cancellationFailedTime'), variant: 'destructive' });
      return;
    }
    handleAction(
      onCancel, 
      { title: t('toasts.bookingCanceledTitle'), description: t('toasts.bookingCanceledDescription'), duration: 1500 },
      { title: t('toasts.cancellationFailedTitle'), description: t('toasts.cancellationFailedDescription') }
    );
  }
  const joinWaitlistAction = () => {
    handleAction(
      onWaitlist, 
      { title: t('toasts.waitlistJoinedTitle'), description: t('toasts.waitlistJoinedDescription'), duration: 1500 },
      { title: t('toasts.waitlistJoinFailedTitle'), description: t('toasts.waitlistJoinFailedDescription') }
    );
  }
  const leaveWaitlistAction = () => {
    handleAction(
      onLeaveWaitlist, 
      { title: t('toasts.waitlistLeftTitle'), description: t('toasts.waitlistLeftDescription'), duration: 1500 },
      { title: t('toasts.waitlistLeaveFailedTitle'), description: t('toasts.waitlistLeaveFailedDescription') }
    );
  }

  const renderActionButtons = () => {
    if (isRegistered) {
      return (
        <Button
          variant="outline"
          onClick={cancelAction}
          disabled={!canCancel}
          title={!canCancel ? t('toasts.cancellationFailedTime') : t('modals.sessionDetails.cancelSpot')}
        >
          <XCircle className="mr-2 h-4 w-4" /> {t('modals.sessionDetails.cancelSpot')}
        </Button>
      );
    }
  
    if (isOnWaitlist) {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          {!isFull && (
            <Button onClick={bookAction}>
              {t('modals.sessionDetails.bookSpot')}
            </Button>
          )}
          <Button variant="secondary" onClick={leaveWaitlistAction}>
            <LogOut className="mr-2 h-4 w-4" />
            {t('modals.sessionDetails.leaveWaitlist')}
          </Button>
        </div>
      );
    }
  
    if (!isFull) {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={bookAction}>
            {t('modals.sessionDetails.bookSpot')}
          </Button>
          <Button variant="secondary" onClick={joinWaitlistAction}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t('modals.sessionDetails.joinWaitlist')}
          </Button>
        </div>
      );
    } else {
      return (
        <Button variant="secondary" onClick={joinWaitlistAction}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('modals.sessionDetails.joinWaitlist')}
        </Button>
      );
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-headline text-2xl">{t(`skillLevels.${session.level}`)} Session</DialogTitle>
          <DialogDescription>
            {t('modals.sessionDetails.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{getSafeDate(session.date).toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
            </div>
          </div>
          
          <div>
            <div className="mb-2 flex justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{t('modals.sessionDetails.spotsFilled')}</span>
              </div>
              <span>{spotsFilled} / {session.maxPlayers}</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          <TooltipProvider>
            <div>
              <div className="mb-3 flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    {t('modals.sessionDetails.registeredPlayers', { count: players.length })}
                </h3>
                 {canGenerateTeams && <GenerateTeamsButton players={players as User[]} />}
              </div>
              {players.length > 0 ? (
                <div className="rounded-lg border max-h-56 overflow-y-auto p-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {players.map((player) => (
                        <div key={player.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                          <PlayerAvatar player={player} className="h-10 w-10 border-2 border-primary/50" />
                          <div className="flex-grow">
                              <p className="font-semibold text-sm">{player.name}</p>
                              <p className="text-xs text-muted-foreground">{player.skillLevel ? t(`skillLevels.${player.skillLevel}`) : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 rounded-lg border border-dashed">
                  <p className="text-muted-foreground text-center text-sm">{t('modals.sessionDetails.noPlayers')}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-3 font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                {t('modals.sessionDetails.waitlist', { count: waitlist.length })}
              </h3>
              {waitlist.length > 0 ? (
                <div className="rounded-lg border max-h-56 overflow-y-auto p-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {waitlist.map((player) => (
                        <div key={player.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                          <PlayerAvatar player={player} className="h-10 w-10 border-2 border-primary/50" />
                          <div className="flex-grow">
                              <p className="font-semibold text-sm">{player.name}</p>
                               <p className="text-xs text-muted-foreground">{player.skillLevel ? t(`skillLevels.${player.skillLevel}`) : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 rounded-lg border border-dashed">
                  <p className="text-muted-foreground text-center text-sm">{t('modals.sessionDetails.waitlistEmpty')}</p>
                </div>
              )}
            </div>
            
            {session.momentImageUrl && (
                <div className="pt-4">
                    <h3 className="font-semibold text-center mb-2">{t('modals.sessionDetails.sessionMoment')}</h3>
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                        <Image src={session.momentImageUrl} alt={t('modals.sessionDetails.sessionMoment')} fill style={{ objectFit: 'cover' }} />
                    </div>
                </div>
            )}
          </TooltipProvider>

        </div>
        <DialogFooter className='sm:justify-between items-center flex-shrink-0 pt-4'>
            <div className='flex items-center gap-2 flex-wrap'>
              {renderActionButtons()}
            </div>
           <Button variant="ghost" onClick={onClose}>
            {t('modals.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

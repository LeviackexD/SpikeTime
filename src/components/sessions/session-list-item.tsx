/**
 * @fileoverview A card component for displaying a summary of a single session in a list.
 * Used on the main dashboard to show upcoming and available sessions.
 * Includes action buttons and a progress bar for player capacity.
 */

'use client';

import * as React from 'react';
import Image from 'next/image';
import { Calendar, Clock, CheckCircle, XCircle, UserPlus, Users } from 'lucide-react';

// UI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Hooks, Types, & Utils
import { useAuth } from '@/context/auth-context';
import type { Session } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SessionListItemProps {
  session: Session;
  onBook: (sessionId: string) => void;
  onCancel: (sessionId: string) => void;
  onWaitlist: (sessionId: string) => void;
  onViewPlayers: (session: Session) => void;
  priority?: boolean; // For prioritizing image loading (e.g., LCP)
}

export default function SessionListItem({
  session,
  onBook,
  onCancel,
  onWaitlist,
  onViewPlayers,
  priority = false,
}: SessionListItemProps) {
  // --- HOOKS ---
  const { user: currentUser } = useAuth();
  
  // --- DERIVED STATE & LOGIC ---
  if (!currentUser) {
    // Or a loading skeleton
    return null;
  }
  
  const isFull = session.players.length >= session.maxPlayers;
  const isRegistered = session.players.includes(currentUser.id);
  const isOnWaitlist = session.waitlist.includes(currentUser.id);
  const progressValue = (session.players.length / session.maxPlayers) * 100;
  
  const sessionDateTime = new Date(`${session.date}T${session.startTime}`);
  const now = new Date();
  const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel = hoursUntilSession > 24;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  /**
   * A wrapper component to show a tooltip explaining why cancellation is disabled.
   */
  const CancelButtonWrapper = ({ children }: { children: React.ReactNode }) => {
    if (canCancel) {
      return <>{children}</>;
    }
    return (
       <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent>
            <p>Cannot cancel less than 24 hours before the session.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // --- RENDER ---
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-xl w-full h-full">
      {/* Session Image */}
      <div className="relative h-48">
        <Image
          src={session.imageUrl || `https://picsum.photos/seed/${session.id}/400/300`}
          alt={`Volleyball session for ${session.level} level`}
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
        {/* Session Info */}
        <CardHeader className="p-4 pb-2">
          <CardTitle className="font-headline text-lg">{session.level} Level</CardTitle>
        </CardHeader>

        <CardContent className="p-4 pt-0 flex-grow space-y-3">
          {/* Date and Time */}
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
          
          {/* Player Progress Bar */}
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

        {/* Action Buttons */}
        <CardFooter className="bg-muted/50 p-2">
          {isRegistered ? (
            <CancelButtonWrapper>
              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => onCancel(session.id)}
                disabled={!canCancel}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel My Spot
              </Button>
            </CancelButtonWrapper>
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

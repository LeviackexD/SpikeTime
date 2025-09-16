/**
 * @fileoverview A card component for displaying a summary of a single session in a list.
 * Used on the main dashboard to show upcoming and available sessions.
 * Includes action buttons and a progress bar for player capacity.
 */

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import type { Session } from '@/lib/types';
import { useAuth } from '@/context/auth-context';

interface SessionListItemProps {
  session: Session;
  onBook: (sessionId: string) => void;
  onCancel: (sessionId: string) => void;
  onWaitlist: (sessionId: string) => void;
  onViewPlayers: (session: Session) => void; // Kept for compatibility, though not used in this version
  priority?: boolean; // Kept for compatibility
}

export default function SessionListItem({
  session,
  onBook,
  onCancel,
  onWaitlist,
}: SessionListItemProps) {
  const { user } = useAuth();
  if (!user) return null;

  const isPlayer = session.players.includes(user.id);
  const isInWaitlist = session.waitlist?.includes(user.id);
  const isFull = session.players.length >= session.maxPlayers;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    });
  };

  return (
    <div className="rounded-lg border p-4 shadow-sm space-y-4 bg-card">
      <h3 className="text-lg font-semibold">{session.level} Session</h3>
      <p className="text-sm text-muted-foreground">
        {formatDate(session.date)}
      </p>

      <div className="space-y-2">
        {isPlayer ? (
          <Button
            variant="destructive"
            onClick={() => onCancel(session.id)}
            className="w-full"
          >
            Cancelar reserva
          </Button>
        ) : (
          <>
            {/* Show booking button only if not full and not a player */}
            {!isFull && (
              <Button onClick={() => onBook(session.id)} className="w-full">
                Reservar spot
              </Button>
            )}

            {/* Show waitlist button if full */}
            {isFull && (
              <>
                {isInWaitlist ? (
                  <Button disabled className="w-full">
                    Ya estás en la lista de espera
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => onWaitlist(session.id)}
                    className="w-full"
                  >
                    Unirse a la lista de espera
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

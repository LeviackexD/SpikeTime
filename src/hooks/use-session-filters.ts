

/**
 * @fileoverview Custom hooks for filtering and sorting volleyball sessions.
 * This separates the logic from the presentation components.
 */

import * as React from 'react';
import type { Session, User } from '@/lib/types';
import { getSafeDate } from '@/lib/utils';

/**
 * A hook that returns a memoized list of sessions the user is booked into or waitlisted for.
 * @param currentUser The currently authenticated user.
 * @param sessions The complete list of all sessions.
 * @returns A filtered and sorted array of upcoming sessions for the user.
 */
export function useUpcomingSessions(currentUser: User | null, sessions: Session[]): Session[] {
  return React.useMemo(() => {
    if (!currentUser) return [];

    return sessions
      .filter(session => {
        const players = session.players as User[];
        const waitlist = session.waitlist as User[];
        return players.some(p => p.id === currentUser.id) || waitlist.some(w => w.id === currentUser.id);
      })
      .sort((a, b) => getSafeDate(`${a.date}T${a.startTime}`).getTime() - getSafeDate(`${b.date}T${b.startTime}`).getTime());
  }, [currentUser, sessions]);
}

/**
 * A hook that returns a memoized list of sessions available for the user to book.
 * It excludes sessions the user is already booked into or waitlisted for.
 * @param currentUser The currently authenticated user.
 * @param sessions The complete list of all sessions.
 * @returns A filtered and sorted array of available sessions.
 */
export function useAvailableSessions(currentUser: User | null, sessions: Session[]): Session[] {
  return React.useMemo(() => {
    if (!currentUser) return [];

    return sessions
      .filter(session => {
        const players = session.players as User[];
        const waitlist = session.waitlist as User[];
        return !players.some(p => p.id === currentUser.id) && !waitlist.some(w => w.id === currentUser.id);
      })
      .sort((a, b) => getSafeDate(`${a.date}T${a.startTime}`).getTime() - getSafeDate(`${b.date}T${b.startTime}`).getTime());
  }, [currentUser, sessions]);
}

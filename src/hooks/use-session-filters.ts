

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
    const now = new Date();

    return sessions
      .filter(session => {
        const sessionDate = getSafeDate(session.date);
        const [endHours, endMinutes] = session.endTime.split(':').map(Number);
        sessionDate.setHours(endHours, endMinutes, 0, 0);

        const players = session.players as User[];
        const waitlist = session.waitlist as User[];
        const isUserInvolved = currentUser && (players.some(p => p.id === currentUser.id) || waitlist.some(w => w.id === currentUser.id));
        
        return isUserInvolved && sessionDate > now;
      })
      .sort((a, b) => getSafeDate(a.date).getTime() - getSafeDate(b.date).getTime());
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
    const now = new Date();

    return sessions
      .filter(session => {
        const sessionDate = getSafeDate(session.date);
        const [endHours, endMinutes] = session.endTime.split(':').map(Number);
        sessionDate.setHours(endHours, endMinutes, 0, 0);

        const players = session.players as User[];
        const waitlist = session.waitlist as User[];
        const isUserInvolved = currentUser && (players.some(p => p.id === currentUser?.id) || waitlist.some(w => w.id === currentUser?.id));
        
        return !isUserInvolved && sessionDate > now;
      })
      .sort((a, b) => getSafeDate(a.date).getTime() - getSafeDate(b.date).getTime());
  }, [currentUser, sessions]);
}

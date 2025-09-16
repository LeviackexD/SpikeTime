/**
 * @fileoverview A reusable component for displaying a grid of session list items.
 */

import SessionListItem from '@/components/sessions/session-list-item';
import type { Session } from '@/lib/types';

interface SessionGridProps {
  sessions: Session[];
  onBook: (sessionId: string) => void;
  onCancel: (sessionId: string) => void;
  onWaitlist: (sessionId: string) => void;
  onViewPlayers: (session: Session) => void;
}

const SessionGrid = ({ sessions, onBook, onCancel, onWaitlist, onViewPlayers }: SessionGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
    {sessions.map((session, index) => (
      <SessionListItem
        key={session.id}
        session={session}
        onBook={onBook}
        onCancel={onCancel}
        onWaitlist={onWaitlist}
        onViewPlayers={onViewPlayers}
        priority={index === 0}
      />
    ))}
  </div>
);

export default SessionGrid;


'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import { Button } from '@/components/ui/button';
import { mockSessions, currentUser } from '@/lib/mock-data';
import Link from 'next/link';
import type { Session } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import SessionListItem from '@/components/sessions/session-list-item';
import SectionHeader from '@/components/layout/section-header';
import { Volleyball } from 'lucide-react';
import SessionDetailsModal from '@/components/sessions/session-details-modal';

type ToastInfo = {
  title: string;
  description: string;
  variant: 'success' | 'destructive';
};

const DashboardPage: NextPage = () => {
  const [sessions, setSessions] = React.useState<Session[]>(mockSessions);
  const [sessionToView, setSessionToView] = React.useState<Session | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [toastInfo, setToastInfo] = React.useState<ToastInfo | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (toastInfo) {
      toast({
        title: toastInfo.title,
        description: toastInfo.description,
        variant: toastInfo.variant,
      });
      setToastInfo(null);
    }
  }, [toastInfo, toast]);

  const handleBooking = (sessionId: string) => {
    let bookedSession: Session | undefined;
    setSessions((prevSessions) => {
        const sessionToBook = prevSessions.find(s => s.id === sessionId);
        if (!sessionToBook || sessionToBook.players.some(p => p.id === currentUser.id)) {
            return prevSessions;
        }

        if (sessionToBook.players.length < sessionToBook.maxPlayers) {
            bookedSession = sessionToBook;
            const updatedSessions = prevSessions.map(session =>
                session.id === sessionId
                    ? { ...session, players: [...session.players, currentUser] }
                    : session
            );
            if(sessionToView?.id === sessionId) {
              setSessionToView(updatedSessions.find(s => s.id === sessionId) || null);
            }
            return updatedSessions;
        }
        return prevSessions;
    });

    if (bookedSession) {
      setToastInfo({
        title: 'Booking Confirmed!',
        description: `You're all set for the ${bookedSession.level} session.`,
        variant: 'success',
      });
    }
  };

  const handleJoinWaitlist = (sessionId: string) => {
    let joinedSession: Session | undefined;
    setSessions(prevSessions => {
        const sessionToJoin = prevSessions.find(s => s.id === sessionId);
        if (!sessionToJoin || sessionToJoin.waitlist.some(p => p.id === currentUser.id)) {
            return prevSessions;
        }

        if (sessionToJoin.players.length >= sessionToJoin.maxPlayers) {
            joinedSession = sessionToJoin;
            const updatedSessions = prevSessions.map(session =>
                session.id === sessionId
                    ? { ...session, waitlist: [...session.waitlist, currentUser] }
                    : session
            );
            if(sessionToView?.id === sessionId) {
              setSessionToView(updatedSessions.find(s => s.id === sessionId) || null);
            }
            return updatedSessions;
        }
        return prevSessions;
    });

    if(joinedSession){
      setToastInfo({
        title: 'You are on the waitlist!',
        description: "We'll notify you if a spot opens up.",
        variant: 'success'
      });
    }
  };

  const handleCancelBooking = (sessionId: string) => {
    let canceledSession: Session | undefined;
    setSessions(prevSessions => {
        const sessionToCancel = prevSessions.find(s => s.id === sessionId);
        if (!sessionToCancel || !sessionToCancel.players.some(p => p.id === currentUser.id)) {
            return prevSessions;
        }
        
        canceledSession = sessionToCancel;
        const updatedSessions = prevSessions.map(session =>
            session.id === sessionId
                ? { ...session, players: session.players.filter(p => p.id !== currentUser.id) }
                : session
        );

        if(sessionToView?.id === sessionId) {
            setSessionToView(updatedSessions.find(s => s.id === sessionId) || null);
        }
        return updatedSessions;
    });

    if (canceledSession) {
      setToastInfo({
        title: 'Booking Canceled',
        description: 'Your spot has been successfully canceled.',
        variant: 'destructive',
      });
    }
  };

  const handleViewPlayers = (session: Session) => {
    setSessionToView(session);
    setIsViewModalOpen(true);
  };

  const upcomingSessions = sessions.filter(session => 
    new Date(session.date) >= new Date() && session.players.some(p => p.id === currentUser.id)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const availableSessions = sessions.filter(session =>
    new Date(session.date) >= new Date() && !session.players.some(p => p.id === currentUser.id)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">Welcome back, Manu!</h1>
        <p className="text-muted-foreground">Here's what's happening in your volleyball world.</p>
      </div>
      
      <div className="flex flex-col gap-8">
        <SectionHeader icon={Volleyball} title="My Upcoming Sessions" />
        {upcomingSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {upcomingSessions.map((session, index) => (
               <SessionListItem 
                  key={session.id}
                  session={session}
                  currentUser={currentUser}
                  onBook={handleBooking}
                  onCancel={handleCancelBooking}
                  onWaitlist={handleJoinWaitlist}
                  onViewPlayers={() => handleViewPlayers(session)}
                  priority={index === 0}
               />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-lg bg-muted/50 border border-dashed">
            <p className="text-muted-foreground mb-4">You have no upcoming sessions booked.</p>
            <Button asChild>
              <Link href="/calendar">Browse Sessions</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8">
         <SectionHeader icon={Volleyball} title="Available Sessions" />
        {availableSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {availableSessions.map((session) => (
               <SessionListItem 
                  key={session.id}
                  session={session}
                  currentUser={currentUser}
                  onBook={handleBooking}
                  onCancel={handleCancelBooking}
                  onWaitlist={handleJoinWaitlist}
                  onViewPlayers={() => handleViewPlayers(session)}
               />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-lg bg-muted/50 border border-dashed">
            <p className="text-muted-foreground">No other sessions available at the moment.</p>
          </div>
        )}
      </div>

      <SessionDetailsModal
        session={sessionToView}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onBook={handleBooking}
        onCancel={handleCancelBooking}
        onWaitlist={handleJoinWaitlist}
      />
    </div>
  );
};

export default DashboardPage;

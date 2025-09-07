'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockSessions, currentUser } from '@/lib/mock-data';
import { VolleyballIcon } from '@/components/icons/volleyball-icon';
import Link from 'next/link';
import type { Session } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import SessionListItem from '@/components/sessions/session-list-item';

const DashboardPage: NextPage = () => {
  const [sessions, setSessions] = React.useState<Session[]>(mockSessions);
  const { toast } = useToast();

  const handleBooking = (sessionId: string) => {
    let sessionToBook: Session | undefined;
    setSessions(prevSessions => {
      const updatedSessions = prevSessions.map(session => {
        if (session.id === sessionId) {
          if (session.players.length < session.maxPlayers && !session.players.some(p => p.id === currentUser.id)) {
            sessionToBook = session;
            return { ...session, players: [...session.players, currentUser] };
          }
        }
        return session;
      });
      return updatedSessions;
    });

    if (sessionToBook) {
      toast({
        title: 'Booking Confirmed!',
        description: `You're all set for the ${sessionToBook.level} session.`,
        variant: 'success',
      });
    }
  };

  const handleJoinWaitlist = (sessionId: string) => {
    let sessionToJoin: Session | undefined;
    setSessions(prevSessions => {
      const updatedSessions = prevSessions.map(session => {
        if (session.id === sessionId) {
           if (session.players.length >= session.maxPlayers && !session.waitlist.some(p => p.id === currentUser.id)) {
            sessionToJoin = session;
            return { ...session, waitlist: [...session.waitlist, currentUser] };
          }
        }
        return session;
      });
      return updatedSessions;
    });
    
    if (sessionToJoin) {
       toast({
        title: 'You are on the waitlist!',
        description: "We'll notify you if a spot opens up.",
        variant: 'success'
      });
    }
  };

  const handleCancelBooking = (sessionId: string) => {
    let sessionToCancel: Session | undefined;
    setSessions(prevSessions => {
       const updatedSessions = prevSessions.map(session => {
        if (session.id === sessionId && session.players.some(p => p.id === currentUser.id)) {
          sessionToCancel = session;
          return { ...session, players: session.players.filter(p => p.id !== currentUser.id) };
        }
        return session;
      });
      return updatedSessions;
    });

    if(sessionToCancel) {
      toast({
        title: 'Booking Canceled',
        description: 'Your spot has been successfully canceled.',
        variant: 'destructive',
      });
    }
  };

  const upcomingSessions = sessions.filter(session => 
    new Date(session.date) >= new Date() && session.players.some(p => p.id === currentUser.id)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const availableSessions = sessions.filter(session =>
    new Date(session.date) >= new Date() && !session.players.some(p => p.id === currentUser.id)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's what's happening in your volleyball world.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-8">
          {/* My Upcoming Sessions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <VolleyballIcon className="h-6 w-6 text-primary" />
                My Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-6">
                  {upcomingSessions.map((session, index) => (
                     <SessionListItem 
                        key={session.id}
                        session={session}
                        currentUser={currentUser}
                        onBook={handleBooking}
                        onCancel={handleCancelBooking}
                        onWaitlist={handleJoinWaitlist}
                        priority={index === 0}
                     />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground mb-4">You have no upcoming sessions booked.</p>
                  <Button asChild>
                    <Link href="/calendar">Browse Sessions</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Available Sessions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <VolleyballIcon className="h-6 w-6 text-primary" />
                Available Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableSessions.length > 0 ? (
                <div className="space-y-6">
                  {availableSessions.map((session) => (
                     <SessionListItem 
                        key={session.id}
                        session={session}
                        currentUser={currentUser}
                        onBook={handleBooking}
                        onCancel={handleCancelBooking}
                        onWaitlist={handleJoinWaitlist}
                     />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">No other sessions available at the moment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

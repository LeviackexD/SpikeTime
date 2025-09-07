
'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import SessionCalendar from '@/components/dashboard/session-calendar';
import { mockSessions, currentUser } from '@/lib/mock-data';
import { Calendar as CalendarIcon, Info } from 'lucide-react';
import type { Session } from '@/lib/types';
import SessionDetailsCard from '@/components/sessions/session-details-card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

type ToastInfo = {
  title: string;
  description: string;
  variant: 'success' | 'destructive';
};

const CalendarPage: NextPage = () => {
  const [sessions, setSessions] = React.useState<Session[]>(mockSessions);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [skillFilter, setSkillFilter] = React.useState<string>('All');
  const [toastInfo, setToastInfo] = React.useState<ToastInfo | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    setSelectedDate(new Date());
  }, []);

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
    setSessions(prevSessions => {
      const sessionToBook = prevSessions.find(s => s.id === sessionId);
      if (!sessionToBook || sessionToBook.players.some(p => p.id === currentUser.id)) return prevSessions;

      if (sessionToBook.players.length < sessionToBook.maxPlayers) {
        bookedSession = sessionToBook;
        return prevSessions.map(session =>
          session.id === sessionId
            ? { ...session, players: [...session.players, currentUser] }
            : session
        );
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
      if (!sessionToJoin || sessionToJoin.waitlist.some(p => p.id === currentUser.id)) return prevSessions;

      if (sessionToJoin.players.length >= sessionToJoin.maxPlayers) {
        joinedSession = sessionToJoin;
        return prevSessions.map(session =>
          session.id === sessionId
            ? { ...session, waitlist: [...session.waitlist, currentUser] }
            : session
        );
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
      if (!sessionToCancel || !sessionToCancel.players.some(p => p.id === currentUser.id)) return prevSessions;

      canceledSession = sessionToCancel;
      return prevSessions.map(session =>
        session.id === sessionId
          ? { ...session, players: session.players.filter(p => p.id !== currentUser.id) }
          : session
      );
    });

    if (canceledSession) {
        setToastInfo({
            title: 'Booking Canceled',
            description: 'Your spot has been successfully canceled.',
            variant: 'destructive',
        });
    }
  };
  
  const filteredSessions = React.useMemo(() => {
    if (!selectedDate) return [];
    return sessions.filter(session => {
        const sessionDate = new Date(session.date).toDateString();
        const isSameDay = sessionDate === selectedDate.toDateString();
        const matchesFilter = skillFilter === 'All' || session.level === skillFilter;
        return isSameDay && matchesFilter;
    });
  }, [sessions, selectedDate, skillFilter]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <div className="lg:col-span-3 flex flex-col gap-8">
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                  Session Calendar
                  </CardTitle>
                  <CardDescription>
                      Find and book your next volleyball session. Use the legend below to guide you.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  {selectedDate ? (
                    <SessionCalendar 
                        sessions={sessions}
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                        skillFilter={skillFilter}
                        currentUser={currentUser}
                    />
                  ) : (
                    <Skeleton className="w-full h-[375px]" />
                  )}
                  <div className="mt-4 flex items-center gap-6 text-sm">
                    <h3 className="font-semibold text-muted-foreground">Legend:</h3>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-orange-500" />
                      <span>My Booked Sessions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <span>Available Sessions</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">Filter by Skill Level</h3>
                    <Select value={skillFilter} onValueChange={setSkillFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select skill level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Levels</SelectItem>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                            <SelectItem value="All-Rounder">All-Rounder</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
              </CardContent>
          </Card>
      </div>

      <div className="lg:col-span-2">
          <Card>
              <CardHeader>
                  <CardTitle>
                      {selectedDate ? `Sessions on ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` : 'Loading Sessions...'}
                  </CardTitle>
                  <CardDescription>
                      {selectedDate && (filteredSessions.length > 0 
                          ? `Found ${filteredSessions.length} session(s).` 
                          : 'No sessions scheduled for this day.')}
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  {!selectedDate ? (
                     <div className="space-y-4">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                     </div>
                  ) : filteredSessions.length > 0 ? (
                      <div className="space-y-6">
                      {filteredSessions.map(session => (
                          <SessionDetailsCard
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
                      <div className="flex flex-col items-center justify-center text-center py-16 rounded-lg bg-muted/50">
                          <Info className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-xl font-semibold">No Sessions Found</h3>
                          <p className="text-muted-foreground">Try selecting another date or changing the filter.</p>
                      </div>
                  )}
              </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default CalendarPage;

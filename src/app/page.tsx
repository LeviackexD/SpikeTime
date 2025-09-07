
'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockSessions, currentUser, mockUsers } from '@/lib/mock-data';
import { ArrowRight, Calendar, Clock, Users, CheckCircle, UserPlus } from 'lucide-react';
import { VolleyballIcon } from '@/components/icons/volleyball-icon';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { Session } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


const DashboardPage: NextPage = () => {
  // Mock user's booked sessions - We'll use state to make it interactive
  const [sessions, setSessions] = React.useState<Session[]>(mockSessions.slice(0,3));
  const { toast } = useToast();

  const handleBooking = (sessionId: string) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId && session.players.length < session.maxPlayers) {
          if (session.players.some(p => p.id === currentUser.id)) return session; // Already registered
          toast({
            title: 'Booking Confirmed!',
            description: `You're all set for the ${session.level} session.`,
            variant: 'success',
          });
          return { ...session, players: [...session.players, currentUser] };
        }
        return session;
      })
    );
  };

  const handleJoinWaitlist = (sessionId: string) => {
     setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId && session.players.length >= session.maxPlayers) {
          if (session.waitlist.some(p => p.id === currentUser.id)) return session; // Already on waitlist
          toast({
            title: 'You are on the waitlist!',
            description: `We'll notify you if a spot opens up.`,
            variant: 'success'
          });
          return { ...session, waitlist: [...session.waitlist, currentUser] };
        }
        return session;
      })
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's what's happening in your volleyball world.</p>
      </div>

      {/* My Upcoming Sessions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <VolleyballIcon className="h-6 w-6 text-primary" />
            My Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => {
                 const isFull = session.players.length >= session.maxPlayers;
                 const isRegistered = session.players.some(p => p.id === currentUser.id);
                 const isOnWaitlist = session.waitlist.some(p => p.id === currentUser.id);

                 return (
                    <Card key={session.id} className="flex flex-col overflow-hidden transition-all hover:scale-105">
                        <div className="relative h-48 w-full">
                            <Image 
                            src={`https://picsum.photos/seed/${session.id}/600/400`} 
                            alt="Volleyball session" 
                            fill
                            style={{ objectFit: 'cover' }}
                            data-ai-hint="volleyball action"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute top-2 right-2">
                               <Badge variant={isFull ? 'destructive' : 'secondary'}>
                                {isFull ? 'Full' : 'Open'}
                               </Badge>
                            </div>
                            <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="font-headline text-2xl font-bold text-white">
                                Beach Volleyball
                            </h3>
                            <p className="font-semibold text-primary">{session.level} Level</p>
                            </div>
                        </div>
                        <CardContent className="flex-grow p-4 space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-semibold">
                                {new Date(session.date).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                    timeZone: 'UTC',
                                })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-semibold">{session.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span className="text-sm font-semibold">{session.players.length} / {session.maxPlayers} players</span>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            {isRegistered ? (
                                <Button className="w-full" variant="outline" disabled>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    You're Registered
                                </Button>
                            ) : isFull ? (
                                isOnWaitlist ? (
                                    <Button className="w-full" variant="outline" disabled>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        On Waitlist
                                    </Button>
                                ) : (
                                    <Button className="w-full" variant="secondary" onClick={() => handleJoinWaitlist(session.id)}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Join Waitlist
                                    </Button>
                                )
                            ) : (
                                <Button className="w-full" onClick={() => handleBooking(session.id)}>
                                    Book My Spot
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                 );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You have no upcoming sessions.</p>
              <Button asChild>
                <Link href="/calendar">Browse Sessions</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;

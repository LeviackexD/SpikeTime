import type { NextPage } from 'next';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockSessions, currentUser } from '@/lib/mock-data';
import { ArrowRight, Calendar, Clock, Users } from 'lucide-react';
import { VolleyballIcon } from '@/components/icons/volleyball-icon';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const DashboardPage: NextPage = () => {
  const userSessions = mockSessions.slice(0, 3); // Mock user's booked sessions

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
          {userSessions.length > 0 ? (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userSessions.map((session) => (
                <Card key={session.id} className="flex flex-col overflow-hidden transition-all hover:scale-105">
                  <div className="relative h-40 w-full">
                    <Image 
                      src={`https://picsum.photos/seed/${session.id}/600/400`} 
                      alt="Volleyball session" 
                      layout="fill" 
                      objectFit="cover"
                      data-ai-hint="volleyball action"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="font-headline text-xl font-bold text-white">
                        Beach Volleyball - {session.level}
                      </h3>
                      <Badge variant="secondary" className="mt-1">{session.level}</Badge>
                    </div>
                  </div>
                  <CardContent className="flex-grow p-4 space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
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
                      <span className="text-sm">{session.time}</span>
                    </div>
                     <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{session.players.length} / {session.maxPlayers} spots</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                     <Button className="w-full" variant="outline" asChild>
                      <Link href="#">
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
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

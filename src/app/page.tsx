import type { NextPage } from 'next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockSessions, currentUser } from '@/lib/mock-data';
import { ArrowRight } from 'lucide-react';
import { VolleyballIcon } from '@/components/icons/volleyball-icon';
import Link from 'next/link';

const DashboardPage: NextPage = () => {
  const userSessions = mockSessions.slice(0, 2); // Mock user's booked sessions

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
          <div className="space-y-4">
            {userSessions.length > 0 ? (
              userSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border bg-card-foreground/5 p-4 transition-all hover:bg-card-foreground/10"
                >
                  <div>
                    <p className="font-semibold text-lg">{session.level}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'UTC',
                      })}{' '}
                      - {session.time}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="#">
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You have no upcoming sessions.</p>
                <Button asChild>
                  <Link href="/calendar">Browse Sessions</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;

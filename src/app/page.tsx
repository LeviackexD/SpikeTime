import type { NextPage } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SessionCalendar from '@/components/dashboard/session-calendar';
import { mockAnnouncements, mockSessions, currentUser } from '@/lib/mock-data';
import { Calendar, ArrowRight, Bell } from 'lucide-react';
import SummarizeButton from '@/components/ai/summarize-button';
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

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
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
                    <Button>Browse Sessions</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline">Announcements</CardTitle>
              </div>
               <SummarizeButton announcements={mockAnnouncements.map(a => `${a.title}: ${a.content}`).join('\n\n')} />
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {mockAnnouncements.slice(0, 3).map((announcement) => (
                  <li key={announcement.id} className="border-l-4 border-primary pl-4">
                    <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground">{announcement.content}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Side Calendar */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Session Calendar
              </CardTitle>
              <CardDescription>
                Find and book your next volleyball session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionCalendar sessions={mockSessions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

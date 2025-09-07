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
import { mockAnnouncements, mockSessions } from '@/lib/mock-data';
import { Calendar, Clock, ArrowRight, Bell } from 'lucide-react';
import SummarizeButton from '@/components/ai/summarize-button';
import { VolleyballIcon } from '@/components/icons/volleyball-icon';
import Link from 'next/link';

const DashboardPage: NextPage = () => {
  const userSessions = mockSessions.slice(0, 2); // Mock user's booked sessions

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Calendar View */}
        <div className="md:col-span-2">
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

        {/* Side Cards */}
        <div className="space-y-8">
          {/* My Upcoming Sessions */}
          <Card>
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
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-semibold">{session.level}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                          })}{' '}
                          - {session.time}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="#">
                          Details <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You have no upcoming sessions.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mockAnnouncements.slice(0, 3).map((announcement) => (
                  <li key={announcement.id} className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{announcement.title}:</span> {announcement.content}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-end">
                <SummarizeButton announcements={mockAnnouncements.map(a => `${a.title}: ${a.content}`).join('\n\n')} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

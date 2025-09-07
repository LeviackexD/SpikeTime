
import type { NextPage } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import SessionCalendar from '@/components/dashboard/session-calendar';
import { mockSessions } from '@/lib/mock-data';
import { Calendar } from 'lucide-react';

const CalendarPage: NextPage = () => {
  return (
    <Card>
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
  );
};

export default CalendarPage;


import type { NextPage } from 'next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockAnnouncements } from '@/lib/mock-data';
import { Bell } from 'lucide-react';
import SummarizeButton from '@/components/ai/summarize-button';

const AnnouncementsPage: NextPage = () => {
  return (
    <div className="space-y-8">
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
            {mockAnnouncements.map((announcement) => (
              <li key={announcement.id} className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                <p className="text-sm text-muted-foreground">{announcement.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(announcement.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnouncementsPage;

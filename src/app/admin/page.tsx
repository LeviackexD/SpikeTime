'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockSessions, mockAnnouncements } from '@/lib/mock-data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

export default function AdminPage() {
  return (
    <Tabs defaultValue="sessions">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="sessions">Manage Sessions</TabsTrigger>
          <TabsTrigger value="announcements">Manage Announcements</TabsTrigger>
        </TabsList>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>
      <TabsContent value="sessions" className="mt-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="font-medium">{new Date(session.date).toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground">{session.time}</div>
                  </TableCell>
                  <TableCell>{session.level}</TableCell>
                  <TableCell>
                    {session.players.length} / {session.maxPlayers}
                  </TableCell>
                  <TableCell>
                    <Badge variant={session.players.length >= session.maxPlayers ? 'destructive' : 'secondary'}>
                      {session.players.length >= session.maxPlayers ? 'Full' : 'Open'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Players</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      <TabsContent value="announcements" className="mt-6">
      <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAnnouncements.map((ann) => (
                <TableRow key={ann.id}>
                  <TableCell className="font-medium">{ann.title}</TableCell>
                  <TableCell className="max-w-sm truncate">{ann.content}</TableCell>
                  <TableCell>{new Date(ann.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}

'use client';

import * as React from 'react';
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
import type { Session, Announcement } from '@/lib/types';
import SessionFormModal from '@/components/admin/session-form-modal';
import DeleteSessionDialog from '@/components/admin/delete-session-dialog';
import SessionDetailsModal from '@/components/sessions/session-details-modal';
import AnnouncementFormModal from '@/components/admin/announcement-form-modal';
import DeleteAnnouncementDialog from '@/components/admin/delete-announcement-dialog';

export default function AdminPage() {
  const [activeTab, setActiveTab] = React.useState('sessions');
  const [sessions, setSessions] = React.useState<Session[]>(mockSessions);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>(mockAnnouncements);

  const [isSessionModalOpen, setIsSessionModalOpen] = React.useState(false);
  const [selectedSession, setSelectedSession] = React.useState<Session | null>(null);
  const [isDeleteSessionDialogOpen, setIsDeleteSessionDialogOpen] = React.useState(false);
  const [sessionToDelete, setSessionToDelete] = React.useState<Session | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [sessionToView, setSessionToView] = React.useState<Session | null>(null);

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = React.useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<Announcement | null>(null);
  const [isDeleteAnnouncementDialogOpen, setIsDeleteAnnouncementDialogOpen] = React.useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = React.useState<Announcement | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { timeZone: 'UTC' });
  };
  
  const handleCreateNew = () => {
    if (activeTab === 'sessions') {
      setSelectedSession(null);
      setIsSessionModalOpen(true);
    } else {
      setSelectedAnnouncement(null);
      setIsAnnouncementModalOpen(true);
    }
  };

  const handleEditSession = (session: Session) => {
    setSelectedSession(session);
    setIsSessionModalOpen(true);
  };
  
  const handleDeleteSessionClick = (session: Session) => {
    setSessionToDelete(session);
    setIsDeleteSessionDialogOpen(true);
  }

  const handleViewPlayers = (session: Session) => {
    setSessionToView(session);
    setIsViewModalOpen(true);
  };

  const confirmDeleteSession = () => {
    if (sessionToDelete) {
        setSessions(sessions.filter(s => s.id !== sessionToDelete.id));
        setSessionToDelete(null);
        setIsDeleteSessionDialogOpen(false);
    }
  }

  const handleSaveSession = (sessionData: Session) => {
    if (selectedSession) {
      // Edit existing session
      setSessions(sessions.map((s) => (s.id === sessionData.id ? sessionData : s)));
    } else {
      // Create new session
      setSessions([...sessions, { ...sessionData, id: `s${sessions.length + 1}` }]);
    }
    setIsSessionModalOpen(false);
    setSelectedSession(null);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsAnnouncementModalOpen(true);
  };

  const handleDeleteAnnouncementClick = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
    setIsDeleteAnnouncementDialogOpen(true);
  };

  const confirmDeleteAnnouncement = () => {
    if (announcementToDelete) {
      setAnnouncements(announcements.filter(a => a.id !== announcementToDelete.id));
      setAnnouncementToDelete(null);
      setIsDeleteAnnouncementDialogOpen(false);
    }
  };

  const handleSaveAnnouncement = (announcementData: Announcement) => {
    if (selectedAnnouncement) {
      // Edit existing announcement
      setAnnouncements(announcements.map((a) => (a.id === announcementData.id ? announcementData : a)));
    } else {
      // Create new announcement
      setAnnouncements([...announcements, { ...announcementData, id: `a${announcements.length + 1}`, date: new Date().toISOString() }]);
    }
    setIsAnnouncementModalOpen(false);
    setSelectedAnnouncement(null);
  };


  return (
    <Tabs defaultValue="sessions" onValueChange={setActiveTab}>
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="sessions">Manage Sessions</TabsTrigger>
          <TabsTrigger value="announcements">Manage Announcements</TabsTrigger>
        </TabsList>
        <Button onClick={handleCreateNew}>
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
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="font-medium">{formatDate(session.date)}</div>
                    <div className="text-sm text-muted-foreground">{session.time}</div>
                  </TableCell>
                  <TableCell>{session.level}</TableCell>
                  <TableCell>
                    {session.players.length} / {session.maxPlayers}
                    {session.waitlist.length > 0 && ` (+${session.waitlist.length} waitlist)`}
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
                        <DropdownMenuItem onClick={() => handleEditSession(session)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewPlayers(session)}>View Players</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteSessionClick(session)}>
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
              {announcements.map((ann) => (
                <TableRow key={ann.id}>
                  <TableCell className="font-medium">{ann.title}</TableCell>
                  <TableCell className="max-w-sm truncate">{ann.content}</TableCell>
                  <TableCell>{formatDate(ann.date)}</TableCell>
                  <TableCell className="text-right">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditAnnouncement(ann)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteAnnouncementClick(ann)}>
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
      
      <SessionFormModal 
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSave={handleSaveSession}
        session={selectedSession}
      />
      
      <DeleteSessionDialog
        isOpen={isDeleteSessionDialogOpen}
        onClose={() => setIsDeleteSessionDialogOpen(false)}
        onConfirm={confirmDeleteSession}
      />

      <SessionDetailsModal
        session={sessionToView}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />

      <AnnouncementFormModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onSave={handleSaveAnnouncement}
        announcement={selectedAnnouncement}
      />

      <DeleteAnnouncementDialog
        isOpen={isDeleteAnnouncementDialogOpen}
        onClose={() => setIsDeleteAnnouncementDialogOpen(false)}
        onConfirm={confirmDeleteAnnouncement}
      />

    </Tabs>
  );
}

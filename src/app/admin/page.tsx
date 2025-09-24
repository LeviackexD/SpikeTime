
/**
 * @fileoverview Admin management page for volleyball sessions and club announcements.
 * Allows administrators to create, view, update, and delete sessions and announcements.
 * It provides both a table view for desktop and a card view for mobile.
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SessionFormModal from '@/components/admin/session-form-modal';
import DeleteSessionDialog from '@/components/admin/delete-session-dialog';
import SessionDetailsModal from '@/components/sessions/session-details-modal';
import AnnouncementFormModal from '@/components/admin/announcement-form-modal';
import DeleteAnnouncementDialog from '@/components/admin/delete-announcement-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSessions, getSafeDate } from '@/context/session-context';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import type { Session, Announcement, User } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

// --- Helper Functions ---

const formatDate = (date: string | Timestamp, locale: string) => {
  return getSafeDate(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

// --- Sub-components for Mobile View ---

const SessionCards = ({
  sessions,
  handleEditSession,
  handleViewPlayers,
  handleDeleteSessionClick,
  t,
  locale
}: {
  sessions: Session[];
  handleEditSession: (session: Session) => void;
  handleViewPlayers: (session: Session) => void;
  handleDeleteSessionClick: (session: Session) => void;
  t: (key: string) => string;
  locale: string;
}) => (
  <div className="space-y-4">
    {sessions.map((session) => (
      <Card key={session.id}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{t(`skillLevels.${session.level}`)}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {formatDate(session.date, locale)} - {session.startTime} - {session.endTime}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditSession(session)}>
                  {t('adminPage.actions.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewPlayers(session)}>
                  {t('adminPage.actions.viewPlayers')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={() => handleDeleteSessionClick(session)}
                >
                  {t('adminPage.actions.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">{t('adminPage.sessionTable.players')}: </span>
            {(session.players as User[]).length} / {session.maxPlayers}
            {(session.waitlist as User[]).length > 0 && ` ${t('adminPage.statusValues.waitlist').replace('{count}', String((session.waitlist as User[]).length))}`}
          </div>
          <div>
            <span className="font-semibold">{t('adminPage.sessionTable.status')}: </span>
            <Badge
              variant={(session.players as User[]).length >= session.maxPlayers ? 'destructive' : 'secondary'}
            >
              {(session.players as User[]).length >= session.maxPlayers ? t('adminPage.statusValues.full') : t('adminPage.statusValues.open')}
            </Badge>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const AnnouncementCards = ({
  announcements,
  handleEditAnnouncement,
  handleDeleteAnnouncementClick,
  t,
  locale
}: {
  announcements: Announcement[];
  handleEditAnnouncement: (announcement: Announcement) => void;
  handleDeleteAnnouncementClick: (announcement: Announcement) => void;
  t: (key: string) => string;
  locale: string;
}) => (
  <div className="space-y-4">
    {announcements.map((ann) => (
      <Card key={ann.id}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{ann.title[locale]}</CardTitle>
              <div className="text-sm text-muted-foreground">{formatDate(ann.date, locale)}</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditAnnouncement(ann)}>{t('adminPage.actions.edit')}</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={() => handleDeleteAnnouncementClick(ann)}
                >
                  {t('adminPage.actions.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div>{ann.content[locale]}</div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// --- Main Admin Page Component ---

export default function AdminPage() {
  // --- HOOKS ---
  const { user } = useAuth();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const {
    sessions,
    createSession,
    updateSession,
    deleteSession,
    bookSession,
    cancelBooking,
    joinWaitlist,
    leaveWaitlist,
    announcements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useSessions();
  const isMobile = useIsMobile();

  // --- STATE ---
  const [activeTab, setActiveTab] = React.useState('sessions');

  // Session Modals State
  const [isSessionModalOpen, setIsSessionModalOpen] = React.useState(false);
  const [selectedSession, setSelectedSession] = React.useState<Session | null>(null);
  const [isDeleteSessionDialogOpen, setIsDeleteSessionDialogOpen] = React.useState(false);
  const [sessionToDelete, setSessionToDelete] = React.useState<Session | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [sessionToView, setSessionToView] = React.useState<Session | null>(null);

  // Announcement Modals State
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = React.useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<Announcement | null>(null);
  const [isDeleteAnnouncementDialogOpen, setIsDeleteAnnouncementDialogOpen] = React.useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = React.useState<Announcement | null>(null);

  // --- EFFECTS ---

  // Redirect non-admin users
  React.useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  // --- EVENT HANDLERS ---

  const handleCreateNew = () => {
    if (activeTab === 'sessions') {
      setSelectedSession(null);
      setIsSessionModalOpen(true);
    } else {
      setSelectedAnnouncement(null);
      setIsAnnouncementModalOpen(true);
    }
  };

  // Session Handlers
  const handleEditSession = (session: Session) => {
    setSelectedSession(session);
    setIsSessionModalOpen(true);
  };

  const handleDeleteSessionClick = (session: Session) => {
    setSessionToDelete(session);
    setIsDeleteSessionDialogOpen(true);
  };

  const handleViewPlayers = (session: Session) => {
    setSessionToView(session);
    setIsViewModalOpen(true);
  };

  const confirmDeleteSession = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete.id);
      setSessionToDelete(null);
      setIsDeleteSessionDialogOpen(false);
    }
  };

  const handleSaveSession = async (sessionData: Omit<Session, 'id' | 'players' | 'waitlist' | 'messages' | 'date'> & { date: string } | (Omit<Session, 'date' | 'players' | 'waitlist' | 'messages'> & { date: string, id: string, players: User[], waitlist: User[] })) => {
    if ('id' in sessionData) {
        await updateSession(sessionData);
    } else {
        await createSession(sessionData);
    }
    setIsSessionModalOpen(false);
    setSelectedSession(null);
  };

  // Announcement Handlers
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
      deleteAnnouncement(announcementToDelete.id);
      setAnnouncementToDelete(null);
      setIsDeleteAnnouncementDialogOpen(false);
    }
  };

  const handleSaveAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'date'>) => {
    if (selectedAnnouncement) {
      await updateAnnouncement({ ...announcementData, id: selectedAnnouncement.id });
    } else {
      await createAnnouncement(announcementData);
    }
    setIsAnnouncementModalOpen(false);
    setSelectedAnnouncement(null);
  };

  // --- RENDER LOGIC ---

  const renderSessionTable = () => (
    <div className="rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>{t('adminPage.sessionTable.dateAndTime')}</TableHead>
            <TableHead>{t('adminPage.sessionTable.level')}</TableHead>
            <TableHead>{t('adminPage.sessionTable.players')}</TableHead>
            <TableHead>{t('adminPage.sessionTable.status')}</TableHead>
            <TableHead className="text-right">{t('adminPage.sessionTable.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>
                <div className="font-medium">{formatDate(session.date, locale)}</div>
                <div className="text-sm text-muted-foreground">
                  {session.startTime} - {session.endTime}
                </div>
              </TableCell>
              <TableCell>{t(`skillLevels.${session.level}`)}</TableCell>
              <TableCell>
                {(session.players as User[]).length} / {session.maxPlayers}
                {(session.waitlist as User[]).length > 0 && ` ${t('adminPage.statusValues.waitlist').replace('{count}', String((session.waitlist as User[]).length))}`}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    (session.players as User[]).length >= session.maxPlayers ? 'destructive' : 'secondary'
                  }
                >
                  {(session.players as User[]).length >= session.maxPlayers ? t('adminPage.statusValues.full') : t('adminPage.statusValues.open')}
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
                    <DropdownMenuItem onClick={() => handleEditSession(session)}>
                      {t('adminPage.actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewPlayers(session)}>
                      {t('adminPage.actions.viewPlayers')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() => handleDeleteSessionClick(session)}
                    >
                      {t('adminPage.actions.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderAnnouncementTable = () => (
    <div className="rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>{t('adminPage.announcementTable.title')}</TableHead>
            <TableHead>{t('adminPage.announcementTable.content')}</TableHead>
            <TableHead>{t('adminPage.announcementTable.date')}</TableHead>
            <TableHead className="text-right">{t('adminPage.announcementTable.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.map((ann) => (
            <TableRow key={ann.id}>
              <TableCell className="font-medium">{ann.title[locale]}</TableCell>
              <TableCell className="max-w-xs md:max-w-sm truncate">{ann.content[locale]}</TableCell>
              <TableCell>{formatDate(ann.date, locale)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditAnnouncement(ann)}>
                      {t('adminPage.actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() => handleDeleteAnnouncementClick(ann)}
                    >
                      {t('adminPage.actions.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
  
  if (user?.role !== 'admin') {
    return <div className="text-center p-8">{t('adminPage.redirecting')}</div>; // or a loading spinner
  }

  return (
    <>
      <Tabs defaultValue="sessions" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger value="sessions">{t('adminPage.tabs.sessions')}</TabsTrigger>
            <TabsTrigger value="announcements">{t('adminPage.tabs.announcements')}</TabsTrigger>
          </TabsList>
          <Button onClick={handleCreateNew} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('adminPage.createNew')}
          </Button>
        </div>
        <TabsContent value="sessions" className="mt-6">
          {isMobile ? (
            <SessionCards
              sessions={sessions}
              handleEditSession={handleEditSession}
              handleViewPlayers={handleViewPlayers}
              handleDeleteSessionClick={handleDeleteSessionClick}
              t={t}
              locale={locale}
            />
          ) : (
            renderSessionTable()
          )}
        </TabsContent>
        <TabsContent value="announcements" className="mt-6">
          {isMobile ? (
            <AnnouncementCards
              announcements={announcements}
              handleEditAnnouncement={handleEditAnnouncement}
              handleDeleteAnnouncementClick={handleDeleteAnnouncementClick}
              t={t}
              locale={locale}
            />
          ) : (
            renderAnnouncementTable()
          )}
        </TabsContent>
      </Tabs>

      {/* --- Modals and Dialogs --- */}

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
        onBook={bookSession}
        onCancel={cancelBooking}
        onWaitlist={joinWaitlist}
        onLeaveWaitlist={leaveWaitlist}
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
    </>
  );
}

    

/**
 * @fileoverview Admin management page for volleyball sessions and club announcements.
 * Allows administrators to create, view, update, and delete sessions and announcements.
 * It provides both a table view for desktop and a card view for mobile.
 */

'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, PlusCircle, User, Users } from 'lucide-react';
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
import DeleteSessionDialog from '@/components/admin/delete-session-dialog';
import SessionDetailsModal from '@/components/sessions/session-details-modal';
import DeleteAnnouncementDialog from '@/components/admin/delete-announcement-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSessions, getSafeDate } from '@/context/session-context';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import type { Session, Announcement } from '@/lib/types';
import { cn, formatTime } from '@/lib/utils';
import PlayerAvatar from '@/components/sessions/player-avatar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

const SessionFormModal = dynamic(() => import('@/components/admin/session-form-modal'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false
});
const AnnouncementFormModal = dynamic(() => import('@/components/admin/announcement-form-modal'), {
  loading: () => <Skeleton className="h-80 w-full" />,
  ssr: false
});

// --- Helper Functions ---

const formatDate = (date: string | Date, locale: string) => {
  return getSafeDate(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
    {sessions.map((session, index) => {
      const rotationClass = `note-${(index % 4) + 1}`;
      const players = session.players || [];
      const waitlist = session.waitlist || [];
      return (
      <div key={session.id} className={cn('note bg-paper-yellow p-4 rounded-lg shadow-lg relative', rotationClass)}>
         <div className={cn('pushpin bg-red-500')}></div>
         <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="handwriting text-xl font-bold text-brown mb-1">{t(`skillLevels.${session.level}`)}</h3>
              <div className="text-xs text-brown-light">
                {formatDate(session.date, locale)} - {formatTime(session.startTime)}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-brown-dark hover:bg-brown-light/20 -mr-2 -mt-2">
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
          <div className="space-y-3 text-sm border-t border-dashed border-brown-light/30 pt-3">
             <div className="flex items-center gap-2 text-brown-dark">
                <Users className="h-4 w-4" />
                <span className="font-semibold">{players.length} / {session.maxPlayers} {t('adminPage.sessionTable.players')}</span>
                 {waitlist.length > 0 && <span className="text-xs">({t('adminPage.statusValues.waitlist', {count: waitlist.length})})</span>}
            </div>
            <div className="flex items-center gap-2">
                <Badge
                  variant={players.length >= session.maxPlayers ? 'destructive' : 'secondary'}
                >
                  {players.length >= session.maxPlayers ? t('adminPage.statusValues.full') : t('adminPage.statusValues.open')}
                </Badge>
            </div>
          </div>
      </div>
    )})}
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
    {announcements.map((ann, index) => {
       const rotationClass = `note-${(index % 4) + 1}`;
       return (
        <div key={ann.id} className={cn('note bg-paper-blue p-4 rounded-lg shadow-lg relative', rotationClass)}>
            <div className={cn('pushpin bg-blue-500')}></div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="handwriting text-xl font-bold text-brown mb-1">{ann.title[locale]}</h3>
                <div className="text-xs text-brown-light">{formatDate(ann.date, locale)}</div>
              </div>
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="text-brown-dark hover:bg-brown-light/20 -mr-2 -mt-2">
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
            <p className="text-sm text-brown-dark border-t border-dashed border-brown-light/30 pt-3">{ann.content[locale]}</p>
        </div>
    )})}
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

  const handleSaveSession = async (sessionData: any) => {
    if (sessionData.id) {
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
    <div className="chalkboard-bg rounded-lg p-4 shadow-lg">
      <Table>
        <TableHeader>
          <TableRow className="border-b-chalk/20">
            <TableHead className="text-chalk">{t('adminPage.sessionTable.dateAndTime')}</TableHead>
            <TableHead className="text-chalk">{t('adminPage.sessionTable.level')}</TableHead>
            <TableHead className="text-chalk">{t('adminPage.sessionTable.players')}</TableHead>
            <TableHead className="text-chalk">{t('adminPage.sessionTable.status')}</TableHead>
            <TableHead className="text-right text-chalk">{t('adminPage.sessionTable.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => {
            const players = session.players || [];
            const waitlist = session.waitlist || [];
            return (
            <TableRow key={session.id} className="border-b-chalk/10 hover:bg-white/5">
              <TableCell className="text-chalk/90">
                <div className="font-medium">{formatDate(session.date, locale)}</div>
                <div className="text-sm text-chalk/60">
                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                </div>
              </TableCell>
              <TableCell className="text-chalk/90">{t(`skillLevels.${session.level}`)}</TableCell>
              <TableCell className="text-chalk/90">
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <span>{players.length} / {session.maxPlayers}</span>
                    <div className="flex -space-x-2 overflow-hidden">
                      {players.slice(0, 3).map(player => (
                        <PlayerAvatar key={player.id} player={player} className="h-6 w-6 border-2 border-chalkboard" />
                      ))}
                    </div>
                  </div>
                  </TooltipProvider>
                  {waitlist.length > 0 && <div className="text-xs text-chalk/60 mt-1">{t('adminPage.statusValues.waitlist', {count: waitlist.length})}</div>}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    players.length >= session.maxPlayers ? 'destructive' : 'secondary'
                  }
                >
                  {players.length >= session.maxPlayers ? t('adminPage.statusValues.full') : t('adminPage.statusValues.open')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-chalk/80 hover:bg-white/10 hover:text-chalk">
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
          )})}
        </TableBody>
      </Table>
    </div>
  );

  const renderAnnouncementTable = () => (
    <div className="chalkboard-bg rounded-lg p-4 shadow-lg">
      <Table>
        <TableHeader>
          <TableRow className="border-b-chalk/20">
            <TableHead className="text-chalk">{t('adminPage.announcementTable.title')}</TableHead>
            <TableHead className="text-chalk">{t('adminPage.announcementTable.content')}</TableHead>
            <TableHead className="text-chalk">{t('adminPage.announcementTable.date')}</TableHead>
            <TableHead className="text-right text-chalk">{t('adminPage.announcementTable.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.map((ann) => (
            <TableRow key={ann.id} className="border-b-chalk/10 hover:bg-white/5">
              <TableCell className="font-medium text-chalk/90">{ann.title[locale]}</TableCell>
              <TableCell className="max-w-xs md:max-w-sm truncate text-chalk/70">{ann.content[locale]}</TableCell>
              <TableCell className="text-chalk/70">{formatDate(ann.date, locale)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-chalk/80 hover:bg-white/10 hover:text-chalk">
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

      {isSessionModalOpen && (
        <SessionFormModal
          isOpen={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          onSave={handleSaveSession}
          session={selectedSession}
        />
      )}

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

      {isAnnouncementModalOpen && (
        <AnnouncementFormModal
          isOpen={isAnnouncementModalOpen}
          onClose={() => setIsAnnouncementModalOpen(false)}
          onSave={handleSaveAnnouncement}
          announcement={selectedAnnouncement}
        />
      )}

      <DeleteAnnouncementDialog
        isOpen={isDeleteAnnouncementDialogOpen}
        onClose={() => setIsDeleteAnnouncementDialogOpen(false)}
        onConfirm={confirmDeleteAnnouncement}
      />
    </>
  );
}

    
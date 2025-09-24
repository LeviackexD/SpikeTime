/**
 * @fileoverview Displays a list of all club announcements on a corkboard-style interface.
 * Users can view announcements as colored notes, filter them by category,
 * and open a modal to create a new announcement.
 */

'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import { Plus, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AnnouncementFormModal from '@/components/admin/announcement-form-modal';
import type { Announcement, AnnouncementCategory } from '@/lib/types';
import { useSessions, getSafeDate } from '@/context/session-context';
import { useAuth } from '@/context/auth-context';

const categoryFilters: { label: string; value: AnnouncementCategory | 'all' }[] = [
  { label: '📌 Todos', value: 'all' },
  { label: '🎉 Evento', value: 'event' },
  { label: '🏐 Clase', value: 'class' },
  { label: '🏆 Torneo', value: 'tournament' },
  { label: '📢 General', value: 'general' },
];

const categoryStyles: Record<AnnouncementCategory, { bg: string; text: string; pin: string }> = {
  event: { bg: 'bg-paper-yellow', text: 'text-red-800', pin: 'bg-red-500' },
  class: { bg: 'bg-paper-blue', text: 'text-blue-800', pin: 'bg-blue-500' },
  tournament: { bg: 'bg-paper-pink', text: 'text-purple-800', pin: 'bg-purple-500' },
  general: { bg: 'bg-paper-green', text: 'text-green-800', pin: 'bg-green-500' },
};

const NoteCard = ({ announcement, index }: { announcement: Announcement; index: number }) => {
  const styles = categoryStyles[announcement.category] || categoryStyles.general;
  const rotationClass = `note-${(index % 6) + 1}`;

  return (
    <div
      className={cn('note p-6 rounded-lg shadow-lg relative fade-in', styles.bg, rotationClass)}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={cn('pushpin', styles.pin)}></div>
      <div className="mb-4">
        <span className={cn('px-3 py-1 rounded-full text-sm font-semibold', styles.bg.replace('bg-', 'bg-light-'), styles.text)}>
          {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
        </span>
      </div>
      <h3 className="handwriting text-2xl font-bold text-brown mb-3">{announcement.title}</h3>
      <p className="text-brown-dark">{announcement.content}</p>
       <p className="text-xs text-brown-light mt-4 text-right">{getSafeDate(announcement.date).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric'
      })}</p>
    </div>
  );
};


const AnnouncementsPage: NextPage = () => {
  const { announcements, createAnnouncement, updateAnnouncement } = useSessions();
  const { user } = useAuth();
  const [filter, setFilter] = React.useState<AnnouncementCategory | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const filteredAnnouncements = React.useMemo(() => {
    if (filter === 'all') return announcements;
    return announcements.filter(a => a.category === filter);
  }, [announcements, filter]);

  const handleSaveAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'date'>) => {
    // For this page, we only handle creation. Editing is done in the admin panel.
    await createAnnouncement(announcementData);
    setIsModalOpen(false);
  };


  return (
    <>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
                <div className="bg-cream text-brown rounded-full p-3 shadow-sm">
                    <Megaphone className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold handwriting text-brown-dark">Tablón de Anuncios</h1>
                    <p className="text-muted-foreground opacity-80">Mantente al día con todas las novedades</p>
                </div>
            </div>
            {user?.role === 'admin' && (
                <Button onClick={() => setIsModalOpen(true)} className="bg-cream text-brown px-6 py-3 rounded-lg font-semibold button-hover flex items-center space-x-2 hover:bg-cream-dark">
                    <Plus className="w-5 h-5" />
                    <span>Nuevo Anuncio</span>
                </Button>
            )}
        </div>


        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          {categoryFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'filter-btn px-4 py-2 rounded-full font-semibold button-hover',
                filter === f.value ? 'filter-active' : 'bg-cream text-brown'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tablón */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAnnouncements.map((announcement, index) => (
            <NoteCard key={announcement.id} announcement={announcement} index={index} />
          ))}
        </div>
      </div>
      
      {/* Modal para nuevo anuncio */}
      <AnnouncementFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAnnouncement}
        announcement={null} // Always for creation from this page
      />
    </>
  );
};

export default AnnouncementsPage;

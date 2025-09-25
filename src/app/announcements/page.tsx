
/**
 * @fileoverview Displays a list of all club announcements on a corkboard-style interface.
 * Users can view announcements as colored notes, filter them by category,
 * and open a modal to create a new announcement.
 */

'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { Plus, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Announcement, AnnouncementCategory } from '@/lib/types';
import { useSessions, getSafeDate } from '@/context/session-context';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';

const AnnouncementFormModal = dynamic(() => import('@/components/admin/announcement-form-modal'), {
  loading: () => <Skeleton className="h-[400px] w-full" />,
});


const getCategoryFilters = (t: (key: string) => string) => [
  { label: t('announcementsPage.filters.all'), value: 'all' },
  { label: t('announcementsPage.filters.event'), value: 'event' },
  { label: t('announcementsPage.filters.class'), value: 'class' },
  { label: t('announcementsPage.filters.tournament'), value: 'tournament' },
  { label: t('announcementsPage.filters.general'), value: 'general' },
];

const categoryStyles: Record<AnnouncementCategory, { bg: string; text: string; pin: string }> = {
  event: { bg: 'bg-paper-yellow', text: 'text-red-800', pin: 'bg-red-500' },
  class: { bg: 'bg-paper-blue', text: 'text-blue-800', pin: 'bg-blue-500' },
  tournament: { bg: 'bg-paper-pink', text: 'text-purple-800', pin: 'bg-purple-500' },
  general: { bg: 'bg-paper-green', text: 'text-green-800', pin: 'bg-green-500' },
};

const NoteCard = ({ announcement, index, t, locale }: { announcement: Announcement; index: number, t: (key: string) => string; locale: 'en' | 'es'; }) => {
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
          {t(`announcementCategories.${announcement.category}`)}
        </span>
      </div>
      <h3 className="handwriting text-2xl font-bold text-brown mb-3">{announcement.title[locale]}</h3>
      <p className="text-brown-dark">{announcement.content[locale]}</p>
       <p className="text-xs text-brown-light mt-4 text-right">{getSafeDate(announcement.date).toLocaleDateString(locale, {
          month: 'long', day: 'numeric'
      })}</p>
    </div>
  );
};


const AnnouncementsPage: NextPage = () => {
  const { announcements, createAnnouncement } = useSessions();
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const [filter, setFilter] = React.useState<AnnouncementCategory | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  const categoryFilters = getCategoryFilters(t);

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
                    <h1 className="text-3xl font-bold handwriting text-brown-dark">{t('announcementsPage.title')}</h1>
                    <p className="text-muted-foreground opacity-80">{t('announcementsPage.subtitle')}</p>
                </div>
            </div>
            {user?.role === 'admin' && (
                <Button onClick={() => setIsModalOpen(true)} className="bg-cream text-brown px-6 py-3 rounded-lg font-semibold button-hover flex items-center space-x-2 hover:bg-cream-dark">
                    <Plus className="w-5 h-5" />
                    <span>{t('announcementsPage.newAnnouncement')}</span>
                </Button>
            )}
        </div>


        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {categoryFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as AnnouncementCategory | 'all')}
              className={cn(
                'filter-btn px-4 py-2 rounded-full font-semibold button-hover',
                filter === f.value ? 'filter-active' : 'bg-cream text-brown'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAnnouncements.map((announcement, index) => (
            <NoteCard key={announcement.id} announcement={announcement} index={index} t={t} locale={locale}/>
          ))}
        </div>
      </div>
      
      {/* Modal for new announcement */}
      {isModalOpen && (
        <AnnouncementFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAnnouncement}
          announcement={null} // Always for creation from this page
        />
      )}
    </>
  );
};

export default AnnouncementsPage;

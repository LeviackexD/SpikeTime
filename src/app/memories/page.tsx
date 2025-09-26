
/**
 * @fileoverview Displays a gallery of "moments" from past volleyball sessions
 * in a retro photo album style.
 */

'use client';

import * as React from 'react';
import type { NextPage } from 'next';
import { useSessions } from '@/context/session-context';
import { useLanguage } from '@/context/language-context';
import { Camera, Loader2, BookHeart, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Session } from '@/lib/types';
import Image from 'next/image';
import { getSafeDate, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import PhotoViewerModal from '@/components/memories/photo-viewer-modal';

interface MemoriesByMonth {
  [monthYear: string]: Session[];
}

const PolaroidCard = ({ session, index, t, locale, onImageClick }: { session: Session; index: number; t: (key: string) => string; locale: 'en' | 'es', onImageClick: (url: string, alt: string) => void; }) => {
    const rotationClass = `polaroid-${(index % 6) + 1}`;
    const imageUrl = session.momentImageUrl || `https://picsum.photos/seed/${session.id}/600/600`;
    const altText = `Moment from ${session.level} session on ${getSafeDate(session.date).toLocaleDateString()}`;
    
    return (
        <div className={cn("polaroid", rotationClass)}>
            <button 
                className="w-full h-full"
                onClick={() => onImageClick(imageUrl, altText)}
                aria-label={`View larger image for ${session.level} session`}
            >
                <div className="tape" style={{top: '-10px', left: `calc(50% - 48px)`, transform: `rotate(${(Math.random() - 0.5) * 20}deg)` }}></div>
                <div className="relative aspect-square w-full bg-gray-200">
                    <Image 
                        src={imageUrl}
                        alt={altText}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        style={{ objectFit: 'cover' }}
                        className="group-hover:brightness-105 transition-all"
                        data-ai-hint="volleyball action"
                    />
                </div>
            </button>
             <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="font-handwriting text-xl text-gray-700">{t(`skillLevels.${session.level}`)} @ {session.location}</p>
                 <p className="font-handwriting text-sm text-gray-500">{getSafeDate(session.date).toLocaleDateString(locale, {
                    month: 'long', day: 'numeric', year: 'numeric'
                 })}</p>
            </div>
        </div>
    )
}

const MemoriesPage: NextPage = () => {
  const { sessions, loading } = useSessions();
  const { t, locale } = useLanguage();
  const [currentMonthIndex, setCurrentMonthIndex] = React.useState(0);
  const [selectedPhoto, setSelectedPhoto] = React.useState<{url: string, alt: string} | null>(null);

  const memoriesByMonth = React.useMemo(() => {
    let moments = sessions.filter(s => s.momentImageUrl);
    
    // If there are no real moments, create sample data for demonstration
    if (moments.length === 0 && !loading) {
        const sampleDate = new Date();
        moments = Array.from({length: 4}).map((_, index) => ({
            id: `sample-moment-${index}`,
            date: sampleDate.toISOString(),
            startTime: '18:00',
            endTime: '20:00',
            location: 'The Rec Hall',
            level: 'Intermediate',
            maxPlayers: 12,
            players: [],
            waitlist: [],
            messages: [],
            momentImageUrl: `https://picsum.photos/seed/moment-demo-${index}/600/600`
        }));
    }

    const groupedByMonth = moments.reduce((acc: MemoriesByMonth, session) => {
      const date = getSafeDate(session.date);
      const monthYear = date.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(session);
      return acc;
    }, {});
    
    return groupedByMonth;
  }, [sessions, locale, loading]);
  
  const sortedMonths = React.useMemo(() => {
    return Object.keys(memoriesByMonth).sort((a, b) => {
        // Create date objects ensuring they are parsed correctly, assuming "Month Year" format
        const dateA = new Date(`1 ${a}`);
        const dateB = new Date(`1 ${b}`);
        return dateB.getTime() - dateA.getTime();
    });
  }, [memoriesByMonth]);


  React.useEffect(() => {
    if (sortedMonths.length > 0) {
        setCurrentMonthIndex(0);
    }
  }, [sortedMonths.length]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasMemories = sortedMonths.length > 0;
  const currentMonth = hasMemories ? sortedMonths[currentMonthIndex] : null;

  const handleNextMonth = () => {
      setCurrentMonthIndex(prev => (prev > 0 ? prev - 1 : 0));
  }
  
  const handlePrevMonth = () => {
      setCurrentMonthIndex(prev => (prev < sortedMonths.length - 1 ? prev + 1 : sortedMonths.length - 1));
  }
  
  const handleImageClick = (url: string, alt: string) => {
      setSelectedPhoto({ url, alt });
  };


  return (
    <>
        <div className="w-full min-h-full -m-4 sm:-m-8 p-4 sm:p-8 photo-album-bg">
            <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
                <div className="text-center pt-8 pb-4">
                    <h1 className="text-5xl font-bold font-handwriting text-brown-dark flex items-center justify-center gap-4">
                        <BookHeart className="h-12 w-12 text-brown" />
                        {t('memoriesPage.title')}
                    </h1>
                    <p className="text-brown-dark/80 mt-2 max-w-2xl mx-auto">
                        {t('memoriesPage.subtitle')}
                    </p>
                </div>

                {hasMemories && currentMonth ? (
                    <div className="space-y-8">
                        <div className="flex flex-row items-center justify-center gap-4">
                            <Button onClick={handlePrevMonth} disabled={currentMonthIndex >= sortedMonths.length - 1} variant="outline" size="icon" className="bg-cream/50">
                                <ArrowLeft className="h-4 w-4"/>
                                <span className="sr-only">{t('memoriesPage.prevMonth')}</span>
                            </Button>
                            <h2 className="font-handwriting text-4xl font-bold text-brown-dark text-center whitespace-nowrap">
                                {currentMonth}
                            </h2>
                            <Button onClick={handleNextMonth} disabled={currentMonthIndex <= 0} variant="outline" size="icon" className="bg-cream/50">
                                <ArrowRight className="h-4 w-4"/>
                                <span className="sr-only">{t('memoriesPage.nextMonth')}</span>
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-x-8 sm:gap-y-16">
                            {memoriesByMonth[currentMonth].map((session, index) => (
                                <PolaroidCard
                                    key={session.id}
                                    session={session}
                                    index={index}
                                    t={t}
                                    locale={locale}
                                    onImageClick={handleImageClick}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-16 rounded-lg bg-black/20 border border-dashed border-white/20 animate-fade-in mt-12">
                        <Camera className="h-16 w-16 text-white/40 mb-4" />
                        <p className="text-white/80 font-semibold text-lg">{t('memoriesPage.noMemories')}</p>
                        <p className="text-white/60 max-w-sm">{t('memoriesPage.noMemoriesHint')}</p>
                    </div>
                )}
            </div>
        </div>

        {selectedPhoto && (
            <PhotoViewerModal
                isOpen={!!selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
                imageUrl={selectedPhoto.url}
                alt={selectedPhoto.alt}
            />
        )}
    </>
  );
};

export default MemoriesPage;

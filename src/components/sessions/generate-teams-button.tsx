/**
 * @fileoverview A component to generate balanced or random teams for a session.
 * It displays a button that, when clicked, opens a dialog to choose the generation
 * method and then shows the resulting teams.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Shuffle, Scale } from 'lucide-react';
import type { User, SkillLevel } from '@/lib/types';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

interface GenerateTeamsButtonProps {
  players: User[];
}

type Team = User[];

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: User[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const generateRandomTeams = (players: User[]): { teamA: Team; teamB: Team } => {
  const shuffledPlayers = shuffleArray([...players]);
  const midPoint = Math.ceil(shuffledPlayers.length / 2);
  const teamA = shuffledPlayers.slice(0, midPoint);
  const teamB = shuffledPlayers.slice(midPoint);
  return { teamA, teamB };
};

const generateBalancedTeams = (players: User[]): { teamA: Team; teamB: Team } => {
  const skillOrder: SkillLevel[] = ['Advanced', 'Intermediate', 'Beginner'];
  const sortedPlayers = [...players].sort((a, b) => skillOrder.indexOf(a.skillLevel) - skillOrder.indexOf(b.skillLevel));

  const teamA: Team = [];
  const teamB: Team = [];

  sortedPlayers.forEach((player, index) => {
    // Alternate adding to teams
    if (index % 2 === 0) {
      teamA.push(player);
    } else {
      teamB.push(player);
    }
  });

  return { teamA, teamB };
};

export default function GenerateTeamsButton({ players }: GenerateTeamsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [teams, setTeams] = useState<{ teamA: Team; teamB: Team } | null>(null);
  const { t } = useLanguage();

  const handleGenerate = (method: 'random' | 'balanced') => {
    if (method === 'random') {
      setTeams(generateRandomTeams(players));
    } else {
      setTeams(generateBalancedTeams(players));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset teams after a short delay to allow the dialog to close smoothly
    setTimeout(() => {
        setTeams(null)
    }, 300);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="mr-2 h-4 w-4" />
          {t('modals.generateTeams.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{t('modals.generateTeams.title')}</DialogTitle>
          <DialogDescription>
            {t('modals.generateTeams.description')}
          </DialogDescription>
        </DialogHeader>

        {!teams ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <Button variant="outline" size="lg" className="h-24 flex-col gap-2" onClick={() => handleGenerate('balanced')}>
                <Scale className="h-8 w-8 text-primary"/>
                <span className="font-semibold">{t('modals.generateTeams.balanced')}</span>
            </Button>
            <Button variant="outline" size="lg" className="h-24 flex-col gap-2" onClick={() => handleGenerate('random')}>
                <Shuffle className="h-8 w-8 text-primary"/>
                <span className="font-semibold">{t('modals.generateTeams.random')}</span>
            </Button>
          </div>
        ) : (
          <div className="mt-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-6">
                <TeamList title={t('modals.generateTeams.teamA')} team={teams.teamA} />
                <TeamList title={t('modals.generateTeams.teamB')} team={teams.teamB} />
            </div>
             <DialogFooter className="mt-6">
                <Button onClick={() => setTeams(null)} variant="secondary">{t('modals.generateTeams.regenerate')}</Button>
                <DialogClose asChild>
                    <Button onClick={handleClose}>{t('modals.close')}</Button>
                </DialogClose>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface TeamListProps {
    title: string;
    team: Team;
}

const TeamList = ({title, team}: TeamListProps) => {
    const {t} = useLanguage();
    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-lg text-center">{title}</h3>
            <Separator />
            <div className="space-y-3 rounded-md p-2">
                {team.map(player => (
                    <div key={player.id} className="flex items-center gap-3 p-2 rounded-md">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={player.avatarUrl} alt={player.name} />
                            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm">{player.name}</p>
                            <p className="text-xs text-muted-foreground">{t(`skillLevels.${player.skillLevel}`)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

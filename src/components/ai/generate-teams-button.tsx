/**
 * @fileoverview A button and dialog component that uses AI to generate balanced teams for a full session.
 * The button is only visible when the session has exactly 12 players.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateBalancedTeams } from '@/ai/flows/generate-balanced-teams';
import { Loader2, Sparkles, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { GenerateBalancedTeamsOutput } from '@/ai/flows/generate-balanced-teams';
import type { User } from '@/lib/types';
import { useLanguage } from '@/context/language-context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';

interface GenerateTeamsButtonProps {
  players: User[];
}

export default function GenerateTeamsButton({ players }: GenerateTeamsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState<GenerateBalancedTeamsOutput | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useLanguage();

  const handleGenerateTeams = async () => {
    setIsLoading(true);
    try {
      const result = await generateBalancedTeams(players);
      setTeams(result);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Failed to generate teams:", error);
      // You might want to show a toast notification here
    }
    setIsLoading(false);
  };
  
  // The button is only rendered if the session is full (12 players)
  if (players.length !== 12) {
    return null;
  }

  return (
    <>
      <Button onClick={handleGenerateTeams} disabled={isLoading} size="sm">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        {t('modals.generateTeams.button')}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
              <Sparkles className="text-primary" />
              {t('modals.generateTeams.title')}
            </DialogTitle>
            <DialogDescription>
                {teams?.analysis || t('modals.generateTeams.description')}
            </DialogDescription>
          </DialogHeader>
          
          {teams && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[60vh] overflow-y-auto">
              <TeamList team={teams.teamA} teamName={t('modals.generateTeams.teamA')} players={players} t={t} />
              <TeamList team={teams.teamB} teamName={t('modals.generateTeams.teamB')} players={players} t={t}/>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">{t('modals.close')}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper component to find full user data from the slimmed down AI response
const TeamList = ({ team, teamName, players, t }: { team: GenerateBalancedTeamsOutput['teamA'], teamName: string, players: User[], t: (key: string) => string }) => {
    
    // Create a map for quick lookups
    const playerMap = new Map(players.map(p => [p.id, p]));
    
    return (
        <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-bold text-lg text-center">{teamName}</h3>
            <div className='space-y-2'>
            {team.map(member => {
                const fullPlayer = playerMap.get(member.id);
                if (!fullPlayer) return null;

                return (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={fullPlayer.avatarUrl} alt={fullPlayer.name} />
                            <AvatarFallback>{fullPlayer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm">{fullPlayer.name}</p>
                            <p className="text-xs text-muted-foreground">{t(`skillLevels.${fullPlayer.skillLevel}`)}</p>
                        </div>
                    </div>
                )
            })}
            </div>
        </div>
    )
}

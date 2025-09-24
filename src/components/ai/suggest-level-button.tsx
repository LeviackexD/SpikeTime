
/**
 * @fileoverview A button component that triggers an AI flow to suggest the optimal skill level for a session.
 * It takes an array of player skill levels, sends them to a Genkit flow, and displays the AI's suggestion in a dialog.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { suggestOptimalSessionLevel } from '@/ai/flows/suggest-optimal-session-level';
import { Loader2, Sparkles } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { SuggestOptimalSessionLevelOutput } from '@/ai/flows/suggest-optimal-session-level';
import { useLanguage } from '@/context/language-context';

interface SuggestLevelButtonProps {
  playerSkillLevels: ("beginner" | "intermediate" | "advanced")[];
}

export default function SuggestLevelButton({ playerSkillLevels }: SuggestLevelButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestOptimalSessionLevelOutput | null>(null);
  const { t } = useLanguage();

  const handleSuggestLevel = async () => {
    setIsLoading(true);
    try {
      const result = await suggestOptimalSessionLevel({ playerSkillLevels });
      setSuggestion(result);
    } catch (error) {
      console.error("Failed to suggest optimal level:", error);
      setSuggestion({ suggestedLevel: 'unknown' as any, reasoning: t('toasts.aiSuggestionError') });
    }
    setIsLoading(false);
  };

  return (
    <>
      <Button onClick={handleSuggestLevel} disabled={isLoading} variant="outline" size="sm">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Suggest Optimal Level
      </Button>

      <AlertDialog open={!!suggestion} onOpenChange={() => setSuggestion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-headline">
              <Sparkles className="text-primary" />
              {t('modals.aiSuggestion.title')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
                {suggestion && (
                <div className="pt-4 text-left">
                    <p className="font-semibold">{t('modals.aiSuggestion.suggestedLevel')} <span className="font-bold text-primary uppercase">{t(`skillLevels.${suggestion.suggestedLevel as 'Beginner' | 'Intermediate' | 'Advanced'}`)}</span></p>
                    <p className="mt-2">
                    <span className="font-semibold">{t('modals.aiSuggestion.reasoning')}</span> {suggestion.reasoning}
                    </p>
                </div>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSuggestion(null)}>
              {t('modals.greatThanks')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

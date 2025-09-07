'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { summarizeAnnouncements } from '@/ai/flows/summarize-announcements';
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

interface SummarizeButtonProps {
  announcements: string;
}

export default function SummarizeButton({ announcements }: SummarizeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      const result = await summarizeAnnouncements({ announcements });
      setSummary(result.summary);
    } catch (error) {
      console.error("Failed to summarize announcements:", error);
      setSummary("Sorry, we couldn't generate a summary at this time.");
    }
    setIsLoading(false);
  };

  return (
    <>
      <Button onClick={handleSummarize} disabled={isLoading} variant="ghost" size="sm">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        AI Summary
      </Button>

      <AlertDialog open={!!summary} onOpenChange={() => setSummary(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-headline">
              <Sparkles className="text-primary" />
              Announcements Summary
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-4 whitespace-pre-wrap">
              {summary}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSummary(null)}>
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

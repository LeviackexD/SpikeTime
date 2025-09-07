'use server';

/**
 * @fileOverview Summarizes recent announcements into a concise digest.
 *
 * - summarizeAnnouncements - A function that takes recent announcements and returns a summarized digest.
 * - SummarizeAnnouncementsInput - The input type for the summarizeAnnouncements function.
 * - SummarizeAnnouncementsOutput - The return type for the summarizeAnnouncements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAnnouncementsInputSchema = z.object({
  announcements: z
    .string()
    .describe('A list of recent announcements to summarize.'),
});
export type SummarizeAnnouncementsInput = z.infer<
  typeof SummarizeAnnouncementsInputSchema
>;

const SummarizeAnnouncementsOutputSchema = z.object({
  summary: z.string().describe('A summarized digest of the recent announcements.'),
});
export type SummarizeAnnouncementsOutput = z.infer<
  typeof SummarizeAnnouncementsOutputSchema
>;

export async function summarizeAnnouncements(
  input: SummarizeAnnouncementsInput
): Promise<SummarizeAnnouncementsOutput> {
  return summarizeAnnouncementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAnnouncementsPrompt',
  input: {schema: SummarizeAnnouncementsInputSchema},
  output: {schema: SummarizeAnnouncementsOutputSchema},
  prompt: `You are an AI assistant helping to summarize announcements for users.

  Here are the announcements:
  {{announcements}}

  Please provide a concise summary of these announcements so users can quickly stay up-to-date.`,
});

const summarizeAnnouncementsFlow = ai.defineFlow(
  {
    name: 'summarizeAnnouncementsFlow',
    inputSchema: SummarizeAnnouncementsInputSchema,
    outputSchema: SummarizeAnnouncementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

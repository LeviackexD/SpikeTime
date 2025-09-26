'use server';

/**
 * @fileOverview Suggests the optimal skill level for a volleyball session based on registered players' skill levels.
 *
 * - suggestOptimalSessionLevel - A function that suggests the optimal skill level.
 * - SuggestOptimalSessionLevelInput - The input type for the suggestOptimalSessionLevel function.
 * - SuggestOptimalSessionLevelOutput - The return type for the suggestOptimalSessionLevel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestOptimalSessionLevelInputSchema = z.object({
  playerSkillLevels: z
    .array(z.enum(['beginner', 'intermediate', 'advanced']))
    .describe('An array of skill levels for players registered in the session.'),
});
export type SuggestOptimalSessionLevelInput = z.infer<typeof SuggestOptimalSessionLevelInputSchema>;

const SuggestOptimalSessionLevelOutputSchema = z.object({
  suggestedLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The suggested optimal skill level for the session.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested skill level.'),
});
export type SuggestOptimalSessionLevelOutput = z.infer<typeof SuggestOptimalSessionLevelOutputSchema>;

export async function suggestOptimalSessionLevel(input: SuggestOptimalSessionLevelInput): Promise<SuggestOptimalSessionLevelOutput> {
  return suggestOptimalSessionLevelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalSessionLevelPrompt',
  input: {schema: SuggestOptimalSessionLevelInputSchema},
  output: {schema: SuggestOptimalSessionLevelOutputSchema},
  prompt: `You are an AI assistant helping a volleyball session administrator determine the optimal skill level for a session.

  Given the skill levels of the registered players, suggest the most appropriate session level to maximize engagement and create balanced teams.

  The available skill levels are: beginner, intermediate, and advanced.

  Consider the distribution of skill levels when making your suggestion. For example, if most players are intermediate, suggest an intermediate session.
  If the skill levels are mixed, suggest the level that accommodates the majority or provides the best overall experience.

  Registered Player Skill Levels: {{{playerSkillLevels}}}

  Please provide the suggested skill level and a brief explanation of your reasoning.
`,
});

const suggestOptimalSessionLevelFlow = ai.defineFlow(
  {
    name: 'suggestOptimalSessionLevelFlow',
    inputSchema: SuggestOptimalSessionLevelInputSchema,
    outputSchema: SuggestOptimalSessionLevelOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview Generates two balanced volleyball teams from a list of 12 players.
 *
 * - generateBalancedTeams - A function that takes a list of players and returns two balanced teams.
 * - GenerateBalancedTeamsInput - The input type for the generateBalancedTeams function.
 * - GenerateBalancedTeamsOutput - The return type for the generateBalancedTeams function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { User } from '@/lib/types';

const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  skillLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
});

const GenerateBalancedTeamsInputSchema = z.object({
  players: z.array(PlayerSchema).length(12).describe('An array of 12 players with their name and skill level.'),
});
export type GenerateBalancedTeamsInput = z.infer<typeof GenerateBalancedTeamsInputSchema>;


const TeamSchema = z.array(PlayerSchema).length(6).describe('A team of 6 players.');

const GenerateBalancedTeamsOutputSchema = z.object({
    teamA: TeamSchema,
    teamB: TeamSchema,
    analysis: z.string().describe('A brief analysis of why the teams are balanced.'),
});
export type GenerateBalancedTeamsOutput = z.infer<typeof GenerateBalancedTeamsOutputSchema>;

// We need to define a mapper from the full User object to the slimmed down Player schema for the AI
const mapUserToPlayer = (user: User): z.infer<typeof PlayerSchema> => ({
  id: user.id,
  name: user.name,
  skillLevel: user.skillLevel,
});


export async function generateBalancedTeams(players: User[]): Promise<GenerateBalancedTeamsOutput> {
    const input = {
        players: players.map(mapUserToPlayer)
    };
  return generateBalancedTeamsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBalancedTeamsPrompt',
  input: {schema: GenerateBalancedTeamsInputSchema},
  output: {schema: GenerateBalancedTeamsOutputSchema},
  prompt: `You are an expert volleyball coach. Your task is to create two balanced teams of 6 from the following list of 12 players.

Players:
{{#each players}}
- {{name}} ({{skillLevel}})
{{/each}}

Analyze the players' skill levels (Beginner, Intermediate, Advanced) and distribute them as evenly as possible between Team A and Team B.
Try to ensure each team has a similar mix of skill levels. For example, avoid putting all advanced players on one team.

Return the two teams and a brief analysis explaining your choices and why the teams are balanced.`,
});

const generateBalancedTeamsFlow = ai.defineFlow(
  {
    name: 'generateBalancedTeamsFlow',
    inputSchema: GenerateBalancedTeamsInputSchema,
    outputSchema: GenerateBalancedTeamsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

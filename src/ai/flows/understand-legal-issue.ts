// src/ai/flows/understand-legal-issue.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to understand a user's legal issue described in natural language.
 *
 * - understandLegalIssue - A function that processes the user's description and returns a legal analysis, flowchart, and safety indicator.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import type { UnderstandLegalIssueInput, UnderstandLegalIssueOutput } from '@/ai/schemas/legal-issue-types';
import { UnderstandLegalIssueInputSchema, UnderstandLegalIssueOutputSchema } from '@/ai/schemas/legal-issue-types';


// Define the main function that calls the flow
export async function understandLegalIssue(input: UnderstandLegalIssueInput): Promise<UnderstandLegalIssueOutput> {
  return understandLegalIssueFlow(input);
}

// Define the prompt
const understandLegalIssuePrompt = ai.definePrompt({
  name: 'understandLegalIssuePrompt',
  input: {
    schema: UnderstandLegalIssueInputSchema, // Use imported schema
  },
  output: {
    schema: UnderstandLegalIssueOutputSchema, // Use imported schema
  },
  prompt: `Given the user's description and keywords of their legal issue, provide a legal analysis, a flowchart explaining their rights and options, and a safety indicator.

User Description: {{{description}}}
Keywords: {{{keywords}}}

Legal Analysis:
Flowchart:
Safety Indicator (Safe, Caution, or Illegal Detainment Possible):`,
});

// Define the flow
const understandLegalIssueFlow = ai.defineFlow<
  typeof UnderstandLegalIssueInputSchema,
  typeof UnderstandLegalIssueOutputSchema
>({
  name: 'understandLegalIssueFlow',
  inputSchema: UnderstandLegalIssueInputSchema,
  outputSchema: UnderstandLegalIssueOutputSchema,
},
async input => {
  const {output} = await understandLegalIssuePrompt(input);
  return output!;
}
);
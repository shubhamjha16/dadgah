// src/ai/flows/understand-legal-issue.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to understand a user's legal issue described in natural language.
 *
 * - understandLegalIssue - A function that processes the user's description and returns a legal analysis, relevant law, flowchart, clarifying questions, final interpretation, suggested actions/phrases, and a safety indicator.
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
    schema: UnderstandLegalIssueOutputSchema, // Use updated output schema
  },
  prompt: `You are an AI legal assistant designed to help users understand their rights in specific situations.

Analyze the user's scenario and keywords provided below.

User Scenario: {{{scenario}}}
Keywords: {{{keywords}}}

Based on this information, perform the following tasks:

1.  **Background Legal Context:** Briefly explain the user's likely rights in simple terms. Identify and cite the most relevant law or legal article (e.g., Fourth Amendment, specific statute number if applicable) for the 'relevantLaw' field.
2.  **Legal Analysis:** Provide a concise analysis matching the scenario to potential legal principles, rights violations, or relevant clauses.
3.  **Flowchart Generation:** Create a simple, textual step-by-step flowchart visualizing the situation, the relevant legal point, and the user's potential options (e.g., "Police ask for phone --> Warrant needed? --> Yes: Consent required --> No: Refuse politely"). Output this for the 'flowchart' field.
4.  **Clarifying Questions (MCQs):** Generate 2-4 multiple-choice questions to gather more information and clarify the user's legal standing. Examples: "Did the officer state they had a warrant?", "Were you formally placed under arrest?". Format this for the 'clarifyingQuestions' field (array of objects with 'question' and 'options').
5.  **Final Interpretation:** Summarize where the user likely stands legally based on the current information. Output this for the 'finalInterpretation' field.
6.  **Suggestions:** Provide specific, actionable suggestions:
    *   Exact phrases the user could say (e.g., "Am I being detained or am I free to go?", "I do not consent to a search."). Output these for the 'suggestedPhrases' field.
    *   Potential actions the user could take (e.g., "Record the interaction if safe and legal.", "Ask for badge number."). Output these for the 'suggestedActions' field.
7.  **Safety Indicator:** Assess the risk level based *only* on the potential for illegal detainment or escalation described *in the scenario*. Assign one: 'Safe' (low immediate risk), 'Caution' (potential issues, advise care), or 'Illegal Detainment Possible' (scenario suggests risk of rights violation/detainment). Output this for the 'safetyIndicator' field.

Structure your entire response according to the defined output schema.
`,
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
  // Ensure all required fields are present, even if optional ones are empty arrays/undefined
  return {
      legalAnalysis: output?.legalAnalysis ?? "Analysis could not be generated.",
      relevantLaw: output?.relevantLaw,
      flowchart: output?.flowchart ?? "Flowchart could not be generated.",
      clarifyingQuestions: output?.clarifyingQuestions ?? [],
      finalInterpretation: output?.finalInterpretation ?? "Interpretation could not be generated.",
      suggestedPhrases: output?.suggestedPhrases ?? [],
      suggestedActions: output?.suggestedActions ?? [],
      safetyIndicator: output?.safetyIndicator ?? 'Caution', // Default to Caution if missing
    };
}
);

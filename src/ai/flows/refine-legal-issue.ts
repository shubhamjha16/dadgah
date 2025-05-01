// src/ai/flows/refine-legal-issue.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to refine a user's legal issue analysis based on their answers to clarifying questions, focusing on Indian law.
 *
 * - refineLegalIssue - A function that processes the original scenario, keywords, and user answers to provide a refined legal analysis.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'zod';
// Import schemas and types from the central location
import type { RefineLegalIssueInput, RefineLegalIssueOutput } from '@/ai/schemas/legal-issue-types';
import { RefineLegalIssueInputSchema, RefineLegalIssueOutputSchema } from '@/ai/schemas/legal-issue-types';

// Define the main function that calls the refinement flow
export async function refineLegalIssue(input: RefineLegalIssueInput): Promise<RefineLegalIssueOutput> {
  return refineLegalIssueFlow(input);
}

// Define the prompt for refinement
const refineLegalIssuePrompt = ai.definePrompt({
  name: 'refineLegalIssuePrompt',
  input: {
    schema: RefineLegalIssueInputSchema, // Use imported schema for refinement input
  },
  output: {
    schema: RefineLegalIssueOutputSchema, // Use imported schema for output (same structure as initial analysis)
  },
  prompt: `You are an AI legal assistant specialized in the Constitution of India and Indian Laws. You previously provided an initial analysis for the user's scenario. Now, refine that analysis based on the user's answers to the clarifying questions.

Original User Scenario: {{{originalScenario}}}
Original Keywords: {{{originalKeywords}}}

User's Answers to Clarifying Questions:
{{#each questionsAndAnswers}}
Question: {{this.question}}
Answer: {{this.answer}}
{{/each}}

Based on the original information AND the user's answers, perform the following tasks AGAIN, providing a REFINED output:

1.  **Refined Background Legal Context (Indian Law):** Briefly explain the user's likely rights in simple terms *according to relevant Indian laws*, CONSIDERING THE ANSWERS. Identify and cite the most relevant Indian law, constitutional article, or statute for the 'relevantLaw' field.
2.  **Refined Legal Analysis (Indian Law):** Provide a concise analysis matching the scenario AND ANSWERS to potential legal principles, rights violations, or relevant clauses *under Indian law*.
3.  **Refined Flowchart Generation:** Create a simple, textual step-by-step flowchart visualizing the situation, the relevant Indian legal point, and the user's potential options, UPDATED based on the answers. Output this for the 'flowchart' field.
4.  **Clarifying Questions (MCQs):** Generate **0 to 2 NEW** multiple-choice questions ONLY IF the answers provided raise significant new ambiguities or require further critical details *under Indian law to provide a final interpretation*. If the picture is clear, return an empty array []. Format this for the 'clarifyingQuestions' field. Do NOT repeat previous questions.
5.  **Refined Final Interpretation (Indian Law):** Summarize where the user likely stands legally *based on the refined understanding of Indian law incorporating the answers*. Output this for the 'finalInterpretation' field.
6.  **Refined Suggestions:** Provide specific, actionable suggestions relevant in the Indian context, UPDATED based on the answers:
    *   Exact phrases the user could say. Output these for the 'suggestedPhrases' field.
    *   Potential actions the user could take. Output these for the 'suggestedActions' field.
7.  **Refined Safety Indicator:** Assess the risk level based *only* on the potential for illegal detainment or escalation described *in the scenario AND considering the answers, within the Indian legal context*. Assign one: 'Safe', 'Caution', or 'Illegal Detainment Possible'. Output this for the 'safetyIndicator' field.

Structure your entire refined response according to the defined output schema. Ensure all legal references and interpretations are specific to India and reflect the new information from the answers. Provide 0-2 clarifying questions as requested.
`,
});

// Define the refinement flow
const refineLegalIssueFlow = ai.defineFlow<
  typeof RefineLegalIssueInputSchema,
  typeof RefineLegalIssueOutputSchema
>({
  name: 'refineLegalIssueFlow',
  inputSchema: RefineLegalIssueInputSchema,
  outputSchema: RefineLegalIssueOutputSchema, // Output structure is the same
},
async input => {
  const {output} = await refineLegalIssuePrompt(input);

  // Ensure all required fields are present in the refined output, providing defaults if needed.
  return {
      legalAnalysis: output?.legalAnalysis ?? "Refined analysis based on Indian law could not be generated.",
      relevantLaw: output?.relevantLaw ?? "Relevant Indian law could not be identified.",
      flowchart: output?.flowchart ?? "Refined flowchart could not be generated.",
      // Ensure clarifyingQuestions is an array, even if empty (as requested in the prompt)
      clarifyingQuestions: output?.clarifyingQuestions ?? [],
      finalInterpretation: output?.finalInterpretation ?? "Refined interpretation based on Indian law could not be generated.",
      suggestedPhrases: output?.suggestedPhrases ?? [],
      suggestedActions: output?.suggestedActions ?? [],
      safetyIndicator: output?.safetyIndicator ?? 'Caution', // Default to Caution if missing
    };
}
);

     
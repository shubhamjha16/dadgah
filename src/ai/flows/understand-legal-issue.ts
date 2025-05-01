// src/ai/flows/understand-legal-issue.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to understand a user's legal issue described in natural language, focusing on Indian law.
 *
 * - understandLegalIssue - A function that processes the user's description and returns a legal analysis based on Indian law, relevant law, flowchart, clarifying questions, final interpretation, suggested actions/phrases, and a safety indicator.
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
    schema: UnderstandLegalIssueInputSchema,
  },
  output: {
    schema: UnderstandLegalIssueOutputSchema,
  },
  prompt: `You are an AI legal assistant specialized in the Constitution of India and Indian Laws. You help users understand their rights in specific situations within the Indian legal context.

Analyze the user's scenario and keywords provided below. Your entire analysis MUST be based on relevant Indian laws and legal principles.

User Scenario: {{{scenario}}}
Keywords: {{{keywords}}}

Based on this information, perform the following tasks:

1.  **Background Legal Context (Indian Law):** Briefly explain the user's likely rights in simple terms *according to relevant Indian laws*. Identify and cite the most relevant Indian law, constitutional article, or statute (e.g., Article 21 of the Constitution, relevant section of the CrPC or IPC) for the 'relevantLaw' field.
2.  **Legal Analysis (Indian Law):** Provide a concise analysis matching the scenario to potential legal principles, rights violations, or relevant clauses *under Indian law*.
3.  **Flowchart Generation:** Create a simple, textual step-by-step flowchart visualizing the situation, the relevant Indian legal point, and the user's potential options (e.g., "Police ask for phone --> Warrant required under Indian law? --> Yes: Consent required --> No: Refuse politely"). Output this for the 'flowchart' field.
4.  **Clarifying Questions (MCQs):** Generate **exactly 5** multiple-choice questions to gather more critical information and clarify the user's legal standing *under Indian law*. Ensure the questions are distinct and relevant to determining the next steps or potential rights violations. Examples: "Did the police officer inform you of the reason for the stop as required by Indian law?", "Were you formally placed under arrest?", "Did you explicitly state you do not consent to a search?". Format this for the 'clarifyingQuestions' field (array of objects with 'question' and 'options').
5.  **Final Interpretation (Indian Law):** Summarize where the user likely stands legally *based on the current understanding of Indian law*. Output this for the 'finalInterpretation' field.
6.  **Suggestions:** Provide specific, actionable suggestions relevant in the Indian context:
    *   Exact phrases the user could say (e.g., "Am I being detained or am I free to go?", "Under what law are you asking for this?", "I do not consent to a search."). Output these for the 'suggestedPhrases' field.
    *   Potential actions the user could take (e.g., "Record the interaction if safe and legal in India.", "Ask for the officer's name and badge number."). Output these for the 'suggestedActions' field.
7.  **Safety Indicator:** Assess the risk level based *only* on the potential for illegal detainment or escalation described *in the scenario, considering Indian legal procedures*. Assign one: 'Safe' (low immediate risk), 'Caution' (potential issues, advise care), or 'Illegal Detainment Possible' (scenario suggests risk of rights violation/detainment under Indian law). Output this for the 'safetyIndicator' field.

Structure your entire response according to the defined output schema. Ensure all legal references and interpretations are specific to India and provide exactly 5 clarifying questions.
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
  // Add fallback defaults to ensure the output matches the schema even if the AI fails partially.
  // Validate that exactly 5 questions are returned, otherwise provide a fallback or error indication.
  const clarifyingQuestions = (output?.clarifyingQuestions ?? []).slice(0, 5); // Ensure max 5
  if (clarifyingQuestions.length !== 5 && output?.clarifyingQuestions) {
      console.warn("AI did not return exactly 5 clarifying questions. Adjusting.");
      // Potentially add placeholder questions or log an error, for now just slicing
  }


  return {
      legalAnalysis: output?.legalAnalysis ?? "Analysis based on Indian law could not be generated.",
      relevantLaw: output?.relevantLaw ?? "Relevant Indian law could not be identified.",
      flowchart: output?.flowchart ?? "Flowchart could not be generated.",
      clarifyingQuestions: clarifyingQuestions, // Use the validated/adjusted array
      finalInterpretation: output?.finalInterpretation ?? "Interpretation based on Indian law could not be generated.",
      suggestedPhrases: output?.suggestedPhrases ?? [],
      suggestedActions: output?.suggestedActions ?? [],
      safetyIndicator: output?.safetyIndicator ?? 'Caution', // Default to Caution if missing
    };
}
);

    
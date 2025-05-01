/**
 * @fileOverview Shared types and Zod schemas for legal issue analysis and flowchart generation.
 */

import { z } from 'zod';

// --- Understand Legal Issue ---

export const UnderstandLegalIssueInputSchema = z.object({
  scenario: z.string().describe('User description of their legal issue (e.g., "They took my phone").'),
  keywords: z.string().describe('Keywords related to the legal issue (e.g., phone, warrant).'),
});
export type UnderstandLegalIssueInput = z.infer<typeof UnderstandLegalIssueInputSchema>;

// Define the schema for a single multiple-choice question
const MCQSchema = z.object({
  question: z.string().describe('The clarifying question to ask the user.'),
  options: z.array(z.string()).describe('The multiple-choice options for the question.'),
});

export const UnderstandLegalIssueOutputSchema = z.object({
  legalAnalysis: z.string().describe('A legal analysis of the issue based on the provided scenario and keywords.'),
  relevantLaw: z.string().optional().describe('The most relevant law or legal article related to the issue.'),
  flowchart: z.string().describe('A textual representation of a flowchart explaining rights and options based on the scenario.'),
  clarifyingQuestions: z.array(MCQSchema).optional().describe('2-4 multiple-choice questions to clarify the user\'s legal standing.'),
  finalInterpretation: z.string().describe('A summary explaining the user\'s legal standing based on the analysis.'),
  suggestedPhrases: z.array(z.string()).optional().describe('Exact phrases the user might consider saying in the situation.'),
    suggestedActions: z.array(z.string()).optional().describe('Specific actions the user might consider taking.'),
  safetyIndicator: z
    .enum(['Safe', 'Caution', 'Illegal Detainment Possible'])
    .describe('An indicator of the potential risk level in the situation.'),
});
export type UnderstandLegalIssueOutput = z.infer<typeof UnderstandLegalIssueOutputSchema>;


// --- Generate Legal Flowchart ---

export const GenerateLegalFlowchartInputSchema = z.object({
  legalIssueDescription: z // Keep this name consistent with the original flowchart flow for now
    .string()
    .describe('A natural language description of the user\'s legal issue.'),
  keywords: z.string().describe('Keywords related to the legal issue.'),
  relevantLaw: z.string().optional().describe('The relevant law/article related to the issue.'),
});
export type GenerateLegalFlowchartInput = z.infer<typeof GenerateLegalFlowchartInputSchema>;

export const GenerateLegalFlowchartOutputSchema = z.object({
  flowchart: z
    .string()
    .describe(
      'A textual representation of a flowchart explaining the user\'s rights and options in their legal scenario.'
    ),
});
export type GenerateLegalFlowchartOutput = z.infer<typeof GenerateLegalFlowchartOutputSchema>;

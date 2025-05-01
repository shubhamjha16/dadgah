/**
 * @fileOverview Shared types and Zod schemas for legal issue analysis and flowchart generation.
 */

import { z } from 'zod';

// --- Understand Legal Issue ---

export const UnderstandLegalIssueInputSchema = z.object({
  description: z.string().describe('A detailed description of the legal issue.'),
  keywords: z.string().describe('Keywords related to the legal issue (e.g., phone, warrant).'),
});
export type UnderstandLegalIssueInput = z.infer<typeof UnderstandLegalIssueInputSchema>;

export const UnderstandLegalIssueOutputSchema = z.object({
  legalAnalysis: z.string().describe('A legal analysis of the issue.'),
  flowchart: z.string().describe('A visual flowchart explaining rights and options.'),
  safetyIndicator: z
    .enum(['Safe', 'Caution', 'Illegal Detainment Possible'])
    .describe('An indicator of the severity of the situation.'),
});
export type UnderstandLegalIssueOutput = z.infer<typeof UnderstandLegalIssueOutputSchema>;


// --- Generate Legal Flowchart ---

export const GenerateLegalFlowchartInputSchema = z.object({
  legalIssueDescription: z
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
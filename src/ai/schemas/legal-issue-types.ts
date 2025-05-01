/**
 * @fileOverview Shared types and Zod schemas for legal issue analysis, refinement, and flowchart generation.
 */

import { z } from 'zod';

// --- Shared Schemas ---

// Define the schema for a single multiple-choice question (exported for reuse)
export const MCQSchema = z.object({
  question: z.string().describe('The clarifying question to ask the user.'),
  options: z.array(z.string()).describe('The multiple-choice options for the question.'),
});
export type MCQ = z.infer<typeof MCQSchema>; // Export the type as well


// --- Understand Legal Issue ---

export const UnderstandLegalIssueInputSchema = z.object({
  scenario: z.string().describe('User description of their legal issue (e.g., "They took my phone").'),
  // keywords removed
});
export type UnderstandLegalIssueInput = z.infer<typeof UnderstandLegalIssueInputSchema>;


export const UnderstandLegalIssueOutputSchema = z.object({
  legalAnalysis: z.string().describe('A legal analysis of the issue based on the provided scenario, focusing on Indian Law.'),
  relevantLaw: z.string().optional().describe('The most relevant Indian law or legal article related to the issue.'),
  flowchart: z.string().describe('A textual representation of a flowchart explaining rights and options based on the scenario within the Indian legal context.'),
  clarifyingQuestions: z.array(MCQSchema).optional().describe('0 to 5 multiple-choice questions to clarify the user\'s legal standing under Indian Law.'),
  finalInterpretation: z.string().describe('A summary explaining the user\'s legal standing based on the analysis and Indian law.'),
  suggestedPhrases: z.array(z.string()).optional().describe('Exact phrases the user might consider saying in the situation, relevant in India.'),
    suggestedActions: z.array(z.string()).optional().describe('Specific actions the user might consider taking, relevant in India.'),
  safetyIndicator: z
    .enum(['Safe', 'Caution', 'Illegal Detainment Possible'])
    .describe('An indicator of the potential risk level in the situation based on Indian legal procedures.'),
});
export type UnderstandLegalIssueOutput = z.infer<typeof UnderstandLegalIssueOutputSchema>;


// --- Refine Legal Issue ---

export const RefineLegalIssueInputSchema = z.object({
  originalScenario: z.string().describe("The original scenario provided by the user."),
  // originalKeywords removed
  questionsAndAnswers: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).describe("The clarifying questions and the user's selected answers used for refinement."),
});
export type RefineLegalIssueInput = z.infer<typeof RefineLegalIssueInputSchema>;

// The output of refinement is the same structure as the initial understanding
export type RefineLegalIssueOutput = UnderstandLegalIssueOutput;
export const RefineLegalIssueOutputSchema = UnderstandLegalIssueOutputSchema;


// --- Generate Legal Flowchart ---

// Note: This schema is still defined but the flow might be redundant
export const GenerateLegalFlowchartInputSchema = z.object({
  legalIssueDescription: z // Keep this name consistent with the original flowchart flow for now
    .string()
    .describe('A natural language description of the user\'s legal issue.'),
  // keywords removed
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
